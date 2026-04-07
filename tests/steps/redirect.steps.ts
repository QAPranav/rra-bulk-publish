import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

// ─── Per-row failure collector ────────────────────────────────────────────────

let redirectFailures: string[] = [];

// ─── When — validate a single old path redirects correctly ───────────────────
//
// Checks:
//   1. Old URL returns HTTP 301
//   2. Location header is present
//   3. Redirect destination returns HTTP 200
//   4. No redirect chain (destination itself does not return 301/302)

When('I validate the redirect for {string}', async ({ request, baseURL, $testInfo }, oldPath: string) => {
  redirectFailures = [];
  const oldUrl = `${baseURL}${oldPath}`;

  $testInfo.annotations.push({ type: 'Page URL', description: oldUrl });
  console.log(`\n  Validating redirect: ${oldUrl}`);

  // ── 1. Expect 301 ──────────────────────────────────────────────────────────
  let initialResponse: any;
  try {
    initialResponse = await request.get(oldUrl, {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
  } catch {
    redirectFailures.push(`[${oldPath}] Could not reach URL`);
    return;
  }

  const status = initialResponse.status();
  if (status !== 301) {
    redirectFailures.push(`[${oldPath}] Expected 301 but got ${status}`);
    return;
  }

  // ── 2. Location header ─────────────────────────────────────────────────────
  const locationHeader = initialResponse.headers()['location'] ?? null;
  if (!locationHeader) {
    redirectFailures.push(`[${oldPath}] No Location header in 301 response`);
    return;
  }

  const targetUrl = locationHeader.startsWith('http')
    ? locationHeader
    : `${baseURL}${locationHeader}`;

  console.log(`    → ${targetUrl}`);

  // ── 3. Destination returns 200 ─────────────────────────────────────────────
  const finalResponse = await request.get(targetUrl, { failOnStatusCode: false });
  const finalStatus = finalResponse.status();
  if (finalStatus !== 200) {
    redirectFailures.push(`[${oldPath}] Redirect destination ${targetUrl} returned ${finalStatus}`);
  }

  // ── 4. No redirect chain ───────────────────────────────────────────────────
  const hopResponse = await request.get(targetUrl, {
    maxRedirects: 0,
    failOnStatusCode: false,
  });
  const hopStatus = hopResponse.status();
  if (hopStatus === 301 || hopStatus === 302) {
    redirectFailures.push(
      `[${oldPath}] Redirect chain detected: ${targetUrl} → ${hopResponse.headers()['location']}`
    );
  }
});

// ─── Then — assert collected results ─────────────────────────────────────────

Then('the redirect should return 301 and resolve correctly', async () => {
  for (const msg of redirectFailures) {
    expect.soft(false, msg).toBe(true);
  }
  expect(
    redirectFailures.length,
    `${redirectFailures.length} redirect check(s) failed — see soft failures above`
  ).toBe(0);
});
