import { test, expect } from '../fixtures/testModel';

test('add an externalized processor to a transition → save', async ({ page, request, model }) => {
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
  await page.getByRole('button', { name: /^Edit$/ }).first().click();
  await page.getByRole('button', { name: /\+ Add processor/ }).click();
  await page.getByRole('button', { name: /^externalized$/ }).click();
  // The newly added processor's Name field — last() because there may be multiple
  await page.getByRole('textbox', { name: /^Name$/ }).last().fill('p1');
  await page.getByRole('button', { name: /^Done$/ }).click();
  await page.getByRole('button', { name: /^Save$/ }).click();
  await page.reload();
  await page.getByRole('button', { name: /^Edit$/ }).first().click();
  await expect(page.getByText(/externalized: p1/)).toBeVisible();
});
