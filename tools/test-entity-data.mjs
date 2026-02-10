import { chromium } from 'playwright';

async function testEntityData() {
  console.log('🚀 Starting Entity Data test...');
  
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
        console.log(`   Response data:`, JSON.stringify(data, null, 2).substring(0, 500));
        apiCalls.push({ url, status, data });
      } catch (e) {
        console.log(`   Could not parse response as JSON`);
      }
    }
  });

  try {
    // Step 1: Login
    console.log('\n=== STEP 1: LOGIN ===');
    const testUser = process.env.TEST_ENV_USER || 'demo.user';
    const testSecret = process.env.TEST_ENV_SECRET || 'password';
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.locator('input[type="text"]').first().fill(testUser);
    await page.locator('input[type="password"]').first().fill(testSecret);
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
    await page.waitForTimeout(2000);
    console.log('✅ Clicked Create New button');
    
    // Wait for API call to complete
    console.log('\n⏳ Waiting for entity data API call...');
    await page.waitForTimeout(3000);
    
    // Check console logs
    console.log('\n=== CHECKING PAGE CONSOLE ===');
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Filtering entity options') || text.includes('entity')) {
        console.log('🖥️  Console:', text);
      }
    });
    
    // Take screenshot
    await page.screenshot({ path: 'entity-data-dialog.png', fullPage: true });
    console.log('📸 Screenshot saved to entity-data-dialog.png');
    
    // Check if data is in the select
    console.log('\n=== CHECKING ENTITY SELECT ===');
    const selectInput = page.locator('.ant-select-selection-search-input').first();
    const selectExists = await selectInput.count() > 0;
    console.log(`${selectExists ? '✅' : '❌'} Select input exists: ${selectExists}`);
    
    if (selectExists) {
      // Try to get the placeholder or value
      const placeholder = await selectInput.getAttribute('placeholder');
      console.log(`   Placeholder: ${placeholder}`);
      
      // Click on the select to open dropdown
      console.log('\n🔘 Clicking select to open dropdown...');
      const selectContainer = page.locator('.ant-select-selector').first();
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
          for (let i = 0; i < Math.min(10, optionCount); i++) {
            const text = await options.nth(i).textContent();
            console.log(`   ${i + 1}. ${text}`);
          }
        } else {
          console.log('❌ No options found in dropdown');
        }
        
        await page.screenshot({ path: 'entity-dropdown-visible.png', fullPage: true });
        console.log('📸 Screenshot saved to entity-dropdown-visible.png');
      } else {
        // Check for "No data" message
        const noData = page.locator('.ant-select-item-empty, .ant-empty').first();
        const noDataVisible = await noData.isVisible().catch(() => false);
        if (noDataVisible) {
          const noDataText = await noData.textContent();
          console.log(`⚠️  No data message: ${noDataText}`);
        }
      }
    }
    
    // Summary
    console.log('\n=== API CALLS SUMMARY ===');
    console.log(`Total entity API calls: ${apiCalls.length}`);
    apiCalls.forEach((call, i) => {
      console.log(`\n${i + 1}. ${call.url}`);
      console.log(`   Status: ${call.status}`);
      if (call.data) {
        const dataStr = JSON.stringify(call.data);
        console.log(`   Data length: ${dataStr.length} chars`);
        if (Array.isArray(call.data)) {
          console.log(`   Array length: ${call.data.length} items`);
        }
      }
    });
    
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

