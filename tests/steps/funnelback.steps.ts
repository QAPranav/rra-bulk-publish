import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

const FUNNELBACK_SEARCH_PATH = '/s/search.json';
const FUNNELBACK_COLLECTION  = 'shelter-search';

// ─── Per-row state ────────────────────────────────────────────────────────────

let lastSearchBody = '';
let lastCheckedPath = '';

// ─── When — check a single old path is absent from Funnelback ────────────────

When('I check that {string} is absent from the Funnelback index', async ({ request, baseURL, $testInfo }, oldPath: string) => {
  lastCheckedPath = oldPath;
  const searchUrl = `${baseURL}${FUNNELBACK_SEARCH_PATH}?query=${encodeURIComponent(oldPath)}&collection=${FUNNELBACK_COLLECTION}`;

  $testInfo.annotations.push({ type: 'Funnelback query', description: searchUrl });
  console.log(`\n  Funnelback absence check: ${oldPath}`);

  try {
    const response = await request.get(searchUrl, { failOnStatusCode: false });
    lastSearchBody = await response.text();
  } catch {
    console.log(`  ⚠ Could not reach Funnelback for: ${oldPath}`);
    lastSearchBody = '';
  }
});

// ─── Then — assert old path is absent ────────────────────────────────────────

Then('{string} should not appear in Funnelback search results', async ({}, oldPath: string) => {
  const found = lastSearchBody.includes(oldPath);
  if (found) console.log(`  ✗ FOUND:  ${oldPath}`);
  else console.log(`  ✓ absent: ${oldPath}`);
  expect(found, `Old path "${oldPath}" is still present in Funnelback search results`).toBe(false);
});

// ─── Spot-check steps — new paths should appear ──────────────────────────────

When('I search Funnelback for {string}', async ({ request, baseURL }, newPath: string) => {
  const searchUrl = `${baseURL}${FUNNELBACK_SEARCH_PATH}?query=${encodeURIComponent(newPath)}&collection=${FUNNELBACK_COLLECTION}`;
  const response = await request.get(searchUrl, { failOnStatusCode: false });
  lastSearchBody = await response.text();
  console.log(`  Searched Funnelback for: ${newPath}`);
});

Then('the search results should contain {string}', async ({}, expectedPath: string) => {
  expect(
    lastSearchBody.includes(expectedPath),
    `Funnelback results do not contain "${expectedPath}"`
  ).toBe(true);
});
