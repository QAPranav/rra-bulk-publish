import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

const CONTENT_SELECTOR = '#main';

// ─── Per-page failure collector ───────────────────────────────────────────────

let contentFailures: string[] = [];

// ─── When — run content health checks on the current page ────────────────────

When('I check content health on the page', async ({ page, $testInfo }) => {
  contentFailures = [];
  const fullUrl = page.url();
  const pagePath = new URL(fullUrl).pathname;

  $testInfo.annotations.push({ type: 'Page URL', description: fullUrl });
  console.log(`\n  Content health: ${fullUrl}`);

  const title = await page.title();
  if (!title.trim().length) contentFailures.push(`[${pagePath}] Page title is empty`);

  const content = await page.locator(CONTENT_SELECTOR).innerText();
  if (!content.trim().length) {
    contentFailures.push(`[${pagePath}] Main content area is empty`);
    return;
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 100) {
    contentFailures.push(`[${pagePath}] Main content has fewer than 100 words (got ${wordCount})`);
  }

  const headingCount = await page.locator(`${CONTENT_SELECTOR} :is(h1,h2,h3,h4,h5,h6)`).count();
  if (headingCount === 0) contentFailures.push(`[${pagePath}] No headings found in main content`);

  console.log(`  ✓ ${wordCount} words, ${headingCount} headings`);
});

// ─── Then — assert collected results ─────────────────────────────────────────

Then('the page should pass basic content health checks', async () => {
  for (const msg of contentFailures) {
    expect.soft(false, msg).toBe(true);
  }
  expect(
    contentFailures.length,
    `${contentFailures.length} page(s) failed content health checks — see soft failures above`
  ).toBe(0);
});

// ─── Single-page spot-check steps ────────────────────────────────────────────

Then('the page title should contain {string}', async ({ page }, expectedTitle: string) => {
  const title = await page.title();
  expect(title.toLowerCase(), `Expected page title to contain "${expectedTitle}" but got "${title}"`).toContain(expectedTitle.toLowerCase());
});

Then('the page title should not be empty', async ({ page }) => {
  expect((await page.title()).trim().length, 'Page title is empty').toBeGreaterThan(0);
});

Then('the main content should contain {string}', async ({ page }, expectedTerm: string) => {
  const content = await page.locator(CONTENT_SELECTOR).innerText();
  expect(
    content.toLowerCase(),
    `Expected main content to contain "${expectedTerm}"\n\nPreview: ${content.substring(0, 300)}...`
  ).toContain(expectedTerm.toLowerCase());
});

Then('the main content should NOT contain {string}', async ({ page }, bannedTerm: string) => {
  const content = await page.locator(CONTENT_SELECTOR).innerText();
  const pos = content.toLowerCase().indexOf(bannedTerm.toLowerCase());
  if (pos !== -1) {
    const context = content.substring(Math.max(0, pos - 80), pos + bannedTerm.length + 80);
    expect(false, `STALE CONTENT: "${bannedTerm}" found\n\nContext: ...${context}...`).toBe(true);
  }
});

Then('the page should have a heading containing {string}', async ({ page }, expectedHeading: string) => {
  const headings = await page.locator(`${CONTENT_SELECTOR} :is(h1,h2,h3,h4,h5,h6)`).allInnerTexts();
  const match = headings.some(h => h.toLowerCase().includes(expectedHeading.toLowerCase()));
  if (!match) {
    const list = headings.map((h, i) => `  ${i + 1}. "${h}"`).join('\n');
    expect(false, `No heading containing "${expectedHeading}" found.\n\nHeadings on page:\n${list}`).toBe(true);
  }
});

Then('the main content should not be empty', async ({ page }) => {
  const content = await page.locator(CONTENT_SELECTOR).innerText();
  expect(content.trim().length, 'Main content area is empty').toBeGreaterThan(0);
});

Then('the main content should have at least {int} words', async ({ page }, minWords: number) => {
  const content = await page.locator(CONTENT_SELECTOR).innerText();
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  expect(wordCount, `Expected at least ${minWords} words but found ${wordCount}`).toBeGreaterThanOrEqual(minWords);
});
