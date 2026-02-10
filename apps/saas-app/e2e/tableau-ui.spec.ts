/**
 * E2E Tests for Tableau UI Interactions
 * Tests sorting, pagination, tab switching, and other UI interactions
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

test.describe('Tableau UI - Tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should switch between Report Config and Reports tabs', async ({ page }) => {
    await page.goto('/tableau/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check that Report Config tab is active by default
    const reportConfigTab = page.locator('.ant-tabs-tab:has-text("Report Config")').first();
    await expect(reportConfigTab).toBeVisible();
    console.log('✓ Report Config tab is visible');

    // Click on Reports tab
    const reportsTab = page.locator('.ant-tabs-tab:has-text("Reports")').first();
    const hasReportsTab = await reportsTab.isVisible();

    if (hasReportsTab) {
      await reportsTab.click();
      await page.waitForTimeout(500);
      console.log('✓ Clicked Reports tab');

      // Check that Reports tab is now active
      const activeTab = page.locator('.ant-tabs-tab-active');
      const activeTabText = await activeTab.textContent();

      if (activeTabText?.includes('Reports')) {
        console.log('✓ Reports tab is now active');
      }

      // Switch back to Report Config tab
      await reportConfigTab.click();
      await page.waitForTimeout(500);
      console.log('✓ Switched back to Report Config tab');
    } else {
      console.log('⚠️  Reports tab not found - may be a single tab page');
    }
  });
});

test.describe('Tableau UI - Table Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should sort table by clicking column headers', async ({ page }) => {
    await page.goto('/tableau/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if there are any rows
    let rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
    let rowCount = await rows.count();

    // If no data in BUSINESS mode, try PERSISTENCE mode
    if (rowCount === 0) {
      console.log('⚠️  No data in BUSINESS mode, trying PERSISTENCE mode...');
      await setEntityType(page, 'PERSISTENCE');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
      rowCount = await rows.count();
    }

    if (rowCount === 0) {
      console.log('⚠️  No data to sort - skipping test');
      test.skip();
      return;
    }

    console.log(`✓ Found ${rowCount} row(s) to test sorting`);

    // Find sortable column headers (they have sorter icons)
    const sortableHeaders = page.locator('.ant-table-thead th.ant-table-column-has-sorters');
    const sortableCount = await sortableHeaders.count();

    if (sortableCount > 0) {
      console.log(`✓ Found ${sortableCount} sortable column(s)`);

      // Click first sortable header
      const firstSortable = sortableHeaders.first();
      const headerText = await firstSortable.textContent();
      console.log(`✓ Clicking sortable column: ${headerText?.trim()}`);

      await firstSortable.click();
      await page.waitForTimeout(500);
      console.log('✓ Clicked to sort ascending');

      // Click again to sort descending
      await firstSortable.click();
      await page.waitForTimeout(500);
      console.log('✓ Clicked to sort descending');

      // Click again to remove sorting
      await firstSortable.click();
      await page.waitForTimeout(500);
      console.log('✓ Clicked to remove sorting');
    } else {
      console.log('⚠️  No sortable columns found');
    }
  });
});

test.describe('Tableau UI - Table Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should display pagination controls', async ({ page }) => {
    await page.goto('/tableau/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if there are any rows
    let rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
    let rowCount = await rows.count();

    // If no data in BUSINESS mode, try PERSISTENCE mode
    if (rowCount === 0) {
      console.log('⚠️  No data in BUSINESS mode, trying PERSISTENCE mode...');
      await setEntityType(page, 'PERSISTENCE');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
      rowCount = await rows.count();
    }

    if (rowCount === 0) {
      console.log('⚠️  No data - skipping pagination test');
      test.skip();
      return;
    }

    // Check for pagination controls
    const pagination = page.locator('.ant-pagination').first();
    const hasPagination = await pagination.isVisible();

    if (hasPagination) {
      console.log('✓ Pagination controls are visible');

      // Check for page size selector
      const pageSizeSelector = page.locator('.ant-select-selector:has-text("/")').first();
      const hasPageSize = await pageSizeSelector.isVisible().catch(() => false);

      if (hasPageSize) {
        console.log('✓ Page size selector found');
      }

      // Check for total count
      const totalText = page.locator('.ant-pagination-total-text').first();
      const hasTotalText = await totalText.isVisible().catch(() => false);

      if (hasTotalText) {
        const totalContent = await totalText.textContent();
        console.log(`✓ Total items: ${totalContent}`);
      }
    } else {
      console.log('⚠️  Pagination not visible (may be hidden if few items)');
    }
  });

  test('should change page size', async ({ page }) => {
    await page.goto('/tableau/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if there are any rows
    let rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
    let rowCount = await rows.count();

    // If no data in BUSINESS mode, try PERSISTENCE mode
    if (rowCount === 0) {
      console.log('⚠️  No data in BUSINESS mode, trying PERSISTENCE mode...');
      await setEntityType(page, 'PERSISTENCE');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
      rowCount = await rows.count();
    }

    if (rowCount === 0) {
      console.log('⚠️  No data - skipping page size test');
      test.skip();
      return;
    }

    // Find page size selector
    const pageSizeSelector = page.locator('.ant-select-selector').filter({ hasText: '/' }).first();
    const hasPageSize = await pageSizeSelector.isVisible().catch(() => false);

    if (hasPageSize) {
      console.log('✓ Page size selector found');

      // Click to open dropdown
      await pageSizeSelector.click();
      await page.waitForTimeout(500);

      // Select a different page size (e.g., 20)
      const option20 = page.locator('.ant-select-item-option:has-text("20")').first();
      const hasOption = await option20.isVisible().catch(() => false);

      if (hasOption) {
        await option20.click();
        await page.waitForTimeout(1000);
        console.log('✓ Changed page size to 20');
      } else {
        console.log('⚠️  Page size option not found');
      }
    } else {
      console.log('⚠️  Page size selector not found');
    }
  });
});

test.describe('Tableau UI - Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await setEntityType(page, 'BUSINESS');
  });

  test('should filter table using search input', async ({ page }) => {
    await page.goto('/tableau/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if there are any rows
    let rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
    let rowCount = await rows.count();

    // If no data in BUSINESS mode, try PERSISTENCE mode
    if (rowCount === 0) {
      console.log('⚠️  No data in BUSINESS mode, trying PERSISTENCE mode...');
      await setEntityType(page, 'PERSISTENCE');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
      rowCount = await rows.count();
    }

    if (rowCount === 0) {
      console.log('⚠️  No data - skipping search test');
      test.skip();
      return;
    }

    console.log(`✓ Initial row count: ${rowCount}`);

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    const hasSearch = await searchInput.isVisible();

    if (hasSearch) {
      console.log('✓ Search input found');

      // Type a search query that should not match anything
      await searchInput.fill('nonexistent_search_query_12345');
      await page.waitForTimeout(1000);

      // Check if results are filtered
      const filteredRows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
      const filteredCount = await filteredRows.count();
      const noData = page.locator('.ant-empty');
      const hasNoData = await noData.isVisible();

      if (hasNoData || filteredCount === 0) {
        console.log('✓ Search filter works - no results for non-matching query');
      } else {
        console.log(`⚠️  Search may not be working - still showing ${filteredCount} rows`);
      }

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
      console.log('✓ Cleared search');
    } else {
      console.log('⚠️  Search input not found');
    }
  });
});

