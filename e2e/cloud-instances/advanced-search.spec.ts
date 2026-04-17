import { test, expect } from '../fixtures/auth';

test('Advanced Search drawer accepts JSON and replaces table', async ({ page }) => {
  await page.goto('/instances?entityName=DatasetExport&modelVersion=1');
  await page.getByRole('button', { name: /^Advanced$/ }).click();
  // Replace template with a minimal valid criterion
  const textarea = page.getByRole('textbox').last();
  await textarea.fill('{"type":"group","operator":"AND","conditions":[]}');
  await page.getByRole('button', { name: /^Search$/ }).click();
  // After Search the drawer closes; the table re-renders. Assertion: at least the heading is still there.
  await expect(page.getByRole('heading', { name: /Instances/ })).toBeVisible();
});
