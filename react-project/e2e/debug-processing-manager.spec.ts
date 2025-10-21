import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3008';

test.describe('Debug Processing Manager', () => {
  test('should load home page', async ({ page }) => {
    await page.goto(`${BASE_URL}/processing-ui`);
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });
    
    // Check if page loaded
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for any text on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Body text length:', bodyText?.length);
    
    expect(bodyText).toBeTruthy();
  });

  test('should load node detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/processing-ui/nodes/demo-node`);
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/node-detail-page.png', fullPage: true });
    
    // Check if page loaded
    const bodyText = await page.locator('body').textContent();
    console.log('Node detail body text length:', bodyText?.length);
    
    // Check for tabs
    const tabs = await page.locator('[role="tab"]').count();
    console.log('Number of tabs found:', tabs);
    
    expect(bodyText).toBeTruthy();
  });
});

