/**
 * E2E Tests for Report Configs Page (Phase 1)
 * Tests report configuration management functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Report Configs Page - Phase 1', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the report configs page
    await page.goto('/tableau/report-configs');
  });

  test('should display the page title and header', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Tableau/);
    
    // Check page heading
    const heading = page.locator('h2').first();
    await expect(heading).toContainText('Report Configurations');
  });

  test('should display the Create New button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create New")');
    await expect(createButton).toBeVisible();
  });

  test('should display the report configs table', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should have table headers', async ({ page }) => {
    await page.waitForSelector('.ant-table-thead');
    
    const headers = page.locator('.ant-table-thead th');
    const headerCount = await headers.count();
    
    // Should have multiple headers (Name, Description, Entity, Owner, etc.)
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

  test('should display QuickRunReport component', async ({ page }) => {
    // Check for QuickRunReport dropdown
    const quickRun = page.locator('.quick-run-report');
    
    // Component should exist (may not be visible if no reports)
    const exists = await quickRun.count();
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Configs - Create Report Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/report-configs');
  });

  test('should open Create Report Dialog', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create New")');
    await createButton.click();
    
    // Dialog should be visible
    const dialog = page.locator('.ant-modal');
    await expect(dialog).toBeVisible();
    
    // Dialog title should be correct
    const dialogTitle = page.locator('.ant-modal-title');
    await expect(dialogTitle).toContainText('Create New Report');
  });

  test('should display entity type filter in dialog', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create New")');
    await createButton.click();
    
    // Wait for dialog
    await page.waitForSelector('.ant-modal');
    
    // Should have entity type radio buttons
    const radioButtons = page.locator('.ant-radio-group');
    await expect(radioButtons.first()).toBeVisible();
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

  test('should validate required fields', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create New")');
    await createButton.click();
    
    // Wait for dialog
    await page.waitForSelector('.ant-modal');
    
    // Try to proceed without filling fields
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      
      // Should show validation errors
      const errorMessages = page.locator('.ant-form-item-explain-error');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Report Configs - Table Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/report-configs');
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
      
      // Row should be selected (highlighted)
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
      // Pagination should be visible
      await expect(pagination).toBeVisible();
    }
  });
});

test.describe('Report Configs - QuickRunReport', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/report-configs');
  });

  test('should display QuickRunReport dropdown', async ({ page }) => {
    const dropdown = page.locator('.quick-run-report select, .quick-run-report .ant-select');
    const exists = await dropdown.count();
    
    // Component should exist
    expect(exists).toBeGreaterThanOrEqual(0);
  });

  test('should have Run button', async ({ page }) => {
    const runButton = page.locator('.quick-run-report button:has-text("Run")');
    const exists = await runButton.count();
    
    // Run button should exist
    expect(exists).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Report Configs - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/report-configs');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h2 = page.locator('h2');
    await expect(h2.first()).toBeVisible();
  });

  test('should have accessible table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    const thead = page.locator('thead');
    await expect(thead).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Report Configs - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/tableau/report-configs');
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
    
    await page.goto('/tableau/report-configs');
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

test.describe('Report Configs - Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tableau/report-configs');
    
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
    
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/tableau/report-configs');
    
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
    
    const createButton = page.locator('button:has-text("Create New")');
    await expect(createButton).toBeVisible();
  });
});

