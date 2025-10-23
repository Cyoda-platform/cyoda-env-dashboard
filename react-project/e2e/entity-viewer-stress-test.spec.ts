/**
 * Entity Viewer Stress Test
 * Tests edge cases and potential issues
 */

import { test, expect } from '@playwright/test';

test.describe('Entity Viewer - Stress Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/entity-viewer');
    await page.waitForLoadState('networkidle');
  });

  test('should handle multiple entity selections rapidly', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    const selector = page.locator('.ant-select').first();
    
    // Rapidly select different entities
    for (let i = 0; i < 5; i++) {
      await selector.click();
      await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
      
      const options = page.locator('.ant-select-item-option');
      const count = await options.count();
      
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
        await page.waitForTimeout(500);
      }
    }

    // Should have no critical errors
    const criticalErrors = errors.filter(error =>
      !error.includes('Network Error') &&
      !error.includes('404')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle checkbox toggling during entity loading', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    const selector = page.locator('.ant-select').first();

    // Toggle checkbox while selecting entity
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      
      // Immediately toggle checkbox
      await checkbox.click();
      await page.waitForTimeout(200);
      await checkbox.click();
      await page.waitForTimeout(200);
    }

    // Page should still be functional
    await expect(selector).toBeVisible();
    await expect(checkbox).toBeVisible();
  });

  test('should handle window resize during entity display', async ({ page }) => {
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      
      // Resize window multiple times
      const sizes = [
        { width: 1920, height: 1080 },
        { width: 1024, height: 768 },
        { width: 1366, height: 768 },
        { width: 1920, height: 1080 },
      ];

      for (const size of sizes) {
        await page.setViewportSize(size);
        await page.waitForTimeout(300);
      }

      // Entity viewer should still be visible
      const entityViewer = page.locator('.entity-viewer');
      await expect(entityViewer.first()).toBeVisible();
    }
  });

  test('should handle rapid zoom control clicks', async ({ page }) => {
    // Select an entity first
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      
      const zoomControls = page.locator('.tools .anticon');
      const controlCount = await zoomControls.count();
      
      if (controlCount >= 3) {
        // Rapidly click zoom controls
        for (let i = 0; i < 10; i++) {
          await zoomControls.nth(i % 3).click();
          await page.waitForTimeout(100);
        }
      }

      // Page should still be functional
      await expect(selector).toBeVisible();
    }
  });

  test('should handle entity selection with empty state', async ({ page }) => {
    // Try to interact with empty state
    const selector = page.locator('.ant-select').first();
    
    // Open and close selector multiple times
    for (let i = 0; i < 3; i++) {
      await selector.click();
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    // Should still be functional
    await expect(selector).toBeVisible();
  });

  test('should handle navigation away and back', async ({ page }) => {
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
    }

    // Navigate to home
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // Navigate back to entity viewer
    await page.goto('http://localhost:3000/entity-viewer');
    await page.waitForLoadState('networkidle');
    
    // Should load correctly
    await expect(page.locator('h2').filter({ hasText: 'Entity Viewer Demo' })).toBeVisible();
    await expect(selector).toBeVisible();
  });

  test('should handle multiple browser tabs', async ({ context, page }) => {
    // Select an entity in first tab
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
    }

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000/entity-viewer');
    await page2.waitForLoadState('networkidle');
    
    // Both tabs should work independently
    await expect(page.locator('.ant-select').first()).toBeVisible();
    await expect(page2.locator('.ant-select').first()).toBeVisible();
    
    await page2.close();
  });

  test('should handle long entity class names', async ({ page }) => {
    // This tests if the UI handles long text properly
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    const count = await options.count();
    
    // Check all options for proper text display
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await options.nth(i).textContent();
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(0);
    }
    
    await page.keyboard.press('Escape');
  });

  test('should maintain performance with entity displayed', async ({ page }) => {
    const startTime = Date.now();
    
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      
      // Perform various interactions
      const checkbox = page.locator('input[type="checkbox"]').first();
      await checkbox.click();
      await checkbox.click();
      
      const zoomControls = page.locator('.tools .anticon');
      if (await zoomControls.count() > 0) {
        await zoomControls.first().click();
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (10 seconds)
    expect(duration).toBeLessThan(10000);
  });

  test('should handle console warnings gracefully', async ({ page }) => {
    const warnings: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // Interact with the page
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(2000);
    }

    // Warnings are expected in demo mode (API warnings)
    // Just verify they're not critical
    const criticalWarnings = warnings.filter(warning =>
      warning.includes('React') &&
      !warning.includes('API') &&
      !warning.includes('mock')
    );
    
    // Should have no critical React warnings
    expect(criticalWarnings).toHaveLength(0);
  });
});

