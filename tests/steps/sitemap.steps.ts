import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

// ─── Sitemap cache — fetched once and reused across all scenario rows ─────────

let cachedSitemapContent: string | null = null;
let cachedBaseURL: string | null = null;

// ─── When — fetch sitemap and check a single old path is absent ───────────────

When('I check that {string} is absent from the sitemap', async ({ request, baseURL }, oldPath: string) => {
  // Reset cache if running against a different base URL
  if (cachedBaseURL !== baseURL) {
    cachedSitemapContent = null;
    cachedBaseURL = baseURL ?? null;
  }

  if (!cachedSitemapContent) {
    console.log(`\n  Fetching sitemap from ${baseURL}/sitemap.xml`);
    const response = await request.get(`${baseURL}/sitemap.xml`, { failOnStatusCode: false });
    expect(response.status(), 'Could not retrieve sitemap.xml').toBe(200);
    cachedSitemapContent = await response.text();
  }

  console.log(`  Checking absent: ${oldPath}`);
});

// ─── Then — assert the old path is not in the cached sitemap ─────────────────

Then('{string} should not appear in the sitemap', async ({}, oldPath: string) => {
  const found = cachedSitemapContent?.includes(oldPath) ?? false;
  expect(found, `Old path "${oldPath}" is still present in sitemap.xml`).toBe(false);
});
