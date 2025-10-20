/**
 * Simple Visual Test - Check what's actually on the page
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Check - Report Configs', () => {
  test('should show what elements are on the page', async ({ page }) => {
    await page.goto('/tableau/report-configs');
    
    // Wait a bit for page to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/report-configs-visual.png', fullPage: true });
    
    // Check what headings exist
    const h1 = await page.locator('h1').count();
    const h2 = await page.locator('h2').count();
    const h3 = await page.locator('h3').count();
    
    console.log(`H1 count: ${h1}`);
    console.log(`H2 count: ${h2}`);
    console.log(`H3 count: ${h3}`);
    
    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log(`Button count: ${buttons}`);
    
    // Check for tables
    const tables = await page.locator('table').count();
    const antTables = await page.locator('.ant-table').count();
    console.log(`Table count: ${tables}`);
    console.log(`Ant Table count: ${antTables}`);
    
    // Get page HTML
    const html = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Check if h1 with "Report Configurations" exists
    const h1Text = await page.locator('h1').first().textContent();
    console.log(`H1 text: ${h1Text}`);
    
    // This test always passes - it's just for visual inspection
    expect(true).toBe(true);
  });
});

