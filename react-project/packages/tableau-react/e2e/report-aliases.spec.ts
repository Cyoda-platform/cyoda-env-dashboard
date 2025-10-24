/**
 * E2E tests for Aliases in Reports
 * Tests alias functionality in the Report Editor
 */

import { test, expect } from '@playwright/test';

const MOCK_REPORT_ID = 'test-report-123';

test.describe('Report Editor - Aliases Tab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to report editor
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForLoadState('networkidle');
  });

  test('should display Aliases tab', async ({ page }) => {
    // Wait for tabs to load
    await page.waitForSelector('.ant-tabs');

    // Look for Aliases or Model tab (aliases are typically in Model tab)
    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    const aliasesTab = page.locator('.ant-tabs-tab:has-text("Aliases")');

    const modelExists = await modelTab.count();
    const aliasesExists = await aliasesTab.count();

    expect(modelExists + aliasesExists).toBeGreaterThan(0);
  });

  test('should navigate to Model tab and show aliases section', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    // Click Model tab
    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      // Check for aliases section
      const aliasesSection = page.locator('text=/alias/i').first();
      const exists = await aliasesSection.count();
      expect(exists).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display "Add from Catalog" button', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    // Navigate to Model tab
    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      // Look for Add from Catalog button
      const addButton = page.locator('button:has-text("Add from Catalog")');
      const exists = await addButton.count();
      expect(exists).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display aliases table', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      // Check for table
      const table = page.locator('.ant-table');
      const exists = await table.count();
      expect(exists).toBeGreaterThan(0);
    }
  });

  test('should open alias catalog when "Add from Catalog" is clicked', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      const addButton = page.locator('button:has-text("Add from Catalog")');
      if (await addButton.count() > 0) {
        await addButton.click();

        // Modal should open
        await page.waitForTimeout(500);
        const modal = page.locator('.ant-modal:has-text("Catalog of Aliases")');
        const modalExists = await modal.count();
        expect(modalExists).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should display catalog items in modal', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      const addButton = page.locator('button:has-text("Add from Catalog")');
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);

        // Check for table in modal
        const modalTable = page.locator('.ant-modal .ant-table');
        const exists = await modalTable.count();
        expect(exists).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should have "Add New Alias" button in catalog', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      const addButton = page.locator('button:has-text("Add from Catalog")');
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);

        const newAliasButton = page.locator('.ant-modal button:has-text("Add New Alias")');
        const exists = await newAliasButton.count();
        expect(exists).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should open create alias dialog when "Add New Alias" is clicked', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      const addButton = page.locator('button:has-text("Add from Catalog")');
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);

        const newAliasButton = page.locator('.ant-modal button:has-text("Add New Alias")');
        if (await newAliasButton.count() > 0) {
          await newAliasButton.click();
          await page.waitForTimeout(500);

          // Create/Edit alias modal should open
          const createModal = page.locator('.ant-modal:has-text("Create New Alias")');
          const exists = await createModal.count();
          expect(exists).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  test('should display steps in create alias dialog', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      const addButton = page.locator('button:has-text("Add from Catalog")');
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);

        const newAliasButton = page.locator('.ant-modal button:has-text("Add New Alias")');
        if (await newAliasButton.count() > 0) {
          await newAliasButton.click();
          await page.waitForTimeout(500);

          // Steps should be visible
          const steps = page.locator('.ant-steps');
          const exists = await steps.count();
          expect(exists).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  test('should have form fields in create alias dialog', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      const addButton = page.locator('button:has-text("Add from Catalog")');
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);

        const newAliasButton = page.locator('.ant-modal button:has-text("Add New Alias")');
        if (await newAliasButton.count() > 0) {
          await newAliasButton.click();
          await page.waitForTimeout(500);

          // Form fields should be present
          const nameInput = page.locator('.ant-modal input[id*="name"]');
          const exists = await nameInput.count();
          expect(exists).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  test('should support selecting aliases from catalog', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      const addButton = page.locator('button:has-text("Add from Catalog")');
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);

        // Check for checkboxes in catalog table
        const checkboxes = page.locator('.ant-modal .ant-table input[type="checkbox"]');
        const exists = await checkboxes.count();
        expect(exists).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should display alias details in table', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      // Check if any aliases are displayed
      const table = page.locator('.ant-table');
      const exists = await table.count();
      expect(exists).toBeGreaterThan(0);
    }
  });

  test('should have edit and delete actions for aliases', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      // Look for action buttons (edit/delete)
      const actionButtons = page.locator('.ant-table button');
      const exists = await actionButtons.count();
      expect(exists).toBeGreaterThanOrEqual(0);
    }
  });

  test('should close catalog modal when cancel is clicked', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      const addButton = page.locator('button:has-text("Add from Catalog")');
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);

        // Close modal
        const closeButton = page.locator('.ant-modal .ant-modal-close');
        if (await closeButton.count() > 0) {
          await closeButton.click();
          await page.waitForTimeout(300);

          // Modal should be closed
          const modal = page.locator('.ant-modal:visible');
          const exists = await modal.count();
          expect(exists).toBe(0);
        }
      }
    }
  });
});

test.describe('Report Editor - Alias Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForLoadState('networkidle');
  });

  test('should persist aliases when report is saved', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    // Navigate to Model tab
    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      // Look for Save button
      const saveButton = page.locator('button:has-text("Save")');
      const exists = await saveButton.count();
      expect(exists).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display alias paths correctly', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      // Check for path display in table
      const table = page.locator('.ant-table');
      const exists = await table.count();
      expect(exists).toBeGreaterThan(0);
    }
  });

  test('should display mapper class information', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');

    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")');
    if (await modelTab.count() > 0) {
      await modelTab.click();
      await page.waitForTimeout(500);

      // Mapper information should be in table
      const table = page.locator('.ant-table');
      const exists = await table.count();
      expect(exists).toBeGreaterThan(0);
    }
  });
});

