/**
 * Simple E2E Test for Processing Events Tabs
 * Tests if the tabs are visible and clickable
 */

import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3008';

async function runTests() {
  console.log('🚀 Starting Simple Processing Events Tabs Test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to home page
    console.log('Navigating to home page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'screenshot-home.png', fullPage: true });
    console.log('✅ Screenshot saved: screenshot-home.png');

    // Navigate to Nodes page
    console.log('\nNavigating to Nodes page...');
    await page.goto(`${BASE_URL}/nodes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'screenshot-nodes.png', fullPage: true });
    console.log('✅ Screenshot saved: screenshot-nodes.png');

    // Check if there are any nodes
    const nodeCount = await page.locator('.ant-table-row').count();
    console.log(`\nFound ${nodeCount} nodes in the table`);

    if (nodeCount > 0) {
      // Click on first node
      console.log('Clicking on first node...');
      await page.locator('.ant-table-row').first().click();
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({ path: 'screenshot-node-detail.png', fullPage: true });
      console.log('✅ Screenshot saved: screenshot-node-detail.png');

      // Check for tabs
      const tabCount = await page.locator('.ant-tabs-tab').count();
      console.log(`\nFound ${tabCount} tabs on node detail page`);

      // List all tab names
      const tabs = await page.locator('.ant-tabs-tab').allTextContents();
      console.log('Tab names:', tabs);

      // Look for Processing Events tab
      const processingEventsTab = await page.locator('.ant-tabs-tab:has-text("Processing Events")');
      const processingEventsCount = await processingEventsTab.count();
      console.log(`\nProcessing Events tab count: ${processingEventsCount}`);

      if (processingEventsCount > 0) {
        console.log('Clicking Processing Events tab...');
        await processingEventsTab.click();
        await page.waitForTimeout(2000);

        // Take screenshot
        await page.screenshot({ path: 'screenshot-processing-events.png', fullPage: true });
        console.log('✅ Screenshot saved: screenshot-processing-events.png');

        // Check for inner tabs
        const innerTabCount = await page.locator('.ant-tabs-tab').count();
        console.log(`\nFound ${innerTabCount} inner tabs`);

        // List all inner tab names
        const innerTabs = await page.locator('.ant-tabs-tab').allTextContents();
        console.log('Inner tab names:', innerTabs);

        // Look for our three tabs
        const errorViewTab = await page.locator('.ant-tabs-tab:has-text("Processing events error view")').count();
        const entitiesErrorTab = await page.locator('.ant-tabs-tab:has-text("Entities error list view")').count();
        const siftLoggerTab = await page.locator('.ant-tabs-tab:has-text("SIFT logger conf view")').count();

        console.log(`\nProcessing events error view tab: ${errorViewTab > 0 ? '✅ Found' : '❌ Not found'}`);
        console.log(`Entities error list view tab: ${entitiesErrorTab > 0 ? '✅ Found' : '❌ Not found'}`);
        console.log(`SIFT logger conf view tab: ${siftLoggerTab > 0 ? '✅ Found' : '❌ Not found'}`);

        if (siftLoggerTab > 0) {
          console.log('\nClicking SIFT logger conf view tab...');
          await page.locator('.ant-tabs-tab:has-text("SIFT logger conf view")').click();
          await page.waitForTimeout(2000);

          // Take screenshot
          await page.screenshot({ path: 'screenshot-sift-logger.png', fullPage: true });
          console.log('✅ Screenshot saved: screenshot-sift-logger.png');

          // Check for SIFT logger elements
          const heading = await page.locator('h3:has-text("Sift logger")').count();
          const switches = await page.locator('.ant-switch').count();
          const transfer = await page.locator('.ant-transfer').count();
          const submitButton = await page.locator('button:has-text("Submit")').count();

          console.log(`\nSIFT Logger elements:`);
          console.log(`  Heading: ${heading > 0 ? '✅ Found' : '❌ Not found'}`);
          console.log(`  Switches: ${switches}`);
          console.log(`  Transfer component: ${transfer > 0 ? '✅ Found' : '❌ Not found'}`);
          console.log(`  Submit button: ${submitButton > 0 ? '✅ Found' : '❌ Not found'}`);
        }
      }
    } else {
      console.log('⚠️  No nodes available - cannot test node detail page');
    }

    console.log('\n✅ Test completed - check screenshots for details');
    console.log('Press Enter to close browser...');
    
    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'screenshot-error.png', fullPage: true });
    console.log('Error screenshot saved: screenshot-error.png');
  } finally {
    await browser.close();
  }
}

runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

