import { chromium } from 'playwright';

async function testCreateReport() {
  console.log('🚀 Starting Create Report test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('\n=== STEP 1: LOGIN ===');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.locator('input[type="text"]').first().fill('demo.user');
    await page.locator('input[type="password"]').first().fill('k33pS8fe!!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    console.log('✅ Logged in');
    
    // Step 2: Navigate to Tableau Reports
    console.log('\n=== STEP 2: NAVIGATE TO TABLEAU ===');
    await page.goto('http://localhost:3000/tableau/reports', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('✅ On Tableau Reports page');
    
    // Step 3: Click Create New Report
    console.log('\n=== STEP 3: OPEN CREATE REPORT DIALOG ===');
    const createButton = page.locator('button:has-text("Create New")').first();
    await createButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Create New button');
    
    // Check if dialog opened
    const dialog = page.locator('.ant-modal, [role="dialog"]').first();
    const dialogVisible = await dialog.isVisible();
    console.log(`${dialogVisible ? '✅' : '❌'} Dialog visible: ${dialogVisible}`);
    
    if (dialogVisible) {
      await page.screenshot({ path: 'create-dialog-opened.png', fullPage: true });
      console.log('📸 Screenshot saved to create-dialog-opened.png');
      
      // Step 4: Check Entity Class dropdown
      console.log('\n=== STEP 4: CHECK ENTITY CLASS DROPDOWN ===');
      
      // Wait for the entity class select to be visible
      await page.waitForTimeout(1000);
      
      // Find the entity class dropdown
      const entitySelect = page.locator('.ant-select').first();
      const entitySelectVisible = await entitySelect.isVisible();
      console.log(`${entitySelectVisible ? '✅' : '❌'} Entity Class dropdown visible: ${entitySelectVisible}`);
      
      if (entitySelectVisible) {
        // Click to open dropdown
        console.log('🔘 Opening Entity Class dropdown...');
        await entitySelect.click();
        await page.waitForTimeout(1000);
        
        // Check for dropdown options
        const dropdownOptions = page.locator('.ant-select-item, .ant-select-dropdown .ant-select-item-option');
        const optionCount = await dropdownOptions.count();
        console.log(`📋 Found ${optionCount} entity class options`);
        
        if (optionCount > 0) {
          console.log('✅ Entity data loaded successfully!');
          
          // Get first few option texts
          const optionTexts = [];
          for (let i = 0; i < Math.min(5, optionCount); i++) {
            const text = await dropdownOptions.nth(i).textContent();
            optionTexts.push(text);
          }
          console.log('📋 Sample options:', optionTexts);
          
          // Take screenshot of dropdown
          await page.screenshot({ path: 'entity-dropdown-open.png', fullPage: true });
          console.log('📸 Screenshot saved to entity-dropdown-open.png');
          
          // Select first option
          console.log('🔘 Selecting first entity class...');
          await dropdownOptions.first().click();
          await page.waitForTimeout(1000);
          
          // Fill in report name
          console.log('\n=== STEP 5: FILL REPORT NAME ===');
          const nameInput = page.locator('input[placeholder*="name" i], input[type="text"]').first();
          const testReportName = `Test Report ${Date.now()}`;
          await nameInput.fill(testReportName);
          console.log(`✅ Filled report name: ${testReportName}`);
          
          await page.screenshot({ path: 'report-form-filled.png', fullPage: true });
          console.log('📸 Screenshot saved to report-form-filled.png');
          
          // Check if Confirm button is enabled
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("OK"), button.ant-btn-primary').first();
          const isEnabled = await confirmButton.isEnabled();
          console.log(`${isEnabled ? '✅' : '❌'} Confirm button enabled: ${isEnabled}`);
          
          if (isEnabled) {
            console.log('🔘 Clicking Confirm button...');
            await confirmButton.click();
            await page.waitForTimeout(3000);
            
            // Check if we navigated to report editor
            const currentUrl = page.url();
            console.log('📍 Current URL after confirm:', currentUrl);
            
            if (currentUrl.includes('report-editor') || currentUrl.includes('tableau/reports/')) {
              console.log('✅ Successfully navigated to report editor!');
              await page.screenshot({ path: 'report-editor.png', fullPage: true });
              console.log('📸 Screenshot saved to report-editor.png');
            } else {
              console.log('⚠️  Did not navigate to report editor');
            }
          }
        } else {
          console.log('❌ No entity class options found - API might not be returning data');
        }
      }
    }
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log('✅ Login: SUCCESS');
    console.log(`${dialogVisible ? '✅' : '❌'} Create Dialog: ${dialogVisible ? 'OPENED' : 'FAILED'}`);
    console.log(`${entitySelectVisible ? '✅' : '❌'} Entity Dropdown: ${entitySelectVisible ? 'VISIBLE' : 'NOT FOUND'}`);
    
    // Wait to observe
    console.log('\n⏳ Waiting 5 seconds to observe...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved to error-screenshot.png');
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed');
  }
}

testCreateReport();

