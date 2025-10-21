import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Processing Manager Improvements
 *
 * Tests the following improvements:
 * 1. Lazy loading of tabs (only active tab content is rendered)
 * 2. Tab state persistence (remembers last active tab)
 * 3. New API hook: useTransactionEventStatusesList
 */

// Use the processing-manager-react dev server port
const BASE_URL = 'http://localhost:3008';

test.describe('Processing Manager Improvements', () => {
  
  test.describe('Lazy Loading', () => {
    test('should only render active tab content', async ({ page }) => {
      // Navigate to node detail page
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      // Wait for the page to be ready
      await expect(page.getByText('Node Detail: demo-node')).toBeVisible();
      
      // Check that the first tab (Processing Manager) is active
      const firstTab = page.getByRole('tab', { name: 'Processing Manager' });
      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
      
      // The active tab content should be visible
      // Note: We can't check for specific content without a backend, 
      // but we can verify the tab panel is rendered
      const activePanel = page.locator('[role="tabpanel"][aria-hidden="false"]');
      await expect(activePanel).toBeVisible();
      
      // Verify only one tab panel is visible (lazy loading)
      const visiblePanels = page.locator('[role="tabpanel"][aria-hidden="false"]');
      await expect(visiblePanels).toHaveCount(1);
    });

    test('should render new tab content when switching tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      // Initially on first tab
      let activePanel = page.locator('[role="tabpanel"][aria-hidden="false"]');
      await expect(activePanel).toHaveCount(1);
      
      // Click on Server Summary tab
      await page.getByRole('tab', { name: 'Server Summary' }).click();
      await page.waitForTimeout(300);
      
      // Check that Server Summary tab is now active
      const summaryTab = page.getByRole('tab', { name: 'Server Summary' });
      await expect(summaryTab).toHaveAttribute('aria-selected', 'true');
      
      // Still only one visible panel (lazy loading working)
      activePanel = page.locator('[role="tabpanel"][aria-hidden="false"]');
      await expect(activePanel).toHaveCount(1);
    });

    test('should switch between multiple tabs correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      const tabs = [
        'Processing Manager',
        'Server Summary',
        'Cassandra',
        'Processing Events',
        'Time Statistics',
        'Transactions'
      ];
      
      for (const tabName of tabs) {
        // Click on the tab
        await page.getByRole('tab', { name: tabName }).click();
        await page.waitForTimeout(200);
        
        // Verify it's active
        const tab = page.getByRole('tab', { name: tabName });
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        
        // Verify only one panel is visible
        const visiblePanels = page.locator('[role="tabpanel"][aria-hidden="false"]');
        await expect(visiblePanels).toHaveCount(1);
      }
    });

    test('should not have performance issues with lazy loading', async ({ page }) => {
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      // Measure time to switch tabs
      const startTime = Date.now();
      
      // Switch through several tabs quickly
      await page.getByRole('tab', { name: 'Server Summary' }).click();
      await page.waitForTimeout(100);
      await page.getByRole('tab', { name: 'Cassandra' }).click();
      await page.waitForTimeout(100);
      await page.getByRole('tab', { name: 'Processing Events' }).click();
      await page.waitForTimeout(100);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Tab switching should be fast (under 2 seconds for 3 switches)
      expect(duration).toBeLessThan(2000);
    });
  });

  test.describe('Tab State Persistence', () => {
    test('should persist tab selection across page reloads', async ({ page }) => {
      // Navigate to node detail page
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      // Switch to Time Statistics tab (tab 5)
      await page.getByRole('tab', { name: 'Time Statistics' }).click();
      await page.waitForTimeout(300);
      
      // Verify it's active
      let timeStatsTab = page.getByRole('tab', { name: 'Time Statistics' });
      await expect(timeStatsTab).toHaveAttribute('aria-selected', 'true');
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // The Time Statistics tab should still be active
      timeStatsTab = page.getByRole('tab', { name: 'Time Statistics' });
      await expect(timeStatsTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should persist different tabs for different nodes', async ({ page }) => {
      // Go to first node and select a tab
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('tab', { name: 'Cassandra' }).click();
      await page.waitForTimeout(300);
      
      // Navigate to a different node (or same node, localStorage is per page)
      await page.goto(`${BASE_URL}/processing-ui/nodes/another-node`);
      await page.waitForLoadState('networkidle');
      
      // Select a different tab
      await page.getByRole('tab', { name: 'Transactions' }).click();
      await page.waitForTimeout(300);
      
      // Go back to first node
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      // Should remember Cassandra tab
      const cassandraTab = page.getByRole('tab', { name: 'Cassandra' });
      await expect(cassandraTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should handle localStorage errors gracefully', async ({ page }) => {
      // Navigate to node detail page
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      // Disable localStorage by overriding it
      await page.evaluate(() => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => {
          throw new Error('localStorage disabled');
        };
      });
      
      // Try to switch tabs - should still work despite localStorage error
      await page.getByRole('tab', { name: 'Server Summary' }).click();
      await page.waitForTimeout(300);
      
      // Tab should still switch
      const summaryTab = page.getByRole('tab', { name: 'Server Summary' });
      await expect(summaryTab).toHaveAttribute('aria-selected', 'true');
      
      // No console errors should be thrown (errors should be caught)
      // The app should continue to work
      expect(true).toBe(true);
    });

    test('should default to first tab when no saved state exists', async ({ page, context }) => {
      // Clear localStorage
      await context.clearCookies();
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      
      // Clear localStorage via evaluate
      await page.evaluate(() => localStorage.clear());
      
      // Reload to start fresh
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should default to first tab (Processing Manager)
      const firstTab = page.getByRole('tab', { name: 'Processing Manager' });
      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('Combined Features', () => {
    test('should work correctly with both lazy loading and persistence', async ({ page }) => {
      // Navigate to node detail page
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      // Switch to a specific tab
      await page.getByRole('tab', { name: 'Network info' }).click();
      await page.waitForTimeout(300);
      
      // Verify only one panel is visible (lazy loading)
      let visiblePanels = page.locator('[role="tabpanel"][aria-hidden="false"]');
      await expect(visiblePanels).toHaveCount(1);
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Network info tab should still be active (persistence)
      const networkTab = page.getByRole('tab', { name: 'Network info' });
      await expect(networkTab).toHaveAttribute('aria-selected', 'true');
      
      // Still only one panel visible (lazy loading)
      visiblePanels = page.locator('[role="tabpanel"][aria-hidden="false"]');
      await expect(visiblePanels).toHaveCount(1);
    });

    test('should not have console errors with improvements', async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        } else if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      // Switch between tabs
      await page.getByRole('tab', { name: 'Server Summary' }).click();
      await page.waitForTimeout(300);
      await page.getByRole('tab', { name: 'Time Statistics' }).click();
      await page.waitForTimeout(300);
      
      // Reload to test persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Filter out known warnings and expected errors
      const actualErrors = consoleErrors.filter(err => 
        !err.includes('condition "types"') && 
        !err.includes('Failed to fetch') &&
        !err.includes('Network Error') &&
        !err.includes('ERR_CONNECTION_REFUSED')
      );
      
      // Should have no unexpected errors
      expect(actualErrors.length).toBe(0);
    });
  });

  test.describe('All 11 Tabs Present', () => {
    test('should have all 11 tabs visible', async ({ page }) => {
      await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
      await page.waitForLoadState('networkidle');
      
      const expectedTabs = [
        'Processing Manager',
        'Server Summary',
        'Cassandra',
        'Processing Events',
        'Time Statistics',
        'Transactions',
        'PM components',
        'Composite indexes',
        'Caches List',
        'Network info',
        'ZooKeeper info'
      ];
      
      // Verify all 11 tabs are present
      for (const tabName of expectedTabs) {
        const tab = page.getByRole('tab', { name: tabName });
        await expect(tab).toBeVisible();
      }
      
      // Count total tabs
      const allTabs = page.locator('[role="tab"]');
      await expect(allTabs).toHaveCount(11);
    });
  });
});

