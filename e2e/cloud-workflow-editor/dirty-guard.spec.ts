import { test, expect } from '../fixtures/testModel';

test('dirty guard fires on sidebar nav and on browser back button', async ({ page, request, model }) => {
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf', initialState: 'draft', active: true,
        states: { draft: { transitions: [] } },
      }],
    },
  });
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf`);
  // Make dirty.
  await page.getByRole('textbox', { name: /^Name$/ }).fill('wf-edited');

  // Sidebar nav path.
  page.once('dialog', () => {});  // no native dialog expected; the AntD modal renders inline
  await page.getByRole('menuitem', { name: /workflow/i }).first().click();
  await expect(page.getByText(/Discard unsaved changes/i)).toBeVisible();
  await page.getByRole('button', { name: /Stay/i }).click();
  await expect(page).toHaveURL(new RegExp(`/workflow/${model.entityName}`));

  // Browser back path.
  await page.goBack();
  await expect(page.getByText(/Discard unsaved changes/i)).toBeVisible();
  await page.getByRole('button', { name: /Discard/i }).click();
});
