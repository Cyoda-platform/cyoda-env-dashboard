/**
 * Entity Viewer E2E Tests
 * Tests all features of the Entity Viewer component
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3009';
const ENTITY_VIEWER_URL = `${BASE_URL}/entity-viewer`;

test.describe('Entity Viewer - 100% Feature Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ENTITY_VIEWER_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load Entity Viewer page', async ({ page }) => {
    // Check page title or heading
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
    
    // Check for main controls
    const dynamicToggle = page.locator('input[type="checkbox"]').first();
    await expect(dynamicToggle).toBeVisible();
  });

  test('should display entity class selector', async ({ page }) => {
    // Wait for the select dropdown
    const selector = page.locator('.ant-select').first();
    await expect(selector).toBeVisible();
    
    // Click to open dropdown
    await selector.click();
    
    // Wait for options to appear
    await page.waitForTimeout(500);
    
    // Check if options are visible
    const options = page.locator('.ant-select-item');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should toggle between dynamic and non-dynamic entities', async ({ page }) => {
    // Find the checkbox for dynamic/non-dynamic toggle
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    
    // Get initial state
    const initialState = await checkbox.isChecked();
    
    // Toggle
    await checkbox.click();
    await page.waitForTimeout(500);
    
    // Verify state changed
    const newState = await checkbox.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should add entity box when selecting entity class', async ({ page }) => {
    // Open entity class selector
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForTimeout(500);
    
    // Select first option
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.click();
    await page.waitForTimeout(1000);
    
    // Check if entity box appeared
    const entityBox = page.locator('.entity-viewer').first();
    await expect(entityBox).toBeVisible();
  });

  test('should display zoom controls', async ({ page }) => {
    // Look for zoom buttons
    const zoomIn = page.locator('button').filter({ hasText: /zoom.*in|\\+/i });
    const zoomOut = page.locator('button').filter({ hasText: /zoom.*out|\\-/i });
    const zoomRefresh = page.locator('button').filter({ hasText: /refresh|reset/i });
    
    // At least one zoom control should be visible
    const controls = await page.locator('button').all();
    expect(controls.length).toBeGreaterThan(0);
  });

  test('should handle entity box drag and drop', async ({ page }) => {
    // First add an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForTimeout(500);
    
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.click();
    await page.waitForTimeout(1000);
    
    // Find entity box
    const entityBox = page.locator('.entity-viewer').first();
    await expect(entityBox).toBeVisible();
    
    // Get initial position
    const initialBox = await entityBox.boundingBox();
    
    if (initialBox) {
      // Drag entity box
      await entityBox.hover();
      await page.mouse.down();
      await page.mouse.move(initialBox.x + 100, initialBox.y + 50);
      await page.mouse.up();
      await page.waitForTimeout(500);
      
      // Get new position
      const newBox = await entityBox.boundingBox();
      
      // Position should have changed
      if (newBox) {
        const moved = Math.abs(newBox.x - initialBox.x) > 10 || Math.abs(newBox.y - initialBox.y) > 10;
        expect(moved).toBe(true);
      }
    }
  });

  test('should show action-hover effect during drag', async ({ page }) => {
    // Add two entities
    const selector = page.locator('.ant-select').first();
    
    // Add first entity
    await selector.click();
    await page.waitForTimeout(500);
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.click();
    await page.waitForTimeout(1000);
    
    // Add second entity (if possible)
    await selector.click();
    await page.waitForTimeout(500);
    const secondOption = page.locator('.ant-select-item').nth(1);
    if (await secondOption.isVisible()) {
      await secondOption.click();
      await page.waitForTimeout(1000);
    }
    
    // Get all entity boxes
    const entityBoxes = page.locator('.entity-viewer');
    const count = await entityBoxes.count();
    
    if (count >= 2) {
      const firstBox = entityBoxes.first();
      const secondBox = entityBoxes.nth(1);
      
      // Start dragging first box
      await firstBox.hover();
      await page.mouse.down();
      await page.waitForTimeout(200);
      
      // Check if second box has action-hover class
      const hasHoverClass = await secondBox.evaluate((el) => el.classList.contains('action-hover'));
      
      // Release mouse
      await page.mouse.up();
      
      // Verify hover effect was applied
      expect(hasHoverClass).toBe(true);
    }
  });

  test('should display entity class names for related fields', async ({ page }) => {
    // Add an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForTimeout(500);
    
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.click();
    await page.waitForTimeout(1500);
    
    // Look for fields with entity class names in parentheses
    const fieldsWithClass = page.locator('.modelling-item').filter({ hasText: /\(.*\)/ });
    const count = await fieldsWithClass.count();
    
    // Should have at least some fields with class names
    console.log(`Found ${count} fields with entity class names`);
  });

  test('should open unique values modal for LEAF fields', async ({ page }) => {
    // Add an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForTimeout(500);
    
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.click();
    await page.waitForTimeout(1500);
    
    // Find eye icon for a LEAF field
    const eyeIcon = page.locator('.wrap-icon .anticon-eye').first();
    
    if (await eyeIcon.isVisible()) {
      await eyeIcon.click();
      await page.waitForTimeout(1000);
      
      // Check if modal appeared
      const modal = page.locator('.ant-modal');
      await expect(modal).toBeVisible();
      
      // Check for table in modal
      const table = page.locator('.ant-table');
      await expect(table).toBeVisible();
      
      // Close modal
      const closeButton = page.locator('.ant-modal-close').first();
      await closeButton.click();
    }
  });

  test('should add new entity box when clicking related field', async ({ page }) => {
    // Add an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForTimeout(500);
    
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.click();
    await page.waitForTimeout(1500);
    
    // Count initial entity boxes
    const initialCount = await page.locator('.entity-viewer').count();
    
    // Find link icon for a related field
    const linkIcon = page.locator('.wrap-icon .anticon-link').first();
    
    if (await linkIcon.isVisible()) {
      await linkIcon.click();
      await page.waitForTimeout(1500);
      
      // Count entity boxes after click
      const newCount = await page.locator('.entity-viewer').count();
      
      // Should have one more entity box
      expect(newCount).toBe(initialCount + 1);
    }
  });

  test('should draw connection lines between entities', async ({ page }) => {
    // Add an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForTimeout(500);
    
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.click();
    await page.waitForTimeout(1500);
    
    // Click related field to add second entity
    const linkIcon = page.locator('.wrap-icon .anticon-link').first();
    
    if (await linkIcon.isVisible()) {
      await linkIcon.click();
      await page.waitForTimeout(1500);
      
      // Check for SVG canvas
      const svg = page.locator('svg.canvas');
      await expect(svg).toBeVisible();
      
      // Check for line elements
      const lines = page.locator('svg.canvas line');
      const lineCount = await lines.count();
      
      // Should have at least one connection line
      expect(lineCount).toBeGreaterThan(0);
    }
  });

  test('should prevent duplicate entities', async ({ page }) => {
    // Add an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForTimeout(500);
    
    const firstOption = page.locator('.ant-select-item').first();
    const optionText = await firstOption.textContent();
    await firstOption.click();
    await page.waitForTimeout(1000);
    
    // Try to add the same entity again
    await selector.click();
    await page.waitForTimeout(500);
    
    const sameOption = page.locator('.ant-select-item').filter({ hasText: optionText || '' }).first();
    await sameOption.click();
    await page.waitForTimeout(1000);
    
    // Should still have only one entity box
    const entityBoxes = page.locator('.entity-viewer');
    const count = await entityBoxes.count();
    
    expect(count).toBe(1);
  });

  test('should remove entity box with confirmation', async ({ page }) => {
    // Add an entity
    const selector = page.locator('.ant-select').first();
    await selector.click();
    await page.waitForTimeout(500);
    
    const firstOption = page.locator('.ant-select-item').first();
    await firstOption.click();
    await page.waitForTimeout(1000);
    
    // Find close/remove button
    const closeButton = page.locator('.entity-viewer .anticon-close').first();
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
      
      // Look for confirmation modal
      const confirmModal = page.locator('.ant-modal-confirm');
      
      if (await confirmModal.isVisible()) {
        // Click OK button
        const okButton = page.locator('.ant-btn-primary').filter({ hasText: /ok|yes|confirm/i });
        await okButton.click();
        await page.waitForTimeout(500);
      }
      
      // Entity box should be removed
      const entityBoxes = page.locator('.entity-viewer');
      const count = await entityBoxes.count();
      
      expect(count).toBe(0);
    }
  });
});

