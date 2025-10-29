import { chromium } from 'playwright';

async function testEntityData() {
  console.log('🚀 Starting Entity Data test (with name and description)...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track API calls
  const apiCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/platform-api/entity-info/fetch/types')) {
      const status = response.status();
      console.log(`\n📡 API Call: ${url}`);
      console.log(`   Status: ${status}`);
      
      try {
        const data = await response.json();
        console.log(`   Response: ${Array.isArray(data) ? data.length : 'N/A'} entity types`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   First 3: ${data.slice(0, 3).join(', ')}`);
        }
        apiCalls.push({ url, status, data });
      } catch (e) {
        console.log(`   Could not parse response as JSON`);
      }
    }
  });

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
    await page.waitForTimeout(1500);
    console.log('✅ Clicked Create New button');
    
    // Step 4: Fill in Name and Description FIRST
    console.log('\n=== STEP 4: FILL NAME AND DESCRIPTION ===');
    
    const nameInput = page.locator('input#name, input[placeholder*="name" i]').first();
    const testReportName = `Test Report ${Date.now()}`;
    await nameInput.fill(testReportName);
    console.log(`✅ Filled name: ${testReportName}`);
    
    const descriptionInput = page.locator('textarea#description, textarea[placeholder*="description" i]').first();
    await descriptionInput.fill('Test report created by Playwright automation');
    console.log('✅ Filled description');
    
    await page.screenshot({ path: 'form-name-desc-filled.png', fullPage: true });
    console.log('📸 Screenshot saved to form-name-desc-filled.png');
    
    // Wait a bit for any validation
    await page.waitForTimeout(1000);
    
    // Step 5: Now check Entity Class dropdown
    console.log('\n=== STEP 5: CHECK ENTITY CLASS DROPDOWN ===');
    
    const selectContainer = page.locator('.ant-select-selector').first();
    console.log('🔘 Clicking entity class select...');
    await selectContainer.click({ force: true });
    await page.waitForTimeout(1500);
    
    // Check for dropdown
    const dropdown = page.locator('.ant-select-dropdown').first();
    const dropdownVisible = await dropdown.isVisible().catch(() => false);
    console.log(`${dropdownVisible ? '✅' : '❌'} Dropdown visible: ${dropdownVisible}`);
    
    if (dropdownVisible) {
      // Count options
      const options = page.locator('.ant-select-item-option');
      const optionCount = await options.count();
      console.log(`📋 Found ${optionCount} options in dropdown`);
      
      if (optionCount > 0) {
        console.log('✅ Entity data loaded successfully!');
        
        // Get option texts
        console.log('\n📋 Entity Classes:');
        for (let i = 0; i < Math.min(10, optionCount); i++) {
          const text = await options.nth(i).textContent();
          console.log(`   ${i + 1}. ${text}`);
        }
        
        await page.screenshot({ path: 'entity-dropdown-with-data.png', fullPage: true });
        console.log('\n📸 Screenshot saved to entity-dropdown-with-data.png');
        
        // Step 6: Select first entity and confirm
        console.log('\n=== STEP 6: SELECT ENTITY AND CONFIRM ===');
        console.log('🔘 Selecting first entity...');
        await options.first().click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'entity-selected.png', fullPage: true });
        console.log('📸 Screenshot saved to entity-selected.png');
        
        // Click Confirm button
        const confirmButton = page.locator('button:has-text("Confirm"), button.ant-btn-primary').last();
        const isEnabled = await confirmButton.isEnabled();
        console.log(`${isEnabled ? '✅' : '❌'} Confirm button enabled: ${isEnabled}`);
        
        if (isEnabled) {
          console.log('🔘 Clicking Confirm...');
          await confirmButton.click();
          await page.waitForTimeout(3000);
          
          const currentUrl = page.url();
          console.log('📍 Current URL after confirm:', currentUrl);
          
          if (currentUrl.includes('report-editor') || currentUrl.includes('/tableau/')) {
            console.log('✅ Successfully created report and navigated to editor!');
            await page.screenshot({ path: 'report-editor-opened.png', fullPage: true });
            console.log('📸 Screenshot saved to report-editor-opened.png');
          } else {
            console.log('⚠️  URL did not change as expected');
          }
        }
      } else {
        console.log('❌ No options found in dropdown');
      }
    } else {
      console.log('❌ Dropdown did not open');
      
      // Check for "No data" message
      const noData = page.locator('.ant-select-item-empty, .ant-empty');
      const noDataCount = await noData.count();
      if (noDataCount > 0) {
        const noDataText = await noData.first().textContent();
        console.log(`⚠️  No data message: ${noDataText}`);
      }
    }
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`✅ Login: SUCCESS`);
    console.log(`✅ Dialog opened: SUCCESS`);
    console.log(`✅ Name filled: SUCCESS`);
    console.log(`✅ Description filled: SUCCESS`);
    console.log(`${dropdownVisible ? '✅' : '❌'} Entity dropdown: ${dropdownVisible ? 'OPENED' : 'FAILED'}`);
    console.log(`📡 API calls captured: ${apiCalls.length}`);
    
    if (apiCalls.length > 0) {
      console.log(`   Entity types returned: ${apiCalls[0].data?.length || 0}`);
    }
    
    // Wait to observe
    console.log('\n⏳ Waiting 5 seconds to observe...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved to error-screenshot.png');
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed');
  }
}

testEntityData();

