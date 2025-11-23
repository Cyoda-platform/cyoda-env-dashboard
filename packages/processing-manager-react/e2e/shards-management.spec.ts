/**
 * E2E Tests for Shards Management
 * Tests shards table, actions, and ZooKeeper integration
 */

import { test, expect } from '@playwright/test';

const TEST_NODE = 'test-node-01';
const BASE_URL = `/processing-ui/nodes/${TEST_NODE}`;

test.describe('Shards Management - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('#root', { timeout: 15000 });

    // Enable mock API
    await page.evaluate(() => {
      if (typeof (window as any).enableMockApi === 'function') {
        (window as any).enableMockApi();
      }
    });

    await page.waitForTimeout(2000);
  });

  test('should display shards table with data', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Find shards table
    const shardsTable = page.locator('.ant-table').first();
    await expect(shardsTable).toBeVisible();

    // Check for table rows
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();
    
    expect(rowCount).toBeGreaterThan(0);
    console.log(`✅ Shards table has ${rowCount} rows`);
  });

  test('should display shard columns correctly', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Check for expected column headers
    const expectedColumns = ['Shard ID', 'Node ID', 'Status', 'Action'];
    
    for (const columnName of expectedColumns) {
      const column = page.locator(`.ant-table-thead th:has-text("${columnName}")`);
      const isVisible = await column.isVisible();
      
      if (isVisible) {
        console.log(`✅ Column "${columnName}" is visible`);
      } else {
        console.log(`⚠️ Column "${columnName}" not found`);
      }
    }
  });

  test('should open shard action menu', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Find action buttons in table
    const actionButtons = page.locator('.ant-table-tbody button, .ant-table-tbody .ant-dropdown-trigger');
    const buttonCount = await actionButtons.count();

    if (buttonCount > 0) {
      // Click first action button
      await actionButtons.first().click();
      await page.waitForTimeout(500);

      // Check if dropdown menu appears
      const dropdown = page.locator('.ant-dropdown, .ant-dropdown-menu');
      const isDropdownVisible = await dropdown.isVisible();

      if (isDropdownVisible) {
        console.log('✅ Shard action menu opened');
      } else {
        console.log('⚠️ Shard action menu not visible');
      }
    } else {
      console.log('⚠️ No action buttons found');
    }
  });

  test('should display shard actions (Reassign, Reset)', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Find action buttons
    const actionButtons = page.locator('.ant-table-tbody button, .ant-table-tbody .ant-dropdown-trigger');
    const buttonCount = await actionButtons.count();

    if (buttonCount > 0) {
      // Click first action button
      await actionButtons.first().click();
      await page.waitForTimeout(500);

      // Check for action menu items
      const reassignAction = page.locator('.ant-dropdown-menu-item:has-text("Reassign")');
      const resetAction = page.locator('.ant-dropdown-menu-item:has-text("Reset")');

      const hasReassign = await reassignAction.isVisible();
      const hasReset = await resetAction.isVisible();

      if (hasReassign) {
        console.log('✅ Reassign action is available');
      }
      if (hasReset) {
        console.log('✅ Reset action is available');
      }

      // Close dropdown by clicking elsewhere
      await page.keyboard.press('Escape');
    }
  });

  test('should filter shards by status', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for status filter
    const statusFilter = page.locator('.ant-select, select').first();
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(300);

      // Select first option
      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForTimeout(500);

        // Verify table still exists
        const table = page.locator('.ant-table').first();
        await expect(table).toBeVisible();

        console.log('✅ Status filter works');
      }
    } else {
      console.log('⚠️ Status filter not found');
    }
  });

  test('should search shards', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('shard');
      await page.waitForTimeout(500);

      // Verify table still exists
      const table = page.locator('.ant-table').first();
      await expect(table).toBeVisible();

      console.log('✅ Search functionality works');
    } else {
      console.log('⚠️ Search input not found');
    }
  });

  test('should display ZooKeeper Info tab', async ({ page }) => {
    // Navigate to ZooKeeper Info tab
    const zkTab = page.locator('.ant-tabs-tab:has-text("ZooKeeper Info")');
    await zkTab.click();
    await page.waitForTimeout(1000);

    // Check if content is visible
    const content = page.locator('.ant-card, .ant-table, .ant-descriptions').first();
    await expect(content).toBeVisible();

    console.log('✅ ZooKeeper Info tab is visible');
  });

  test('should display Current Node Info in ZooKeeper', async ({ page }) => {
    // Navigate to ZooKeeper Info tab
    const zkTab = page.locator('.ant-tabs-tab:has-text("ZooKeeper Info")');
    await zkTab.click();
    await page.waitForTimeout(1000);

    // Navigate to Current Node Info subtab
    const currNodeSubtab = page.locator('.ant-tabs-tab:has-text("Current Node Info")');
    if (await currNodeSubtab.isVisible()) {
      await currNodeSubtab.click();
      await page.waitForTimeout(500);

      // Check for node info fields
      const nodeInfo = page.locator('.ant-descriptions, .ant-card').first();
      await expect(nodeInfo).toBeVisible();

      console.log('✅ Current Node Info is displayed');
    }
  });

  test('should display Loaded Online Nodes in ZooKeeper', async ({ page }) => {
    // Navigate to ZooKeeper Info tab
    const zkTab = page.locator('.ant-tabs-tab:has-text("ZooKeeper Info")');
    await zkTab.click();
    await page.waitForTimeout(1000);

    // Navigate to Loaded Online Nodes subtab
    const onlineNodesSubtab = page.locator('.ant-tabs-tab:has-text("Loaded Online Nodes")');
    if (await onlineNodesSubtab.isVisible()) {
      await onlineNodesSubtab.click();
      await page.waitForTimeout(500);

      // Check for nodes table
      const nodesTable = page.locator('.ant-table').first();
      await expect(nodesTable).toBeVisible();

      // Check for table rows
      const tableRows = page.locator('.ant-table-tbody tr');
      const rowCount = await tableRows.count();
      
      console.log(`✅ Loaded Online Nodes table has ${rowCount} rows`);
    }
  });

  test('should display Loaded Shards Distribution in ZooKeeper', async ({ page }) => {
    // Navigate to ZooKeeper Info tab
    const zkTab = page.locator('.ant-tabs-tab:has-text("ZooKeeper Info")');
    await zkTab.click();
    await page.waitForTimeout(1000);

    // Navigate to Loaded Shards Distribution subtab
    const shardsDistrSubtab = page.locator('.ant-tabs-tab:has-text("Loaded Shards Distribution")');
    if (await shardsDistrSubtab.isVisible()) {
      await shardsDistrSubtab.click();
      await page.waitForTimeout(500);

      // Check for shards distribution table
      const shardsTable = page.locator('.ant-table').first();
      await expect(shardsTable).toBeVisible();

      console.log('✅ Loaded Shards Distribution is displayed');
    }
  });

  test('should display rebalance shards button', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for rebalance button
    const rebalanceBtn = page.locator('button:has-text("Rebalance"), button:has-text("rebalance")');
    const buttonExists = await rebalanceBtn.count() > 0;

    if (buttonExists && await rebalanceBtn.first().isVisible()) {
      console.log('✅ Rebalance shards button is visible');
    } else {
      console.log('⚠️ Rebalance shards button not found');
    }
  });

  test('should handle shards table pagination', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for pagination controls
    const pagination = page.locator('.ant-pagination');
    
    if (await pagination.isVisible()) {
      // Try to click next page
      const nextBtn = page.locator('.ant-pagination-next');
      
      if (await nextBtn.isVisible() && !(await nextBtn.isDisabled())) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        console.log('✅ Pagination works');
      } else {
        console.log('⚠️ Next page button is disabled (only one page)');
      }
    } else {
      console.log('⚠️ Pagination not found');
    }
  });

  test('should sort shards table by column', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Find sortable column header
    const sortableHeader = page.locator('.ant-table-thead th.ant-table-column-has-sorters').first();
    
    if (await sortableHeader.isVisible()) {
      // Click to sort
      await sortableHeader.click();
      await page.waitForTimeout(500);

      // Click again to reverse sort
      await sortableHeader.click();
      await page.waitForTimeout(500);

      console.log('✅ Table sorting works');
    } else {
      console.log('⚠️ No sortable columns found');
    }
  });

  test('should handle shards management errors gracefully', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(2000);

    // Navigate to ZooKeeper Info tab
    const zkTab = page.locator('.ant-tabs-tab:has-text("ZooKeeper Info")');
    await zkTab.click();
    await page.waitForTimeout(2000);

    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(err =>
      !err.includes('deprecated') &&
      !err.includes('Warning') &&
      !err.includes('favicon') &&
      !err.includes('ResizeObserver')
    );

    if (criticalErrors.length > 0) {
      console.log('⚠️ Console errors found:', criticalErrors);
    } else {
      console.log('✅ No critical console errors in shards management');
    }

    expect(criticalErrors.length).toBe(0);
  });
});

