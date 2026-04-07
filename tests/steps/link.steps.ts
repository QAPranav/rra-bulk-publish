import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { When, Then } = createBdd(test);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isInternalLink(href: string, baseURL: string): boolean {
  try {
    return new URL(href, baseURL).hostname === new URL(baseURL).hostname;
  } catch {
    return false;
  }
}

function isExternalLink(href: string, baseURL: string): boolean {
  try {
    return new URL(href, baseURL).hostname !== new URL(baseURL).hostname;
  } catch {
    return false;
  }
}

function isAnchorLink(href: string): boolean {
  return href.startsWith('#') || href.includes('#');
}

const BOT_BLOCKED_DOMAINS = [
  'facebook.com', 'twitter.com', 'x.com', 'bsky.app',
  'instagram.com', 'linkedin.com', 'tiktok.com',
];

function isBotBlocked(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return BOT_BLOCKED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

async function extractHrefs(page: any): Promise<string[]> {
  return page.locator('#main a[href]').evaluateAll(
    (anchors: HTMLAnchorElement[]) => anchors.map(a => a.getAttribute('href')!).filter(Boolean)
  );
}

// ─── Per-page failure collectors ──────────────────────────────────────────────

let internalLinkFailures: string[] = [];
let externalLinkFailures: string[] = [];
let anchorLinkFailures: string[] = [];

// ─── When — check all link types on the current page ─────────────────────────

When('I check all links on the page', async ({ page, request, baseURL, $testInfo }) => {
  internalLinkFailures = [];
  externalLinkFailures = [];
  anchorLinkFailures = [];

  const fullUrl = page.url();

  // Attach the page URL as a clickable annotation in the HTML report
  $testInfo.annotations.push({ type: 'Page URL', description: fullUrl });
  console.log(`\n  Checking links on: ${fullUrl}`);

  const hrefs = await extractHrefs(page);

  // ── Internal links ────────────────────────────────────────────────────────
  const internalLinks = [...new Set(
    hrefs
      .filter(h => !isAnchorLink(h) && isInternalLink(h, baseURL!))
      .map(h => new URL(h, baseURL).toString())
  )];

  console.log(`    ${internalLinks.length} internal  |  `, {
    external: hrefs.filter(h => !isAnchorLink(h) && isExternalLink(h, baseURL!)).length,
    anchor:   hrefs.filter(isAnchorLink).length,
  });

  for (const link of internalLinks) {
    try {
      const response = await request.get(link);
      if (response.status() !== 200) {
        internalLinkFailures.push(`Internal link ${link} returned ${response.status()}`);
      }
    } catch {
      internalLinkFailures.push(`Internal link unreachable: ${link}`);
    }
  }

  // ── External links ────────────────────────────────────────────────────────
  const externalLinks = [...new Set(hrefs.filter(h => !isAnchorLink(h) && isExternalLink(h, baseURL!)))];

  for (const link of externalLinks) {
    if (isBotBlocked(link)) continue;

    try {
      let response = await request.head(link);
      if (response.status() >= 400) response = await request.get(link);
      if (response.status() >= 400) {
        externalLinkFailures.push(`External link ${link} returned ${response.status()}`);
      }
    } catch {
      externalLinkFailures.push(`External link unreachable: ${link}`);
    }
  }

  // ── Anchor links ──────────────────────────────────────────────────────────
  const anchors = [...new Set(hrefs.filter(isAnchorLink))];

  for (const href of anchors) {
    const fragment = href.includes('#') ? href.split('#')[1] : href.replace('#', '');
    if (!fragment) continue;

    const count = await page.locator(`[id="${fragment}"]`).count();
    if (count === 0) {
      anchorLinkFailures.push(`Anchor #${fragment} — no element with this id`);
    }
  }
});

// ─── Then — assert collected results ─────────────────────────────────────────

Then('all internal links should return HTTP 200', async () => {
  for (const msg of internalLinkFailures) {
    expect.soft(false, msg).toBe(true);
  }
  expect(
    internalLinkFailures.length,
    `${internalLinkFailures.length} internal link(s) failed`
  ).toBe(0);
});

Then('all external links should be reachable', async () => {
  for (const msg of externalLinkFailures) {
    expect.soft(false, msg).toBe(true);
  }
  expect(
    externalLinkFailures.length,
    `${externalLinkFailures.length} external link(s) failed`
  ).toBe(0);
});

Then('all anchor links should resolve to existing elements', async () => {
  for (const msg of anchorLinkFailures) {
    expect.soft(false, msg).toBe(true);
  }
  expect(
    anchorLinkFailures.length,
    `${anchorLinkFailures.length} anchor link(s) failed`
  ).toBe(0);
});
