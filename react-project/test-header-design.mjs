#!/usr/bin/env node

/**
 * Test Header Design
 * Captures screenshot of the improved header
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function testHeaderDesign() {
  console.log('\n🎨 Testing Header Design...\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('📍 Navigating to saas-app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot of header
    console.log('📸 Capturing header screenshot...');
    const header = page.locator('header.saas-app-header');
    await header.screenshot({ 
      path: 'header-design.png'
    });
    console.log('   ✅ Saved: header-design.png');

    // Take full page screenshot
    console.log('📸 Capturing full page screenshot...');
    await page.screenshot({ 
      path: 'saas-app-with-new-header.png',
      fullPage: false
    });
    console.log('   ✅ Saved: saas-app-with-new-header.png');

    // Check logo
    const logo = await page.locator('.cyoda-logo').count();
    console.log(`\n✅ Logo present: ${logo > 0}`);

    // Check Entity Type toggle
    const entityTypeSwitch = await page.locator('.entity-type-section').count();
    console.log(`✅ Entity Type section present: ${entityTypeSwitch > 0}`);

    console.log('\n✨ Browser will stay open for 30 seconds so you can see the header.');
    console.log('   Press Ctrl+C to close earlier.\n');

    // Keep browser open for viewing
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testHeaderDesign().catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});

