import { test, expect } from '../fixtures/testModel';

test('add group condition with two simple children → save → reload preserves structure', async ({ page, request, model }) => {
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf', initialState: 'draft', active: true,
        states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
      }],
    },
  });
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf`);
  await page.getByText('draft').click();
  await page.getByText('t').click();
  await page.getByRole('button', { name: /Add criterion/ }).click();
  // Switch type from simple → group (no destructive content yet).
  await page.locator('text=Type:').locator('xpath=following-sibling::*[1]').click();
  await page.getByText('group', { exact: true }).click();
  await page.getByRole('button', { name: /Add condition/ }).click();
  await page.getByRole('button', { name: /Add condition/ }).click();
  await page.getByRole('button', { name: /^Save$/ }).click();
  await page.reload();
  // Two simple inputs visible
  await expect(page.locator('input[placeholder="JSONPath e.g. $.field"]')).toHaveCount(2);
});
