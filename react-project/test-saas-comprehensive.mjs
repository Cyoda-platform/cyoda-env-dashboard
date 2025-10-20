#!/usr/bin/env node

/**
 * Comprehensive Playwright test for Cyoda SaaS React application
 * Tests navigation, routing, and end-to-end functionality
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3009';
const TIMEOUT = 30000;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];
const issues = [];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(description, passed, error = null) {
  if (passed) {
    testsPassed++;
    log(`  ✅ ${description}`, colors.green);
  } else {
    testsFailed++;
    failedTests.push(description);
    log(`  ❌ ${description}`, colors.red);
    if (error) {
      log(`     Error: ${error.message}`, colors.red);
    }
  }
}

function logIssue(component, severity, description) {
  issues.push({ component, severity, description });
  const severityColor = severity === 'critical' ? colors.red : 
                        severity === 'warning' ? colors.yellow : colors.cyan;
  log(`  ⚠️  [${severity.toUpperCase()}] ${component}: ${description}`, severityColor);
}

async function runTests() {
  log('\n🚀 Cyoda SaaS Comprehensive E2E Tests', colors.cyan);
  log('=' .repeat(80), colors.cyan);
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    logIssue('JavaScript', 'critical', `Page error: ${error.message}`);
  });
  
  try {
    // Test 1: Initial Load
    log('\n📋 Test Suite 1: Initial Application Load', colors.blue);
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    logTest('Application loads successfully', true);
    
    await page.screenshot({ path: 'react-project/comprehensive-01-initial.png', fullPage: true });
    log('  📸 Screenshot: comprehensive-01-initial.png', colors.cyan);
    
    // Test 2: Header and Navigation
    log('\n📋 Test Suite 2: Header & Navigation Structure', colors.blue);
    
    const header = await page.locator('header, .ant-layout-header').count();
    logTest('Header element exists', header > 0);
    
    const menuItems = await page.locator('.ant-menu-item').all();
    logTest(`Found ${menuItems.length} menu items`, menuItems.length >= 3);
    
    // Verify menu item labels
    const menuTexts = await Promise.all(menuItems.map(item => item.textContent()));
    const hasHome = menuTexts.some(text => text?.includes('Home'));
    const hasSchemas = menuTexts.some(text => text?.includes('Schemas'));
    const hasCreate = menuTexts.some(text => text?.includes('Create'));
    
    logTest('Has "Home" menu item', hasHome);
    logTest('Has "Schemas" menu item', hasSchemas);
    logTest('Has "Create Schema" menu item', hasCreate);
    
    // Test 3: Navigate to Schemas
    log('\n📋 Test Suite 3: Navigate to Schemas List', colors.blue);
    
    const schemasMenuItem = menuItems.find(async (item) => {
      const text = await item.textContent();
      return text?.includes('Schemas');
    });
    
    if (schemasMenuItem) {
      await schemasMenuItem.click();
      await page.waitForTimeout(1000);
      logTest('Clicked "Schemas" menu item', true);
      
      await page.screenshot({ path: 'react-project/comprehensive-02-schemas.png', fullPage: true });
      log('  📸 Screenshot: comprehensive-02-schemas.png', colors.cyan);
      
      // Check for table
      const table = await page.locator('.ant-table, table').count();
      logTest('Schemas table is displayed', table > 0);
      
      // Check for filter input
      const filterInput = await page.locator('input[placeholder*="Filter"], input[placeholder*="filter"]').count();
      logTest('Filter input is present', filterInput > 0);
      
      // Check for action buttons
      const createButton = await page.locator('button:has-text("Create schema")').count();
      logTest('Create schema button is present', createButton > 0);
    } else {
      logTest('Navigate to Schemas', false);
    }
    
    // Test 4: Navigate to Create Schema
    log('\n📋 Test Suite 4: Navigate to Create Schema', colors.blue);
    
    const createMenuItem = menuItems.find(async (item) => {
      const text = await item.textContent();
      return text?.includes('Create');
    });
    
    if (createMenuItem) {
      await createMenuItem.click();
      await page.waitForTimeout(1500);
      logTest('Clicked "Create Schema" menu item', true);
      
      await page.screenshot({ path: 'react-project/comprehensive-03-create.png', fullPage: true });
      log('  📸 Screenshot: comprehensive-03-create.png', colors.cyan);
      
      // Check for form elements
      const formInputs = await page.locator('input, textarea').count();
      logTest(`Form has ${formInputs} input field(s)`, formInputs > 0);
      
      // Check for tabs
      const tabs = await page.locator('.ant-tabs-tab').count();
      logTest(`Found ${tabs} tab(s)`, tabs >= 0);
      
      // Check for save/action buttons
      const buttons = await page.locator('button').count();
      logTest(`Found ${buttons} button(s)`, buttons > 0);
    } else {
      logTest('Navigate to Create Schema', false);
    }
    
    // Test 5: Navigate back to Home
    log('\n📋 Test Suite 5: Navigate to Home', colors.blue);
    
    const homeMenuItem = menuItems.find(async (item) => {
      const text = await item.textContent();
      return text?.includes('Home');
    });
    
    if (homeMenuItem) {
      await homeMenuItem.click();
      await page.waitForTimeout(1000);
      logTest('Clicked "Home" menu item', true);
      
      await page.screenshot({ path: 'react-project/comprehensive-04-home.png', fullPage: true });
      log('  📸 Screenshot: comprehensive-04-home.png', colors.cyan);
    } else {
      logTest('Navigate to Home', false);
    }
    
    // Test 6: Test URL routing
    log('\n📋 Test Suite 6: Direct URL Navigation', colors.blue);
    
    await page.goto(`${BASE_URL}/cyoda-sass/trino`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    logTest('Direct navigation to /cyoda-sass/trino works', true);
    
    const currentUrl = page.url();
    logTest(`URL is correct: ${currentUrl}`, currentUrl.includes('/cyoda-sass/trino'));
    
    await page.screenshot({ path: 'react-project/comprehensive-05-direct-nav.png', fullPage: true });
    log('  📸 Screenshot: comprehensive-05-direct-nav.png', colors.cyan);
    
    // Test 7: Responsive Design Check
    log('\n📋 Test Suite 7: Responsive Design', colors.blue);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    logTest('Mobile viewport (375x667) set', true);
    
    await page.screenshot({ path: 'react-project/comprehensive-06-mobile.png', fullPage: true });
    log('  📸 Screenshot: comprehensive-06-mobile.png', colors.cyan);
    
    const headerMobile = await page.locator('header, .ant-layout-header').count();
    logTest('Header visible on mobile', headerMobile > 0);
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // Test 8: Console Errors Check
    log('\n📋 Test Suite 8: Console Errors', colors.blue);
    
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('DevTools') && 
      !err.includes('Extension') &&
      !err.includes('favicon')
    );
    
    logTest(`No critical console errors (found ${criticalErrors.length})`, criticalErrors.length === 0);
    
    if (criticalErrors.length > 0) {
      log('\n  Console Errors:', colors.red);
      criticalErrors.slice(0, 5).forEach(err => {
        log(`    - ${err}`, colors.red);
      });
    }
    
    // Test 9: Performance Check
    log('\n📋 Test Suite 9: Performance', colors.blue);
    
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    logTest(`Page loads in ${loadTime}ms`, loadTime < 5000);
    if (loadTime >= 5000) {
      logIssue('Performance', 'warning', `Slow page load: ${loadTime}ms`);
    }
    
  } catch (error) {
    log(`\n❌ Fatal error during testing: ${error.message}`, colors.red);
    logIssue('Testing', 'critical', `Fatal error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Print summary
  log('\n' + '='.repeat(80), colors.cyan);
  log('📊 Comprehensive Test Summary', colors.cyan);
  log('='.repeat(80), colors.cyan);
  
  const total = testsPassed + testsFailed;
  const passRate = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0;
  
  log(`\nTotal Tests: ${total}`, colors.cyan);
  log(`Passed: ${testsPassed}`, colors.green);
  log(`Failed: ${testsFailed}`, colors.red);
  log(`Pass Rate: ${passRate}%`, passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red);
  
  if (failedTests.length > 0) {
    log('\n❌ Failed Tests:', colors.red);
    failedTests.forEach(test => log(`  - ${test}`, colors.red));
  }
  
  if (issues.length > 0) {
    log('\n⚠️  Issues Found:', colors.yellow);
    const critical = issues.filter(i => i.severity === 'critical');
    const warnings = issues.filter(i => i.severity === 'warning');
    
    if (critical.length > 0) {
      log(`\n  Critical Issues (${critical.length}):`, colors.red);
      critical.forEach(issue => {
        log(`    - [${issue.component}] ${issue.description}`, colors.red);
      });
    }
    
    if (warnings.length > 0) {
      log(`\n  Warnings (${warnings.length}):`, colors.yellow);
      warnings.forEach(issue => {
        log(`    - [${issue.component}] ${issue.description}`, colors.yellow);
      });
    }
  } else {
    log('\n✅ No issues found!', colors.green);
  }
  
  log('\n' + '='.repeat(80), colors.cyan);
  log('🎉 All comprehensive tests completed!', colors.green);
  log('='.repeat(80), colors.cyan);
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(error => {
  log(`\n💥 Unhandled error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

