import { chromium } from 'playwright';

async function testFullFlow() {
  console.log('🚀 Starting Full Flow Test...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    login: false,
    navigation: false,
    dialogOpen: false,
    formFilled: false,
    entityDataLoaded: false,
    entitySelected: false,
    reportCreated: false,
  };

  try {
    // ========== STEP 1: LOGIN ==========
    console.log('=== STEP 1: LOGIN ===');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.locator('input[type="text"]').first().fill('demo.user');
    await page.locator('input[type="password"]').first().fill('k33pS8fe!!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    const loginUrl = page.url();
    results.login = loginUrl.includes('/trino') || !loginUrl.includes('/login');
    console.log(`${results.login ? '✅' : '❌'} Login: ${results.login ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   URL: ${loginUrl}\n`);
    
    // ========== STEP 2: NAVIGATE TO TABLEAU ==========
    console.log('=== STEP 2: NAVIGATE TO TABLEAU ===');
    await page.goto('http://localhost:3000/tableau/reports');
    await page.waitForTimeout(2000);
    
    results.navigation = page.url().includes('/tableau/reports');
    console.log(`${results.navigation ? '✅' : '❌'} Navigation: ${results.navigation ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   URL: ${page.url()}\n`);
    
    // ========== STEP 3: OPEN CREATE DIALOG ==========
    console.log('=== STEP 3: OPEN CREATE DIALOG ===');
    await page.locator('button:has-text("Create New")').first().click();
    await page.waitForTimeout(1500);
    
    const dialog = page.locator('.ant-modal');
    results.dialogOpen = await dialog.isVisible();
    console.log(`${results.dialogOpen ? '✅' : '❌'} Dialog Open: ${results.dialogOpen ? 'SUCCESS' : 'FAILED'}\n`);
    
    if (!results.dialogOpen) {
      throw new Error('Dialog did not open');
    }
    
    // ========== STEP 4: FILL FORM ==========
    console.log('=== STEP 4: FILL FORM ===');
    const testName = `Playwright Test ${Date.now()}`;
    await page.locator('input#name').fill(testName);
    await page.locator('textarea#description').fill('Automated test report');
    await page.waitForTimeout(500);
    
    results.formFilled = true;
    console.log(`✅ Form Filled`);
    console.log(`   Name: ${testName}`);
    console.log(`   Description: Automated test report\n`);
    
    await page.screenshot({ path: 'test-form-filled.png' });
    
    // ========== STEP 5: SELECT ENTITY CLASS ==========
    console.log('=== STEP 5: SELECT ENTITY CLASS ===');
    
    // Click the select to open dropdown
    await page.locator('.ant-select-selector').first().click();
    await page.waitForTimeout(1500);
    
    // Check if dropdown is visible
    const dropdownVisible = await page.locator('.ant-select-dropdown').isVisible().catch(() => false);
    console.log(`   Dropdown visible: ${dropdownVisible}`);
    
    if (dropdownVisible) {
      const options = page.locator('.ant-select-item-option');
      const optionCount = await options.count();
      console.log(`   Options count: ${optionCount}`);
      
      results.entityDataLoaded = optionCount > 0;
      console.log(`${results.entityDataLoaded ? '✅' : '❌'} Entity Data Loaded: ${results.entityDataLoaded ? 'SUCCESS' : 'FAILED'}`);
      
      if (optionCount > 0) {
        // Show first 5 options
        console.log(`\n   Available entities:`);
        for (let i = 0; i < Math.min(5, optionCount); i++) {
          const text = await options.nth(i).textContent();
          console.log(`   ${i + 1}. ${text}`);
        }
        
        await page.screenshot({ path: 'test-dropdown-open.png' });
        
        // Select first option
        console.log(`\n   Selecting first option...`);
        await options.first().click();
        await page.waitForTimeout(1000);
        
        results.entitySelected = true;
        console.log(`✅ Entity Selected: SUCCESS\n`);
        
        await page.screenshot({ path: 'test-entity-selected.png' });
      }
    } else {
      console.log(`❌ Dropdown did not open\n`);
    }
    
    // ========== STEP 6: CONFIRM AND CREATE ==========
    console.log('=== STEP 6: CONFIRM AND CREATE ===');
    
    if (results.entitySelected) {
      const confirmButton = page.locator('button.ant-btn-primary').last();
      const isEnabled = await confirmButton.isEnabled();
      console.log(`   Confirm button enabled: ${isEnabled}`);
      
      if (isEnabled) {
        await confirmButton.click();
        console.log(`   Clicked Confirm button`);
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        results.reportCreated = finalUrl.includes('/tableau/') && !finalUrl.includes('/tableau/reports');
        console.log(`${results.reportCreated ? '✅' : '❌'} Report Created: ${results.reportCreated ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   Final URL: ${finalUrl}\n`);
        
        if (results.reportCreated) {
          await page.screenshot({ path: 'test-report-editor.png', fullPage: true });
        }
      }
    }
    
    // ========== FINAL SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('FINAL TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`${results.login ? '✅' : '❌'} Login`);
    console.log(`${results.navigation ? '✅' : '❌'} Navigation to Tableau`);
    console.log(`${results.dialogOpen ? '✅' : '❌'} Create Dialog Opened`);
    console.log(`${results.formFilled ? '✅' : '❌'} Form Filled`);
    console.log(`${results.entityDataLoaded ? '✅' : '❌'} Entity Data Loaded`);
    console.log(`${results.entitySelected ? '✅' : '❌'} Entity Selected`);
    console.log(`${results.reportCreated ? '✅' : '❌'} Report Created`);
    console.log('='.repeat(60));
    
    const allPassed = Object.values(results).every(r => r === true);
    console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}\n`);
    
    // Wait to observe
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completed\n');
  }
}

testFullFlow();

