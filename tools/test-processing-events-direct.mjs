/**
 * Direct E2E Test for Processing Events Tabs
 * Tests the three newly implemented tabs by directly navigating to a node detail page
 */

import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3008';
const TEST_NODE_NAME = 'test-node'; // We'll use a test node name

async function runTests() {
  console.log('🚀 Starting Direct Processing Events Tabs E2E Tests...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;
  const errors = [];

  try {
    // Test 1: Navigate directly to a node detail page
    console.log('Test 1: Navigate to node detail page');
    await page.goto(`${BASE_URL}/processing-ui/nodes/${TEST_NODE_NAME}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const pageTitle = await page.locator('h2').first().textContent();
    console.log(`Page title: ${pageTitle}`);
    
    if (pageTitle && pageTitle.includes('Node Detail')) {
      console.log('✅ Successfully navigated to node detail page');
      passed++;
    } else {
      console.log('❌ Failed to navigate to node detail page');
      errors.push('Failed to navigate to node detail page');
      failed++;
    }

    // Test 2: Find and click "Processing Events" tab
    console.log('\nTest 2: Find and click "Processing Events" tab');
    const processingEventsTab = await page.locator('.ant-tabs-tab:has-text("Processing Events")');
    const tabCount = await processingEventsTab.count();
    console.log(`Found ${tabCount} "Processing Events" tab(s)`);
    
    if (tabCount > 0) {
      await processingEventsTab.first().click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked Processing Events tab');
      passed++;
    } else {
      console.log('❌ Processing Events tab not found');
      errors.push('Processing Events tab not found');
      failed++;
    }

    // Test 3: Verify all 6 inner tabs exist
    console.log('\nTest 3: Verify all 6 inner tabs exist');
    const innerTabs = await page.locator('.ant-tabs-tab').allTextContents();
    console.log(`Found ${innerTabs.length} tabs total`);
    console.log('Tab names:', innerTabs);
    
    const expectedTabs = [
      'Process Events Statistics',
      'Polling info',
      'Processing events view',
      'Processing events error view',
      'Entities error list view',
      'SIFT logger conf view'
    ];
    
    let allTabsFound = true;
    for (const tabName of expectedTabs) {
      const found = innerTabs.some(t => t.includes(tabName));
      if (found) {
        console.log(`  ✅ ${tabName}`);
      } else {
        console.log(`  ❌ ${tabName} - NOT FOUND`);
        allTabsFound = false;
        errors.push(`Tab "${tabName}" not found`);
      }
    }
    
    if (allTabsFound) {
      console.log('✅ All 6 tabs found');
      passed++;
    } else {
      console.log('❌ Some tabs are missing');
      failed++;
    }

    // Test 4: Click "Processing events error view" tab
    console.log('\nTest 4: Click "Processing events error view" tab');
    const errorViewTab = await page.locator('.ant-tabs-tab:has-text("Processing events error view")');
    if (await errorViewTab.count() > 0) {
      await errorViewTab.click();
      await page.waitForTimeout(1000);
      
      // Check if the tab content is loaded (not showing "To be implemented")
      const notImplemented = await page.locator('text=To be implemented').count();
      if (notImplemented === 0) {
        console.log('✅ Processing events error view tab is implemented (no "To be implemented" text)');
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

    // Test 5: Click "Entities error list view" tab
    console.log('\nTest 5: Click "Entities error list view" tab');
    const entitiesErrorTab = await page.locator('.ant-tabs-tab:has-text("Entities error list view")');
    if (await entitiesErrorTab.count() > 0) {
      await entitiesErrorTab.click();
      await page.waitForTimeout(1000);
      
      // Check if the tab content is loaded (not showing "To be implemented")
      const notImplemented = await page.locator('text=To be implemented').count();
      if (notImplemented === 0) {
        console.log('✅ Entities error list view tab is implemented (no "To be implemented" text)');
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

    // Test 6: Click "SIFT logger conf view" tab
    console.log('\nTest 6: Click "SIFT logger conf view" tab');
    const siftLoggerTab = await page.locator('.ant-tabs-tab:has-text("SIFT logger conf view")');
    if (await siftLoggerTab.count() > 0) {
      await siftLoggerTab.click();
      await page.waitForTimeout(1000);
      
      // Check if the tab content is loaded (not showing "To be implemented")
      const notImplemented = await page.locator('text=To be implemented').count();
      if (notImplemented === 0) {
        console.log('✅ SIFT logger conf view tab is implemented (no "To be implemented" text)');
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

    // Test 7: Verify SIFT logger form elements
    console.log('\nTest 7: Verify SIFT logger form elements');
    const siftLoggerHeading = await page.locator('h3:has-text("Sift logger")');
    if (await siftLoggerHeading.count() > 0) {
      console.log('✅ SIFT logger heading found');
      passed++;
    } else {
      console.log('❌ SIFT logger heading not found');
      errors.push('SIFT logger heading not found');
      failed++;
    }

    // Test 8: Verify SIFT logger switches
    console.log('\nTest 8: Verify SIFT logger switches');
    const switches = await page.locator('.ant-switch').count();
    if (switches >= 2) {
      console.log(`✅ Found ${switches} switches in SIFT logger form`);
      passed++;
    } else {
      console.log(`❌ Expected at least 2 switches, found ${switches}`);
      errors.push(`Expected at least 2 switches, found ${switches}`);
      failed++;
    }

    // Test 9: Verify SIFT logger Transfer component
    console.log('\nTest 9: Verify SIFT logger Transfer component');
    const transfer = await page.locator('.ant-transfer').count();
    if (transfer > 0) {
      console.log('✅ Transfer component found in SIFT logger form');
      passed++;
    } else {
      console.log('❌ Transfer component not found');
      errors.push('Transfer component not found');
      failed++;
    }

    // Test 10: Verify SIFT logger Submit button
    console.log('\nTest 10: Verify SIFT logger Submit button');
    const submitButton = await page.locator('button:has-text("Submit")').count();
    if (submitButton > 0) {
      console.log('✅ Submit button found in SIFT logger form');
      passed++;
    } else {
      console.log('❌ Submit button not found');
      errors.push('Submit button not found');
      failed++;
    }

    // Test 11: Verify form labels
    console.log('\nTest 11: Verify form labels');
    const configuredLabel = await page.locator('text=Sift logger configured:').count();
    const enabledLabel = await page.locator('text=Sift logger enabled:').count();
    
    if (configuredLabel > 0 && enabledLabel > 0) {
      console.log('✅ Form labels found');
      passed++;
    } else {
      console.log('❌ Form labels not found');
      errors.push('Form labels not found');
      failed++;
    }

    // Test 12: Go back to "Processing events error view" tab
    console.log('\nTest 12: Go back to "Processing events error view" tab');
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

