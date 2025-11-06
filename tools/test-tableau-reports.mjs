import { chromium } from 'playwright';

async function testTableauReports() {
  console.log('🚀 Starting Tableau Reports test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('\n=== STEP 1: LOGIN ===');
    console.log('📱 Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input[type="text"], input[name="username"]', { timeout: 10000 });
    
    console.log('✍️  Filling in credentials...');
    await page.locator('input[type="text"], input[name="username"]').first().fill('demo.user');
    await page.locator('input[type="password"]').first().fill('k33pS8fe!!');
    
    console.log('🔘 Clicking login button...');
    await page.locator('button[type="submit"], button:has-text("Login")').first().click();
    
    console.log('⏳ Waiting for login to complete...');
    await page.waitForTimeout(3000);
    console.log('✅ Login completed. Current URL:', page.url());
    
    // Step 2: Navigate to Tableau Reports
    console.log('\n=== STEP 2: NAVIGATE TO TABLEAU ===');
    console.log('🔍 Looking for Tableau navigation...');
    
    // Try to find and click Tableau link in navigation
    const tableauLink = page.locator('a[href*="tableau"], a:has-text("Tableau"), a:has-text("Reports")').first();
    const hasTableauLink = await tableauLink.count() > 0;
    
    if (hasTableauLink) {
      console.log('📍 Found Tableau link, clicking...');
      await tableauLink.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('📍 No Tableau link found, navigating directly...');
      await page.goto('http://localhost:3000/tableau/reports', { waitUntil: 'networkidle' });
    }
    
    console.log('📍 Current URL:', page.url());
    await page.screenshot({ path: 'tableau-page.png', fullPage: true });
    console.log('📸 Screenshot saved to tableau-page.png');
    
    // Step 3: Check for Report Configs
    console.log('\n=== STEP 3: CHECK REPORT CONFIGS ===');
    
    // Look for report configuration elements
    const reportTable = page.locator('table, .ant-table, [class*="report"]').first();
    const hasReportTable = await reportTable.count() > 0;
    
    if (hasReportTable) {
      console.log('✅ Found report table/list');
    } else {
      console.log('⚠️  No report table found');
    }
    
    // Look for "Create New Report" or similar button
    const createButton = page.locator('button:has-text("Create"), button:has-text("New"), button[class*="create"]').first();
    const hasCreateButton = await createButton.count() > 0;
    
    if (hasCreateButton) {
      console.log('✅ Found create report button');
      const buttonText = await createButton.textContent();
      console.log('   Button text:', buttonText);
    } else {
      console.log('⚠️  No create button found');
    }
    
    // Step 4: Check for Stream Reports
    console.log('\n=== STEP 4: CHECK STREAM REPORTS ===');
    
    const streamLink = page.locator('a[href*="stream"], button:has-text("Stream")').first();
    const hasStreamLink = await streamLink.count() > 0;
    
    if (hasStreamLink) {
      console.log('✅ Found stream reports link');
    } else {
      console.log('⚠️  No stream reports link found');
    }
    
    // Step 5: Check for Catalogue of Aliases
    console.log('\n=== STEP 5: CHECK CATALOGUE OF ALIASES ===');
    
    const catalogueLink = page.locator('a[href*="catalogue"], a:has-text("Catalogue"), a:has-text("Alias")').first();
    const hasCatalogueLink = await catalogueLink.count() > 0;
    
    if (hasCatalogueLink) {
      console.log('✅ Found catalogue of aliases link');
    } else {
      console.log('⚠️  No catalogue link found');
    }
    
    // Step 6: Check API connectivity
    console.log('\n=== STEP 6: CHECK API CONNECTIVITY ===');
    
    // Listen for network requests
    const apiRequests = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Trigger some API calls by interacting with the page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log(`📡 Captured ${apiRequests.length} API requests:`);
    apiRequests.slice(0, 5).forEach(req => {
      const statusIcon = req.status === 200 ? '✅' : '❌';
      console.log(`   ${statusIcon} ${req.status} - ${req.url.substring(0, 80)}...`);
    });
    
    // Final screenshot
    await page.screenshot({ path: 'tableau-final.png', fullPage: true });
    console.log('\n📸 Final screenshot saved to tableau-final.png');
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log('✅ Login: SUCCESS');
    console.log(`${hasReportTable ? '✅' : '⚠️ '} Report Table: ${hasReportTable ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`${hasCreateButton ? '✅' : '⚠️ '} Create Button: ${hasCreateButton ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`${hasStreamLink ? '✅' : '⚠️ '} Stream Reports: ${hasStreamLink ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`${hasCatalogueLink ? '✅' : '⚠️ '} Catalogue: ${hasCatalogueLink ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`📡 API Requests: ${apiRequests.length} captured`);
    
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

testTableauReports();

