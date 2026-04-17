import { test, expect } from '../fixtures/testModel';

test('dirty guard fires on browser back button', async ({ page, request, model }) => {
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf', initialState: 'draft', active: true,
        states: { draft: { transitions: [] } },
      }],
    },
  });
  // Visit a different page first so we have something to go back to.
  await page.goto(`/workflows`);
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf`);

  // Make dirty.
  await page.getByRole('textbox', { name: /^Name$/ }).fill('wf-edited');

  // Browser back path.
  await page.goBack();
  await expect(page.getByText(/Discard unsaved changes/i)).toBeVisible();
  await page.getByRole('button', { name: /Stay/i }).click();
  await expect(page).toHaveURL(new RegExp(`/workflow/${model.entityName}/${model.modelVersion}/wf$`));

  // Try again, this time discard.
  await page.goBack();
  await expect(page.getByText(/Discard unsaved changes/i)).toBeVisible();
  await page.getByRole('button', { name: /Discard/i }).click();
  await expect(page).toHaveURL(new RegExp(`/workflows`));
});
