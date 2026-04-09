import { test, expect } from '@playwright/test';

test.describe('Reports Page with Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/reports');
  });

  test('should display tabs on Reports page', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if tabs are present
    const reportConfigTab = page.locator('.ant-tabs-tab', { hasText: 'Report Config' });
    const reportsTab = page.locator('.ant-tabs-tab', { hasText: 'Reports' });

    await expect(reportConfigTab).toBeVisible();
    await expect(reportsTab).toBeVisible();

    console.log('✅ Both tabs are visible');
  });

  test('should show Report Config tab content by default', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if Report Config tab is active
    const reportConfigTab = page.locator('.ant-tabs-tab-active', { hasText: 'Report Config' });
    await expect(reportConfigTab).toBeVisible();

    // Check if Report Configurations heading is visible
    const heading = page.locator('h1', { hasText: 'Report Configurations' });
    await expect(heading).toBeVisible();

    console.log('✅ Report Config tab is active by default');
  });

  test('should switch to Reports tab when clicked', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click on Reports tab
    const reportsTab = page.locator('.ant-tabs-tab', { hasText: 'Reports' });
    await reportsTab.click();

    // Wait for tab to become active
    await page.waitForTimeout(500);

    // Check if Reports tab is now active
    const activeReportsTab = page.locator('.ant-tabs-tab-active', { hasText: 'Reports' });
    await expect(activeReportsTab).toBeVisible();

    // Check if QuickRunReport component is visible
    const quickRunReport = page.locator('.history-report-quick-run');
    await expect(quickRunReport).toBeVisible();

    console.log('✅ Successfully switched to Reports tab');
  });

  test('should persist tab selection in storage', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click on Reports tab
    const reportsTab = page.locator('.ant-tabs-tab', { hasText: 'Reports' });
    await reportsTab.click();
    await page.waitForTimeout(500);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if Reports tab is still active after reload
    const activeReportsTab = page.locator('.ant-tabs-tab-active', { hasText: 'Reports' });
    await expect(activeReportsTab).toBeVisible();

    console.log('✅ Tab selection persisted after reload');
  });
});

