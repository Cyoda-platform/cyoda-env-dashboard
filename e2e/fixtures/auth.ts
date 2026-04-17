import { test as base, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const STATE_DIR = path.join(os.tmpdir(), 'cyoda-e2e-auth');
const STATE_FILE = path.join(STATE_DIR, 'auth.json');

async function performLogin(page: Page) {
  const user = process.env.TEST_ENV_USER;
  const secret = process.env.TEST_ENV_SECRET;
  if (!user || !secret) throw new Error('TEST_ENV_USER and TEST_ENV_SECRET must be set');
  await page.goto('/login');
  await page.getByRole('textbox', { name: /Username/i }).fill(user);
  await page.getByRole('textbox', { name: /Password/i }).fill(secret);
  await page.getByRole('button', { name: /Log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes('/login'));
}

export const test = base.extend({
  storageState: async ({ browser }, use) => {
    if (!fs.existsSync(STATE_FILE)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await performLogin(page);
      await ctx.storageState({ path: STATE_FILE });
      await ctx.close();
    }
    await use(STATE_FILE);
  },
});

export { expect } from '@playwright/test';
