import { test, expect } from '../fixtures/auth';

test('data lineage timeline + Compare flow', async ({ page }) => {
  await page.goto('/instances?entityName=DatasetExport&modelVersion=1');
  await page.getByRole('button', { name: /^Open$/ }).first().click();
  await page.getByRole('tab', { name: 'Data Lineage' }).click();
  const checkboxes = page.getByRole('checkbox');
  const count = await checkboxes.count();
  if (count < 2) {
    test.skip(true, 'Entity has fewer than 2 changes; cannot compare');
  }
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await page.getByRole('button', { name: /^Compare$/ }).click();
  // Diff editor should render — Monaco's container or our stub
  await expect(page.locator('pre, .monaco-editor').first()).toBeVisible();
});
