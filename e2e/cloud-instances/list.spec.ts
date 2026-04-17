import { test, expect } from '../fixtures/auth';

test('list → row Open → detail URL', async ({ page }) => {
  await page.goto('/instances?entityName=DatasetExport&modelVersion=1');
  // Wait for at least one row.
  const firstOpen = page.getByRole('button', { name: /^Open$/ }).first();
  await firstOpen.waitFor({ state: 'visible' });
  await firstOpen.click();
  await expect(page).toHaveURL(/\/instances\/[^?]+\?entityName=DatasetExport&modelVersion=1/);
});
