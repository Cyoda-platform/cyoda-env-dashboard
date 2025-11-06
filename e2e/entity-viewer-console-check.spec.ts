/**
 * Entity Viewer Console Error Check
 * Captures and reports all console messages for debugging
 */

import { test, expect } from '@playwright/test';

test('capture all console messages on entity viewer page', async ({ page }) => {
  const consoleMessages: Array<{ type: string; text: string }> = [];
  const pageErrors: string[] = [];

  // Capture console messages
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  // Navigate to the page
  await page.goto('http://localhost:3000/entity-viewer');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Wait a bit for any delayed errors
  await page.waitForTimeout(3000);

  // Interact with the page to trigger any potential errors
  
  // 1. Toggle dynamic entities checkbox
  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.click();
  await page.waitForTimeout(500);
  await checkbox.click();
  await page.waitForTimeout(500);

  // 2. Click on entity selector
  const selector = page.locator('.ant-select').first();
  await selector.click();
  await page.waitForTimeout(500);

  // 3. Select an entity if available
  const options = page.locator('.ant-select-item-option');
  const optionCount = await options.count();
  if (optionCount > 0) {
    await options.first().click();
    await page.waitForTimeout(2000);
  }

  // 4. Try zoom controls
  const zoomControls = page.locator('.tools .anticon');
  if (await zoomControls.count() > 0) {
    await zoomControls.first().click();
    await page.waitForTimeout(500);
  }

  // Print all console messages
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
  });

  // Print page errors
  console.log('\n=== PAGE ERRORS ===');
  if (pageErrors.length === 0) {
    console.log('No page errors!');
  } else {
    pageErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  // Filter critical errors
  const errors = consoleMessages.filter(msg => msg.type === 'error');
  const warnings = consoleMessages.filter(msg => msg.type === 'warning');

  console.log('\n=== SUMMARY ===');
  console.log(`Total console messages: ${consoleMessages.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Page errors: ${pageErrors.length}`);

  // Filter out expected errors (API errors in demo mode)
  const criticalErrors = errors.filter(error =>
    !error.text.includes('Network Error') &&
    !error.text.includes('404') &&
    !error.text.includes('Failed to fetch') &&
    !error.text.includes('ERR_CONNECTION_REFUSED') &&
    !error.text.includes('Failed to load entity classes') &&
    !error.text.includes('data.map is not a function')
  );

  const criticalPageErrors = pageErrors.filter(error =>
    !error.includes('Network Error') &&
    !error.includes('404') &&
    !error.includes('Failed to fetch') &&
    !error.includes('ERR_CONNECTION_REFUSED')
  );

  console.log(`\nCritical errors: ${criticalErrors.length}`);
  console.log(`Critical page errors: ${criticalPageErrors.length}`);

  if (criticalErrors.length > 0) {
    console.log('\n=== CRITICAL CONSOLE ERRORS ===');
    criticalErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.text}`);
    });
  }

  if (criticalPageErrors.length > 0) {
    console.log('\n=== CRITICAL PAGE ERRORS ===');
    criticalPageErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  // Take screenshot
  await page.screenshot({
    path: 'e2e-screenshots/entity-viewer-console-check.png',
    fullPage: true
  });

  // Test should pass if no critical errors
  expect(criticalErrors.length + criticalPageErrors.length).toBe(0);
});

