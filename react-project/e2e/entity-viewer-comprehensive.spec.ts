/**
 * Entity Viewer Comprehensive Test
 * Tests all features and looks for potential issues
 */

import { test, expect } from '@playwright/test';

test.describe('Entity Viewer - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/entity-viewer');
    await page.waitForLoadState('networkidle');
  });

  test('should load without critical errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(error =>
      !error.includes('Network Error') &&
      !error.includes('404') &&
      !error.includes('Failed to fetch')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should display all UI elements correctly', async ({ page }) => {
    // Check header
    await expect(page.locator('h2').filter({ hasText: 'Entity Viewer Demo' })).toBeVisible();
    
    // Check info alert
    await expect(page.locator('.ant-alert-info')).toBeVisible();
    
    // Check features list
    await expect(page.locator('text=Select entity classes from dropdown')).toBeVisible();
    await expect(page.locator('text=Toggle between dynamic and non-dynamic entities')).toBeVisible();
    await expect(page.locator('text=Drag entity boxes around the canvas')).toBeVisible();
    await expect(page.locator('text=Zoom in/out controls')).toBeVisible();
    
    // Check main controls
    await expect(page.locator('text=Selected Root Entity')).toBeVisible();
    await expect(page.locator('.ant-select').first()).toBeVisible();
    await expect(page.locator('text=show only dynamic entities')).toBeVisible();
    
    // Check zoom controls
    const zoomControls = page.locator('.tools');
    await expect(zoomControls).toBeVisible();
  });

  test('should handle entity selection workflow', async ({ page }) => {
    // Open selector
    const selector = page.locator('.ant-select').first();
    await selector.click();
    
    // Wait for dropdown
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    // Check options are available
    const options = page.locator('.ant-select-item-option');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    
    // Select first option
    await options.first().click();
    
    // Wait for entity to load
    await page.waitForTimeout(1000);
    
    // Check if entity viewer is displayed
    const entityViewer = page.locator('.entity-viewer');
    const viewerCount = await entityViewer.count();
    expect(viewerCount).toBeGreaterThan(0);
  });

  test('should toggle dynamic entities and show warning', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    
    // Should be checked initially
    await expect(checkbox).toBeChecked();
    
    // Uncheck
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
    
    // Warning should appear
    await expect(page.locator('.ant-alert-warning')).toBeVisible();
    await expect(page.locator('.ant-alert-warning')).toContainText('Reports will not work');
    
    // Check again
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    
    // Warning should disappear
    await expect(page.locator('.ant-alert-warning')).not.toBeVisible();
  });

  test('should handle zoom controls', async ({ page }) => {
    // First select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      
      // Get zoom controls
      const zoomControls = page.locator('.tools .anticon');
      const controlCount = await zoomControls.count();
      
      if (controlCount >= 3) {
        // Click zoom out
        await zoomControls.nth(0).click();
        await page.waitForTimeout(300);
        
        // Click zoom in
        await zoomControls.nth(1).click();
        await page.waitForTimeout(300);
        
        // Click refresh
        await zoomControls.nth(2).click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should display entity data when selected', async ({ page }) => {
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(2000);
      
      // Check if entity viewer is displayed
      const entityViewer = page.locator('.entity-viewer');
      await expect(entityViewer.first()).toBeVisible();
      
      // Check if entity has header
      const header = entityViewer.first().locator('.header');
      await expect(header).toBeVisible();
      
      // Check if entity has body
      const body = entityViewer.first().locator('.body');
      await expect(body).toBeVisible();
    }
  });

  test('should handle entity deletion', async ({ page }) => {
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(2000);
      
      // Find delete button
      const deleteButton = page.locator('.entity-viewer .anticon-delete').first();
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        
        // Wait for modal
        await page.waitForTimeout(500);
        
        // Check if modal appeared
        const modal = page.locator('.ant-modal');
        if (await modal.count() > 0) {
          // Click cancel
          const cancelButton = page.locator('.ant-modal button').filter({ hasText: 'Cancel' });
          if (await cancelButton.count() > 0) {
            await cancelButton.click();
          }
        }
      }
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1366, height: 768, name: 'Laptop' },
      { width: 768, height: 1024, name: 'Tablet' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Check if main elements are still visible
      await expect(page.locator('h2').filter({ hasText: 'Entity Viewer Demo' })).toBeVisible();
      await expect(page.locator('.ant-select').first()).toBeVisible();
    }
  });

  test('should handle rapid interactions without errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Rapid checkbox toggling
    const checkbox = page.locator('input[type="checkbox"]').first();
    for (let i = 0; i < 5; i++) {
      await checkbox.click();
      await page.waitForTimeout(100);
    }

    // Rapid selector opening/closing
    const selector = page.locator('.ant-select').first();
    for (let i = 0; i < 3; i++) {
      await selector.click();
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    // Should have no page errors
    expect(errors).toHaveLength(0);
  });

  test('should maintain state after interactions', async ({ page }) => {
    // Toggle checkbox
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
    
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      const firstOptionText = await options.first().textContent();
      await options.first().click();
      await page.waitForTimeout(1000);
      
      // Checkbox should still be unchecked
      await expect(checkbox).not.toBeChecked();
      
      // Selected value should be displayed
      const selectedValue = await selector.locator('.ant-select-selection-item').textContent();
      expect(selectedValue).toBeTruthy();
    }
  });

  test('should take comprehensive screenshot', async ({ page }) => {
    // Select an entity first
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({
      path: 'e2e-screenshots/entity-viewer-comprehensive.png',
      fullPage: true
    });
  });
});

