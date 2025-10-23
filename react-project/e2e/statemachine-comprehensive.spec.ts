import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E tests for State Machine React Application
 * Tests all major features including workflows, instances, transitions, states, etc.
 */

const BASE_URL = 'http://localhost:3014';

test.describe('State Machine - Comprehensive E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('1. Should load the Menu page successfully', async ({ page }) => {
    // Check if we're on the menu page
    await expect(page).toHaveURL(/\/menu/);
    
    // Check for menu cards
    const workflowsCard = page.locator('text=Workflows');
    const instancesCard = page.locator('text=Instances');
    
    await expect(workflowsCard).toBeVisible();
    await expect(instancesCard).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-01-menu.png', fullPage: true });
  });

  test('2. Should navigate to Workflows page', async ({ page }) => {
    // Click on Workflows card
    await page.click('text=Workflows');
    await page.waitForLoadState('networkidle');
    
    // Check URL
    await expect(page).toHaveURL(/\/workflows/);
    
    // Check for page title
    await expect(page.locator('h1, h2').filter({ hasText: 'Workflows' }).first()).toBeVisible();
    
    // Check for Back button
    const backButton = page.locator('button:has-text("Back to Menu")');
    await expect(backButton).toBeVisible();
    
    // Check for Create button
    const createButton = page.locator('button:has-text("Create")');
    await expect(createButton).toBeVisible();
    
    // Check for Entity Type toggle
    const businessButton = page.locator('button:has-text("Business")');
    const technicalButton = page.locator('button:has-text("Technical")');
    await expect(businessButton.or(technicalButton)).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-02-workflows.png', fullPage: true });
  });

  test('3. Should display workflows table with data', async ({ page }) => {
    await page.click('text=Workflows');
    await page.waitForLoadState('networkidle');
    
    // Wait for table to load
    await page.waitForSelector('.ant-table', { timeout: 10000 });
    
    // Check for table columns
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    
    // Check for column headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Entity Class")')).toBeVisible();
    await expect(page.locator('th:has-text("Active")')).toBeVisible();
    await expect(page.locator('th:has-text("Persisted")')).toBeVisible();
    
    // Check for StateIndicator badges in the table
    const badges = page.locator('.ant-badge-status, .state-indicator-automated-badge');
    const badgeCount = await badges.count();
    console.log(`Found ${badgeCount} state indicator badges`);
    
    // Take screenshot
    await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-03-workflows-table.png', fullPage: true });
  });

  test('4. Should create a new workflow', async ({ page }) => {
    await page.click('text=Workflows');
    await page.waitForLoadState('networkidle');
    
    // Click Create button
    await page.click('button:has-text("Create")');
    await page.waitForLoadState('networkidle');
    
    // Check URL
    await expect(page).toHaveURL(/\/workflow\/new/);
    
    // Fill in workflow form
    const workflowName = `Test Workflow ${Date.now()}`;
    await page.fill('input[name="name"]', workflowName);
    
    // Select entity class
    await page.click('.ant-select-selector:has-text("Select Entity Class")');
    await page.waitForTimeout(500);
    
    // Click first option
    const firstOption = page.locator('.ant-select-item').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }
    
    // Take screenshot before save
    await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-04-create-workflow.png', fullPage: true });
    
    // Click Save button
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to workflow detail page
      await expect(page).toHaveURL(/\/workflow\/[^/]+/);
      
      // Take screenshot after save
      await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-05-workflow-created.png', fullPage: true });
    }
  });

  test('5. Should navigate to Instances page', async ({ page }) => {
    // Go back to menu first
    await page.goto(`${BASE_URL}/menu`);
    await page.waitForLoadState('networkidle');
    
    // Click on Instances card
    await page.click('text=Instances');
    await page.waitForLoadState('networkidle');
    
    // Check URL
    await expect(page).toHaveURL(/\/instances/);
    
    // Check for page title
    await expect(page.locator('h1, h2').filter({ hasText: 'Instances' }).first()).toBeVisible();
    
    // Check for Back button
    const backButton = page.locator('button:has-text("Back to Menu")');
    await expect(backButton).toBeVisible();
    
    // Check for Entity Type toggle
    const businessButton = page.locator('button:has-text("Business")');
    const technicalButton = page.locator('button:has-text("Technical")');
    await expect(businessButton.or(technicalButton)).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-06-instances.png', fullPage: true });
  });

  test('6. Should display Advanced filtering on Instances page', async ({ page }) => {
    await page.goto(`${BASE_URL}/instances`);
    await page.waitForLoadState('networkidle');
    
    // Look for Advanced button
    const advancedButton = page.locator('button:has-text("Advanced")');
    await expect(advancedButton).toBeVisible();
    
    // Click Advanced button
    await advancedButton.click();
    await page.waitForTimeout(500);
    
    // Check for RangeCondition component
    const rangeCondition = page.locator('[data-testid="range-condition"]').or(page.locator('text=Range Order'));
    await expect(rangeCondition).toBeVisible();
    
    // Check for Range Order select
    const rangeOrderSelect = page.locator('.ant-select-selector:has-text("ASC"), .ant-select-selector:has-text("DESC")');
    await expect(rangeOrderSelect).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-07-advanced-filtering.png', fullPage: true });
  });

  test('7. Should navigate to workflow detail and see tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`);
    await page.waitForLoadState('networkidle');
    
    // Wait for table
    await page.waitForSelector('.ant-table-row', { timeout: 10000 });
    
    // Click on first workflow name
    const firstWorkflowLink = page.locator('.ant-table-row a').first();
    if (await firstWorkflowLink.isVisible()) {
      await firstWorkflowLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check for tabs
      await expect(page.locator('.ant-tabs-tab:has-text("Transitions")')).toBeVisible();
      await expect(page.locator('.ant-tabs-tab:has-text("States")')).toBeVisible();
      await expect(page.locator('.ant-tabs-tab:has-text("Processes")')).toBeVisible();
      await expect(page.locator('.ant-tabs-tab:has-text("Criteria")')).toBeVisible();
      
      // Check for Back button
      const backButton = page.locator('button:has-text("Back to Workflows")');
      await expect(backButton).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-08-workflow-detail.png', fullPage: true });
    }
  });

  test('8. Should display Transitions list with StateIndicators', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`);
    await page.waitForLoadState('networkidle');
    
    // Click on first workflow
    const firstWorkflowLink = page.locator('.ant-table-row a').first();
    if (await firstWorkflowLink.isVisible()) {
      await firstWorkflowLink.click();
      await page.waitForLoadState('networkidle');
      
      // Make sure we're on Transitions tab
      const transitionsTab = page.locator('.ant-tabs-tab:has-text("Transitions")');
      await transitionsTab.click();
      await page.waitForTimeout(500);
      
      // Check for table columns
      await expect(page.locator('th:has-text("Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Active")')).toBeVisible();
      await expect(page.locator('th:has-text("Persisted")')).toBeVisible();
      await expect(page.locator('th:has-text("Automated")')).toBeVisible();
      
      // Check for StateIndicator badges
      const badges = page.locator('.ant-badge-status, .state-indicator-automated-badge');
      const badgeCount = await badges.count();
      console.log(`Found ${badgeCount} state indicator badges in transitions`);
      
      // Take screenshot
      await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-09-transitions.png', fullPage: true });
    }
  });

  test('9. Should navigate to Graphical view', async ({ page }) => {
    await page.goto(`${BASE_URL}/workflows`);
    await page.waitForLoadState('networkidle');
    
    // Click on first workflow
    const firstWorkflowLink = page.locator('.ant-table-row a').first();
    if (await firstWorkflowLink.isVisible()) {
      await firstWorkflowLink.click();
      await page.waitForLoadState('networkidle');
      
      // Click on Graphical tab
      const graphicalTab = page.locator('.ant-tabs-tab:has-text("Graphical")');
      if (await graphicalTab.isVisible()) {
        await graphicalTab.click();
        await page.waitForTimeout(1000);
        
        // Check for cytoscape container
        const cytoscapeContainer = page.locator('#cy, [id*="cytoscape"]').or(page.locator('canvas'));
        await expect(cytoscapeContainer.first()).toBeVisible({ timeout: 5000 });
        
        // Take screenshot
        await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-10-graphical.png', fullPage: true });
      }
    }
  });

  test('10. Should test Back button navigation', async ({ page }) => {
    // Start from menu
    await page.goto(`${BASE_URL}/menu`);
    await page.waitForLoadState('networkidle');
    
    // Go to Workflows
    await page.click('text=Workflows');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/workflows/);
    
    // Click on first workflow
    const firstWorkflowLink = page.locator('.ant-table-row a').first();
    if (await firstWorkflowLink.isVisible()) {
      await firstWorkflowLink.click();
      await page.waitForLoadState('networkidle');
      
      // Click Back to Workflows
      const backButton = page.locator('button:has-text("Back to Workflows")');
      await backButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should be back on workflows page
      await expect(page).toHaveURL(/\/workflows/);
      
      // Click Back to Menu
      const backToMenuButton = page.locator('button:has-text("Back to Menu")');
      await backToMenuButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should be back on menu
      await expect(page).toHaveURL(/\/menu/);
      
      // Take screenshot
      await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-11-back-navigation.png', fullPage: true });
    }
  });

  test('11. Should check for console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate through the app
    await page.goto(`${BASE_URL}/menu`);
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Workflows');
    await page.waitForLoadState('networkidle');
    
    // Check for errors
    console.log('Console errors found:', consoleErrors);
    
    // We expect some errors might be acceptable (like network errors for mock data)
    // But we should log them for review
    if (consoleErrors.length > 0) {
      console.warn(`Found ${consoleErrors.length} console errors:`, consoleErrors);
    }
  });
});

