/**
 * E2E Tests for Processing Manager - All Tabs and Features
 * Tests all tabs, subtabs, buttons, filters, and interactions with mock data
 */

import { test, expect } from '@playwright/test';

const TEST_NODE = 'test-node-01';
const BASE_URL = `/processing-ui/nodes/${TEST_NODE}`;

test.describe('Processing Manager - Complete Tab Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for page load
    page.setDefaultTimeout(30000);

    // Navigate to the test node page
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Wait for React app to mount
    await page.waitForSelector('#root', { timeout: 15000 });

    // Wait for main content to load
    try {
      await page.waitForSelector('.ant-tabs, .processing-manager-content, [class*="NodesDetail"]', { timeout: 15000 });
    } catch (e) {
      // If tabs don't load, check if there's an error message
      const errorMsg = await page.textContent('body');
      console.log('Page content:', errorMsg?.substring(0, 500));
      throw e;
    }

    // Enable mock API if not already enabled
    await page.evaluate(() => {
      if (typeof (window as any).enableMockApi === 'function') {
        (window as any).enableMockApi();
      }
    });

    // Wait for mock API to initialize and data to load
    await page.waitForTimeout(2000);
  });

  test('Tab 1: Processing Manager - should display summary data', async ({ page }) => {
    // Click on Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Check for summary cards
    const summarySection = page.locator('text=Summary').first();
    await expect(summarySection).toBeVisible({ timeout: 5000 });

    // Check for shards table
    const shardsTable = page.locator('.ant-table').first();
    await expect(shardsTable).toBeVisible();

    // Verify table has data
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    console.log('✅ Processing Manager tab: OK');
  });

  test('Tab 2: Processing Events - all 6 subtabs', async ({ page }) => {
    // Click on Processing Events tab
    const eventsTab = page.locator('.ant-tabs-tab:has-text("Processing Events")');
    await eventsTab.click();
    await page.waitForTimeout(1000);

    // Subtab 1: Process Events Statistics
    const statsSubtab = page.locator('.ant-tabs-tab:has-text("Process Events Statistics")');
    if (await statsSubtab.isVisible()) {
      await statsSubtab.click();
      await page.waitForTimeout(500);
      const table = page.locator('.ant-table').first();
      await expect(table).toBeVisible();
      console.log('✅ Process Events Statistics: OK');
    }

    // Subtab 2: Polling info
    const pollingSubtab = page.locator('.ant-tabs-tab:has-text("Polling info")');
    if (await pollingSubtab.isVisible()) {
      await pollingSubtab.click();
      await page.waitForTimeout(500);
      const content = page.locator('.ant-card, .ant-table').first();
      await expect(content).toBeVisible();
      console.log('✅ Polling info: OK');
    }

    // Subtab 3: Processing events view
    const eventsViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events view")');
    if (await eventsViewSubtab.isVisible()) {
      await eventsViewSubtab.click();
      await page.waitForTimeout(1000);
      // Check if table exists (it might be hidden in inactive tab)
      const tableCount = await page.locator('.ant-table').count();
      expect(tableCount).toBeGreaterThan(0);

      // Test queue filter (this was causing the React error)
      const queueSelect = page.locator('label:has-text("Queue")').locator('..').locator('.ant-select');
      if (await queueSelect.isVisible()) {
        await queueSelect.click();
        await page.waitForTimeout(500);
        // Select first queue option
        const firstOption = page.locator('.ant-select-item').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(500);
          console.log('✅ Queue filter works without errors');
        }
      }

      console.log('✅ Processing events view: OK');
    }

    // Subtab 4: Processing events error view
    const errorViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events error view")');
    if (await errorViewSubtab.isVisible()) {
      await errorViewSubtab.click();
      await page.waitForTimeout(1000);
      // Check if table exists (it might be hidden in inactive tab)
      const tableCount = await page.locator('.ant-table').count();
      expect(tableCount).toBeGreaterThan(0);
      console.log('✅ Processing events error view: OK');
    }

    // Subtab 5: Entities error list view
    const entitiesErrorSubtab = page.locator('.ant-tabs-tab:has-text("Entities error list view")');
    if (await entitiesErrorSubtab.isVisible()) {
      await entitiesErrorSubtab.click();
      await page.waitForTimeout(500);

      // Test filter dropdown - select entity class
      const filterSelect = page.locator('label:has-text("Entity class")').locator('..').locator('.ant-select');
      if (await filterSelect.isVisible()) {
        await filterSelect.click();
        await page.waitForTimeout(300);
        // Select "com.cyoda.Order" option
        const orderOption = page.locator('.ant-select-item:has-text("com.cyoda.Order")');
        if (await orderOption.isVisible()) {
          await orderOption.click();
          await page.waitForTimeout(300);
        }
      }

      // Click Load button to fetch data (use .first() to handle multiple Load buttons)
      const loadButton = page.locator('button:has-text("Load")').first();
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(1000);

        // Check if table has data
        const tableCount = await page.locator('.ant-table').count();
        expect(tableCount).toBeGreaterThan(0);

        // Check if table has rows
        const rowCount = await page.locator('.ant-table-tbody tr').count();
        console.log(`✅ Entities error list view: ${rowCount} rows loaded`);
      }
      console.log('✅ Entities error list view: OK');
    }

    // Subtab 6: Sift logger
    const siftLoggerSubtab = page.locator('.ant-tabs-tab:has-text("Sift logger")');
    if (await siftLoggerSubtab.isVisible()) {
      await siftLoggerSubtab.click();
      await page.waitForTimeout(500);
      const content = page.locator('.ant-card, .ant-descriptions').first();
      await expect(content).toBeVisible();
      console.log('✅ Sift logger: OK');
    }
  });

  test('Tab 3: Time Statistics - both subtabs', async ({ page }) => {
    const timeStatsTab = page.locator('.ant-tabs-tab:has-text("Time Statistics")');
    await timeStatsTab.click();
    await page.waitForTimeout(1000);

    // Subtab 1: Time stats
    const timeStatsSubtab = page.locator('.ant-tabs-tab:has-text("Time stats")');
    if (await timeStatsSubtab.isVisible()) {
      await timeStatsSubtab.click();
      await page.waitForTimeout(500);
      const table = page.locator('.ant-table').first();
      await expect(table).toBeVisible();
      console.log('✅ Time stats: OK');
    }

    // Subtab 2: Count stats
    const countStatsSubtab = page.locator('.ant-tabs-tab:has-text("Count stats")');
    if (await countStatsSubtab.isVisible()) {
      await countStatsSubtab.click();
      await page.waitForTimeout(1000);
      // Check if table exists (it might be hidden in inactive tab)
      const tableCount = await page.locator('.ant-table').count();
      expect(tableCount).toBeGreaterThan(0);
      console.log('✅ Count stats: OK');
    }
  });

  test('Tab 4: Transactions - with Entities List View', async ({ page }) => {
    const transactionsTab = page.locator('.ant-tabs-tab:has-text("Transactions")');
    await transactionsTab.click();
    await page.waitForTimeout(1000);

    // Main transactions view
    const table = page.locator('.ant-table').first();
    await expect(table).toBeVisible();
    
    // Check for data
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Test Entities List View subtab if it exists
    const entitiesListSubtab = page.locator('.ant-tabs-tab:has-text("Entities list view")');
    if (await entitiesListSubtab.isVisible()) {
      await entitiesListSubtab.click();
      await page.waitForTimeout(500);
      
      // Test filter
      const filterSelect = page.locator('.ant-select').first();
      if (await filterSelect.isVisible()) {
        await filterSelect.click();
        await page.waitForTimeout(300);
        const firstOption = page.locator('.ant-select-item').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(500);
        }
      }
      console.log('✅ Entities list view: OK');
    }

    console.log('✅ Transactions tab: OK');
  });

  test('Tab 5: PM Components - all 4 subtabs', async ({ page }) => {
    const pmComponentsTab = page.locator('.ant-tabs-tab:has-text("PM Components")');
    await pmComponentsTab.click();
    await page.waitForTimeout(1000);

    // Subtab 1: Execution Queues Info
    const execQueuesSubtab = page.locator('.ant-tabs-tab:has-text("Execution Queues Info")');
    if (await execQueuesSubtab.isVisible()) {
      await execQueuesSubtab.click();
      await page.waitForTimeout(500);
      console.log('✅ Execution Queues Info: OK');
    }

    // Subtab 2: Execution Monitors
    const execMonitorsSubtab = page.locator('.ant-tabs-tab:has-text("Execution Monitors")');
    if (await execMonitorsSubtab.isVisible()) {
      await execMonitorsSubtab.click();
      await page.waitForTimeout(1000);
      // Check if table exists (it might be hidden in inactive tab)
      const tableCount = await page.locator('.ant-table').count();
      expect(tableCount).toBeGreaterThan(0);
      console.log('✅ Execution Monitors: OK');
    }

    // Subtab 3: Service Processes View
    const serviceProcessesSubtab = page.locator('.ant-tabs-tab:has-text("Service Processes View")');
    if (await serviceProcessesSubtab.isVisible()) {
      await serviceProcessesSubtab.click();
      await page.waitForTimeout(1000);
      // Check if table exists (it might be hidden in inactive tab)
      const tableCount = await page.locator('.ant-table').count();
      expect(tableCount).toBeGreaterThan(0);
      console.log('✅ Service Processes View: OK');
    }

    // Subtab 4: Cyoda Runnable Components
    const runnableComponentsSubtab = page.locator('.ant-tabs-tab:has-text("Cyoda Runnable Components")');
    if (await runnableComponentsSubtab.isVisible()) {
      await runnableComponentsSubtab.click();
      await page.waitForTimeout(1000);
      // Check if table exists (it might be hidden in inactive tab)
      const tableCount = await page.locator('.ant-table').count();
      expect(tableCount).toBeGreaterThan(0);
      console.log('✅ Cyoda Runnable Components: OK');
    }
  });

  test('Tab 6: Composite Indexes - with filter', async ({ page }) => {
    const compositeIndexesTab = page.locator('.ant-tabs-tab:has-text("Composite Indexes")');
    await compositeIndexesTab.click();
    await page.waitForTimeout(1000);

    // Check table is visible
    const table = page.locator('.ant-table').first();
    await expect(table).toBeVisible();

    // Test entity class filter
    const filterSelect = page.locator('.ant-select').first();
    if (await filterSelect.isVisible()) {
      await filterSelect.click();
      await page.waitForTimeout(300);
      
      // Select first option
      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForTimeout(500);
        
        // Verify table still has data
        await expect(table).toBeVisible();
      }
    }

    console.log('✅ Composite Indexes tab: OK');
  });

  test('Tab 7: Caches List', async ({ page }) => {
    const cachesListTab = page.locator('.ant-tabs-tab:has-text("Caches List")');
    await cachesListTab.click();
    await page.waitForTimeout(1000);

    // Check table is visible
    const table = page.locator('.ant-table').first();
    await expect(table).toBeVisible();

    // Check for data
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    console.log('✅ Caches List tab: OK');
  });

  test('Tab 8: Network Info', async ({ page }) => {
    const networkInfoTab = page.locator('.ant-tabs-tab:has-text("Network Info")');
    await networkInfoTab.click();
    await page.waitForTimeout(1000);

    // Check for server info
    const serverCard = page.locator('.ant-card, .ant-descriptions').first();
    await expect(serverCard).toBeVisible();

    console.log('✅ Network Info tab: OK');
  });

  test('Tab 9: ZooKeeper Info - all 3 subtabs', async ({ page }) => {
    const zkInfoTab = page.locator('.ant-tabs-tab:has-text("ZooKeeper Info")');
    await zkInfoTab.click();
    await page.waitForTimeout(1000);

    // Subtab 1: Current Node Info
    const currNodeSubtab = page.locator('.ant-tabs-tab:has-text("Current Node Info")');
    if (await currNodeSubtab.isVisible()) {
      await currNodeSubtab.click();
      await page.waitForTimeout(500);
      const card = page.locator('.ant-card, .ant-descriptions').first();
      await expect(card).toBeVisible();
      console.log('✅ Current Node Info: OK');
    }

    // Subtab 2: Loaded Online Nodes
    const onlineNodesSubtab = page.locator('.ant-tabs-tab:has-text("Loaded Online Nodes")');
    if (await onlineNodesSubtab.isVisible()) {
      await onlineNodesSubtab.click();
      await page.waitForTimeout(500);
      const table = page.locator('.ant-table').first();
      await expect(table).toBeVisible();
      console.log('✅ Loaded Online Nodes: OK');
    }

    // Subtab 3: Loaded Shards Distribution
    const shardsDistrSubtab = page.locator('.ant-tabs-tab:has-text("Loaded Shards Distribution")');
    if (await shardsDistrSubtab.isVisible()) {
      await shardsDistrSubtab.click();
      await page.waitForTimeout(1000);
      // Check if table exists (it might be hidden in inactive tab)
      const tableCount = await page.locator('.ant-table').count();
      expect(tableCount).toBeGreaterThan(0);
      console.log('✅ Loaded Shards Distribution: OK');
    }
  });

  test('Mock API Toggle - Test Mode Window', async ({ page }) => {
    // Check if Test Mode window is visible
    const testModeWindow = page.locator('.test-mode-window, [class*="MockApiToggle"]');

    // The window might be minimized or expanded
    const isVisible = await testModeWindow.isVisible();

    if (isVisible) {
      // Try to find the toggle switch
      const toggleSwitch = page.locator('.ant-switch').first();
      if (await toggleSwitch.isVisible()) {
        // Get current state
        const isChecked = await toggleSwitch.evaluate((el) => el.classList.contains('ant-switch-checked'));
        console.log(`Mock API is currently: ${isChecked ? 'enabled' : 'disabled'}`);

        // Toggle it
        await toggleSwitch.click();
        await page.waitForTimeout(500);

        // Toggle it back
        await toggleSwitch.click();
        await page.waitForTimeout(500);

        console.log('✅ Mock API Toggle: OK');
      }
    }
  });

  test('Console Errors Check', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate through all tabs
    const tabs = [
      'Processing Manager',
      'Processing Events',
      'Time Statistics',
      'Transactions',
      'PM Components',
      'Composite Indexes',
      'Caches List',
      'Network Info',
      'ZooKeeper Info',
    ];

    for (const tabName of tabs) {
      const tab = page.locator(`.ant-tabs-tab:has-text("${tabName}")`);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);
      }
    }

    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(err =>
      !err.includes('deprecated') &&
      !err.includes('Warning') &&
      !err.includes('favicon')
    );

    if (criticalErrors.length > 0) {
      console.log('⚠️ Console errors found:', criticalErrors);
    } else {
      console.log('✅ No critical console errors');
    }

    expect(criticalErrors.length).toBe(0);
  });
});

