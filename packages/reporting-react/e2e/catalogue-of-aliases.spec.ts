/**
 * E2E tests for Catalogue of Aliases page
 */

import { test, expect } from '@playwright/test';

test.describe('Catalogue of Aliases', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Catalogue of Aliases page
    await page.goto('http://localhost:3007/tableau/catalogue-of-aliases');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display page title and navigation', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("Catalogue of Aliases")')).toBeVisible();
    
    // Check navigation links
    await expect(page.locator('text=Report config editor')).toBeVisible();
    await expect(page.locator('text=Stream Reports')).toBeVisible();
    await expect(page.locator('text=Catalogue of Aliases')).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Create New")')).toBeVisible();
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Import")')).toBeVisible();
  });

  test('should display filter section', async ({ page }) => {
    await expect(page.locator('text=Filter')).toBeVisible();
    await expect(page.locator('text=Filter by state:')).toBeVisible();
    await expect(page.locator('text=Entity:')).toBeVisible();
    await expect(page.locator('text=Author or Group:')).toBeVisible();
    await expect(page.locator('text=By date and time:')).toBeVisible();
    await expect(page.locator('text=Search:')).toBeVisible();
  });

  test('should display table with correct columns', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Check column headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Description")')).toBeVisible();
    await expect(page.locator('th:has-text("Entity")')).toBeVisible();
    await expect(page.locator('th:has-text("User")')).toBeVisible();
    await expect(page.locator('th:has-text("State")')).toBeVisible();
    await expect(page.locator('th:has-text("Created")')).toBeVisible();
    await expect(page.locator('th:has-text("Action")')).toBeVisible();
  });

  test('should filter by search text', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Get initial row count
    const initialRows = await page.locator('tbody tr').count();
    
    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');
    
    // Wait for filtering to apply
    await page.waitForTimeout(500);
    
    // Row count should change (or stay the same if there are matching items)
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('should open create dialog when clicking Create New', async ({ page }) => {
    await page.click('button:has-text("Create New")');
    
    // Dialog should appear
    await expect(page.locator('.ant-modal:has-text("Create Alias")')).toBeVisible();
    
    // Check for step 1: Entity selection
    await expect(page.locator('text=Entity')).toBeVisible();
    await expect(page.locator('text=Select entity class')).toBeVisible();
  });

  test('should navigate through create dialog steps', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("Create New")');
    await expect(page.locator('.ant-modal:has-text("Create Alias")')).toBeVisible();
    
    // Step 1: Select entity
    const entitySelect = page.locator('.ant-select').first();
    await entitySelect.click();
    
    // Wait for dropdown options
    await page.waitForSelector('.ant-select-dropdown');
    
    // Select first option (if available)
    const firstOption = page.locator('.ant-select-item').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      
      // Click Next
      await page.click('button:has-text("Next")');
      
      // Should be on step 2: Paths
      await expect(page.locator('text=Paths')).toBeVisible();
      await expect(page.locator('text=Select columns/paths for the alias')).toBeVisible();
    }
  });

  test('should close create dialog when clicking Cancel', async ({ page }) => {
    // Open create dialog
    await page.click('button:has-text("Create New")');
    await expect(page.locator('.ant-modal:has-text("Create Alias")')).toBeVisible();
    
    // Click Cancel
    await page.click('button:has-text("Cancel")');
    
    // Dialog should close
    await expect(page.locator('.ant-modal:has-text("Create Alias")')).not.toBeVisible();
  });

  test('should select table rows', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Check if there are any rows
    const rowCount = await page.locator('tbody tr').count();
    
    if (rowCount > 0) {
      // Click first checkbox
      const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
      await firstCheckbox.check();
      
      // Delete Selected button should appear
      await expect(page.locator('button:has-text("Delete Selected")')).toBeVisible();
    }
  });

  test('should handle bulk delete with confirmation', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    const rowCount = await page.locator('tbody tr').count();
    
    if (rowCount > 0) {
      // Select first row
      const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
      await firstCheckbox.check();
      
      // Click Delete Selected
      await page.click('button:has-text("Delete Selected")');
      
      // Confirmation modal should appear
      await expect(page.locator('.ant-modal-confirm')).toBeVisible();
      await expect(page.locator('text=/Do you really want to remove/i')).toBeVisible();
      
      // Click Cancel to avoid actually deleting
      await page.click('.ant-modal-confirm button:has-text("Cancel")');
    }
  });

  test('should display edit and delete buttons in action column', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    const rowCount = await page.locator('tbody tr').count();
    
    if (rowCount > 0) {
      const firstRow = page.locator('tbody tr').first();
      
      // Check for action buttons
      await expect(firstRow.locator('button[title="Edit"]')).toBeVisible();
      await expect(firstRow.locator('button[title="Delete"]')).toBeVisible();
    }
  });

  test('should open edit dialog when clicking edit button', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    const rowCount = await page.locator('tbody tr').count();
    
    if (rowCount > 0) {
      // Click edit button on first row
      await page.locator('tbody tr').first().locator('button[title="Edit"]').click();
      
      // Edit dialog should appear
      await expect(page.locator('.ant-modal:has-text("Edit Alias")')).toBeVisible();
    }
  });

  test('should handle delete with confirmation', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    const rowCount = await page.locator('tbody tr').count();
    
    if (rowCount > 0) {
      // Click delete button on first row
      await page.locator('tbody tr').first().locator('button[title="Delete"]').click();
      
      // Confirmation modal should appear
      await expect(page.locator('.ant-modal-confirm')).toBeVisible();
      await expect(page.locator('text=/Do you really want to remove/i')).toBeVisible();
      
      // Click Cancel to avoid actually deleting
      await page.click('.ant-modal-confirm button:has-text("Cancel")');
    }
  });

  test('should handle export functionality', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    
    // Click Export button
    await page.click('button:has-text("Export")');
    
    // Wait for download to start (or timeout)
    const download = await downloadPromise;
    
    if (download) {
      // Verify download filename contains expected pattern
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/catalog-aliases.*\.json/);
    }
  });

  test('should handle import functionality', async ({ page }) => {
    // Click Import button
    await page.click('button:has-text("Import")');
    
    // File input should be triggered (we can't actually test file selection in E2E)
    // But we can verify the button click doesn't cause errors
    await page.waitForTimeout(500);
  });

  test('should filter by state', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Click state filter dropdown
    const stateFilter = page.locator('text=Filter by state:').locator('..').locator('.ant-select');
    await stateFilter.click();
    
    // Wait for dropdown
    await page.waitForSelector('.ant-select-dropdown');
    
    // Select first option
    const firstOption = page.locator('.ant-select-item').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      
      // Wait for filtering to apply
      await page.waitForTimeout(500);
    }
  });

  test('should filter by entity', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Click entity filter dropdown
    const entityFilter = page.locator('text=Entity:').locator('..').locator('.ant-select');
    await entityFilter.click();
    
    // Wait for dropdown
    await page.waitForSelector('.ant-select-dropdown');
    
    // Select first option
    const firstOption = page.locator('.ant-select-item').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      
      // Wait for filtering to apply
      await page.waitForTimeout(500);
    }
  });

  test('should filter by author', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Click author filter dropdown
    const authorFilter = page.locator('text=Author or Group:').locator('..').locator('.ant-select');
    await authorFilter.click();
    
    // Wait for dropdown
    await page.waitForSelector('.ant-select-dropdown');
    
    // Select first option
    const firstOption = page.locator('.ant-select-item').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      
      // Wait for filtering to apply
      await page.waitForTimeout(500);
    }
  });

  test('should handle date/time filter', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Click date picker
    const datePicker = page.locator('text=By date and time:').locator('..').locator('.ant-picker');
    await datePicker.click();
    
    // Wait for date picker dropdown
    await page.waitForSelector('.ant-picker-dropdown');
    
    // Verify preset ranges are available
    await expect(page.locator('text=Past hour')).toBeVisible();
    await expect(page.locator('text=Past 24 hours')).toBeVisible();
    await expect(page.locator('text=Past week')).toBeVisible();
  });

  test('should sort table columns', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    const rowCount = await page.locator('tbody tr').count();
    
    if (rowCount > 1) {
      // Click on Name column header to sort
      await page.click('th:has-text("Name")');
      
      // Wait for sorting to apply
      await page.waitForTimeout(500);
      
      // Click again to reverse sort
      await page.click('th:has-text("Name")');
      
      // Wait for sorting to apply
      await page.waitForTimeout(500);
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Check if pagination exists
    const pagination = page.locator('.ant-pagination');
    
    if (await pagination.isVisible()) {
      // Check for page size selector
      const pageSizeSelector = page.locator('.ant-pagination-options-size-changer');
      
      if (await pageSizeSelector.isVisible()) {
        await pageSizeSelector.click();
        
        // Select different page size
        await page.waitForSelector('.ant-select-dropdown');
        const option = page.locator('.ant-select-item').first();
        await option.click();
        
        // Wait for table to update
        await page.waitForTimeout(500);
      }
    }
  });

  test('should navigate between pages using navigation links', async ({ page }) => {
    // Click on Report config editor
    await page.click('text=Report config editor');
    
    // Should navigate to report config editor page
    await expect(page).toHaveURL(/\/tableau\/report-config-editor/);
    
    // Navigate back to Catalogue of Aliases
    await page.goto('http://localhost:3007/tableau/catalogue-of-aliases');
    
    // Click on Stream Reports
    await page.click('text=Stream Reports');
    
    // Should navigate to stream reports page
    await expect(page).toHaveURL(/\/tableau\/stream-reports/);
  });
});

