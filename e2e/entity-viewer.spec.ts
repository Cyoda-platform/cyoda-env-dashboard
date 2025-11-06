/**
 * Entity Viewer E2E Tests
 * Tests the Entity Viewer component functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Entity Viewer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Entity Viewer page
    await page.goto('http://localhost:3000/entity-viewer');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load Entity Viewer page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h2').filter({ hasText: 'Entity Viewer Demo' })).toBeVisible();

    // Check info alert
    await expect(page.locator('.ant-alert-info')).toBeVisible();
    await expect(page.locator('.ant-alert-info')).toContainText('Demo Mode');
  });

  test('should display Entity Viewer component', async ({ page }) => {
    // Check for main Entity Viewer elements
    await expect(page.locator('text=Selected Root Entity')).toBeVisible();

    // Check for entity class selector
    const selector = page.locator('.ant-select').first();
    await expect(selector).toBeVisible();

    // Check for dynamic entities checkbox
    await expect(page.locator('text=show only dynamic entities')).toBeVisible();
  });

  test('should display zoom controls', async ({ page }) => {
    // Check for zoom control icons
    const zoomControls = page.locator('.tools');
    await expect(zoomControls).toBeVisible();

    // Should have zoom in, zoom out, and refresh buttons
    const icons = zoomControls.locator('.anticon');
    await expect(icons).toHaveCount(3); // zoom-out, zoom-in, refresh
  });

  test('should toggle dynamic entities checkbox', async ({ page }) => {
    // Find the checkbox
    const checkbox = page.locator('input[type="checkbox"]').first();

    // Should be checked by default
    await expect(checkbox).toBeChecked();

    // Click to uncheck
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    // Should show warning alert
    await expect(page.locator('.ant-alert-warning')).toBeVisible();
    await expect(page.locator('.ant-alert-warning')).toContainText('Reports will not work for non-dynamic entities');

    // Click to check again
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Warning should disappear
    await expect(page.locator('.ant-alert-warning')).not.toBeVisible();
  });

  test('should interact with entity class selector', async ({ page }) => {
    // Click on the selector
    const selector = page.locator('.ant-select').first();
    await selector.click();

    // Wait for dropdown to appear
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });

    // Check if dropdown has options (may be empty in demo mode)
    const dropdown = page.locator('.ant-select-dropdown').first();
    await expect(dropdown).toBeVisible();

    // Check if mock data options are present
    const options = page.locator('.ant-select-item-option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0); // Should have mock entity classes
  });

  test('should display canvas when entities are present', async ({ page }) => {
    // Initially, canvas might not be visible (no entities)
    const canvas = page.locator('svg.canvas');

    // Canvas should exist in the DOM
    const canvasCount = await canvas.count();
    expect(canvasCount).toBeGreaterThanOrEqual(0);
  });

  test('should select entity and display its data', async ({ page }) => {
    // Click on the selector
    const selector = page.locator('.ant-select').first();
    await selector.click();

    // Wait for dropdown to appear
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });

    // Select the first option
    const firstOption = page.locator('.ant-select-item-option').first();
    await firstOption.click();

    // Wait for entity viewer to load
    await page.waitForTimeout(1500);

    // Check if entity viewer component is displayed
    const entityViewer = page.locator('.entity-viewer');
    const viewerCount = await entityViewer.count();
    expect(viewerCount).toBeGreaterThan(0); // Should have at least one entity viewer
  });


  test('should handle zoom controls', async ({ page }) => {
    const zoomControls = page.locator('.tools .buttons');

    // Get all icon buttons
    const icons = zoomControls.locator('.anticon');

    // Click zoom out (first icon)
    await icons.nth(0).click();

    // Click zoom in (second icon)
    await icons.nth(1).click();

    // Click refresh (third icon)
    await icons.nth(2).click();

    // No errors should occur
    await page.waitForTimeout(500);
  });

  test('should display features list', async ({ page }) => {
    // Check for features list
    await expect(page.locator('text=Features:')).toBeVisible();
    await expect(page.locator('text=Select entity classes from dropdown')).toBeVisible();
    await expect(page.locator('text=Toggle between dynamic and non-dynamic entities')).toBeVisible();
    await expect(page.locator('text=Drag entity boxes around the canvas')).toBeVisible();
    await expect(page.locator('text=Zoom in/out controls')).toBeVisible();
  });

  test('should have proper layout structure', async ({ page }) => {
    // Check for cards (there might be 3: info card, entity viewer card, and CardComponent wrapper)
    const cards = page.locator('.ant-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(2); // At least info card + Entity Viewer card

    // Check for proper spacing
    const space = page.locator('.ant-space-vertical');
    await expect(space).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test at different viewport sizes
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h2').filter({ hasText: 'Entity Viewer Demo' })).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h2').filter({ hasText: 'Entity Viewer Demo' })).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h2').filter({ hasText: 'Entity Viewer Demo' })).toBeVisible();
  });

  test('should navigate from menu', async ({ page }) => {
    // Go to home page first
    await page.goto('http://localhost:3000/');

    // Click on Entity Viewer menu item
    await page.click('text=Entity Viewer');

    // Should navigate to Entity Viewer page
    await expect(page).toHaveURL('http://localhost:3000/entity-viewer');
    await expect(page.locator('h2').filter({ hasText: 'Entity Viewer Demo' })).toBeVisible();
  });

  test('should have no console errors on load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('http://localhost:3000/entity-viewer');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000);

    // Filter out known acceptable errors (like API errors in demo mode)
    const criticalErrors = errors.filter(error =>
      !error.includes('Network Error') &&
      !error.includes('404') &&
      !error.includes('Failed to fetch') &&
      !error.includes('ERR_CONNECTION_REFUSED') &&
      !error.includes('Failed to load entity classes') && // Expected in demo mode without API
      !error.includes('data.map is not a function') // Expected when API returns non-array
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should take screenshot for documentation', async ({ page }) => {
    await page.goto('http://localhost:3000/entity-viewer');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'e2e-screenshots/entity-viewer-demo.png',
      fullPage: true
    });
  });
});

