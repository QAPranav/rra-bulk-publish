import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixtures';

const { Given } = createBdd(test);

Given('the base URL is configured', async ({ page }) => {
  expect(page).toBeDefined();
});

Given('I navigate to {string}', async ({ page, baseURL }, path: string) => {
  const url = `${baseURL}${path}`;
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  console.log(`Navigated to ${url} - Status: ${response?.status()}`);
  expect(response?.status()).toBe(200);
});
