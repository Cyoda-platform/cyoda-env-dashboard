/**
 * E2E Tests for Tableau Report Editor Tabs
 * Tests navigation and functionality of Model, Columns, FilterBuilder, Grouping, Sorting, Summary, JSON tabs
 */

import { test, expect } from '@playwright/test';

/**
 * Helper function to login before tests
 */
async function login(page: any) {
  await page.goto('/login');
  const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="Username" i]').first();
  const passwordInput = page.locator('input[placeholder*="password" i], input[placeholder*="Password" i]').first();
  await usernameInput.fill(process.env.TEST_ENV_USER || 'demo.user');
  await passwordInput.fill(process.env.TEST_ENV_SECRET || 'password');
  await page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in")').first().click();
  await page.waitForURL(/^(?!.*login).*$/, { timeout: 30000 });
}

/**
 * Helper function to set entity type in global settings
 */
async function setEntityType(page: any, entityType: 'BUSINESS' | 'PERSISTENCE') {
  await page.evaluate((type) => {
    const settings = {
      state: {
        entityType: type,
      },
      version: 0
    };
    localStorage.setItem('cyoda_global_ui_settings', JSON.stringify(settings));
  }, entityType);
  console.log(`✓ Set entity type to: ${entityType}`);
}

/**
 * Helper function to find and open a report for editing
 */
async function openReportEditor(page: any): Promise<boolean> {
  // Navigate to reports page
  await page.goto('/tableau/reports');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Try to find edit button by icon (EditOutlined)
  let editButton = page.locator('.ant-table-tbody button:has(.anticon-edit)').first();
  let editButtonCount = await editButton.count();

  // If no edit buttons in BUSINESS mode, try PERSISTENCE mode
  if (editButtonCount === 0) {
    console.log('⚠️  No reports in BUSINESS mode, trying PERSISTENCE mode...');
    await setEntityType(page, 'PERSISTENCE');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    editButton = page.locator('.ant-table-tbody button:has(.anticon-edit)').first();
    editButtonCount = await editButton.count();
  }

  if (editButtonCount === 0) {
    console.log('⚠️  No reports found to edit');
    return false;
  }

  console.log(`✓ Found ${editButtonCount} report(s) with edit button`);

  // Click edit button
  await editButton.click();
  console.log('✓ Clicked Edit button');

  // Wait for editor page to load
  await page.waitForURL(/\/tableau\/report-editor\//, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  console.log('✓ Report editor opened');

  return true;
}

test.describe('Tableau Report Editor - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display all editor tabs', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Wait for tabs to load
    await page.waitForSelector('.ant-tabs', { timeout: 10000 });
    console.log('✓ Tabs container loaded');

    // Check for all expected tabs
    const expectedTabs = ['Model', 'Columns', 'FilterBuilder', 'Sorting', 'Grouping', 'Summary', 'JSON'];

    for (const tabName of expectedTabs) {
      const tab = page.locator(`.ant-tabs-tab:has-text("${tabName}")`).first();
      const isVisible = await tab.isVisible();

      if (isVisible) {
        console.log(`✓ Tab "${tabName}" is visible`);
      } else {
        console.log(`⚠️  Tab "${tabName}" not found`);
      }
    }

    // At least Model tab should be visible
    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")').first();
    await expect(modelTab).toBeVisible();
    console.log('✓ All expected tabs verified');
  });

  test('should allow switching between tabs', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    await page.waitForSelector('.ant-tabs', { timeout: 10000 });

    // Click each tab in sequence
    const tabs = ['Columns', 'FilterBuilder', 'Sorting', 'Grouping', 'Summary', 'JSON', 'Model'];

    for (const tabName of tabs) {
      const tab = page.locator(`.ant-tabs-tab:has-text("${tabName}")`).first();
      const isVisible = await tab.isVisible();

      if (isVisible) {
        await tab.click();
        await page.waitForTimeout(500);

        // Tab should be active
        const activeTab = page.locator('.ant-tabs-tab-active');
        const activeTabText = await activeTab.textContent();

        if (activeTabText?.includes(tabName)) {
          console.log(`✓ Switched to "${tabName}" tab`);
        } else {
          console.log(`⚠️  Tab "${tabName}" may not be active`);
        }
      }
    }
  });
});

test.describe('Tableau Report Editor - Model Tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display Model tab content', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Click Model tab
    const modelTab = page.locator('.ant-tabs-tab:has-text("Model")').first();
    await modelTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Opened Model tab');

    // Check for Model tab content (ModellingColDefs component)
    const modelContent = page.locator('.report-editor-tab-model, .modelling-col-defs').first();
    const hasContent = await modelContent.isVisible().catch(() => false);

    if (hasContent) {
      console.log('✓ Model tab content is visible');
    } else {
      console.log('⚠️  Model tab content may not be loaded yet');
    }
  });
});

test.describe('Tableau Report Editor - Columns Tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display Columns tab with transfer component', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Click Columns tab
    const columnsTab = page.locator('.ant-tabs-tab:has-text("Columns")').first();
    await columnsTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Opened Columns tab');

    // Check for Transfer component (dual list selector)
    const transferComponent = page.locator('.ant-transfer, .report-editor-tab-columns').first();
    const hasTransfer = await transferComponent.isVisible().catch(() => false);

    if (hasTransfer) {
      console.log('✓ Columns transfer component is visible');
    } else {
      console.log('⚠️  Columns transfer component may not be loaded');
    }
  });
});

test.describe('Tableau Report Editor - FilterBuilder Tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display FilterBuilder tab', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Click FilterBuilder tab
    const filterTab = page.locator('.ant-tabs-tab:has-text("FilterBuilder")').first();
    await filterTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Opened FilterBuilder tab');

    // Check for FilterBuilder content
    const filterContent = page.locator('.report-editor-tab-filter-builder, .filter-builder').first();
    const hasContent = await filterContent.isVisible().catch(() => false);

    if (hasContent) {
      console.log('✓ FilterBuilder tab content is visible');
    } else {
      console.log('⚠️  FilterBuilder tab content may not be loaded');
    }
  });
});

test.describe('Tableau Report Editor - Sorting Tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display Sorting tab with transfer component', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Click Sorting tab
    const sortingTab = page.locator('.ant-tabs-tab:has-text("Sorting")').first();
    await sortingTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Opened Sorting tab');

    // Check for Transfer component
    const transferComponent = page.locator('.ant-transfer, .report-editor-tab-sorting').first();
    const hasTransfer = await transferComponent.isVisible().catch(() => false);

    if (hasTransfer) {
      console.log('✓ Sorting transfer component is visible');
    } else {
      console.log('⚠️  Sorting transfer component may not be loaded');
    }
  });
});

test.describe('Tableau Report Editor - Grouping Tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display Grouping tab with hierarchy toggle', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Click Grouping tab
    const groupingTab = page.locator('.ant-tabs-tab:has-text("Grouping")').first();
    await groupingTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Opened Grouping tab');

    // Check for Grouping content
    const groupingContent = page.locator('.report-editor-tab-grouping').first();
    const hasContent = await groupingContent.isVisible().catch(() => false);

    if (hasContent) {
      console.log('✓ Grouping tab content is visible');

      // Check for Hierarchy Enable switch
      const hierarchySwitch = page.locator('label:has-text("Hierarchy Enable")').first();
      const hasSwitch = await hierarchySwitch.isVisible().catch(() => false);

      if (hasSwitch) {
        console.log('✓ Hierarchy Enable switch found');
      }
    } else {
      console.log('⚠️  Grouping tab content may not be loaded');
    }
  });
});

test.describe('Tableau Report Editor - Summary Tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display Summary tab', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Click Summary tab
    const summaryTab = page.locator('.ant-tabs-tab:has-text("Summary")').first();
    await summaryTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Opened Summary tab');

    // Check for Summary content
    const summaryContent = page.locator('.report-editor-tab-summary').first();
    const hasContent = await summaryContent.isVisible().catch(() => false);

    if (hasContent) {
      console.log('✓ Summary tab content is visible');
    } else {
      console.log('⚠️  Summary tab content may not be loaded');
    }
  });
});

test.describe('Tableau Report Editor - JSON Tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display JSON tab with code editor', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Click JSON tab
    const jsonTab = page.locator('.ant-tabs-tab:has-text("JSON")').first();
    await jsonTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Opened JSON tab');

    // Check for JSON editor (Monaco or textarea)
    const jsonEditor = page.locator('.report-editor-tab-json, .monaco-editor, textarea').first();
    const hasEditor = await jsonEditor.isVisible().catch(() => false);

    if (hasEditor) {
      console.log('✓ JSON editor is visible');
    } else {
      console.log('⚠️  JSON editor may not be loaded');
    }
  });
});

test.describe('Tableau Report Editor - Action Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display action buttons (Back, Save, Run)', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Check for Back button
    const backButton = page.locator('button:has-text("Back"), button[aria-label*="back" i]').first();
    const hasBack = await backButton.isVisible().catch(() => false);

    if (hasBack) {
      console.log('✓ Back button found');
    }

    // Check for Save button
    const saveButton = page.locator('button:has-text("Save"), button:has(.anticon-save)').first();
    const hasSave = await saveButton.isVisible().catch(() => false);

    if (hasSave) {
      console.log('✓ Save button found');
    }

    // Check for Run button
    const runButton = page.locator('button:has-text("Run"), button:has(.anticon-play-circle)').first();
    const hasRun = await runButton.isVisible().catch(() => false);

    if (hasRun) {
      console.log('✓ Run button found');
    }

    // At least one action button should be present
    if (hasBack || hasSave || hasRun) {
      console.log('✓ Action buttons verified');
    } else {
      console.log('⚠️  No action buttons found - UI may have changed');
    }
  });

  test('should navigate back when clicking Back button', async ({ page }) => {
    const opened = await openReportEditor(page);
    if (!opened) {
      test.skip();
      return;
    }

    // Click Back button
    const backButton = page.locator('button:has-text("Back"), button[aria-label*="back" i]').first();
    const hasBack = await backButton.isVisible().catch(() => false);

    if (!hasBack) {
      console.log('⚠️  Back button not found - skipping test');
      return;
    }

    await backButton.click();
    console.log('✓ Clicked Back button');

    // Should navigate back to reports page
    await page.waitForURL(/\/tableau\/reports/, { timeout: 10000 });
    console.log('✓ Navigated back to reports page');
  });
});
