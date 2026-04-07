import fs from 'fs';
import path from 'path';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CsvRow {
  /** Old page path  (col 0: url) */
  url: string;
  /** Old Contentful entry ID  (col 1: to) */
  to: string;
  /** Tagged? = Y  (col 6) */
  tagged: boolean;
  /** New Contentful entry ID — only populated once redirect is confirmed (col 7: Redirect done?) */
  redirectDoneId: string;
}

// ── Parser ───────────────────────────────────────────────────────────────────

const CSV_PATH = path.resolve(__dirname, '../../RRA - Redirects Sample(DAT).csv');

function parseRows(): CsvRow[] {
  const lines = fs.readFileSync(CSV_PATH, 'utf-8').trim().split(/\r?\n/);
  // header: url,to,redirectType,captureSplat,force,passSplat,Tagged?,Redirect done?
  return lines
    .slice(1)
    .map(line => {
      const parts = line.split(',');
      return {
        url:           (parts[0] ?? '').trim(),
        to:            (parts[1] ?? '').trim(),
        tagged:        (parts[6] ?? '').trim() === 'Y',
        redirectDoneId: (parts[7] ?? '').trim(),
      };
    })
    .filter(r => r.url);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns all page URLs from the CSV.
 * Used by: links, vrt, a11y, sitemap, seo-existence tests.
 */
export function loadAllPageUrls(): string[] {
  return parseRows().map(r => r.url);
}

/**
 * Returns only rows that are tagged (Tagged? = Y) AND have a confirmed
 * redirect destination entry ID (Redirect done? populated).
 * Used by: redirect tests.
 */
export function loadRedirectRows(): CsvRow[] {
  return parseRows().filter(r => r.tagged && r.redirectDoneId);
}
