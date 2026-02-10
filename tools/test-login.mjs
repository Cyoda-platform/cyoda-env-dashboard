import { chromium } from 'playwright';

async function testLogin() {
  console.log('🚀 Starting Playwright test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📱 Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input[type="text"], input[name="username"], input[placeholder*="username" i]', { timeout: 10000 });
    
    const testUser = process.env.TEST_ENV_USER || 'demo.user';
    const testSecret = process.env.TEST_ENV_SECRET || 'password';
    console.log(`✍️  Filling in username: ${testUser}`);
    const usernameInput = await page.locator('input[type="text"], input[name="username"], input[placeholder*="username" i]').first();
    await usernameInput.fill(testUser);

    console.log('✍️  Filling in password: ***');
    const passwordInput = await page.locator('input[type="password"]').first();
    await passwordInput.fill(testSecret);
    
    console.log('🔘 Clicking login button...');
    const loginButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    await loginButton.click();
    
    console.log('⏳ Waiting for navigation after login...');
    await page.waitForTimeout(3000);
    
    // Check if we're logged in by looking for common post-login elements
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Take a screenshot
    await page.screenshot({ path: 'login-result.png', fullPage: true });
    console.log('📸 Screenshot saved to login-result.png');
    
    // Check for error messages
    const errorElement = await page.locator('.ant-message-error, .error, [class*="error"]').first();
    const hasError = await errorElement.count() > 0;
    
    if (hasError) {
      const errorText = await errorElement.textContent();
      console.log('❌ Login failed with error:', errorText);
    } else {
      console.log('✅ Login appears successful!');
    }
    
    // Wait a bit to see the result
    console.log('⏳ Waiting 5 seconds to observe the result...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved to error-screenshot.png');
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

testLogin();

