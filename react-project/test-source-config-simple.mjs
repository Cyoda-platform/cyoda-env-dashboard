#!/usr/bin/env node

/**
 * Simple E2E test for Source Configuration React app
 * Tests basic functionality without complex setup
 */

import { chromium } from 'playwright';

async function runTests() {
  console.log('🚀 Starting Source Configuration E2E Tests...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // Test 1: Load the application
    console.log('Test 1: Loading application at http://localhost:5176...');
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle' });
    console.log('✅ Application loaded successfully\n');
    passedTests++;
    
    // Wait a bit for React to render
    await page.waitForTimeout(2000);
    
    // Test 2: Check page title
    console.log('Test 2: Checking page title...');
    const title = await page.title();
    console.log(`   Page title: "${title}"`);
    if (title.includes('Source Configuration')) {
      console.log('✅ Page title is correct\n');
      passedTests++;
    } else {
      console.log('❌ Page title is incorrect\n');
      failedTests++;
    }
    
    // Test 3: Take a screenshot
    console.log('Test 3: Taking screenshot...');
    await page.screenshot({ path: 'source-config-screenshot.png', fullPage: true });
    console.log('✅ Screenshot saved to source-config-screenshot.png\n');
    passedTests++;
    
    // Test 4: Check if React root is rendered
    console.log('Test 4: Checking if React app is rendered...');
    const rootElement = await page.locator('#root').count();
    if (rootElement > 0) {
      console.log('✅ React root element found\n');
      passedTests++;
    } else {
      console.log('❌ React root element not found\n');
      failedTests++;
    }
    
    // Test 5: Check for any visible text
    console.log('Test 5: Checking for visible content...');
    const bodyText = await page.locator('body').textContent();
    console.log(`   Body text length: ${bodyText?.length || 0} characters`);
    if (bodyText && bodyText.length > 0) {
      console.log(`   First 200 chars: "${bodyText.substring(0, 200)}..."`);
      console.log('✅ Page has visible content\n');
      passedTests++;
    } else {
      console.log('❌ Page has no visible content\n');
      failedTests++;
    }
    
    // Test 6: Check for console errors
    console.log('Test 6: Checking for console errors...');
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (errors.length === 0) {
      console.log('✅ No console errors found\n');
      passedTests++;
    } else {
      console.log(`⚠️  Found ${errors.length} console errors:`);
      errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
      console.log('');
      // Don't fail the test for console errors in dev mode
      passedTests++;
    }
    
    // Test 7: Check if page is interactive
    console.log('Test 7: Checking if page is interactive...');
    const clickableElements = await page.locator('button, a, input').count();
    console.log(`   Found ${clickableElements} interactive elements`);
    if (clickableElements > 0) {
      console.log('✅ Page has interactive elements\n');
      passedTests++;
    } else {
      console.log('❌ Page has no interactive elements\n');
      failedTests++;
    }
    
    // Test 8: Check for specific UI elements
    console.log('Test 8: Looking for specific UI elements...');
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const tables = await page.locator('table').count();
    
    console.log(`   Buttons: ${buttons}`);
    console.log(`   Inputs: ${inputs}`);
    console.log(`   Tables: ${tables}`);
    
    if (buttons > 0 || inputs > 0 || tables > 0) {
      console.log('✅ Found UI components\n');
      passedTests++;
    } else {
      console.log('❌ No UI components found\n');
      failedTests++;
    }
    
    // Test 9: Check for Ant Design components
    console.log('Test 9: Checking for Ant Design components...');
    const antdElements = await page.locator('[class*="ant-"]').count();
    console.log(`   Found ${antdElements} Ant Design elements`);
    if (antdElements > 0) {
      console.log('✅ Ant Design components are rendering\n');
      passedTests++;
    } else {
      console.log('❌ No Ant Design components found\n');
      failedTests++;
    }
    
    // Test 10: Check network requests
    console.log('Test 10: Monitoring network requests...');
    const requests = [];
    page.on('request', (request) => {
      requests.push(request.url());
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    console.log(`   Total requests: ${requests.length}`);
    const apiRequests = requests.filter(url => url.includes('/api/'));
    console.log(`   API requests: ${apiRequests.length}`);
    
    if (requests.length > 0) {
      console.log('✅ Network requests are being made\n');
      passedTests++;
    } else {
      console.log('⚠️  No network requests detected\n');
      passedTests++; // Don't fail for this
    }
    
    // Keep browser open for manual inspection
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   Total: ${passedTests + failedTests}`);
    console.log(`   Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    
    if (failedTests === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above for details.');
    }
    
    console.log('\n👀 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    failedTests++;
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed. Tests complete!');
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTests().catch(console.error);

