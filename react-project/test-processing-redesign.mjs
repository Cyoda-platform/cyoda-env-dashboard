#!/usr/bin/env node

/**
 * Visual Test for Processing UI Redesign
 * Captures screenshots of the redesigned Processing pages
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function captureProcessingScreenshots() {
  console.log('\n🎨 Processing UI Redesign - Visual Test\n');
  console.log('=' .repeat(80));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Navigate to Processing page
    console.log('\n📸 Capturing Processing Home page...');
    await page.goto(`${BASE_URL}/processing`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'processing-redesign-01-home.png',
      fullPage: true 
    });
    console.log('   ✅ Saved: processing-redesign-01-home.png');

    // Navigate to Nodes page
    console.log('\n📸 Capturing Nodes page...');
    await page.goto(`${BASE_URL}/processing-ui/nodes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'processing-redesign-02-nodes.png',
      fullPage: true 
    });
    console.log('   ✅ Saved: processing-redesign-02-nodes.png');

    // Click on first node to see detail page
    console.log('\n📸 Capturing Node Detail page...');
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'processing-redesign-03-node-detail.png',
        fullPage: true 
      });
      console.log('   ✅ Saved: processing-redesign-03-node-detail.png');
    }

    // Check layout consistency
    console.log('\n🔍 Verifying Layout Consistency...');
    
    // Check for unified header
    const header = await page.locator('header').count();
    console.log(`   ${header === 1 ? '✅' : '❌'} Single unified header: ${header === 1}`);
    
    // Check for left sidebar
    const sidebar = await page.locator('aside').count();
    console.log(`   ${sidebar === 1 ? '✅' : '❌'} Single left sidebar: ${sidebar === 1}`);
    
    // Check for no duplicate Processing header
    const processingHeaders = await page.locator('h1:has-text("Processing Manager")').count();
    console.log(`   ${processingHeaders === 0 ? '✅' : '❌'} No duplicate Processing header: ${processingHeaders === 0}`);
    
    // Check for consistent title style
    const h2Title = await page.locator('h2').count();
    console.log(`   ${h2Title > 0 ? '✅' : '❌'} Uses h2 for page titles: ${h2Title > 0}`);

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Processing UI Redesign Test Complete!\n');
    console.log('Screenshots saved:');
    console.log('  - processing-redesign-01-home.png');
    console.log('  - processing-redesign-02-nodes.png');
    console.log('  - processing-redesign-03-node-detail.png\n');

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
captureProcessingScreenshots().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});

