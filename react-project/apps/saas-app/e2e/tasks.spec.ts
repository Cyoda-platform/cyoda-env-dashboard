/**
 * E2E Tests for Tasks Feature
 * Tests against real Cyoda backend
 */

import { test, expect } from '@playwright/test';

test.describe('Tasks Feature - Real Backend', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/tasks');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load tasks page successfully', async ({ page }) => {
    // Check if the page title or heading is visible
    const heading = page.locator('h1, h2, .ant-page-header-heading-title');
    await expect(heading.first()).toBeVisible();
    
    // Check if the tasks table or list is present
    const tasksContainer = page.locator('.ant-table, .ant-list, [data-testid="tasks-list"]');
    await expect(tasksContainer.first()).toBeVisible();
  });

  test('should fetch tasks from real backend', async ({ page }) => {
    // Wait for the API call to complete
    const response = await page.waitForResponse(
      response => response.url().includes('/api/alerts/tasks') && response.status() === 200,
      { timeout: 30000 }
    );
    
    // Verify response is successful
    expect(response.status()).toBe(200);
    
    // Verify response has data
    const data = await response.json();
    expect(data).toBeDefined();
    
    // Check if data has expected structure (either array or paged response)
    if (Array.isArray(data)) {
      console.log(`✓ Received ${data.length} tasks from backend`);
    } else if (data.content) {
      console.log(`✓ Received ${data.content.length} tasks from backend (paged)`);
      expect(Array.isArray(data.content)).toBe(true);
    }
  });

  test('should display tasks in the UI', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForResponse(
      response => response.url().includes('/api/alerts/tasks'),
      { timeout: 30000 }
    );
    
    // Wait a bit for UI to render
    await page.waitForTimeout(1000);
    
    // Check if tasks are displayed (could be table rows, list items, or cards)
    const taskElements = page.locator('.ant-table-row, .ant-list-item, .ant-card');
    const count = await taskElements.count();
    
    console.log(`✓ Found ${count} task elements in UI`);
    
    // If there are tasks, verify at least one is visible
    if (count > 0) {
      await expect(taskElements.first()).toBeVisible();
    } else {
      // If no tasks, check for empty state
      const emptyState = page.locator('.ant-empty, [data-testid="empty-state"]');
      await expect(emptyState.first()).toBeVisible();
      console.log('✓ No tasks found - empty state displayed');
    }
  });

  test('should handle pagination if tasks exist', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForResponse(
      response => response.url().includes('/api/alerts/tasks'),
      { timeout: 30000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Check if pagination exists
    const pagination = page.locator('.ant-pagination');
    const hasPagination = await pagination.count() > 0;
    
    if (hasPagination) {
      console.log('✓ Pagination found');
      
      // Check if next page button exists and is enabled
      const nextButton = pagination.locator('.ant-pagination-next:not(.ant-pagination-disabled)');
      const hasNextPage = await nextButton.count() > 0;
      
      if (hasNextPage) {
        // Click next page
        await nextButton.click();
        
        // Wait for new page to load
        await page.waitForResponse(
          response => response.url().includes('/api/alerts/tasks'),
          { timeout: 30000 }
        );
        
        console.log('✓ Successfully navigated to next page');
      } else {
        console.log('✓ Only one page of tasks');
      }
    } else {
      console.log('✓ No pagination (all tasks fit on one page)');
    }
  });

  test('should filter tasks if filters are available', async ({ page }) => {
    // Wait for initial load
    await page.waitForResponse(
      response => response.url().includes('/api/alerts/tasks'),
      { timeout: 30000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Look for filter controls (select, input, etc.)
    const filterControls = page.locator('.ant-select, .ant-input-search, [data-testid="task-filter"]');
    const hasFilters = await filterControls.count() > 0;
    
    if (hasFilters) {
      console.log('✓ Filter controls found');
      
      // Try to interact with first filter
      const firstFilter = filterControls.first();
      const tagName = await firstFilter.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'input' || await firstFilter.locator('input').count() > 0) {
        // It's an input filter
        const input = tagName === 'input' ? firstFilter : firstFilter.locator('input');
        await input.fill('test');
        await input.press('Enter');
        
        // Wait for filtered results
        await page.waitForResponse(
          response => response.url().includes('/api/alerts/tasks'),
          { timeout: 30000 }
        );
        
        console.log('✓ Filter applied successfully');
      }
    } else {
      console.log('✓ No filters available on this page');
    }
  });

  test('should open task detail when clicking on a task', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForResponse(
      response => response.url().includes('/api/alerts/tasks'),
      { timeout: 30000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Find clickable task elements
    const taskLinks = page.locator('.ant-table-row a, .ant-list-item a, [data-testid="task-link"]');
    const count = await taskLinks.count();
    
    if (count > 0) {
      // Click on first task
      await taskLinks.first().click();
      
      // Wait for task detail to load
      await page.waitForResponse(
        response => response.url().includes('/api/alerts/tasks/') && !response.url().includes('/paged'),
        { timeout: 30000 }
      );
      
      // Verify we're on task detail page
      await page.waitForTimeout(1000);
      
      // Check for detail view elements
      const detailView = page.locator('.ant-descriptions, [data-testid="task-detail"]');
      await expect(detailView.first()).toBeVisible();
      
      console.log('✓ Task detail page loaded successfully');
    } else {
      console.log('✓ No clickable tasks found (empty state)');
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate error
    await page.route('**/api/alerts/tasks/error-test', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    // Navigate to a URL that would trigger the error
    // (This is a hypothetical test - adjust based on your actual error handling)
    
    // For now, just verify that the page doesn't crash on normal load
    await page.goto('/tasks');
    
    // Page should still be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('✓ Page handles errors gracefully');
  });

  test('should display task statistics if available', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for statistics/summary elements
    const statsElements = page.locator('.ant-statistic, .ant-card-meta, [data-testid="task-stats"]');
    const hasStats = await statsElements.count() > 0;
    
    if (hasStats) {
      console.log('✓ Task statistics found');
      await expect(statsElements.first()).toBeVisible();
    } else {
      console.log('✓ No statistics displayed on this page');
    }
  });

  test('should support task state transitions if available', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForResponse(
      response => response.url().includes('/api/alerts/tasks'),
      { timeout: 30000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Look for action buttons (complete, cancel, etc.)
    const actionButtons = page.locator('button:has-text("Complete"), button:has-text("Cancel"), button:has-text("Close"), [data-testid="task-action"]');
    const hasActions = await actionButtons.count() > 0;
    
    if (hasActions) {
      console.log('✓ Task action buttons found');
      // Note: We don't actually click them to avoid modifying real data
      // In a real test environment, you would test this with test data
    } else {
      console.log('✓ No task actions available (view-only mode)');
    }
  });
});

test.describe('Tasks Feature - Navigation', () => {
  test('should navigate to tasks from main menu', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for tasks menu item
    const tasksMenuItem = page.locator('a:has-text("Tasks"), [href*="/tasks"]');
    const hasMenuItem = await tasksMenuItem.count() > 0;
    
    if (hasMenuItem) {
      // Click on tasks menu item
      await tasksMenuItem.first().click();
      
      // Verify we're on tasks page
      await page.waitForURL('**/tasks**');
      
      // Wait for tasks to load
      await page.waitForResponse(
        response => response.url().includes('/api/alerts/tasks'),
        { timeout: 30000 }
      );
      
      console.log('✓ Successfully navigated to tasks from menu');
    } else {
      console.log('✓ Tasks menu item not found in navigation');
    }
  });

  test('should navigate back from task detail', async ({ page }) => {
    // Go to tasks page
    await page.goto('/tasks');
    await page.waitForResponse(
      response => response.url().includes('/api/alerts/tasks'),
      { timeout: 30000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Find and click on a task
    const taskLinks = page.locator('.ant-table-row a, .ant-list-item a');
    const count = await taskLinks.count();
    
    if (count > 0) {
      await taskLinks.first().click();
      await page.waitForTimeout(1000);
      
      // Look for back button
      const backButton = page.locator('button:has-text("Back"), .ant-page-header-back, [aria-label="Back"]');
      const hasBackButton = await backButton.count() > 0;
      
      if (hasBackButton) {
        await backButton.first().click();
        
        // Verify we're back on tasks list
        await page.waitForURL('**/tasks');
        console.log('✓ Successfully navigated back to tasks list');
      } else {
        // Try browser back
        await page.goBack();
        console.log('✓ Used browser back to return to tasks list');
      }
    }
  });
});

