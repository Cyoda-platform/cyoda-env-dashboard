#!/usr/bin/env node

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function debug() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Testing /api-demo page...');
  
  try {
    console.log('Navigating to /api-demo...');
    const response = await page.goto(`${BASE_URL}/api-demo`, { waitUntil: 'networkidle', timeout: 10000 });
    console.log('Response status:', response?.status());
    console.log('Response URL:', response?.url());
    
    console.log('\nWaiting for page to load...');
    await page.waitForTimeout(2000);
    
    console.log('\nPage title:', await page.title());
    console.log('\nPage URL:', page.url());
    
    console.log('\nLooking for h1...');
    const h1Count = await page.locator('h1').count();
    console.log('H1 count:', h1Count);
    
    if (h1Count > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      console.log('H1 text:', h1Text);
    }
    
    console.log('\nLooking for header...');
    const headerCount = await page.locator('header, .app-header, .ant-layout-header').count();
    console.log('Header count:', headerCount);
    
    console.log('\nPage content preview:');
    const bodyText = await page.locator('body').textContent();
    console.log(bodyText?.substring(0, 500));
    
    console.log('\nTaking screenshot...');
    await page.screenshot({ path: 'react-project/api-demo-debug.png', fullPage: true });
    console.log('Screenshot saved to api-demo-debug.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

debug();

