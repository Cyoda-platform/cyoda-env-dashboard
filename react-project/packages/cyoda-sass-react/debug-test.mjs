/**
 * Debug test to see what's actually rendering
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3009';

async function debugTest() {
  console.log('🔍 Debugging cyoda-sass-react application...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('Navigating to:', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Get page title
    const title = await page.title();
    console.log('\n📄 Page Title:', title);
    
    // Get current URL
    const url = page.url();
    console.log('🔗 Current URL:', url);
    
    // Get body HTML
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('\n📝 Body HTML (first 500 chars):');
    console.log(bodyHTML.substring(0, 500));
    console.log('...\n');
    
    // Check for React root
    const rootDiv = await page.locator('#root').count();
    console.log('React root (#root):', rootDiv > 0 ? '✓ Found' : '✗ Not found');
    
    // Get all text content
    const allText = await page.locator('body').textContent();
    console.log('\n📝 All visible text:');
    console.log(allText.substring(0, 300));
    console.log('...\n');
    
    // Check for common elements
    console.log('🔍 Looking for common elements:');
    
    const inputs = await page.locator('input').count();
    console.log(`  - Input fields: ${inputs}`);
    
    const buttons = await page.locator('button').count();
    console.log(`  - Buttons: ${buttons}`);
    
    const forms = await page.locator('form').count();
    console.log(`  - Forms: ${forms}`);
    
    const links = await page.locator('a').count();
    console.log(`  - Links: ${links}`);
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    console.log(`  - Headings: ${headings}`);
    
    // List all input types
    if (inputs > 0) {
      console.log('\n📋 Input fields found:');
      const inputElements = await page.locator('input').all();
      for (let i = 0; i < Math.min(inputElements.length, 10); i++) {
        const type = await inputElements[i].getAttribute('type');
        const placeholder = await inputElements[i].getAttribute('placeholder');
        const id = await inputElements[i].getAttribute('id');
        const name = await inputElements[i].getAttribute('name');
        console.log(`  ${i + 1}. type="${type}" placeholder="${placeholder}" id="${id}" name="${name}"`);
      }
    }
    
    // List all buttons
    if (buttons > 0) {
      console.log('\n🔘 Buttons found:');
      const buttonElements = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttonElements.length, 10); i++) {
        const text = await buttonElements[i].textContent();
        const type = await buttonElements[i].getAttribute('type');
        console.log(`  ${i + 1}. "${text?.trim()}" type="${type}"`);
      }
    }
    
    // Check for Ant Design classes
    const antClasses = await page.locator('[class*="ant-"]').count();
    console.log(`\n🎨 Ant Design elements: ${antClasses}`);
    
    // Check for errors in console
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    if (consoleMessages.length > 0) {
      console.log('\n📢 Console messages:');
      consoleMessages.forEach(msg => {
        console.log(`  [${msg.type}] ${msg.text}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved to debug-screenshot.png');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugTest().catch(console.error);

