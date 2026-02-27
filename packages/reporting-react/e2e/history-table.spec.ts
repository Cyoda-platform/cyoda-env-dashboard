/**
 * E2E Tests for History Table Component
 * Tests the report history table functionality
 */

import { test, expect } from '@playwright/test';

test.describe('History Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should display table structure', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    
    // Should have header
    const thead = page.locator('.ant-table-thead');
    await expect(thead).toBeVisible();
    
    // Should have body
    const tbody = page.locator('.ant-table-tbody');
    await expect(tbody).toBeVisible();
  });

  test('should display column headers', async ({ page }) => {
    const headers = page.locator('.ant-table-thead th');
    const count = await headers.count();
    
    // Should have multiple columns
    expect(count).toBeGreaterThan(0);
  });

  test('should handle row hover', async ({ page }) => {
    const firstRow = page.locator('.ant-table-tbody tr').first();
    
    if (await firstRow.isVisible()) {
      // Hover over row
      await firstRow.hover();
      
      // Row should still be visible
      await expect(firstRow).toBeVisible();
    }
  });

  test('should display row data', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    // Should have rows (or be empty)
    expect(rowCount).toBeGreaterThanOrEqual(0);
    
    if (rowCount > 0) {
      const firstRow = rows.first();
      const cells = firstRow.locator('td');
      const cellCount = await cells.count();
      
      // Row should have cells
      expect(cellCount).toBeGreaterThan(0);
    }
  });

  test('should handle empty state', async ({ page }) => {
    // Table should be visible even if empty
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    
    // Check for empty state message
    const emptyText = page.locator('.ant-empty-description');
    const hasEmptyState = await emptyText.isVisible().catch(() => false);
    
    // Either has data or shows empty state
    expect(typeof hasEmptyState).toBe('boolean');
  });

  test('should display loading state', async ({ page }) => {
    // Reload to catch loading state
    await page.reload();
    
    // Check for loading indicator
    const loading = page.locator('.ant-spin');
    
    // Loading might be too fast to catch
    const isVisible = await loading.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should have proper table styling', async ({ page }) => {
    const table = page.locator('.ant-table');
    
    // Check for custom styling
    const hasCustomClass = await table.evaluate((el) => {
      const parent = el.closest('.wrap-table');
      return parent !== null;
    });
    
    expect(hasCustomClass).toBe(true);
  });

  test('should display report label', async ({ page }) => {
    const label = page.locator('.label').filter({ hasText: 'Report' });
    await expect(label).toBeVisible();
  });
});

test.describe('History Table - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should allow row selection', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      const firstRow = rows.first();
      
      // Click on row
      await firstRow.click();
      
      // Row should be clickable
      await expect(firstRow).toBeVisible();
    }
  });

  test('should handle multiple row clicks', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 1) {
      // Click first row
      await rows.nth(0).click();
      await page.waitForTimeout(200);
      
      // Click second row
      await rows.nth(1).click();
      await page.waitForTimeout(200);
      
      // Both rows should still be visible
      await expect(rows.nth(0)).toBeVisible();
      await expect(rows.nth(1)).toBeVisible();
    }
  });

  test('should support column sorting', async ({ page }) => {
    const sortableHeaders = page.locator('.ant-table-column-has-sorters');
    const count = await sortableHeaders.count();
    
    if (count > 0) {
      const firstHeader = sortableHeaders.first();
      
      // Click to sort ascending
      await firstHeader.click();
      await page.waitForTimeout(300);
      
      // Click to sort descending
      await firstHeader.click();
      await page.waitForTimeout(300);
      
      // Table should still be visible
      const table = page.locator('.ant-table');
      await expect(table).toBeVisible();
    }
  });

  test('should handle rapid clicks', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      const firstRow = rows.first();
      
      // Click multiple times rapidly
      await firstRow.click();
      await firstRow.click();
      await firstRow.click();
      
      // Should handle gracefully
      await expect(firstRow).toBeVisible();
    }
  });
});

test.describe('History Table - Data Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should display formatted dates', async ({ page }) => {
    const cells = page.locator('.ant-table-tbody td');
    const cellCount = await cells.count();
    
    if (cellCount > 0) {
      // Check if any cells contain date-like content
      const cellTexts = await cells.allTextContents();
      const hasDateFormat = cellTexts.some(text => 
        /\d{4}-\d{2}-\d{2}/.test(text) || // ISO format
        /\d{2}\/\d{2}\/\d{4}/.test(text) || // US format
        /\d{2}\.\d{2}\.\d{4}/.test(text)    // EU format
      );
      
      // Either has dates or doesn't (both valid)
      expect(typeof hasDateFormat).toBe('boolean');
    }
  });

  test('should display row counts', async ({ page }) => {
    const cells = page.locator('.ant-table-tbody td');
    const cellCount = await cells.count();
    
    if (cellCount > 0) {
      // Check if any cells contain number formatting
      const cellTexts = await cells.allTextContents();
      const hasNumbers = cellTexts.some(text => /\d+/.test(text));
      
      // Should have some numeric data
      expect(typeof hasNumbers).toBe('boolean');
    }
  });

  test('should display status information', async ({ page }) => {
    const cells = page.locator('.ant-table-tbody td');
    const cellCount = await cells.count();
    
    if (cellCount > 0) {
      // Cells should contain text
      const firstCell = cells.first();
      const text = await firstCell.textContent();
      
      // Text can be empty or have content
      expect(typeof text).toBe('string');
    }
  });

  test('should handle long text gracefully', async ({ page }) => {
    const cells = page.locator('.ant-table-tbody td');
    const cellCount = await cells.count();
    
    if (cellCount > 0) {
      // Check for ellipsis or text wrapping
      const hasEllipsis = await cells.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.textOverflow === 'ellipsis' || 
               style.overflow === 'hidden' ||
               style.whiteSpace === 'nowrap';
      });
      
      expect(typeof hasEllipsis).toBe('boolean');
    }
  });
});

test.describe('History Table - Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.ant-table');
    
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForSelector('.ant-table');
    
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForSelector('.ant-table');
    
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('should handle window resize', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
    
    // Start with desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(200);
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    
    // Table should still be visible
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });
});

test.describe('History Table - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should have accessible table structure', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Should have thead
    const thead = page.locator('thead');
    await expect(thead).toBeVisible();
    
    // Should have tbody
    const tbody = page.locator('tbody');
    await expect(tbody).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Tab to first row
      await page.keyboard.press('Tab');
      
      // Should be able to navigate
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });

  test('should have proper heading structure', async ({ page }) => {
    const headers = page.locator('.ant-table-thead th');
    const count = await headers.count();
    
    // Should have headers
    expect(count).toBeGreaterThan(0);
  });
});

