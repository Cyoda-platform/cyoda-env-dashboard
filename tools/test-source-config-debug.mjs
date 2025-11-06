#!/usr/bin/env node

/**
 * Debug test for Source Configuration React app
 * Captures console logs and errors
 */

import { chromium } from 'playwright';

async function runDebugTest() {
  console.log('🔍 Starting Source Configuration Debug Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture all console messages
  const consoleLogs = [];
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push({ type, text });
    console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
  });
  
  // Capture page errors
  page.on('pageerror', (error) => {
    console.log('[PAGE ERROR]:', error.message);
  });
  
  // Capture request failures
  page.on('requestfailed', (request) => {
    console.log('[REQUEST FAILED]:', request.url(), request.failure()?.errorText);
  });
  
  try {
    console.log('Loading http://localhost:5176...\n');
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle' });
    
    console.log('\n⏳ Waiting 5 seconds for React to render...\n');
    await page.waitForTimeout(5000);
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'source-config-debug.png', fullPage: true });
    console.log('✅ Screenshot saved to source-config-debug.png\n');
    
    console.log('🔍 Inspecting DOM...\n');
    
    // Get HTML content
    const html = await page.content();
    console.log('HTML length:', html.length);
    
    // Check root element
    const rootHTML = await page.locator('#root').innerHTML();
    console.log('\n#root innerHTML:');
    console.log(rootHTML.substring(0, 500));
    console.log('...\n');
    
    // Check for React components
    const reactElements = await page.locator('[data-reactroot], [data-react-root]').count();
    console.log('React root elements:', reactElements);
    
    // Check for any divs
    const divs = await page.locator('div').count();
    console.log('Total divs:', divs);
    
    // Check for Ant Design
    const antdElements = await page.locator('[class*="ant-"]').count();
    console.log('Ant Design elements:', antdElements);
    
    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log('Buttons:', buttons);
    
    // Get all text content
    const bodyText = await page.locator('body').textContent();
    console.log('\nBody text content:');
    console.log(bodyText);
    
    console.log('\n\n📋 Console Log Summary:');
    console.log(`Total console messages: ${consoleLogs.length}`);
    
    const errors = consoleLogs.filter(log => log.type === 'error');
    const warnings = consoleLogs.filter(log => log.type === 'warning');
    const logs = consoleLogs.filter(log => log.type === 'log');
    
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    console.log(`Logs: ${logs.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.text}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.text}`);
      });
    }
    
    console.log('\n👀 Browser will stay open for 60 seconds for manual inspection...');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed. Debug test complete!');
  }
}

runDebugTest().catch(console.error);

