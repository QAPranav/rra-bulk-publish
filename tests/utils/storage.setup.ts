import { test as setup } from '@playwright/test';
import * as path from 'path';

const authFile = path.resolve('storageState.json');

setup('Setup storage state', async ({ page, baseURL }) => {
  await page.goto(baseURL as string);
  await page.getByRole('button', { name: 'I accept cookies' }).click();
  await page.context().storageState({ path: authFile });
});
