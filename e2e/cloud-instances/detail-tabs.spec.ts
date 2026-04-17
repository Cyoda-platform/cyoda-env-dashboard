import { test, expect } from '../fixtures/auth';

test('detail page renders all 5 tabs and switches between them', async ({ page }) => {
  await page.goto('/instances?entityName=DatasetExport&modelVersion=1');
  await page.getByRole('button', { name: /^Open$/ }).first().click();
  for (const tab of ['Details', 'Workflow', 'Audit', 'Data Lineage', 'JSON']) {
    await expect(page.getByRole('tab', { name: tab })).toBeVisible();
  }
  // Spot-check that switching tabs renders different content
  await page.getByRole('tab', { name: 'Audit' }).click();
  await expect(page.getByRole('columnheader', { name: /Transaction ID/i })).toBeVisible();
  await page.getByRole('tab', { name: 'JSON' }).click();
  await expect(page.locator('pre')).toBeVisible();
});
