/**
 * Entity Viewer - Delete Lines Fix Verification
 * Verifies that SVG lines are properly removed when entity boxes are deleted
 */

import { test, expect } from '@playwright/test';

test.describe('Entity Viewer - Delete Lines Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/entity-viewer');
    await page.waitForLoadState('networkidle');
  });

  test('should remove SVG lines when deleting entity boxes', async ({ page }) => {
    // Select first entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      
      // Verify entity viewer is visible
      const entityViewers = page.locator('.entity-viewer');
      await expect(entityViewers.first()).toBeVisible();
      
      // Check if SVG canvas exists
      const svgCanvas = page.locator('.wrap-entity-view-box-inner svg.canvas');
      await expect(svgCanvas).toBeVisible();
      
      // Count SVG elements before deletion
      const svgElementsBefore = await svgCanvas.locator('*').count();
      console.log(`SVG elements before deletion: ${svgElementsBefore}`);
      
      // Click delete button
      const deleteButton = page.locator('.entity-viewer .wrap-icon .anticon-delete').first();
      await deleteButton.click();
      
      // Wait for confirmation modal
      await page.waitForSelector('.ant-modal', { state: 'visible' });
      
      // Click OK button in modal
      const okButton = page.locator('.ant-modal .ant-btn-primary');
      await okButton.click();
      
      // Wait for modal to close and entity to be removed
      await page.waitForSelector('.ant-modal', { state: 'hidden' });
      await page.waitForTimeout(500);
      
      // Verify entity viewer is removed
      const entityViewersAfter = await page.locator('.entity-viewer').count();
      expect(entityViewersAfter).toBe(0);
      
      // Count SVG elements after deletion - should be 0 or very few
      const svgElementsAfter = await svgCanvas.locator('*').count();
      console.log(`SVG elements after deletion: ${svgElementsAfter}`);
      
      // SVG elements should be removed (or at least significantly reduced)
      expect(svgElementsAfter).toBe(0);
    }
  });

  test('should properly clean up lines when deleting multiple entities', async ({ page }) => {
    // Select first entity
    const selector = page.locator('.ant-select').first();
    
    // Add first entity
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Add second entity (if available)
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    if (await options.count() > 1) {
      await options.nth(1).click();
      await page.waitForTimeout(1000);
    }
    
    // Check how many entities we have
    const entityCount = await page.locator('.entity-viewer').count();
    console.log(`Total entities: ${entityCount}`);
    
    if (entityCount >= 2) {
      // Get SVG canvas
      const svgCanvas = page.locator('.wrap-entity-view-box-inner svg.canvas');
      
      // Count SVG elements with 2 entities
      const svgElementsWith2 = await svgCanvas.locator('*').count();
      console.log(`SVG elements with 2 entities: ${svgElementsWith2}`);
      
      // Delete first entity
      const deleteButton = page.locator('.entity-viewer .wrap-icon .anticon-delete').first();
      await deleteButton.click();
      await page.waitForSelector('.ant-modal', { state: 'visible' });
      await page.locator('.ant-modal .ant-btn-primary').click();
      await page.waitForSelector('.ant-modal', { state: 'hidden' });
      await page.waitForTimeout(500);
      
      // Should have 1 entity left
      const entityCountAfter1 = await page.locator('.entity-viewer').count();
      expect(entityCountAfter1).toBe(1);
      
      // Count SVG elements with 1 entity - should be less than before
      const svgElementsWith1 = await svgCanvas.locator('*').count();
      console.log(`SVG elements with 1 entity: ${svgElementsWith1}`);
      
      // Delete second entity
      const deleteButton2 = page.locator('.entity-viewer .wrap-icon .anticon-delete').first();
      await deleteButton2.click();
      await page.waitForSelector('.ant-modal', { state: 'visible' });
      await page.locator('.ant-modal .ant-btn-primary').click();
      await page.waitForSelector('.ant-modal', { state: 'hidden' });
      await page.waitForTimeout(500);
      
      // Should have 0 entities
      const entityCountAfter2 = await page.locator('.entity-viewer').count();
      expect(entityCountAfter2).toBe(0);
      
      // Count SVG elements with 0 entities - should be 0
      const svgElementsWith0 = await svgCanvas.locator('*').count();
      console.log(`SVG elements with 0 entities: ${svgElementsWith0}`);
      expect(svgElementsWith0).toBe(0);
    }
  });

  test('should not leave orphaned SVG elements after deletion', async ({ page }) => {
    // Select an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1000);
      
      // Get SVG canvas
      const svgCanvas = page.locator('.wrap-entity-view-box-inner svg.canvas');
      
      // Take screenshot before deletion
      await page.screenshot({ 
        path: 'e2e-screenshots/entity-viewer-before-delete.png',
        fullPage: true 
      });
      
      // Delete the entity
      const deleteButton = page.locator('.entity-viewer .wrap-icon .anticon-delete').first();
      await deleteButton.click();
      await page.waitForSelector('.ant-modal', { state: 'visible' });
      await page.locator('.ant-modal .ant-btn-primary').click();
      await page.waitForSelector('.ant-modal', { state: 'hidden' });
      await page.waitForTimeout(500);
      
      // Take screenshot after deletion
      await page.screenshot({ 
        path: 'e2e-screenshots/entity-viewer-after-delete.png',
        fullPage: true 
      });
      
      // Verify no SVG elements remain
      const svgElements = await svgCanvas.locator('*').count();
      expect(svgElements).toBe(0);
      
      // Verify no entity viewers remain
      const entityViewers = await page.locator('.entity-viewer').count();
      expect(entityViewers).toBe(0);
    }
  });

  test('should handle rapid delete operations without leaving lines', async ({ page }) => {
    // Add multiple entities quickly
    const selector = page.locator('.ant-select').first();
    const options = page.locator('.ant-select-item-option');
    
    // Add 3 entities
    for (let i = 0; i < 3; i++) {
      await selector.click();
      await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
      const count = await options.count();
      if (count > i) {
        await options.nth(i).click();
        await page.waitForTimeout(500);
      }
    }
    
    // Count entities
    const entityCount = await page.locator('.entity-viewer').count();
    console.log(`Added ${entityCount} entities`);
    
    if (entityCount >= 2) {
      // Rapidly delete all entities
      for (let i = 0; i < entityCount; i++) {
        const deleteButton = page.locator('.entity-viewer .wrap-icon .anticon-delete').first();
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          await page.waitForSelector('.ant-modal', { state: 'visible' });
          await page.locator('.ant-modal .ant-btn-primary').click();
          await page.waitForSelector('.ant-modal', { state: 'hidden' });
          await page.waitForTimeout(300);
        }
      }
      
      // Verify all entities are gone
      const finalEntityCount = await page.locator('.entity-viewer').count();
      expect(finalEntityCount).toBe(0);
      
      // Verify no SVG elements remain
      const svgCanvas = page.locator('.wrap-entity-view-box-inner svg.canvas');
      const svgElements = await svgCanvas.locator('*').count();
      expect(svgElements).toBe(0);
    }
  });
});

