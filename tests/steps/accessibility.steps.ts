import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { AxeBuilder } from '@axe-core/playwright';
import path from 'path';
import fs from 'fs';
import { test } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

const A11Y_SCREENSHOTS_DIR = path.resolve('test-results', 'a11y-screenshots');

// ─── Per-page failure collector ───────────────────────────────────────────────

let a11yFailures: string[] = [];

// ─── When — run axe scan on the current page ──────────────────────────────────

When('I run an accessibility scan', async ({ page, $testInfo }) => {
  a11yFailures = [];
  const fullUrl = page.url();
  const pagePath = new URL(fullUrl).pathname;

  $testInfo.annotations.push({ type: 'Page URL', description: fullUrl });
  console.log(`\n  A11y scan: ${fullUrl}`);

  const results = await new AxeBuilder({ page })
    .include('#main')
    .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
    .analyze();

  const violations = results.violations;

  if (violations.length === 0) {
    console.log(`  ✓ No violations`);
    return;
  }

  console.log(`  ✗ ${violations.length} violation(s)`);

  if (!fs.existsSync(A11Y_SCREENSHOTS_DIR)) {
    fs.mkdirSync(A11Y_SCREENSHOTS_DIR, { recursive: true });
  }

  const pageSlug = pagePath.replace(/\//g, '-').replace(/^-/, '') || 'homepage';
  let screenshotCount = 0;

  for (const [vi, v] of violations.entries()) {
    console.log(`    [${vi + 1}] ${v.id}  impact=${v.impact}`);
    console.log(`         ${v.description}`);

    for (const node of v.nodes) {
      const selector = node.target[0] as string;
      screenshotCount++;
      const filename = `${pageSlug}--${v.id}--${screenshotCount}.png`;
      const filepath = path.join(A11Y_SCREENSHOTS_DIR, filename);

      try {
        const el = page.locator(selector).first();
        if (await el.isVisible({ timeout: 3000 })) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          await el.screenshot({ path: filepath, animations: 'disabled' });
        } else {
          await page.screenshot({ path: filepath, fullPage: true });
        }
        await $testInfo.attach(`[${v.impact?.toUpperCase()}] ${v.id} — ${selector}`, {
          path: filepath,
          contentType: 'image/png',
        });
      } catch {
        // skip screenshot if element unreachable
      }
    }
  }

  await $testInfo.attach(`${pageSlug}--axe-violations.json`, {
    body: JSON.stringify(violations, null, 2),
    contentType: 'application/json',
  });

  a11yFailures.push(`${pagePath}: ${violations.length} accessibility violation(s) — see attached report`);
});

// ─── Then — assert collected results ─────────────────────────────────────────

Then('the page should pass WCAG 2.1 AA', async () => {
  for (const msg of a11yFailures) {
    expect.soft(false, msg).toBe(true);
  }
  expect(
    a11yFailures.length,
    `${a11yFailures.length} page(s) have accessibility violations — see soft failures above`
  ).toBe(0);
});
