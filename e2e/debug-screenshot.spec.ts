/**
 * Debug test to take screenshots of pages
 */

import { test } from '@playwright/test';

test('take screenshot of DataMapper index page', async ({ page }) => {
  await page.goto('http://localhost:3009/data-mapper');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/datamapper-index.png', fullPage: true });
  console.log('Screenshot saved to test-results/datamapper-index.png');
});

test('take screenshot of DataMapper edit page', async ({ page }) => {
  await page.goto('http://localhost:3009/data-mapper/configuration');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/datamapper-edit.png', fullPage: true });
  console.log('Screenshot saved to test-results/datamapper-edit.png');
});

test('take screenshot of DataSourceConfig index page', async ({ page }) => {
  await page.goto('http://localhost:3009/data-mapper/data-source-config-creation');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/datasourceconfig-index.png', fullPage: true });
  console.log('Screenshot saved to test-results/datasourceconfig-index.png');
});

test('print page HTML for DataMapper index', async ({ page }) => {
  await page.goto('http://localhost:3009/data-mapper');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const html = await page.content();
  console.log('=== DataMapper Index HTML ===');
  console.log(html.substring(0, 2000));
});

