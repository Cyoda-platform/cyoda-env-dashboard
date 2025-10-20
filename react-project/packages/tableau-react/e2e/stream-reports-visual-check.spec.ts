import { test, expect } from '@playwright/test';

test.describe('Stream Reports Visual Check', () => {
  test('should show what elements are on the Stream Reports page', async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    // Count elements
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const buttonCount = await page.locator('button').count();
    const tableCount = await page.locator('.ant-table').count();

    console.log('H1 count:', h1Count);
    console.log('H2 count:', h2Count);
    console.log('Button count:', buttonCount);
    console.log('Table count:', tableCount);

    // Get H1 text
    if (h1Count > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      console.log('H1 text:', h1Text);
    }

    // Get all table headers
    const headers = await page.locator('th').allTextContents();
    console.log('Table headers:', headers);

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get URL
    const url = page.url();
    console.log('Page URL:', url);
  });
});

