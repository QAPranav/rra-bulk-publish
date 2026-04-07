import { test as base } from 'playwright-bdd';

// Extend the base test fixture with any custom fixtures you need.
// For now we re-export as-is; add shared helpers (e.g. API client, auth) here later.

export const test = base.extend<{
  // Example: add custom fixtures here as the framework grows
  // authenticatedPage: Page;
}>({
  // authenticatedPage: async ({ page }, use) => { ... }
});