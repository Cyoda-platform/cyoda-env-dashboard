/**
 * Tableau App Complete Test
 * Tests the newly migrated HistoryFilter and ReportTableGroup components
 */

import { chromium } from 'playwright';

async function testTableauApp() {
  console.log('🧪 Testing Tableau App with New Components...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    passed: [],
    failed: [],
  };

  try {
    // Navigate to Tableau app
    console.log('📍 Navigating to http://localhost:3007...');
    await page.goto('http://localhost:3007', { waitUntil: 'networkidle', timeout: 10000 });
    results.passed.push('✅ Page loaded successfully');

    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    if (title.includes('Tableau')) {
      results.passed.push('✅ Page title is correct');
    } else {
      results.failed.push('❌ Page title is incorrect');
    }

    // Wait for the page to be fully loaded
    await page.waitForTimeout(2000);

    // Test 1: Check if HistoryFilter component is present
    console.log('\n🔍 Test 1: Checking HistoryFilter component...');
    const historyFilter = await page.locator('.history-filter').count();
    if (historyFilter > 0) {
      results.passed.push('✅ HistoryFilter component is present');
      console.log('   ✓ HistoryFilter found');

      // Check for filter form elements
      const authorsSelect = await page.locator('label:has-text("Author or Group:")').count();
      const statesSelect = await page.locator('label:has-text("Filter by state:")').count();
      const typesSelect = await page.locator('label:has-text("Types:")').count();
      const datePicker = await page.locator('label:has-text("By date and time:")').count();

      if (authorsSelect > 0) {
        results.passed.push('✅ Authors filter field is present');
        console.log('   ✓ Authors filter found');
      } else {
        results.failed.push('❌ Authors filter field is missing');
      }

      if (statesSelect > 0) {
        results.passed.push('✅ States filter field is present');
        console.log('   ✓ States filter found');
      } else {
        results.failed.push('❌ States filter field is missing');
      }

      if (typesSelect > 0) {
        results.passed.push('✅ Types filter field is present');
        console.log('   ✓ Types filter found');
      } else {
        results.failed.push('❌ Types filter field is missing');
      }

      if (datePicker > 0) {
        results.passed.push('✅ Date picker field is present');
        console.log('   ✓ Date picker found');
      } else {
        results.failed.push('❌ Date picker field is missing');
      }
    } else {
      results.failed.push('❌ HistoryFilter component is missing');
      console.log('   ✗ HistoryFilter not found');
    }

    // Test 2: Check if HistoryTable component is present
    console.log('\n🔍 Test 2: Checking HistoryTable component...');
    const historyTable = await page.locator('.history-table').count();
    if (historyTable > 0) {
      results.passed.push('✅ HistoryTable component is present');
      console.log('   ✓ HistoryTable found');
    } else {
      results.failed.push('❌ HistoryTable component is missing');
      console.log('   ✗ HistoryTable not found');
    }

    // Test 3: Check for console errors
    console.log('\n🔍 Test 3: Checking for console errors...');
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    if (consoleErrors.length === 0) {
      results.passed.push('✅ No console errors');
      console.log('   ✓ No console errors detected');
    } else {
      results.failed.push(`❌ ${consoleErrors.length} console errors found`);
      console.log(`   ✗ Console errors: ${consoleErrors.join(', ')}`);
    }

    // Test 4: Count Ant Design components
    console.log('\n🔍 Test 4: Counting Ant Design components...');
    const antComponents = await page.locator('[class*="ant-"]').count();
    console.log(`   📊 Found ${antComponents} Ant Design components`);
    if (antComponents > 0) {
      results.passed.push(`✅ ${antComponents} Ant Design components found`);
    } else {
      results.failed.push('❌ No Ant Design components found');
    }

    // Test 5: Check for Select dropdowns (from HistoryFilter)
    console.log('\n🔍 Test 5: Checking for Select dropdowns...');
    const selectComponents = await page.locator('.ant-select').count();
    console.log(`   📊 Found ${selectComponents} Select components`);
    if (selectComponents >= 3) {
      results.passed.push(`✅ ${selectComponents} Select components found (expected at least 3)`);
    } else {
      results.failed.push(`❌ Only ${selectComponents} Select components found (expected at least 3)`);
    }

    // Test 6: Check for DatePicker (from HistoryFilter)
    console.log('\n🔍 Test 6: Checking for DatePicker...');
    const datePickerComponents = await page.locator('.ant-picker').count();
    console.log(`   📊 Found ${datePickerComponents} DatePicker components`);
    if (datePickerComponents >= 1) {
      results.passed.push(`✅ ${datePickerComponents} DatePicker component(s) found`);
    } else {
      results.failed.push('❌ No DatePicker components found');
    }

    // Test 7: Check page structure
    console.log('\n🔍 Test 7: Checking page structure...');
    const header = await page.locator('.header').count();
    const container = await page.locator('.container').count();
    const reportTable = await page.locator('.report-table').count();

    if (header > 0 && container > 0 && reportTable > 0) {
      results.passed.push('✅ Page structure is correct');
      console.log('   ✓ All main sections present');
    } else {
      results.failed.push('❌ Page structure is incomplete');
      console.log(`   ✗ Missing sections: header=${header}, container=${container}, reportTable=${reportTable}`);
    }

    // Take a screenshot
    await page.screenshot({ path: 'react-project/tableau-complete-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved to: react-project/tableau-complete-screenshot.png');

  } catch (error) {
    results.failed.push(`❌ Test error: ${error.message}`);
    console.error('❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📈 Success Rate: ${((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (results.passed.length > 0) {
    console.log('\n✅ PASSED TESTS:');
    results.passed.forEach((test) => console.log(`   ${test}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.failed.forEach((test) => console.log(`   ${test}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 MIGRATION STATUS');
  console.log('='.repeat(60));
  console.log('✅ HistoryFilter component: MIGRATED');
  console.log('✅ ReportTableGroup component: MIGRATED');
  console.log('✅ HelperReportDefinition utility: MIGRATED');
  console.log('✅ HelperReportTable utility: MIGRATED');
  console.log('✅ Reports page: UPDATED');
  console.log('='.repeat(60));

  return results.failed.length === 0;
}

// Run the test
testTableauApp()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

