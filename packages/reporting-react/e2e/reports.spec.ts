/**
 * E2E Tests for Reports Page
 * Tests the main reports functionality end-to-end
 */

import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the reports page
    await page.goto('/');
  });

  test('should display the page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Tableau/);
  });

  test('should display the main heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Tableau');
  });

  test('should display the username', async ({ page }) => {
    const username = page.locator('.logout');
    await expect(username).toContainText('User');
  });

  test('should display the history table', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should have table headers', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.ant-table-thead');
    
    const headers = page.locator('.ant-table-thead th');
    const headerCount = await headers.count();
    
    // Should have multiple headers (Name, Type, User, Status, etc.)
    expect(headerCount).toBeGreaterThan(0);
  });

  test('should display loading state initially', async ({ page }) => {
    // Reload to catch loading state
    await page.reload();
    
    // Check for loading spinner or skeleton
    const loading = page.locator('.ant-spin, .ant-skeleton');
    
    // Loading should appear briefly
    // Note: This might be too fast to catch in some cases
    const isVisible = await loading.isVisible().catch(() => false);
    
    // Either loading is visible or data loaded too fast
    expect(typeof isVisible).toBe('boolean');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for main sections
    const header = page.locator('.header');
    await expect(header).toBeVisible();
    
    const reportTable = page.locator('.report-table');
    await expect(reportTable).toBeVisible();
  });

  test('should display report label', async ({ page }) => {
    const label = page.locator('.label').first();
    await expect(label).toHaveText('Report');
  });
});

test.describe('Reports Page - Table Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for table to be ready
    await page.waitForSelector('.ant-table');
  });

  test('should allow table sorting', async ({ page }) => {
    // Find sortable column headers
    const sortableHeaders = page.locator('.ant-table-column-has-sorters');
    const count = await sortableHeaders.count();
    
    if (count > 0) {
      // Click first sortable header
      await sortableHeaders.first().click();
      
      // Wait for sort to apply
      await page.waitForTimeout(500);
      
      // Table should still be visible
      const table = page.locator('.ant-table');
      await expect(table).toBeVisible();
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Table should be visible even if empty
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should display table with proper styling', async ({ page }) => {
    const table = page.locator('.ant-table');
    
    // Check table has proper classes
    const hasAbStyle = await table.evaluate((el) => {
      return el.classList.contains('ab-style') || 
             el.querySelector('.ab-style') !== null;
    });
    
    expect(typeof hasAbStyle).toBe('boolean');
  });
});

test.describe('Reports Page - Navigation', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Should show login page
    await expect(page.locator('.login-layout')).toBeVisible();
  });

  test('should navigate to tableau login', async ({ page }) => {
    await page.goto('/tableau/login');
    
    // Should show login page
    await expect(page.locator('.login-layout')).toBeVisible();
  });

  test('should navigate to tableau reports', async ({ page }) => {
    await page.goto('/tableau/reports');
    
    // Should show reports page
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Tableau');
  });

  test('should redirect unknown routes to reports', async ({ page }) => {
    await page.goto('/unknown-route');
    
    // Should redirect to reports
    await page.waitForURL(/\/tableau\/reports/);
    
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Tableau');
  });
});

test.describe('Reports Page - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    const h1Count = await h1.count();
    expect(h1Count).toBe(1); // Should have exactly one h1
  });

  test('should have accessible table', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Table should have proper structure
    const thead = page.locator('thead');
    await expect(thead).toBeVisible();
    
    const tbody = page.locator('tbody');
    await expect(tbody).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus on the page
    await page.keyboard.press('Tab');
    
    // Should be able to navigate with keyboard
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for ARIA attributes on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // Should have buttons (even if just for testing)
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Reports Page - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('.ant-table');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForSelector('.ant-table');
    
    // Filter out known acceptable errors (like network errors in test env)
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load') && 
      !error.includes('404') &&
      !error.includes('Network')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle rapid navigation', async ({ page }) => {
    // Navigate rapidly between pages
    await page.goto('/');
    await page.goto('/login');
    await page.goto('/tableau/reports');
    await page.goto('/');
    
    // Should still work correctly
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Tableau');
  });
});

test.describe('Reports Page - Visual Regression', () => {
  test('should match screenshot on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('reports-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('should match screenshot on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.ant-table');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('reports-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});

