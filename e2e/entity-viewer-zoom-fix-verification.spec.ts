/**
 * Entity Viewer Zoom Icon Fix Verification
 * Verifies that zoom in/out icons are correctly mapped
 */

import { test, expect } from '@playwright/test';

test.describe('Entity Viewer - Zoom Icon Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/entity-viewer');
    await page.waitForLoadState('networkidle');
  });

  test('should have correct zoom icons - zoom in makes things bigger, zoom out makes things smaller', async ({ page }) => {
    // Select an entity first
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      
      // Get initial zoom level
      const zoomDisplay = page.locator('.tools .buttons span').filter({ hasText: 'Zoom' });
      
      // Initial zoom should be 1 (not displayed)
      await expect(zoomDisplay).not.toBeVisible();
      
      // Get the zoom control buttons
      const zoomControls = page.locator('.tools .anticon');
      
      // First icon should be ZoomInOutlined (magnifying glass with +)
      // This should INCREASE the zoom (make things bigger)
      const zoomInButton = zoomControls.first();
      
      // Click zoom in (should make things bigger, zoom > 1)
      await zoomInButton.click();
      await page.waitForTimeout(300);
      
      // Zoom should now be 1.1 (bigger)
      await expect(zoomDisplay).toBeVisible();
      await expect(zoomDisplay).toContainText('Zoom 1.1');
      
      // Second icon should be ZoomOutOutlined (magnifying glass with -)
      // This should DECREASE the zoom (make things smaller)
      const zoomOutButton = zoomControls.nth(1);
      
      // Click zoom out twice (should make things smaller)
      await zoomOutButton.click();
      await page.waitForTimeout(300);
      await zoomOutButton.click();
      await page.waitForTimeout(300);
      
      // Zoom should now be 0.9 (smaller than original)
      await expect(zoomDisplay).toBeVisible();
      await expect(zoomDisplay).toContainText('Zoom 0.9');
      
      // Click zoom in again to verify it increases
      await zoomInButton.click();
      await page.waitForTimeout(300);
      
      // Zoom should be back to 1 (not displayed)
      await expect(zoomDisplay).not.toBeVisible();
    }
  });

  test('should verify zoom behavior matches icon semantics', async ({ page }) => {
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });

    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);

      const zoomControls = page.locator('.tools .anticon');
      const zoomDisplay = page.locator('.tools .buttons span').filter({ hasText: 'Zoom' });

      // Test sequence: zoom in (bigger) -> zoom in (bigger) -> zoom out (smaller) -> zoom out (smaller)

      // Click first icon (zoom in / magnifying glass +) - should increase zoom
      await zoomControls.first().click();
      await page.waitForTimeout(300);
      let zoomText = await zoomDisplay.textContent();
      expect(zoomText).toContain('1.1'); // Bigger than 1

      // Click first icon again - should increase more
      await zoomControls.first().click();
      await page.waitForTimeout(300);
      zoomText = await zoomDisplay.textContent();
      expect(zoomText).toContain('1.2'); // Even bigger

      // Click second icon (zoom out / magnifying glass -) - should decrease zoom
      await zoomControls.nth(1).click();
      await page.waitForTimeout(300);

      // Wait for zoom display to update
      await page.waitForTimeout(500);

      // Check if still visible (should be at 1.1 or 1)
      const isVisible = await zoomDisplay.isVisible();
      if (isVisible) {
        zoomText = await zoomDisplay.textContent();
        // Should be 1.1 or less
        expect(zoomText).toMatch(/Zoom (1\.1|1|0\.\d)/);
      }
    }
  });

  test('should take screenshot showing correct zoom icons', async ({ page }) => {
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      
      // Zoom in to show the zoom level
      const zoomControls = page.locator('.tools .anticon');
      await zoomControls.first().click();
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'e2e-screenshots/entity-viewer-zoom-icons-fixed.png',
        fullPage: true 
      });
    }
  });
});

