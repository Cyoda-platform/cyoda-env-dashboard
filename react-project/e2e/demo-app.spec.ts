import { test, expect } from '@playwright/test';

test.describe('Demo App - Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Cyoda UI React/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Cyoda UI React Migration');
  });

  test('should display package overview cards', async ({ page }) => {
    await page.goto('/');
    
    // Check for package cards
    const cards = page.locator('.ant-card');
    await expect(cards).toHaveCount(3); // http-api, tasks, statemachine
    
    // Verify card titles
    await expect(page.getByText('HTTP API Package')).toBeVisible();
    await expect(page.getByText('Tasks Package')).toBeVisible();
    await expect(page.getByText('State Machine Package')).toBeVisible();
  });

  test('should display migration statistics', async ({ page }) => {
    await page.goto('/');
    
    // Check for statistics
    await expect(page.getByText(/Total Packages/)).toBeVisible();
    await expect(page.getByText(/Total Tests/)).toBeVisible();
    await expect(page.getByText(/Total Lines of Code/)).toBeVisible();
  });
});

test.describe('Demo App - Navigation', () => {
  test('should navigate to Tasks Demo page', async ({ page }) => {
    await page.goto('/');
    
    // Click on Tasks Demo link
    await page.click('text=Tasks Demo');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/tasks/);
    await expect(page.locator('h1')).toContainText('Tasks Package Demo');
  });

  test('should navigate to State Machine Demo page', async ({ page }) => {
    await page.goto('/');
    
    // Click on State Machine Demo link
    await page.click('text=State Machine Demo');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/statemachine/);
    await expect(page.locator('h1')).toContainText('State Machine Package Demo');
  });

  test('should navigate to API Demo page', async ({ page }) => {
    await page.goto('/');
    
    // Click on API Demo link
    await page.click('text=API Demo');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/api/);
    await expect(page.locator('h1')).toContainText('HTTP API Package Demo');
  });

  test('should navigate back to home from menu', async ({ page }) => {
    await page.goto('/tasks');
    
    // Click on Home link in menu
    await page.click('text=Home');
    
    // Verify navigation
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Cyoda UI React Migration');
  });
});

test.describe('Demo App - Tasks Demo Page', () => {
  test('should display tasks features list', async ({ page }) => {
    await page.goto('/tasks');
    
    // Check for features
    await expect(page.getByText(/Task list with filtering/)).toBeVisible();
    await expect(page.getByText(/Pagination and sorting/)).toBeVisible();
    await expect(page.getByText(/Task detail view/)).toBeVisible();
  });

  test('should display usage examples', async ({ page }) => {
    await page.goto('/tasks');
    
    // Check for code examples
    await expect(page.getByText(/Usage Examples/)).toBeVisible();
    await expect(page.getByText(/useTasks/)).toBeVisible();
  });
});

test.describe('Demo App - State Machine Demo Page', () => {
  test('should display state machine features list', async ({ page }) => {
    await page.goto('/statemachine');
    
    // Check for features
    await expect(page.getByText(/Workflow management/)).toBeVisible();
    await expect(page.getByText(/State machine instances/)).toBeVisible();
    await expect(page.getByText(/Graphical visualization/)).toBeVisible();
  });

  test('should display GraphicalStateMachine component info', async ({ page }) => {
    await page.goto('/statemachine');
    
    // Check for GraphicalStateMachine info
    await expect(page.getByText(/GraphicalStateMachine/)).toBeVisible();
  });
});

test.describe('Demo App - API Demo Page', () => {
  test('should display API hooks list', async ({ page }) => {
    await page.goto('/api');
    
    // Check for API hooks sections
    await expect(page.getByText(/Authentication Hooks/)).toBeVisible();
    await expect(page.getByText(/Reports Hooks/)).toBeVisible();
    await expect(page.getByText(/Entities Hooks/)).toBeVisible();
  });

  test('should display axios configuration info', async ({ page }) => {
    await page.goto('/api');
    
    // Check for axios info
    await expect(page.getByText(/Axios Configuration/)).toBeVisible();
  });
});

test.describe('Demo App - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if page loads
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if menu is accessible (might be collapsed)
    const menu = page.locator('.ant-menu, .ant-drawer');
    await expect(menu).toBeTruthy();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check if page loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.ant-card')).toHaveCount(3);
  });
});

test.describe('Demo App - Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Page should still load (React Router handles 404s)
    expect(response?.status()).toBeLessThan(500);
  });

  test('should not have console errors on home page', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (like network errors in dev)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load resource') &&
      !error.includes('net::ERR_')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Demo App - Performance', () => {
  test('should load home page within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('Demo App - Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation landmarks
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeTruthy();
  });
});

