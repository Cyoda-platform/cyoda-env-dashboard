#!/usr/bin/env node

/**
 * Open Version Information Modal
 * Automatically clicks on "Version App" in the left sidebar menu
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function openVersionInfo() {
  console.log('\n🔍 Opening Version Information...\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down so you can see what's happening
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('📍 Navigating to saas-app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Find and click on "Version App" menu item
    console.log('🖱️  Clicking on "Version App" menu item...');
    
    // Try to find the menu item by text
    const versionMenuItem = page.locator('text=Version App');
    await versionMenuItem.waitFor({ timeout: 5000 });
    await versionMenuItem.click();
    
    console.log('✅ Clicked on Version App!');
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);

    // Check if modal is visible (look for Platform/Client/UI sections)
    const modal = page.locator('.ant-modal:has-text("Platform")');
    const isVisible = await modal.isVisible();
    
    if (isVisible) {
      console.log('✅ Version Information modal is now open!');
      console.log('\n📸 Taking screenshot...');
      await page.screenshot({ 
        path: 'version-info-modal.png',
        fullPage: true 
      });
      console.log('   Saved: version-info-modal.png');
    } else {
      console.log('❌ Modal did not appear');
    }

    console.log('\n✨ Browser will stay open so you can see the Version Information modal.');
    console.log('   Press Ctrl+C to close when done.\n');

    // Keep browser open
    await page.waitForTimeout(300000); // Wait 5 minutes

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    // Don't close automatically - let user see the modal
    // await browser.close();
  }
}

// Run the script
openVersionInfo().catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});

