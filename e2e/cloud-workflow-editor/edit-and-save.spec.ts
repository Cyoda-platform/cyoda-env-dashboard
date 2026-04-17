import { test, expect } from '../fixtures/testModel';

test('edit transition name → save → reload → persisted', async ({ page, request, model }) => {
  // Seed a workflow via the import API so we don't depend on the create spec passing.
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf1', initialState: 'draft', active: true,
        states: { draft: { transitions: [{ name: 'oldName', next: 'draft', manual: false }] } },
      }],
    },
  });
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf1`);
  // Navigate to the transition node and edit its name.
  await page.getByText('draft').click();
  await page.getByText('oldName').click();
  const nameInput = page.getByRole('textbox', { name: /^Name$/ });
  await nameInput.fill('newName');
  await page.getByRole('button', { name: /^Save$/ }).click();
  await page.reload();
  await expect(page.getByText('newName')).toBeVisible();
});
