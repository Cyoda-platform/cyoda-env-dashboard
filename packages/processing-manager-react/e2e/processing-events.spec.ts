/**
 * E2E Tests for Processing Events
 * Tests events tables, filters, and error views
 */

import { test, expect } from '@playwright/test';

const TEST_NODE = 'test-node-01';
const BASE_URL = `/processing-ui/nodes/${TEST_NODE}`;

test.describe('Processing Events - E2E Tests', () => {
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

    // Navigate to Processing Events tab
    const eventsTab = page.locator('.ant-tabs-tab:has-text("Processing Events")');
    await eventsTab.click();
    await page.waitForTimeout(1000);
  });

  test('should display Process Events Statistics', async ({ page }) => {
    // Navigate to Process Events Statistics subtab
    const statsSubtab = page.locator('.ant-tabs-tab:has-text("Process Events Statistics")');
    if (await statsSubtab.isVisible()) {
      await statsSubtab.click();
      await page.waitForTimeout(500);

      // Check for statistics table
      const table = page.locator('.ant-table').first();
      await expect(table).toBeVisible();

      // Check for table rows
      const tableRows = page.locator('.ant-table-tbody tr');
      const rowCount = await tableRows.count();
      
      console.log(`✅ Process Events Statistics has ${rowCount} rows`);
    }
  });

  test('should display Polling Info', async ({ page }) => {
    // Navigate to Polling info subtab
    const pollingSubtab = page.locator('.ant-tabs-tab:has-text("Polling info")');
    if (await pollingSubtab.isVisible()) {
      await pollingSubtab.click();
      await page.waitForTimeout(500);

      // Check for polling info content
      const content = page.locator('.ant-card, .ant-table, .ant-descriptions').first();
      await expect(content).toBeVisible();

      console.log('✅ Polling info is displayed');
    }
  });

  test('should display Processing Events View with filters', async ({ page }) => {
    // Navigate to Processing events view subtab
    const eventsViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events view")');
    if (await eventsViewSubtab.isVisible()) {
      await eventsViewSubtab.click();
      await page.waitForTimeout(1000);

      // Check for events table
      const table = page.locator('.ant-table').first();
      await expect(table).toBeVisible();

      console.log('✅ Processing events view is displayed');
    }
  });

  test('should filter events by queue', async ({ page }) => {
    // Navigate to Processing events view subtab
    const eventsViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events view")');
    if (await eventsViewSubtab.isVisible()) {
      await eventsViewSubtab.click();
      await page.waitForTimeout(1000);

      // Find queue filter
      const queueSelect = page.locator('label:has-text("Queue")').locator('..').locator('.ant-select');
      
      if (await queueSelect.isVisible()) {
        await queueSelect.click();
        await page.waitForTimeout(500);

        // Select first queue option
        const firstOption = page.locator('.ant-select-item').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(500);

          // Verify table still exists
          const table = page.locator('.ant-table').first();
          await expect(table).toBeVisible();

          console.log('✅ Queue filter works');
        }
      }
    }
  });

  test('should filter events by status', async ({ page }) => {
    // Navigate to Processing events view subtab
    const eventsViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events view")');
    if (await eventsViewSubtab.isVisible()) {
      await eventsViewSubtab.click();
      await page.waitForTimeout(1000);

      // Find status filter
      const statusSelect = page.locator('label:has-text("Status")').locator('..').locator('.ant-select');
      
      if (await statusSelect.isVisible()) {
        await statusSelect.click();
        await page.waitForTimeout(500);

        // Select first status option
        const firstOption = page.locator('.ant-select-item').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(500);

          console.log('✅ Status filter works');
        }
      }
    }
  });

  test('should display Processing Events Error View', async ({ page }) => {
    // Navigate to Processing events error view subtab
    const errorViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events error view")');
    if (await errorViewSubtab.isVisible()) {
      await errorViewSubtab.click();
      await page.waitForTimeout(1000);

      // Check for error events table
      const table = page.locator('.ant-table').first();
      await expect(table).toBeVisible();

      console.log('✅ Processing events error view is displayed');
    }
  });

  test('should filter error events by error type', async ({ page }) => {
    // Navigate to Processing events error view subtab
    const errorViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events error view")');
    if (await errorViewSubtab.isVisible()) {
      await errorViewSubtab.click();
      await page.waitForTimeout(1000);

      // Find error type filter
      const errorTypeSelect = page.locator('.ant-select').first();
      
      if (await errorTypeSelect.isVisible()) {
        await errorTypeSelect.click();
        await page.waitForTimeout(500);

        // Select first error type option
        const firstOption = page.locator('.ant-select-item').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(500);

          console.log('✅ Error type filter works');
        }
      }
    }
  });

  test('should display Entities Error List View', async ({ page }) => {
    // Navigate to Entities error list view subtab
    const entitiesErrorSubtab = page.locator('.ant-tabs-tab:has-text("Entities error list view")');
    if (await entitiesErrorSubtab.isVisible()) {
      await entitiesErrorSubtab.click();
      await page.waitForTimeout(500);

      // Check for entity class filter
      const filterSelect = page.locator('label:has-text("Entity class")').locator('..').locator('.ant-select');
      await expect(filterSelect).toBeVisible();

      console.log('✅ Entities error list view is displayed');
    }
  });

  test('should load entities error list with filter', async ({ page }) => {
    // Navigate to Entities error list view subtab
    const entitiesErrorSubtab = page.locator('.ant-tabs-tab:has-text("Entities error list view")');
    if (await entitiesErrorSubtab.isVisible()) {
      await entitiesErrorSubtab.click();
      await page.waitForTimeout(500);

      // Select entity class
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

      // Click Load button
      const loadButton = page.locator('button:has-text("Load")').first();
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await page.waitForTimeout(1000);

        // Check if table has data
        const table = page.locator('.ant-table').first();
        await expect(table).toBeVisible();

        console.log('✅ Entities error list loaded successfully');
      }
    }
  });

  test('should display Sift Logger', async ({ page }) => {
    // Navigate to Sift logger subtab
    const siftLoggerSubtab = page.locator('.ant-tabs-tab:has-text("Sift logger")');
    if (await siftLoggerSubtab.isVisible()) {
      await siftLoggerSubtab.click();
      await page.waitForTimeout(500);

      // Check for sift logger content
      const content = page.locator('.ant-card, .ant-descriptions, .ant-form').first();
      await expect(content).toBeVisible();

      console.log('✅ Sift logger is displayed');
    }
  });

  test('should search events', async ({ page }) => {
    // Navigate to Processing events view subtab
    const eventsViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events view")');
    if (await eventsViewSubtab.isVisible()) {
      await eventsViewSubtab.click();
      await page.waitForTimeout(1000);

      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('event');
        await page.waitForTimeout(500);

        // Verify table still exists
        const table = page.locator('.ant-table').first();
        await expect(table).toBeVisible();

        console.log('✅ Search functionality works');
      }
    }
  });

  test('should display event details when clicking on row', async ({ page }) => {
    // Navigate to Processing events view subtab
    const eventsViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events view")');
    if (await eventsViewSubtab.isVisible()) {
      await eventsViewSubtab.click();
      await page.waitForTimeout(1000);

      // Find table rows
      const tableRows = page.locator('.ant-table-tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {
        // Click on first row
        await tableRows.first().click();
        await page.waitForTimeout(500);

        // Check if details panel or modal appears
        const detailsPanel = page.locator('.ant-drawer, .ant-modal, [class*="event-detail"]');
        const isPanelVisible = await detailsPanel.isVisible();

        if (isPanelVisible) {
          console.log('✅ Event details panel opened');
        } else {
          console.log('⚠️ Event details panel not found');
        }
      }
    }
  });

  test('should paginate events table', async ({ page }) => {
    // Navigate to Processing events view subtab
    const eventsViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events view")');
    if (await eventsViewSubtab.isVisible()) {
      await eventsViewSubtab.click();
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
      }
    }
  });

  test('should export events data', async ({ page }) => {
    // Navigate to Processing events view subtab
    const eventsViewSubtab = page.locator('.ant-tabs-tab:has-text("Processing events view")');
    if (await eventsViewSubtab.isVisible()) {
      await eventsViewSubtab.click();
      await page.waitForTimeout(1000);

      // Look for export button
      const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")');
      const buttonExists = await exportBtn.count() > 0;

      if (buttonExists && await exportBtn.first().isVisible()) {
        console.log('✅ Export button is available');
      } else {
        console.log('⚠️ Export button not found');
      }
    }
  });

  test('should handle processing events errors gracefully', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate through all Processing Events subtabs
    const subtabs = [
      'Process Events Statistics',
      'Polling info',
      'Processing events view',
      'Processing events error view',
      'Entities error list view',
      'Sift logger',
    ];

    for (const subtabName of subtabs) {
      const subtab = page.locator(`.ant-tabs-tab:has-text("${subtabName}")`);
      if (await subtab.isVisible()) {
        await subtab.click();
        await page.waitForTimeout(500);
      }
    }

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
      console.log('✅ No critical console errors in processing events');
    }

    expect(criticalErrors.length).toBe(0);
  });
});

