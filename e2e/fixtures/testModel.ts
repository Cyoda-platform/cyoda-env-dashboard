import { test as authTest } from './auth';

export interface ModelRef {
  entityName: string;
  modelVersion: number;
}

export const test = authTest.extend<{ model: ModelRef }>({
  model: async ({ request }, use, testInfo) => {
    const apiBase = process.env.CYODA_API_BASE_URL ?? '';
    if (!apiBase) throw new Error('CYODA_API_BASE_URL must be set for tests that use the model fixture');
    const entityName = `E2E_${testInfo.testId.replace(/[^A-Za-z0-9]/g, '_')}_${Date.now()}`;
    const modelVersion = 1;
    // No PUT /lock — locking enables data ingestion (Instances territory),
    // not workflow authoring. Workflows can be authored against an unlocked model.
    const post = await request.post(
      `${apiBase}/model/import/JSON/SAMPLE_DATA/${entityName}/${modelVersion}`,
      { data: { id: 1, name: 'sample' } },
    );
    if (!post.ok()) throw new Error(`Model setup failed (${post.status()}): ${await post.text()}`);

    await use({ entityName, modelVersion });

    // Cleanup — runs even if the test fails.
    await request.delete(`${apiBase}/model/${entityName}/${modelVersion}`);
  },
});

export { expect } from '@playwright/test';
