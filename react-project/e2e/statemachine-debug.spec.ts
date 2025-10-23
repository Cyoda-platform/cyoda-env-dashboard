import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3014';

test('Debug - Check what loads on the page', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  await page.goto(BASE_URL);
  await page.waitForTimeout(3000); // Wait for any async loading
  
  // Take screenshot
  await page.screenshot({ path: 'react-project/e2e-screenshots/statemachine-debug.png', fullPage: true });
  
  // Get page content
  const bodyText = await page.locator('body').textContent();
  console.log('=== PAGE CONTENT ===');
  console.log(bodyText);
  
  // Check for Vite error overlay
  const errorOverlay = page.locator('vite-error-overlay');
  if (await errorOverlay.isVisible()) {
    const errorText = await errorOverlay.textContent();
    console.log('=== VITE ERROR OVERLAY ===');
    console.log(errorText);
  }
  
  // Log console messages
  console.log('=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(msg));
  
  // Log errors
  console.log('=== PAGE ERRORS ===');
  errors.forEach(err => console.log(err));
  
  // Check current URL
  console.log('=== CURRENT URL ===');
  console.log(page.url());
});

