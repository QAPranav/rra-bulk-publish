# RRA Bulk Publish — QA Testing Framework

**Author:** Pranav Pothiwala
**Go-Live:** 1st May 2026, Midnight
**Status:** Ready for Team Review

---

## Overview

This is a Playwright-BDD automated testing framework for validating the **Renters Rights Advice (RRA)** bulk content publish and migration on [england.shelter.org.uk](https://england.shelter.org.uk).

It covers **54 core RRA pages** across 5 housing topics, using Gherkin feature files and Playwright for browser automation. Tests validate accessibility, content health, link integrity, redirects, SEO metadata, sitemap correctness, Funnelback search indexing, and visual regression.

---

## Project Structure

```
rra-bulk-publish/
├── .github/workflows/playwright.yml   # GitHub Actions CI/CD pipeline
├── tests/
│   ├── features/                      # BDD Gherkin feature files
│   │   ├── accessibility.feature      # WCAG 2.1 AA compliance
│   │   ├── content.feature            # Content health & spot checks
│   │   ├── funnelback.feature         # Search index validation
│   │   ├── links.feature              # Internal, external, and anchor link checks
│   │   ├── redirect.feature           # 301 redirect chain validation
│   │   ├── seo.feature                # SEO metadata validation
│   │   ├── sitemap.feature            # Sitemap inclusion/exclusion checks
│   │   └── vrt.feature                # Visual regression testing (desktop & mobile)
│   ├── steps/                         # Step definition files (TypeScript)
│   │   ├── accessibility.steps.ts
│   │   ├── common.steps.ts
│   │   ├── content.steps.ts
│   │   ├── funnelback.steps.ts
│   │   ├── link.steps.ts
│   │   ├── redirect.steps.ts
│   │   ├── seo.steps.ts
│   │   ├── sitemap.steps.ts
│   │   └── vrt.steps.ts
│   ├── fixtures/
│   │   └── fixtures.ts                # Extended Playwright fixtures
│   └── utils/
│       ├── csv-loader.ts              # Parses redirect CSV data
│       └── storage.setup.ts           # Cookie consent setup
├── .features-gen/                     # Auto-generated specs (do not edit)
├── screenshots/                       # VRT baseline snapshots
├── reports/                           # Per-suite HTML reports
├── test-results/                      # Playwright test artifacts
├── playwright-report/                 # Default HTML report output
├── playwright.config.ts               # Playwright & BDD configuration
├── tsconfig.json                      # TypeScript config
├── package.json
├── storageState.json                  # Persisted browser cookie state
├── RRA - Redirects Sample(DAT).csv    # Redirect mapping data
├── allsite.txt                        # Full site URL list
├── england-urls.txt                   # England-specific URLs
├── professional-urls.txt              # Professional/staff URLs
├── pro-urls-*.txt                     # Category-scoped URL subsets
└── rra-topic-urls.txt                 # Topic-grouped URLs
```

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Node.js | LTS | Runtime |
| TypeScript | ES2022 | Language |
| Playwright | ^1.58.2 | Browser automation |
| playwright-bdd | ^8.5.0 | Gherkin → Playwright test generation |
| @axe-core/playwright | ^4.11.1 | WCAG accessibility scanning |
| cross-env | ^10.1.0 | Cross-platform env vars |

---

## Prerequisites

- Node.js LTS
- npm

```bash
npm ci
npx playwright install --with-deps
```

---

## Running Tests

All commands first run `bddgen` to regenerate specs from feature files.

### By Suite

```bash
# Accessibility (WCAG 2.1 AA)
npm run a11y-test

# Link integrity
npm run test-links

# 301 redirects
npm run redirect-test

# Visual regression — capture baselines
npm run vrt-update

# Visual regression — compare against baselines
npm run vrt-test
```

### Run all tests

```bash
npx bddgen
npx playwright test
```

### By tag (using Playwright grep)

```bash
npx playwright test --grep @a11y
npx playwright test --grep @links
npx playwright test --grep @redirects
npx playwright test --grep @vrt
npx playwright test --grep @seo
npx playwright test --grep @sitemap
npx playwright test --grep @funnelback
npx playwright test --grep @content-health
```

### Environment override

```bash
BASE_URL=https://staging.england.shelter.org.uk npx playwright test
```

Default `BASE_URL` is `https://england.shelter.org.uk`.

---

## Test Suites

### Accessibility (`@a11y`)

- Runs Axe-core on the `#main` region of each page
- Checks against `wcag2a`, `wcag2aa`, and `best-practice` rules
- Tests both **desktop** (1280×720) and **mobile** (390×844) viewports
- On failure: captures screenshot and detailed violation JSON per page
- Soft-fail pattern — all pages run even if earlier ones fail

### Content Health (`@content-health`)

- Validates page title is present and non-empty
- Checks word count ≥ 100 in `#main`
- Confirms at least one heading (`h1`–`h6`) exists
- Spot-check scenarios available for specific titles, legal content, and heading text (configurable by the content team)

### Link Integrity (`@links`)

- Extracts all links from `#main`
- **Internal links:** Asserts HTTP 200
- **External links:** Asserts reachable (skips bot-blocked domains: Facebook, Twitter, LinkedIn, Instagram, etc.)
- **Anchor links:** Asserts matching `id` attribute exists on the page
- Per-category failure collection with full summary at end of each page

### Redirects (`@redirects`)

- Reads data from `RRA - Redirects Sample(DAT).csv` (rows where `Tagged?=Y` and `Redirect done?` is populated)
- Validates:
  - HTTP 301 response from old URL
  - `Location` header is set
  - Final destination returns HTTP 200
  - No redirect chains (anti-pattern)
- Per-row failure reporting with full chain details

### SEO (`@seo`)

- Checks for presence of: `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`), `<meta name="robots">`
- Flags pages with `noindex` as failures
- Spot-check scenarios for specific meta values (configurable)

### Sitemap (`@sitemap`)

- Fetches `/sitemap.xml` once and caches it across all 54 URL checks
- Asserts that **old RRA paths are absent** from the sitemap after migration
- Placeholder scenario for asserting new paths are present

### Funnelback Search (`@funnelback`)

- Queries `/s/search.json?query={path}&collection=shelter-search`
- Asserts **old URLs are absent** from search results
- Placeholder scenario for asserting new URLs are indexed

### Visual Regression (`@vrt`)

- Captures full-page screenshots for each URL at **desktop** (1280×720) and **mobile** (390×844)
- Compares against baselines stored in `./screenshots/`
- Masks dynamic content regions and the Contentful editor button
- Pixel tolerance: 20% (`maxDiffPixelRatio: 0.2`)
- Run `npm run vrt-update` to update baselines; `npm run vrt-test` to compare

---

### URL Lists

| File | Contents |
|---|---|
| `allsite.txt` | Full site URL inventory |
| `england-urls.txt` | England-region pages |
| `professional-urls.txt` | Professional/staff pages |
| `pro-urls-*.txt` | Category subsets (eviction, repossession, etc.) |
| `rra-topic-urls.txt` | Topic-grouped RRA URLs |

---

## Playwright Configuration

Key settings in `playwright.config.ts`:

| Setting | Value |
|---|---|
| Base URL | `https://england.shelter.org.uk` (or `BASE_URL` env) |
| Features | `tests/features/**/*.feature` |
| Steps | `tests/steps/**/*.ts`, `tests/fixtures/**/*.ts` |
| Screenshots | `./screenshots` |
| Retries | 2 on CI, 0 locally |
| Workers | 1 on CI, auto locally |
| Parallel | Fully parallel |
| Browsers | Chromium (Desktop Chrome) |
| Reporter | HTML (per suite via `REPORT_DIR`) + list |
| Setup project | Cookie consent acceptance → `storageState.json` |

---

## Cookie Consent Setup

The framework uses a `setup` project (`tests/utils/storage.setup.ts`) that:

1. Navigates to the site
2. Accepts the cookie consent banner
3. Saves the browser state to `storageState.json`

All test projects use this state, so cookie banners do not interfere with tests.

---

## Reports

Reports are output to per-suite directories:

| Suite | Report Directory |
|---|---|
| Accessibility | `reports/a11y/` |
| Links | `reports/links/` |
| Redirects | `reports/redirects/` |
| Visual regression | `reports/vrt/` |
| Default (all) | `playwright-report/` |

Open the HTML report:

```bash
npx playwright show-report reports/a11y
```

---

## CI/CD

GitHub Actions workflow at `.github/workflows/playwright.yml`:

- **Triggers:** Push or PR to `main` / `master`
- **Timeout:** 60 minutes
- **OS:** `ubuntu-latest`
- **Node:** LTS
- **Steps:** checkout → install Node → `npm ci` → `npx playwright install --with-deps` → `npx playwright test`
- **Artifacts:** `playwright-report/` uploaded with 30-day retention

---

## Scope

- **Site:** [england.shelter.org.uk](https://england.shelter.org.uk)
- **Pages under test:** 54 RRA pages
- **Housing topics covered:**
  - Eviction
  - Repossession
  - Tenancy deposits
  - Private renting
  - DSS discrimination

---

## Assertion Pattern

All suites use a **soft-fail / collector pattern**: failures are accumulated per page or per row and reported as a summary at the end of each scenario. This ensures all pages are tested even when earlier ones fail, and reports show the full picture rather than stopping on the first error.
