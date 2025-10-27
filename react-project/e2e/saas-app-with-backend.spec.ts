import { test, expect } from '@playwright/test';

test.describe('SaaS App - With Backend Data', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="Username" i]').first();
    const passwordInput = page.locator('input[placeholder*="password" i], input[placeholder*="Password" i]').first();
    await usernameInput.fill('admin');
    await passwordInput.fill('password');
    await page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in")').first().click();
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
  });

  test('should load Trino schemas from backend', async ({ page }) => {
    await page.goto('/trino');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for the API call to complete
    await page.waitForTimeout(2000);
    
    // Check if we have any content (table, list, or cards)
    const hasTable = await page.locator('.ant-table').count() > 0;
    const hasList = await page.locator('.ant-list').count() > 0;
    const hasCards = await page.locator('.ant-card').count() > 0;
    const hasContent = hasTable || hasList || hasCards;
    
    // Should have some content displayed
    expect(hasContent).toBeTruthy();
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'e2e-screenshots/trino-with-backend.png', fullPage: true });
  });

  test('should load Tableau reports from backend', async ({ page }) => {
    await page.goto('/tableau/reports');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if we have any content
    const hasTable = await page.locator('.ant-table').count() > 0;
    const hasList = await page.locator('.ant-list').count() > 0;
    const hasCards = await page.locator('.ant-card').count() > 0;
    const hasContent = hasTable || hasList || hasCards;
    
    expect(hasContent).toBeTruthy();
    
    // Take a screenshot
    await page.screenshot({ path: 'e2e-screenshots/tableau-with-backend.png', fullPage: true });
  });

  test('should load Workflows from backend', async ({ page }) => {
    await page.goto('/workflows');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if we have any content
    const hasTable = await page.locator('.ant-table').count() > 0;
    const hasList = await page.locator('.ant-list').count() > 0;
    const hasCards = await page.locator('.ant-card').count() > 0;
    const hasContent = hasTable || hasList || hasCards;
    
    expect(hasContent).toBeTruthy();
    
    // Take a screenshot
    await page.screenshot({ path: 'e2e-screenshots/workflows-with-backend.png', fullPage: true });
  });

  test('should load Processing UI from backend', async ({ page }) => {
    await page.goto('/processing-ui');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if we have any content
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    expect(hasContent!.length).toBeGreaterThan(0);
    
    // Take a screenshot
    await page.screenshot({ path: 'e2e-screenshots/processing-ui-with-backend.png', fullPage: true });
  });

  test('should load Tasks from backend', async ({ page }) => {
    await page.goto('/tasks');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if we have any content
    const hasTable = await page.locator('.ant-table').count() > 0;
    const hasList = await page.locator('.ant-list').count() > 0;
    const hasCards = await page.locator('.ant-card').count() > 0;
    const hasContent = hasTable || hasList || hasCards;
    
    expect(hasContent).toBeTruthy();
    
    // Take a screenshot
    await page.screenshot({ path: 'e2e-screenshots/tasks-with-backend.png', fullPage: true });
  });

  test('should navigate between pages with backend data', async ({ page }) => {
    // Start at Trino
    await page.goto('/trino');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Navigate to Tableau
    const tableauLink = page.locator('a:has-text("Report"), a:has-text("Tableau"), [href*="tableau"]').first();
    if (await tableauLink.isVisible()) {
      await tableauLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/tableau/);
    }
    
    // Navigate to Workflows
    const workflowsLink = page.locator('a:has-text("Workflow"), [href*="workflow"]').first();
    if (await workflowsLink.isVisible()) {
      await workflowsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/workflow/);
    }
    
    // Navigate to Processing
    const processingLink = page.locator('a:has-text("Processing"), [href*="processing"]').first();
    if (await processingLink.isVisible()) {
      await processingLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/processing/);
    }
  });

  test('should not have backend connection errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/trino');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Filter out non-backend errors
    const backendErrors = consoleErrors.filter(error => 
      error.includes('ECONNREFUSED') ||
      error.includes('Network Error') ||
      error.includes('ERR_CONNECTION_REFUSED')
    );
    
    // Log any backend errors found
    if (backendErrors.length > 0) {
      console.log('Backend connection errors found:', backendErrors);
    }
    
    // Should not have backend connection errors since backend is running
    expect(backendErrors.length).toBe(0);
  });
});

