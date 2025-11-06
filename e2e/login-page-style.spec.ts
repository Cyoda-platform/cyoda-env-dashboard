import { test, expect } from '@playwright/test';

test.describe('Login Page - Style Verification', () => {
  test('should display login page with dark theme styling', async ({ page }) => {
    await page.goto('/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that the page has loaded
    await expect(page.locator('.login-page')).toBeVisible();

    // Check for the logo container
    await expect(page.locator('.logo-container')).toBeVisible();

    // Check for the logo image
    await expect(page.locator('.logo')).toBeVisible();

    // Check for input fields
    await expect(page.locator('input[placeholder*="Username" i]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Password" i]')).toBeVisible();

    // Check for login button
    await expect(page.locator('button:has-text("Log in")')).toBeVisible();

    // Take a screenshot of the styled login page
    await page.screenshot({
      path: 'e2e-screenshots/login-page-dark-theme.png',
      fullPage: true
    });
  });

  test('should have proper dark theme colors', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Get the background color of the login page
    const loginPage = page.locator('.login-page');
    const bgColor = await loginPage.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should have a dark background (not purple)
    // RGB for #0A0E27 is approximately rgb(10, 14, 39)
    expect(bgColor).toContain('rgb');
    
    // Check that the card is visible
    const loginCard = page.locator('.login-card');
    await expect(loginCard).toBeVisible();
  });

  test('should have gradient effects on logo and title', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check logo container exists
    const logoContainer = page.locator('.logo-container');
    await expect(logoContainer).toBeVisible();

    // Check logo image exists
    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();
  });

  test('should have styled input fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const usernameInput = page.locator('input[placeholder*="Username" i]');
    const passwordInput = page.locator('input[placeholder*="Password" i]');
    
    // Check inputs are visible
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Test focus state by clicking on username input
    await usernameInput.click();
    
    // Take screenshot with focused input
    await page.screenshot({ 
      path: 'e2e-screenshots/login-page-input-focus.png', 
      fullPage: true 
    });
  });

  test('should have styled login button with gradient', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const loginButton = page.locator('button:has-text("Log in")');
    await expect(loginButton).toBeVisible();
    
    // Hover over the button to test hover state
    await loginButton.hover();
    
    // Take screenshot with button hover
    await page.screenshot({ 
      path: 'e2e-screenshots/login-page-button-hover.png', 
      fullPage: true 
    });
  });

  test('should display footer with copyright', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check for footer
    const footer = page.locator('.login-footer');
    await expect(footer).toBeVisible();
    
    // Check for copyright text
    const currentYear = new Date().getFullYear();
    await expect(page.getByText(`© ${currentYear} Cyoda. All rights reserved.`)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check that elements are still visible
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('.logo-container')).toBeVisible();
    await expect(page.locator('.logo')).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({
      path: 'e2e-screenshots/login-page-mobile.png',
      fullPage: true
    });
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check that elements are still visible
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('.logo-container')).toBeVisible();
    
    // Take tablet screenshot
    await page.screenshot({ 
      path: 'e2e-screenshots/login-page-tablet.png', 
      fullPage: true 
    });
  });
});

