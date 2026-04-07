import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { Given, When, Then } = createBdd(test);

// ─── Viewport definitions ─────────────────────────────────────────────────────

const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  mobile:  { width: 390,  height: 844 },
};

let currentViewport = 'desktop';
let vrtFailures: string[] = [];

Given('I am using the {string} viewport', async ({ page }, viewport: string) => {
  const size = VIEWPORTS[viewport as keyof typeof VIEWPORTS];
  if (!size) throw new Error(`Unknown viewport "${viewport}". Use "desktop" or "mobile".`);
  currentViewport = viewport;
  await page.setViewportSize(size);
});

// ─── When — capture and compare screenshot of the current page ────────────────

When('I capture and compare a screenshot', async ({ page, $testInfo }) => {
  vrtFailures = [];
  const fullUrl = page.url();

  $testInfo.annotations.push({ type: 'Page URL', description: fullUrl });
  console.log(`\n  VRT [${currentViewport}]: ${fullUrl}`);

  // Wait for content images to load
  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(i => i.naturalWidth > 1 && i.naturalHeight > 1).every(i => i.complete);
  }, { timeout: 10000 }).catch(() => {});

  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  const pagePath = new URL(fullUrl).pathname;
  const snapshotName = `${pagePath.replace(/\//g, '-').replace(/^-/, '')}--${currentViewport}.png`;

  try {
    await expect(page).toHaveScreenshot(snapshotName, {
      fullPage: true,
      maxDiffPixelRatio: 0.2,
      mask: [
        page.locator('[data-testid="dynamic-content"]'),
        page.getByText('Edit in Contentful', { exact: true }),
      ],
      animations: 'disabled',
    });
  } catch (e: any) {
    vrtFailures.push(`[${pagePath}] Visual regression at ${currentViewport}: ${e.message.split('\n')[0]}`);
  }
});

// ─── Then — assert collected results ─────────────────────────────────────────

Then('the page should match its visual baseline', async () => {
  for (const msg of vrtFailures) {
    expect.soft(false, msg).toBe(true);
  }
  expect(
    vrtFailures.length,
    `${vrtFailures.length} page(s) had visual regressions — see soft failures above`
  ).toBe(0);
});
