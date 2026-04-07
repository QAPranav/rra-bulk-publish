import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getMetaContent(page: any, selector: string): Promise<string | null> {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) return null;
  return el.getAttribute('content');
}

// ─── Per-page failure collector ───────────────────────────────────────────────

let seoFailures: string[] = [];

// ─── When — check SEO meta tags on the current page ──────────────────────────

When('I check SEO meta tags on the page', async ({ page, $testInfo }) => {
  seoFailures = [];
  const fullUrl = page.url();
  const pagePath = new URL(fullUrl).pathname;

  $testInfo.annotations.push({ type: 'Page URL', description: fullUrl });
  console.log(`\n  SEO check: ${fullUrl}`);

  const title = await page.title();
  if (!title.trim().length) seoFailures.push(`[${pagePath}] Empty meta title`);

  const description = await getMetaContent(page, 'meta[name="description"]');
  if (description === null) seoFailures.push(`[${pagePath}] Missing meta description`);
  else if (!description.trim().length) seoFailures.push(`[${pagePath}] Empty meta description`);

  const canonical = await page.locator('link[rel="canonical"]').first().getAttribute('href');
  if (!canonical) seoFailures.push(`[${pagePath}] Missing canonical link`);

  const ogTitle = await getMetaContent(page, 'meta[property="og:title"]');
  if (ogTitle === null) seoFailures.push(`[${pagePath}] Missing og:title`);

  const ogDescription = await getMetaContent(page, 'meta[property="og:description"]');
  if (ogDescription === null) seoFailures.push(`[${pagePath}] Missing og:description`);

  const robotsMeta = await getMetaContent(page, 'meta[name="robots"]');
  if (robotsMeta?.toLowerCase().includes('noindex')) {
    seoFailures.push(`[${pagePath}] Page has noindex directive: "${robotsMeta}"`);
  }

  console.log(seoFailures.length === 0 ? `  ✓ All SEO tags present` : `  ✗ ${seoFailures.length} issue(s)`);
});

// ─── Then — assert collected results ─────────────────────────────────────────

Then('the page should have required SEO meta tags', async () => {
  for (const msg of seoFailures) {
    expect.soft(false, msg).toBe(true);
  }
  expect(
    seoFailures.length,
    `${seoFailures.length} SEO issue(s) found — see soft failures above`
  ).toBe(0);
});

// ─── Single-page spot-check steps ────────────────────────────────────────────

Then('the meta title should contain {string}', async ({ page }, expected: string) => {
  const title = await page.title();
  expect(title.toLowerCase(), `Expected meta title to contain "${expected}" but got "${title}"`).toContain(expected.toLowerCase());
});

Then('the meta description should contain {string}', async ({ page }, expected: string) => {
  const description = await getMetaContent(page, 'meta[name="description"]');
  expect(description, 'Meta description tag is missing').not.toBeNull();
  expect(description!.toLowerCase(), `Expected meta description to contain "${expected}"`).toContain(expected.toLowerCase());
});

Then('the og:title should contain {string}', async ({ page }, expected: string) => {
  const v = await getMetaContent(page, 'meta[property="og:title"]');
  expect(v, 'og:title missing').not.toBeNull();
  expect(v!.toLowerCase()).toContain(expected.toLowerCase());
});

Then('the og:url should contain {string}', async ({ page }, expected: string) => {
  const v = await getMetaContent(page, 'meta[property="og:url"]');
  expect(v, 'og:url missing').not.toBeNull();
  expect(v!.toLowerCase()).toContain(expected.toLowerCase());
});

Then('the og:description should not be empty', async ({ page }) => {
  const v = await getMetaContent(page, 'meta[property="og:description"]');
  expect(v?.trim().length ?? 0, 'og:description empty or missing').toBeGreaterThan(0);
});
