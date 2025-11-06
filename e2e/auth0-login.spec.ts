import { test, expect } from '@playwright/test';

test.describe('Auth0 Login Integration', () => {
  test('should display login page with Auth0 button', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page has loaded
    await expect(page.locator('.login-page')).toBeVisible();
    
    // Check for the logo
    await expect(page.locator('.logo')).toBeVisible();
    
    // Check for standard login inputs
    await expect(page.locator('input[placeholder*="Username" i]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Password" i]')).toBeVisible();
    
    // Check for standard login button
    await expect(page.locator('button:has-text("Log in")')).toBeVisible();
    
    // Check for OR divider
    await expect(page.getByText('OR')).toBeVisible();
    
    // Check for Auth0 login button
    const auth0Button = page.locator('button:has-text("Login with Auth0")');
    await expect(auth0Button).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'e2e-screenshots/login-with-auth0-button.png', 
      fullPage: true 
    });
  });

  test('should have styled Auth0 button', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const auth0Button = page.locator('button:has-text("Login with Auth0")');
    await expect(auth0Button).toBeVisible();
    
    // Check button is clickable
    await expect(auth0Button).toBeEnabled();
    
    // Hover over the button
    await auth0Button.hover();
    
    // Take screenshot with hover
    await page.screenshot({ 
      path: 'e2e-screenshots/login-auth0-button-hover.png', 
      fullPage: true 
    });
  });

  test('should not have console errors on login page', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    // Filter out expected errors (API errors when backend is not running)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load resource') &&
      !error.includes('net::ERR_') &&
      !error.includes('404') &&
      !error.includes('favicon') &&
      !error.includes('API Error') &&
      !error.includes('AxiosError') &&
      !error.includes('Network Error')
    );
    
    // Log any critical errors found
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    // Should not have critical console errors
    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper layout with both login options', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check that both login methods are visible
    const standardLoginButton = page.locator('button:has-text("Log in")');
    const auth0Button = page.locator('button:has-text("Login with Auth0")');
    
    await expect(standardLoginButton).toBeVisible();
    await expect(auth0Button).toBeVisible();
    
    // Check they are in the same card
    const loginCard = page.locator('.login-card');
    await expect(loginCard).toBeVisible();
    
    // Both buttons should be within the card
    await expect(loginCard.locator('button:has-text("Log in")')).toBeVisible();
    await expect(loginCard.locator('button:has-text("Login with Auth0")')).toBeVisible();
  });
});

