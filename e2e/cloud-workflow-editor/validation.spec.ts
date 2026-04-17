import { test, expect } from '../fixtures/testModel';

test('clear initialState → save attempt → error banner + tree-node red badge', async ({ page, request, model }) => {
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
  // Force initialState to an unknown value via the Select.
  await page.getByLabel('Initial state').click();
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.getByRole('button', { name: /^Save$/ }).click();
  await expect(page.getByText(/validation failed/i)).toBeVisible();
  await expect(page.locator('[data-testid="node-error-dot"]').first()).toBeVisible();
});
