/**
 * Entity Viewer - Delete with Relationships Test
 * Tests deletion of entities that have relationship lines
 */

import { test, expect } from '@playwright/test';

test.describe('Entity Viewer - Delete with Relationships', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/entity-viewer');
    await page.waitForLoadState('networkidle');
  });

  test('should remove lines when deleting entity with relationships', async ({ page }) => {
    // Select first entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1500);
      
      // Look for a related field (blue link icon) to click
      const relatedField = page.locator('.entity-viewer .modelling-item .anticon-link').first();
      
      if (await relatedField.isVisible()) {
        // Click on a related field to add a connected entity
        await relatedField.click();
        await page.waitForTimeout(1500);
        
        // Now we should have 2 entities
        const entityCount = await page.locator('.entity-viewer').count();
        console.log(`Entities after adding related: ${entityCount}`);
        
        if (entityCount >= 2) {
          // Get SVG canvas
          const svgCanvas = page.locator('.wrap-entity-view-box-inner svg.canvas');
          
          // Count SVG elements (should have circles and lines)
          const svgElementsBefore = await svgCanvas.locator('*').count();
          console.log(`SVG elements before deletion: ${svgElementsBefore}`);
          
          // Take screenshot showing the relationship
          await page.screenshot({ 
            path: 'e2e-screenshots/entity-viewer-with-relationship.png',
            fullPage: true 
          });
          
          // Delete the second entity (the one that was added via relationship)
          const deleteButtons = page.locator('.entity-viewer .wrap-icon .anticon-delete');
          const deleteButton = deleteButtons.nth(1);
          await deleteButton.click();
          
          // Confirm deletion
          await page.waitForSelector('.ant-modal', { state: 'visible' });
          await page.locator('.ant-modal .ant-btn-primary').click();
          await page.waitForSelector('.ant-modal', { state: 'hidden' });
          await page.waitForTimeout(500);
          
          // Should have 1 entity left
          const entityCountAfter = await page.locator('.entity-viewer').count();
          expect(entityCountAfter).toBe(1);
          
          // Count SVG elements after deletion
          const svgElementsAfter = await svgCanvas.locator('*').count();
          console.log(`SVG elements after deletion: ${svgElementsAfter}`);
          
          // Take screenshot after deletion
          await page.screenshot({ 
            path: 'e2e-screenshots/entity-viewer-after-relationship-delete.png',
            fullPage: true 
          });
          
          // SVG elements should be removed (no orphaned lines)
          expect(svgElementsAfter).toBe(0);
        }
      } else {
        console.log('No related fields found to test relationships');
      }
    }
  });

  test('should clean up all lines when deleting parent entity', async ({ page }) => {
    // Select first entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1500);
      
      // Look for a related field to click
      const relatedField = page.locator('.entity-viewer .modelling-item .anticon-link').first();
      
      if (await relatedField.isVisible()) {
        // Click on a related field to add a connected entity
        await relatedField.click();
        await page.waitForTimeout(1500);
        
        const entityCount = await page.locator('.entity-viewer').count();
        console.log(`Entities: ${entityCount}`);
        
        if (entityCount >= 2) {
          const svgCanvas = page.locator('.wrap-entity-view-box-inner svg.canvas');
          const svgElementsBefore = await svgCanvas.locator('*').count();
          console.log(`SVG elements before: ${svgElementsBefore}`);
          
          // Delete the FIRST entity (parent)
          const deleteButton = page.locator('.entity-viewer .wrap-icon .anticon-delete').first();
          await deleteButton.click();
          
          // Confirm deletion
          await page.waitForSelector('.ant-modal', { state: 'visible' });
          await page.locator('.ant-modal .ant-btn-primary').click();
          await page.waitForSelector('.ant-modal', { state: 'hidden' });
          await page.waitForTimeout(500);
          
          // Should have 1 entity left
          const entityCountAfter = await page.locator('.entity-viewer').count();
          expect(entityCountAfter).toBe(1);
          
          // Count SVG elements - should be 0 since the relationship is broken
          const svgElementsAfter = await svgCanvas.locator('*').count();
          console.log(`SVG elements after: ${svgElementsAfter}`);
          
          // No lines should remain
          expect(svgElementsAfter).toBe(0);
        }
      }
    }
  });

  test('should handle deletion of middle entity in chain', async ({ page }) => {
    // This test would require creating a chain of 3+ entities
    // For now, we'll just verify the basic case works
    
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1500);
      
      // Try to add multiple related entities
      const relatedFields = page.locator('.entity-viewer .modelling-item .anticon-link');
      const relatedCount = await relatedFields.count();
      
      if (relatedCount >= 2) {
        // Add first related entity
        await relatedFields.first().click();
        await page.waitForTimeout(1500);
        
        // Try to add another related entity from the new entity
        const relatedFields2 = page.locator('.entity-viewer .modelling-item .anticon-link');
        if (await relatedFields2.count() > 0) {
          await relatedFields2.last().click();
          await page.waitForTimeout(1500);
        }
        
        const entityCount = await page.locator('.entity-viewer').count();
        console.log(`Total entities in chain: ${entityCount}`);
        
        if (entityCount >= 3) {
          const svgCanvas = page.locator('.wrap-entity-view-box-inner svg.canvas');
          const svgBefore = await svgCanvas.locator('*').count();
          console.log(`SVG elements with ${entityCount} entities: ${svgBefore}`);
          
          // Delete middle entity
          const deleteButton = page.locator('.entity-viewer .wrap-icon .anticon-delete').nth(1);
          await deleteButton.click();
          await page.waitForSelector('.ant-modal', { state: 'visible' });
          await page.locator('.ant-modal .ant-btn-primary').click();
          await page.waitForSelector('.ant-modal', { state: 'hidden' });
          await page.waitForTimeout(500);
          
          const entityCountAfter = await page.locator('.entity-viewer').count();
          const svgAfter = await svgCanvas.locator('*').count();
          
          console.log(`Entities after middle delete: ${entityCountAfter}`);
          console.log(`SVG elements after middle delete: ${svgAfter}`);
          
          // Lines should be redrawn correctly
          expect(entityCountAfter).toBe(entityCount - 1);
        }
      }
    }
  });

  test('visual verification - before and after deletion', async ({ page }) => {
    // This test creates a visual record of the deletion process
    
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    
    const options = page.locator('.ant-select-item-option');
    if (await options.count() > 0) {
      await options.first().click();
      await page.waitForTimeout(1500);
      
      // Take screenshot of initial state
      await page.screenshot({ 
        path: 'e2e-screenshots/delete-test-step1-initial.png',
        fullPage: true 
      });
      
      // Add related entity
      const relatedField = page.locator('.entity-viewer .modelling-item .anticon-link').first();
      if (await relatedField.isVisible()) {
        await relatedField.click();
        await page.waitForTimeout(1500);
        
        // Take screenshot with relationship
        await page.screenshot({ 
          path: 'e2e-screenshots/delete-test-step2-with-relationship.png',
          fullPage: true 
        });
        
        const entityCount = await page.locator('.entity-viewer').count();
        if (entityCount >= 2) {
          // Delete one entity
          const deleteButton = page.locator('.entity-viewer .wrap-icon .anticon-delete').last();
          await deleteButton.click();
          await page.waitForSelector('.ant-modal', { state: 'visible' });
          
          // Screenshot of modal
          await page.screenshot({ 
            path: 'e2e-screenshots/delete-test-step3-confirm-modal.png',
            fullPage: true 
          });
          
          await page.locator('.ant-modal .ant-btn-primary').click();
          await page.waitForSelector('.ant-modal', { state: 'hidden' });
          await page.waitForTimeout(500);
          
          // Take screenshot after deletion
          await page.screenshot({ 
            path: 'e2e-screenshots/delete-test-step4-after-delete.png',
            fullPage: true 
          });
          
          // Verify clean state
          const svgCanvas = page.locator('.wrap-entity-view-box-inner svg.canvas');
          const svgElements = await svgCanvas.locator('*').count();
          
          console.log(`Final SVG elements: ${svgElements}`);
          expect(svgElements).toBe(0);
        }
      }
    }
  });
});

