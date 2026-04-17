import { test, expect } from '../fixtures/testModel';

test('clear initialState → save attempt → error banner', async ({ page, request, model }) => {
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
  // Find the Initial state Select in the WorkflowSettingsForm and clear it.
  const initStateSelect = page.getByLabel('Initial state');
  await initStateSelect.click();
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.getByRole('button', { name: /^Save$/ }).click();
  await expect(page.getByText(/validation failed/i)).toBeVisible();
});
