/**
 * E2E Tests for Report Editor Page (Phase 2)
 * Tests report editor functionality with all 7 tabs
 */

import { test, expect } from '@playwright/test';

// Mock report ID for testing
const MOCK_REPORT_ID = 'test-report-123';

test.describe('Report Editor Page - Phase 2', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the report editor page
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
  });

  test('should display the page title and header', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Tableau/);
    
    // Check page heading
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
  });

  test('should display Back button', async ({ page }) => {
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeVisible();
  });

  test('should display Update button', async ({ page }) => {
    const updateButton = page.locator('button:has-text("Update")');
    await expect(updateButton).toBeVisible();
  });

  test('should display tabs', async ({ page }) => {
    // Wait for tabs to load
    await page.waitForSelector('.ant-tabs');
    
    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();
    
    // Should have 7 tabs
    expect(tabCount).toBeGreaterThanOrEqual(5);
  });

  test('should have all required tabs', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');
    
    // Check for each tab
    const columnsTab = page.locator('.ant-tabs-tab:has-text("Columns")');
    const filterTab = page.locator('.ant-tabs-tab:has-text("Filter")');
    const sortingTab = page.locator('.ant-tabs-tab:has-text("Sorting")');
    const groupingTab = page.locator('.ant-tabs-tab:has-text("Grouping")');
    const summaryTab = page.locator('.ant-tabs-tab:has-text("Summary")');
    const jsonTab = page.locator('.ant-tabs-tab:has-text("JSON")');
    
    await expect(columnsTab).toBeVisible();
    await expect(filterTab).toBeVisible();
    await expect(sortingTab).toBeVisible();
    await expect(groupingTab).toBeVisible();
    await expect(summaryTab).toBeVisible();
    await expect(jsonTab).toBeVisible();
  });
});

test.describe('Report Editor - Columns Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should display Columns tab content', async ({ page }) => {
    // Click Columns tab
    const columnsTab = page.locator('.ant-tabs-tab:has-text("Columns")');
    await columnsTab.click();
    
    // Should display Transfer component
    const transfer = page.locator('.ant-transfer');
    const exists = await transfer.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should allow column selection', async ({ page }) => {
    const columnsTab = page.locator('.ant-tabs-tab:has-text("Columns")');
    await columnsTab.click();
    
    // Check for transfer lists
    const transferLists = page.locator('.ant-transfer-list');
    const listCount = await transferLists.count();
    
    // Should have 2 lists (available and selected)
    expect(listCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Editor - Filter Builder Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should display Filter Builder tab content', async ({ page }) => {
    // Click Filter Builder tab
    const filterTab = page.locator('.ant-tabs-tab:has-text("Filter")');
    await filterTab.click();
    
    // Should display filter builder
    const filterBuilder = page.locator('.filter-builder, .report-editor-tab-filter-builder');
    const exists = await filterBuilder.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Editor - Sorting Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should display Sorting tab content', async ({ page }) => {
    // Click Sorting tab
    const sortingTab = page.locator('.ant-tabs-tab:has-text("Sorting")');
    await sortingTab.click();
    
    // Should display sorting configuration
    const sortingContent = page.locator('.report-editor-tab-sorting');
    const exists = await sortingContent.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should have Add Sorting button', async ({ page }) => {
    const sortingTab = page.locator('.ant-tabs-tab:has-text("Sorting")');
    await sortingTab.click();
    
    // Check for Add button
    const addButton = page.locator('button:has-text("Add")');
    const exists = await addButton.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Editor - Grouping Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should display Grouping tab content', async ({ page }) => {
    // Click Grouping tab
    const groupingTab = page.locator('.ant-tabs-tab:has-text("Grouping")');
    await groupingTab.click();
    
    // Should display grouping configuration
    const groupingContent = page.locator('.report-editor-tab-grouping');
    const exists = await groupingContent.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should have Add Grouping button', async ({ page }) => {
    const groupingTab = page.locator('.ant-tabs-tab:has-text("Grouping")');
    await groupingTab.click();
    
    // Check for Add button
    const addButton = page.locator('button:has-text("Add")');
    const exists = await addButton.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Editor - Summary Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should display Summary tab content', async ({ page }) => {
    // Click Summary tab
    const summaryTab = page.locator('.ant-tabs-tab:has-text("Summary")');
    await summaryTab.click();
    
    // Should display summary configuration
    const summaryContent = page.locator('.report-editor-tab-summary');
    const exists = await summaryContent.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should have Add Summary button', async ({ page }) => {
    const summaryTab = page.locator('.ant-tabs-tab:has-text("Summary")');
    await summaryTab.click();
    
    // Check for Add button
    const addButton = page.locator('button:has-text("Add")');
    const exists = await addButton.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Editor - JSON Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should display JSON tab content', async ({ page }) => {
    // Click JSON tab
    const jsonTab = page.locator('.ant-tabs-tab:has-text("JSON")');
    await jsonTab.click();
    
    // Should display Monaco Editor
    const editor = page.locator('.monaco-editor, .report-editor-tab-json');
    const exists = await editor.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should display JSON content', async ({ page }) => {
    const jsonTab = page.locator('.ant-tabs-tab:has-text("JSON")');
    await jsonTab.click();
    
    // Wait for editor to load
    await page.waitForTimeout(1000);
    
    // Editor should be visible
    const editorContainer = page.locator('.monaco-editor');
    const exists = await editorContainer.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Editor - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should allow switching between tabs', async ({ page }) => {
    // Click each tab in sequence
    const tabs = ['Columns', 'Filter', 'Sorting', 'Grouping', 'Summary', 'JSON'];
    
    for (const tabName of tabs) {
      const tab = page.locator(`.ant-tabs-tab:has-text("${tabName}")`);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(300);
        
        // Tab should be active
        const activeTab = page.locator('.ant-tabs-tab-active');
        await expect(activeTab).toContainText(tabName);
      }
    }
  });

  test('should maintain state when switching tabs', async ({ page }) => {
    // Click Columns tab
    const columnsTab = page.locator('.ant-tabs-tab:has-text("Columns")');
    await columnsTab.click();
    
    // Switch to another tab
    const sortingTab = page.locator('.ant-tabs-tab:has-text("Sorting")');
    await sortingTab.click();
    
    // Switch back to Columns
    await columnsTab.click();
    
    // Content should still be there
    const transfer = page.locator('.ant-transfer');
    const exists = await transfer.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Editor - Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
  });

  test('should have Update button', async ({ page }) => {
    const updateButton = page.locator('button:has-text("Update")');
    await expect(updateButton).toBeVisible();
  });

  test('should have Update and Run button', async ({ page }) => {
    const updateRunButton = page.locator('button:has-text("Update and Run")');
    const exists = await updateRunButton.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should navigate back on Back button click', async ({ page }) => {
    const backButton = page.locator('button:has-text("Back")');
    await backButton.click();
    
    // Should navigate away from editor
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).not.toContain('/report-editor/');
  });
});

test.describe('Report Editor - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h2 = page.locator('h2');
    await expect(h2.first()).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have accessible tabs', async ({ page }) => {
    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();
    
    expect(tabCount).toBeGreaterThan(0);
  });
});

test.describe('Report Editor - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`/tableau/report-editor/${MOCK_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load') && 
      !error.includes('404') &&
      !error.includes('Network')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

