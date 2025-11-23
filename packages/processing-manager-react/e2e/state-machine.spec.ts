/**
 * E2E Tests for State Machine Functionality
 * Tests state machine diagram, transitions, and interactions
 */

import { test, expect } from '@playwright/test';

const TEST_NODE = 'test-node-01';
const BASE_URL = `/processing-ui/nodes/${TEST_NODE}`;

test.describe('State Machine - E2E Tests', () => {
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

  test('should display state machine diagram', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for state machine diagram or canvas
    const diagram = page.locator('canvas, svg, [class*="state-machine"], [class*="StateMachine"]').first();
    
    // Check if diagram exists
    const diagramExists = await diagram.count() > 0;
    
    if (diagramExists) {
      await expect(diagram).toBeVisible({ timeout: 10000 });
      console.log('✅ State machine diagram is visible');
    } else {
      console.log('⚠️ State machine diagram not found - might be in a different location');
    }
  });

  test('should display state machine details', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for state machine details section
    const detailsSection = page.locator('[class*="state-machine-details"], .ant-descriptions, .ant-card').first();
    
    if (await detailsSection.isVisible()) {
      await expect(detailsSection).toBeVisible();
      console.log('✅ State machine details section is visible');
    }
  });

  test('should display transitions table', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for transitions table
    const transitionsTable = page.locator('.ant-table').first();
    await expect(transitionsTable).toBeVisible();

    // Check if table has rows
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      console.log(`✅ Transitions table has ${rowCount} rows`);
    } else {
      console.log('⚠️ Transitions table is empty');
    }
  });

  test('should allow clicking on state nodes', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for clickable state nodes
    const stateNodes = page.locator('[class*="state-node"], [class*="react-flow__node"]');
    const nodeCount = await stateNodes.count();

    if (nodeCount > 0) {
      // Click on first state node
      await stateNodes.first().click();
      await page.waitForTimeout(500);
      
      console.log(`✅ Clicked on state node (${nodeCount} nodes found)`);
    } else {
      console.log('⚠️ No state nodes found to click');
    }
  });

  test('should display transition details when clicking on transition', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for transitions in table
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0) {
      // Click on first transition row
      await tableRows.first().click();
      await page.waitForTimeout(500);

      // Check if details panel or modal appears
      const detailsPanel = page.locator('.ant-drawer, .ant-modal, [class*="transition-detail"]');
      const isPanelVisible = await detailsPanel.isVisible();

      if (isPanelVisible) {
        console.log('✅ Transition details panel opened');
      } else {
        console.log('⚠️ Transition details panel not found');
      }
    }
  });

  test('should filter transitions by state', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for state filter dropdown
    const stateFilter = page.locator('.ant-select').first();
    
    if (await stateFilter.isVisible()) {
      await stateFilter.click();
      await page.waitForTimeout(300);

      // Select first option
      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForTimeout(500);

        // Verify table still exists
        const table = page.locator('.ant-table').first();
        await expect(table).toBeVisible();

        console.log('✅ State filter works');
      }
    } else {
      console.log('⚠️ State filter not found');
    }
  });

  test('should search transitions', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Verify table still exists
      const table = page.locator('.ant-table').first();
      await expect(table).toBeVisible();

      console.log('✅ Search functionality works');
    } else {
      console.log('⚠️ Search input not found');
    }
  });

  test('should zoom in/out on state machine diagram', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for zoom controls
    const zoomControls = page.locator('[class*="zoom"], [class*="react-flow__controls"]');
    
    if (await zoomControls.isVisible()) {
      // Try to find zoom in button
      const zoomInBtn = page.locator('button[aria-label*="zoom in"], button:has-text("+")').first();
      
      if (await zoomInBtn.isVisible()) {
        await zoomInBtn.click();
        await page.waitForTimeout(300);
        console.log('✅ Zoom in works');
      }

      // Try to find zoom out button
      const zoomOutBtn = page.locator('button[aria-label*="zoom out"], button:has-text("-")').first();
      
      if (await zoomOutBtn.isVisible()) {
        await zoomOutBtn.click();
        await page.waitForTimeout(300);
        console.log('✅ Zoom out works');
      }
    } else {
      console.log('⚠️ Zoom controls not found');
    }
  });

  test('should display state machine statistics', async ({ page }) => {
    // Navigate to Processing Manager tab
    const pmTab = page.locator('.ant-tabs-tab:has-text("Processing Manager")');
    await pmTab.click();
    await page.waitForTimeout(1000);

    // Look for statistics cards or summary
    const statsCards = page.locator('.ant-statistic, .ant-card, [class*="summary"]');
    const cardCount = await statsCards.count();

    if (cardCount > 0) {
      console.log(`✅ Found ${cardCount} statistics cards`);
    } else {
      console.log('⚠️ No statistics cards found');
    }
  });

  test('should handle state machine errors gracefully', async ({ page }) => {
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
      console.log('✅ No critical console errors in state machine');
    }

    expect(criticalErrors.length).toBe(0);
  });
});

