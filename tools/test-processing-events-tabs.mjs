/**
 * E2E Test for Processing Events Tabs
 * Tests the three newly implemented tabs:
 * - Processing events error view
 * - Entities error list view
 * - SIFT logger conf view
 */

import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3008';

async function runTests() {
  console.log('🚀 Starting Processing Events Tabs E2E Tests...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;
  const errors = [];

  try {
    // Test 1: Navigate to Nodes page
    console.log('Test 1: Navigate to Nodes page');
    await page.goto(`${BASE_URL}/nodes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Click on first node (if available)
    const firstNode = await page.locator('.ant-table-row').first();
    if (await firstNode.count() > 0) {
      await firstNode.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigated to node detail page');
      passed++;
    } else {
      console.log('⚠️  No nodes available - skipping node detail tests');
      errors.push('No nodes available for testing');
      failed++;
    }

    // Test 2: Navigate to Processing Events tab
    console.log('\nTest 2: Navigate to Processing Events tab');
    const processingEventsTab = await page.locator('text=Processing Events').first();
    if (await processingEventsTab.count() > 0) {
      await processingEventsTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked Processing Events tab');
      passed++;
    } else {
      console.log('❌ Processing Events tab not found');
      errors.push('Processing Events tab not found');
      failed++;
    }

    // Test 3: Click "Processing events error view" tab
    console.log('\nTest 3: Click "Processing events error view" tab');
    const errorViewTab = await page.locator('.ant-tabs-tab:has-text("Processing events error view")');
    if (await errorViewTab.count() > 0) {
      await errorViewTab.click();
      await page.waitForTimeout(1000);
      
      // Check if the tab content is loaded (not showing "To be implemented")
      const notImplemented = await page.locator('text=To be implemented').count();
      if (notImplemented === 0) {
        console.log('✅ Processing events error view tab is implemented');
        passed++;
      } else {
        console.log('❌ Processing events error view tab shows "To be implemented"');
        errors.push('Processing events error view not implemented');
        failed++;
      }
    } else {
      console.log('❌ Processing events error view tab not found');
      errors.push('Processing events error view tab not found');
      failed++;
    }

    // Test 4: Click "Entities error list view" tab
    console.log('\nTest 4: Click "Entities error list view" tab');
    const entitiesErrorTab = await page.locator('.ant-tabs-tab:has-text("Entities error list view")');
    if (await entitiesErrorTab.count() > 0) {
      await entitiesErrorTab.click();
      await page.waitForTimeout(1000);
      
      // Check if the tab content is loaded (not showing "To be implemented")
      const notImplemented = await page.locator('text=To be implemented').count();
      if (notImplemented === 0) {
        console.log('✅ Entities error list view tab is implemented');
        passed++;
      } else {
        console.log('❌ Entities error list view tab shows "To be implemented"');
        errors.push('Entities error list view not implemented');
        failed++;
      }
    } else {
      console.log('❌ Entities error list view tab not found');
      errors.push('Entities error list view tab not found');
      failed++;
    }

    // Test 5: Click "SIFT logger conf view" tab
    console.log('\nTest 5: Click "SIFT logger conf view" tab');
    const siftLoggerTab = await page.locator('.ant-tabs-tab:has-text("SIFT logger conf view")');
    if (await siftLoggerTab.count() > 0) {
      await siftLoggerTab.click();
      await page.waitForTimeout(1000);
      
      // Check if the tab content is loaded (not showing "To be implemented")
      const notImplemented = await page.locator('text=To be implemented').count();
      if (notImplemented === 0) {
        console.log('✅ SIFT logger conf view tab is implemented');
        passed++;
      } else {
        console.log('❌ SIFT logger conf view tab shows "To be implemented"');
        errors.push('SIFT logger conf view not implemented');
        failed++;
      }
    } else {
      console.log('❌ SIFT logger conf view tab not found');
      errors.push('SIFT logger conf view tab not found');
      failed++;
    }

    // Test 6: Verify SIFT logger form elements
    console.log('\nTest 6: Verify SIFT logger form elements');
    const siftLoggerHeading = await page.locator('h3:has-text("Sift logger")');
    if (await siftLoggerHeading.count() > 0) {
      console.log('✅ SIFT logger heading found');
      passed++;
    } else {
      console.log('❌ SIFT logger heading not found');
      errors.push('SIFT logger heading not found');
      failed++;
    }

    // Test 7: Verify SIFT logger switches
    console.log('\nTest 7: Verify SIFT logger switches');
    const switches = await page.locator('.ant-switch').count();
    if (switches >= 2) {
      console.log(`✅ Found ${switches} switches in SIFT logger form`);
      passed++;
    } else {
      console.log(`❌ Expected at least 2 switches, found ${switches}`);
      errors.push(`Expected at least 2 switches, found ${switches}`);
      failed++;
    }

    // Test 8: Verify SIFT logger Transfer component
    console.log('\nTest 8: Verify SIFT logger Transfer component');
    const transfer = await page.locator('.ant-transfer').count();
    if (transfer > 0) {
      console.log('✅ Transfer component found in SIFT logger form');
      passed++;
    } else {
      console.log('❌ Transfer component not found');
      errors.push('Transfer component not found');
      failed++;
    }

    // Test 9: Verify SIFT logger Submit button
    console.log('\nTest 9: Verify SIFT logger Submit button');
    const submitButton = await page.locator('button:has-text("Submit")').count();
    if (submitButton > 0) {
      console.log('✅ Submit button found in SIFT logger form');
      passed++;
    } else {
      console.log('❌ Submit button not found');
      errors.push('Submit button not found');
      failed++;
    }

    // Test 10: Go back to "Processing events error view" tab
    console.log('\nTest 10: Go back to "Processing events error view" tab');
    const errorViewTab2 = await page.locator('.ant-tabs-tab:has-text("Processing events error view")');
    if (await errorViewTab2.count() > 0) {
      await errorViewTab2.click();
      await page.waitForTimeout(1000);
      console.log('✅ Successfully navigated back to Processing events error view');
      passed++;
    } else {
      console.log('❌ Could not navigate back to Processing events error view');
      errors.push('Could not navigate back to Processing events error view');
      failed++;
    }

  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    errors.push(error.message);
    failed++;
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Pass Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  console.log('='.repeat(60));

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

