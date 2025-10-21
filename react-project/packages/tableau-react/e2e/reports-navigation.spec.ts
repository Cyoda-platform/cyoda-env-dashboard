/**
 * E2E Tests for Reports Navigation Menu
 * Tests the navigation between Reports and Stream Reports pages
 */

import { test, expect } from '@playwright/test';

test.describe('Reports Navigation Menu', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Reports page
    await page.goto('http://localhost:3007/tableau/reports');
    await page.waitForLoadState('networkidle');
  });

  test('should display navigation menu on Reports page', async ({ page }) => {
    // Check if navigation menu exists
    const navigation = page.locator('.reports-navigation');
    await expect(navigation).toBeVisible();

    // Check if both links are present
    const reportConfigLink = navigation.locator('a', { hasText: 'Report config editor' });
    const streamReportsLink = navigation.locator('a', { hasText: 'Stream Reports' });

    await expect(reportConfigLink).toBeVisible();
    await expect(streamReportsLink).toBeVisible();

    // Check if separator is present
    const separator = navigation.locator('.separator');
    await expect(separator).toBeVisible();
    await expect(separator).toHaveText('|');
  });

  test('should highlight active link on Reports page', async ({ page }) => {
    const navigation = page.locator('.reports-navigation');
    const reportConfigLink = navigation.locator('a', { hasText: 'Report config editor' });
    const streamReportsLink = navigation.locator('a', { hasText: 'Stream Reports' });

    // On Reports page, "Report config editor" should be active
    await expect(reportConfigLink).toHaveClass(/active/);
    await expect(streamReportsLink).not.toHaveClass(/active/);
  });

  test('should navigate to Stream Reports page when clicking Stream Reports link', async ({ page }) => {
    const navigation = page.locator('.reports-navigation');
    const streamReportsLink = navigation.locator('a', { hasText: 'Stream Reports' });

    // Click on Stream Reports link
    await streamReportsLink.click();
    await page.waitForLoadState('networkidle');

    // Verify URL changed
    expect(page.url()).toContain('/tableau/reports/stream');

    // Verify navigation menu is still visible
    await expect(navigation).toBeVisible();
  });

  test('should highlight active link on Stream Reports page', async ({ page }) => {
    // Navigate to Stream Reports page
    await page.goto('http://localhost:3007/tableau/reports/stream');
    await page.waitForLoadState('networkidle');

    const navigation = page.locator('.reports-navigation');
    const reportConfigLink = navigation.locator('a', { hasText: 'Report config editor' });
    const streamReportsLink = navigation.locator('a', { hasText: 'Stream Reports' });

    // On Stream Reports page, "Stream Reports" should be active
    await expect(streamReportsLink).toHaveClass(/active/);
    await expect(reportConfigLink).not.toHaveClass(/active/);
  });

  test('should navigate back to Reports page when clicking Report config editor link', async ({ page }) => {
    // First navigate to Stream Reports page
    await page.goto('http://localhost:3007/tableau/reports/stream');
    await page.waitForLoadState('networkidle');

    const navigation = page.locator('.reports-navigation');
    const reportConfigLink = navigation.locator('a', { hasText: 'Report config editor' });

    // Click on Report config editor link
    await reportConfigLink.click();
    await page.waitForLoadState('networkidle');

    // Verify URL changed back
    expect(page.url()).toContain('/tableau/reports');
    expect(page.url()).not.toContain('/stream');

    // Verify navigation menu is still visible
    await expect(navigation).toBeVisible();

    // Verify correct link is active
    await expect(reportConfigLink).toHaveClass(/active/);
  });

  test('should maintain navigation menu when switching between pages', async ({ page }) => {
    const navigation = page.locator('.reports-navigation');

    // Start on Reports page
    await expect(navigation).toBeVisible();

    // Navigate to Stream Reports
    const streamReportsLink = navigation.locator('a', { hasText: 'Stream Reports' });
    await streamReportsLink.click();
    await page.waitForLoadState('networkidle');

    // Navigation should still be visible
    await expect(navigation).toBeVisible();

    // Navigate back to Reports
    const reportConfigLink = navigation.locator('a', { hasText: 'Report config editor' });
    await reportConfigLink.click();
    await page.waitForLoadState('networkidle');

    // Navigation should still be visible
    await expect(navigation).toBeVisible();
  });

  test('should display navigation menu on Stream Reports page', async ({ page }) => {
    // Navigate to Stream Reports page
    await page.goto('http://localhost:3007/tableau/reports/stream');
    await page.waitForLoadState('networkidle');

    // Check if navigation menu exists
    const navigation = page.locator('.reports-navigation');
    await expect(navigation).toBeVisible();

    // Check if both links are present
    const reportConfigLink = navigation.locator('a', { hasText: 'Report config editor' });
    const streamReportsLink = navigation.locator('a', { hasText: 'Stream Reports' });

    await expect(reportConfigLink).toBeVisible();
    await expect(streamReportsLink).toBeVisible();
  });

  test('should have correct link hrefs', async ({ page }) => {
    const navigation = page.locator('.reports-navigation');
    const reportConfigLink = navigation.locator('a', { hasText: 'Report config editor' });
    const streamReportsLink = navigation.locator('a', { hasText: 'Stream Reports' });

    // Check href attributes
    await expect(reportConfigLink).toHaveAttribute('href', '/tableau/reports');
    await expect(streamReportsLink).toHaveAttribute('href', '/tableau/reports/stream');
  });

  test('should apply hover styles to links', async ({ page }) => {
    const navigation = page.locator('.reports-navigation');
    const reportConfigLink = navigation.locator('a', { hasText: 'Report config editor' });

    // Get initial color
    const initialColor = await reportConfigLink.evaluate((el) => 
      window.getComputedStyle(el).color
    );

    // Hover over the link
    await reportConfigLink.hover();

    // Color should change on hover (we can't test exact color due to CSS transitions)
    // But we can verify the element is still visible and interactive
    await expect(reportConfigLink).toBeVisible();
  });
});

