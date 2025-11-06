import { test, expect } from '@playwright/test';

test('capture console errors on data-mapper page', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];

  // Listen to all console events
  page.on('console', (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log(text);
  });

  // Listen to page errors
  page.on('pageerror', (error) => {
    const errorText = `PAGE ERROR: ${error.message}\n${error.stack}`;
    errors.push(errorText);
    console.error(errorText);
  });

  // Navigate to the page
  await page.goto('http://localhost:3009/data-mapper');

  // Wait a bit for any errors to appear
  await page.waitForTimeout(3000);

  // Take a screenshot
  await page.screenshot({ path: 'e2e-screenshots/console-errors.png', fullPage: true });

  // Print all console messages
  console.log('\n=== ALL CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(msg));

  // Print all errors
  console.log('\n=== ALL PAGE ERRORS ===');
  errors.forEach(err => console.log(err));

  // Get the page HTML
  const html = await page.content();
  console.log('\n=== PAGE HTML (first 1000 chars) ===');
  console.log(html.substring(0, 1000));

  // Check if root div has content
  const rootContent = await page.locator('#root').innerHTML();
  console.log('\n=== ROOT DIV CONTENT ===');
  console.log(rootContent);
});

