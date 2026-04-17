import { test, expect } from '../fixtures/testModel';

test('create new workflow → save → redirected to canonical URL', async ({ page, model }) => {
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/new`);
  await page.getByRole('textbox', { name: /^Name$/ }).fill('e2e-created');
  await page.getByRole('button', { name: /^Save$/ }).click();
  await expect(page).toHaveURL(new RegExp(`/workflow/${model.entityName}/${model.modelVersion}/e2e-created$`));
  // Sanity: refresh re-loads the saved workflow.
  await page.reload();
  await expect(page.getByDisplayValue('e2e-created')).toBeVisible();
});
