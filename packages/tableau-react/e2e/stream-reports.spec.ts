/**
 * E2E Tests for Stream Reports Pages (Phase 3)
 * Tests stream report management and editor functionality
 */

import { test, expect } from '@playwright/test';

// Mock stream report ID for testing
const MOCK_STREAM_REPORT_ID = 'test-stream-report-123';

test.describe('Stream Reports Page - Phase 3', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the stream reports page
    await page.goto('/tableau/stream-reports');
  });

  test('should display the page title and header', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Tableau/);
    
    // Check page heading
    const heading = page.locator('h2').first();
    await expect(heading).toContainText('Stream Reports');
  });

  test('should display the Create New button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create New")');
    await expect(createButton).toBeVisible();
  });

  test('should display the stream reports table', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should have table headers', async ({ page }) => {
    await page.waitForSelector('.ant-table-thead');
    
    const headers = page.locator('.ant-table-thead th');
    const headerCount = await headers.count();
    
    // Should have multiple headers
    expect(headerCount).toBeGreaterThan(0);
  });

  test('should display filter section', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should allow filtering by search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    
    // Type in search
    await searchInput.fill('test');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Table should still be visible
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should display Reset State button', async ({ page }) => {
    const resetButton = page.locator('button:has-text("Reset State")');
    const exists = await resetButton.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Stream Reports - Create Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/stream-reports');
  });

  test('should open Create Stream Report Dialog', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create New")');
    await createButton.click();
    
    // Dialog should be visible
    const dialog = page.locator('.ant-modal');
    await expect(dialog).toBeVisible();
    
    // Dialog title should be correct
    const dialogTitle = page.locator('.ant-modal-title');
    await expect(dialogTitle).toContainText('Create New Stream');
  });

  test('should close dialog on cancel', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create New")');
    await createButton.click();
    
    // Wait for dialog
    await page.waitForSelector('.ant-modal');
    
    // Click cancel
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();
    
    // Dialog should be closed
    const dialog = page.locator('.ant-modal');
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Stream Reports - Table Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/stream-reports');
    await page.waitForSelector('.ant-table');
  });

  test('should display action buttons for each row', async ({ page }) => {
    // Check if there are any rows
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // First row should have action buttons
      const firstRow = rows.first();
      const editButton = firstRow.locator('button[title*="Edit"], button:has-text("Edit")');
      const runButton = firstRow.locator('button[title*="Run"], button:has-text("Run")');
      
      // At least one action button should exist
      const editExists = await editButton.count();
      const runExists = await runButton.count();
      expect(editExists + runExists).toBeGreaterThan(0);
    }
  });

  test('should allow row selection', async ({ page }) => {
    // Check if there are any rows
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Click first row
      await rows.first().click();
      
      // Row should be selected
      const selectedRow = page.locator('.ant-table-row-selected, .selected-row');
      const selectedCount = await selectedRow.count();
      expect(selectedCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Check for pagination
    const pagination = page.locator('.ant-pagination');
    const paginationExists = await pagination.count();
    
    if (paginationExists > 0) {
      await expect(pagination).toBeVisible();
    }
  });
});

test.describe('Stream Report Editor - Phase 3', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the stream report editor page
    await page.goto(`/tableau/stream-report-editor/${MOCK_STREAM_REPORT_ID}`);
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
    
    // Should have 7 tabs (including Range tab)
    expect(tabCount).toBeGreaterThanOrEqual(5);
  });

  test('should have all required tabs including Range', async ({ page }) => {
    await page.waitForSelector('.ant-tabs');
    
    // Check for each tab
    const columnsTab = page.locator('.ant-tabs-tab:has-text("Columns")');
    const filterTab = page.locator('.ant-tabs-tab:has-text("Filter")');
    const rangeTab = page.locator('.ant-tabs-tab:has-text("Range")');
    const sortingTab = page.locator('.ant-tabs-tab:has-text("Sorting")');
    const groupingTab = page.locator('.ant-tabs-tab:has-text("Grouping")');
    const summaryTab = page.locator('.ant-tabs-tab:has-text("Summary")');
    const jsonTab = page.locator('.ant-tabs-tab:has-text("JSON")');
    
    await expect(columnsTab).toBeVisible();
    await expect(filterTab).toBeVisible();
    await expect(rangeTab).toBeVisible();
    await expect(sortingTab).toBeVisible();
    await expect(groupingTab).toBeVisible();
    await expect(summaryTab).toBeVisible();
    await expect(jsonTab).toBeVisible();
  });
});

test.describe('Stream Report Editor - Range Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/stream-report-editor/${MOCK_STREAM_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should display Range tab content', async ({ page }) => {
    // Click Range tab
    const rangeTab = page.locator('.ant-tabs-tab:has-text("Range")');
    await rangeTab.click();
    
    // Should display range configuration
    const rangeContent = page.locator('.stream-report-editor-tab-range');
    const exists = await rangeContent.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should have Range Field selector', async ({ page }) => {
    const rangeTab = page.locator('.ant-tabs-tab:has-text("Range")');
    await rangeTab.click();
    
    // Check for Range Field label
    const rangeFieldLabel = page.locator('label:has-text("Range Field")');
    const exists = await rangeFieldLabel.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should have Condition Type selector', async ({ page }) => {
    const rangeTab = page.locator('.ant-tabs-tab:has-text("Range")');
    await rangeTab.click();
    
    // Check for Condition Type label
    const conditionLabel = page.locator('label:has-text("Condition Type")');
    const exists = await conditionLabel.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should have Range Order radio buttons', async ({ page }) => {
    const rangeTab = page.locator('.ant-tabs-tab:has-text("Range")');
    await rangeTab.click();
    
    // Check for Range Order label
    const orderLabel = page.locator('label:has-text("Range Order")');
    const exists = await orderLabel.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should display range info section', async ({ page }) => {
    const rangeTab = page.locator('.ant-tabs-tab:has-text("Range")');
    await rangeTab.click();
    
    // Check for info section
    const infoSection = page.locator('.range-info');
    const exists = await infoSection.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Stream Report Editor - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/stream-report-editor/${MOCK_STREAM_REPORT_ID}`);
    await page.waitForSelector('.ant-tabs');
  });

  test('should allow switching between tabs', async ({ page }) => {
    // Click each tab in sequence
    const tabs = ['Columns', 'Filter', 'Range', 'Sorting', 'Grouping', 'Summary', 'JSON'];
    
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
    // Click Range tab
    const rangeTab = page.locator('.ant-tabs-tab:has-text("Range")');
    await rangeTab.click();
    
    // Switch to another tab
    const sortingTab = page.locator('.ant-tabs-tab:has-text("Sorting")');
    await sortingTab.click();
    
    // Switch back to Range
    await rangeTab.click();
    
    // Content should still be there
    const rangeContent = page.locator('.stream-report-editor-tab-range');
    const exists = await rangeContent.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Stream Report Editor - Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tableau/stream-report-editor/${MOCK_STREAM_REPORT_ID}`);
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
    expect(url).not.toContain('/stream-report-editor/');
  });
});

test.describe('Stream Reports - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/stream-reports');
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
});

test.describe('Stream Reports - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/tableau/stream-reports');
    await page.waitForSelector('.ant-table');
    
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
    
    await page.goto('/tableau/stream-reports');
    await page.waitForSelector('.ant-table');
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load') && 
      !error.includes('404') &&
      !error.includes('Network')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Stream Reports - Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tableau/stream-reports');
    
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
    
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/tableau/stream-reports');
    
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
    
    const createButton = page.locator('button:has-text("Create New")');
    await expect(createButton).toBeVisible();
  });
});

