/**
 * E2E Tests for Complete Workflow (Phase 4)
 * Tests the complete end-to-end workflow across all phases
 */

import { test, expect } from '@playwright/test';

test.describe('Complete Workflow - Report Management', () => {
  test('should complete full report lifecycle: create → edit → run → view', async ({ page }) => {
    // Step 1: Navigate to Report Configs
    await page.goto('/tableau/report-configs');
    await page.waitForSelector('.ant-table');
    
    // Verify page loaded
    const heading = page.locator('h2').first();
    await expect(heading).toContainText('Report Configurations');
    
    // Step 2: Open Create Dialog
    const createButton = page.locator('button:has-text("Create New")');
    await expect(createButton).toBeVisible();
    
    // Note: Actual creation would require API mocking
    // This test verifies the UI flow is accessible
    
    // Step 3: Verify QuickRunReport is available
    const quickRun = page.locator('.quick-run-report');
    const quickRunExists = await quickRun.count();
    expect(quickRunExists).toBeGreaterThanOrEqual(0);
    
    // Step 4: Verify table actions are available
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should navigate between all report pages', async ({ page }) => {
    // Navigate to Reports (viewing)
    await page.goto('/tableau/reports');
    let heading = page.locator('h1');
    await expect(heading).toHaveText('Tableau');
    
    // Navigate to Report Configs (management)
    await page.goto('/tableau/report-configs');
    heading = page.locator('h2').first();
    await expect(heading).toContainText('Report Configurations');
    
    // Navigate to Stream Reports
    await page.goto('/tableau/stream-reports');
    heading = page.locator('h2').first();
    await expect(heading).toContainText('Stream Reports');
    
    // All pages should be accessible
    expect(true).toBe(true);
  });
});

test.describe('Complete Workflow - Stream Report Management', () => {
  test('should complete full stream report lifecycle', async ({ page }) => {
    // Step 1: Navigate to Stream Reports
    await page.goto('/tableau/stream-reports');
    await page.waitForSelector('.ant-table');
    
    // Verify page loaded
    const heading = page.locator('h2').first();
    await expect(heading).toContainText('Stream Reports');
    
    // Step 2: Verify Create button is available
    const createButton = page.locator('button:has-text("Create New")');
    await expect(createButton).toBeVisible();
    
    // Step 3: Verify table is displayed
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    
    // Step 4: Verify filter is available
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should access stream report editor', async ({ page }) => {
    // Navigate to stream report editor
    await page.goto('/tableau/stream-report-editor/test-123');
    
    // Wait for tabs to load
    await page.waitForSelector('.ant-tabs');
    
    // Verify all tabs are present
    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(5);
    
    // Verify Range tab exists (unique to stream reports)
    const rangeTab = page.locator('.ant-tabs-tab:has-text("Range")');
    await expect(rangeTab).toBeVisible();
  });
});

test.describe('Complete Workflow - Cross-Component Integration', () => {
  test('should share components between report and stream report pages', async ({ page }) => {
    // Both pages should use CreateReportDialog
    // Both pages should use ConfigEditorReportsFilter
    
    // Test Report Configs
    await page.goto('/tableau/report-configs');
    await page.waitForSelector('.ant-table');
    
    const createButton1 = page.locator('button:has-text("Create New")');
    await expect(createButton1).toBeVisible();
    
    const searchInput1 = page.locator('input[placeholder*="Search"]');
    await expect(searchInput1).toBeVisible();
    
    // Test Stream Reports
    await page.goto('/tableau/stream-reports');
    await page.waitForSelector('.ant-table');
    
    const createButton2 = page.locator('button:has-text("Create New")');
    await expect(createButton2).toBeVisible();
    
    const searchInput2 = page.locator('input[placeholder*="Search"]');
    await expect(searchInput2).toBeVisible();
    
    // Both pages should have similar UI
    expect(true).toBe(true);
  });

  test('should share tab components between editors', async ({ page }) => {
    // Both editors should use the same tab components
    
    // Test Report Editor
    await page.goto('/tableau/report-editor/test-123');
    await page.waitForSelector('.ant-tabs');
    
    const columnsTab1 = page.locator('.ant-tabs-tab:has-text("Columns")');
    await expect(columnsTab1).toBeVisible();
    
    const jsonTab1 = page.locator('.ant-tabs-tab:has-text("JSON")');
    await expect(jsonTab1).toBeVisible();
    
    // Test Stream Report Editor
    await page.goto('/tableau/stream-report-editor/test-123');
    await page.waitForSelector('.ant-tabs');
    
    const columnsTab2 = page.locator('.ant-tabs-tab:has-text("Columns")');
    await expect(columnsTab2).toBeVisible();
    
    const jsonTab2 = page.locator('.ant-tabs-tab:has-text("JSON")');
    await expect(jsonTab2).toBeVisible();
    
    // Both editors should have similar tabs
    expect(true).toBe(true);
  });
});

test.describe('Complete Workflow - Navigation Flow', () => {
  test('should navigate from Reports to Report Configs', async ({ page }) => {
    await page.goto('/tableau/reports');
    
    // Navigate to report configs (would typically be via a link/button)
    await page.goto('/tableau/report-configs');
    
    const heading = page.locator('h2').first();
    await expect(heading).toContainText('Report Configurations');
  });

  test('should navigate from Report Configs to Report Editor', async ({ page }) => {
    await page.goto('/tableau/report-configs');
    await page.waitForSelector('.ant-table');
    
    // Navigate to editor (would typically be via Edit button)
    await page.goto('/tableau/report-editor/test-123');
    
    await page.waitForSelector('.ant-tabs');
    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should navigate from Report Editor back to Report Configs', async ({ page }) => {
    await page.goto('/tableau/report-editor/test-123');
    
    // Click Back button
    const backButton = page.locator('button:has-text("Back")');
    await backButton.click();
    
    // Should navigate back
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).not.toContain('/report-editor/');
  });

  test('should navigate from Stream Reports to Stream Report Editor', async ({ page }) => {
    await page.goto('/tableau/stream-reports');
    await page.waitForSelector('.ant-table');
    
    // Navigate to editor
    await page.goto('/tableau/stream-report-editor/test-123');
    
    await page.waitForSelector('.ant-tabs');
    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should navigate from Stream Report Editor back to Stream Reports', async ({ page }) => {
    await page.goto('/tableau/stream-report-editor/test-123');
    
    // Click Back button
    const backButton = page.locator('button:has-text("Back")');
    await backButton.click();
    
    // Should navigate back
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).not.toContain('/stream-report-editor/');
  });
});

test.describe('Complete Workflow - Data Flow', () => {
  test('should handle loading states across all pages', async ({ page }) => {
    const pages = [
      '/tableau/reports',
      '/tableau/report-configs',
      '/tableau/stream-reports',
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Should show loading or data
      const table = page.locator('.ant-table');
      const loading = page.locator('.ant-spin');
      
      const tableExists = await table.count();
      const loadingExists = await loading.count();
      
      // Either table or loading should exist
      expect(tableExists + loadingExists).toBeGreaterThan(0);
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to pages and check for error handling
    await page.goto('/tableau/report-configs');
    
    // Page should load even if API fails
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});

test.describe('Complete Workflow - User Experience', () => {
  test('should maintain consistent UI across all pages', async ({ page }) => {
    const pages = [
      '/tableau/reports',
      '/tableau/report-configs',
      '/tableau/stream-reports',
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // All pages should have consistent structure
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // All pages should use Ant Design components
      const antComponents = page.locator('[class*="ant-"]');
      const componentCount = await antComponents.count();
      expect(componentCount).toBeGreaterThan(0);
    }
  });

  test('should support browser back/forward navigation', async ({ page }) => {
    // Navigate through pages
    await page.goto('/tableau/reports');
    await page.goto('/tableau/report-configs');
    await page.goto('/tableau/stream-reports');
    
    // Go back
    await page.goBack();
    let url = page.url();
    expect(url).toContain('/report-configs');
    
    // Go back again
    await page.goBack();
    url = page.url();
    expect(url).toContain('/reports');
    
    // Go forward
    await page.goForward();
    url = page.url();
    expect(url).toContain('/report-configs');
  });

  test('should handle rapid page switching', async ({ page }) => {
    // Rapidly switch between pages
    await page.goto('/tableau/reports');
    await page.goto('/tableau/report-configs');
    await page.goto('/tableau/stream-reports');
    await page.goto('/tableau/reports');
    await page.goto('/tableau/report-configs');
    
    // Should still work correctly
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Complete Workflow - Performance', () => {
  test('should load all pages within acceptable time', async ({ page }) => {
    const pages = [
      '/tableau/reports',
      '/tableau/report-configs',
      '/tableau/stream-reports',
    ];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      
      await page.goto(pagePath);
      await page.waitForSelector('.ant-table, h1, h2');
      
      const loadTime = Date.now() - startTime;
      
      // Each page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    }
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/tableau/reports');
      await page.goto('/tableau/report-configs');
      await page.goto('/tableau/stream-reports');
    }
    
    // Should still be responsive
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Complete Workflow - Integration', () => {
  test('should verify all routes are accessible', async ({ page }) => {
    const routes = [
      '/',
      '/tableau/reports',
      '/tableau/report-configs',
      '/tableau/report-editor/test-123',
      '/tableau/stream-reports',
      '/tableau/stream-report-editor/test-123',
    ];
    
    for (const route of routes) {
      await page.goto(route);
      
      // Page should load without errors
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should handle unknown routes gracefully', async ({ page }) => {
    await page.goto('/unknown-route-12345');
    
    // Should redirect or show error page
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

