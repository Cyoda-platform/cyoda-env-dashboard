#!/usr/bin/env node

/**
 * E2E Test Script for Demo App
 * This script tests the demo app using Playwright programmatically
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 30000;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name, passed, error = null) {
  if (passed) {
    testsPassed++;
    log(`  ✓ ${name}`, colors.green);
  } else {
    testsFailed++;
    failedTests.push({ name, error });
    log(`  ✗ ${name}`, colors.red);
    if (error) {
      log(`    Error: ${error.message}`, colors.red);
    }
  }
}

async function runTests() {
  log('\n🎭 Starting E2E Tests for Demo App\n', colors.cyan);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set default timeout
  page.setDefaultTimeout(TIMEOUT);
  
  try {
    // Test Suite 1: Home Page
    log('📋 Test Suite: Home Page', colors.blue);
    
    try {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      logTest('Should load the home page', true);
    } catch (error) {
      logTest('Should load the home page', false, error);
    }
    
    try {
      const title = await page.title();
      const hasCorrectTitle = title.includes('Cyoda') || title.includes('Demo');
      if (!hasCorrectTitle) throw new Error(`Title is: ${title}`);
      logTest('Should have correct page title', true);
    } catch (error) {
      logTest('Should have correct page title', false, error);
    }
    
    try {
      const h1 = await page.locator('h1').first();
      await h1.waitFor({ state: 'visible', timeout: 5000 });
      const text = await h1.textContent();
      if (!text) throw new Error('No h1 text found');
      logTest('Should display main heading', true);
    } catch (error) {
      logTest('Should display main heading', false, error);
    }
    
    try {
      const cards = await page.locator('.ant-card').count();
      if (cards === 0) throw new Error('No cards found');
      logTest(`Should display package cards (found ${cards})`, true);
    } catch (error) {
      logTest('Should display package cards', false, error);
    }
    
    // Test Suite 2: Navigation
    log('\n📋 Test Suite: Navigation', colors.blue);
    
    try {
      await page.goto(BASE_URL);
      const menu = await page.locator('.ant-menu, nav').first();
      await menu.waitFor({ state: 'visible', timeout: 5000 });
      logTest('Should display navigation menu', true);
    } catch (error) {
      logTest('Should display navigation menu', false, error);
    }
    
    // Test navigation links (Ant Design Menu)
    const navTests = [
      { name: 'Tasks', path: '/tasks', heading: 'Tasks' },
      { name: 'State Machine', path: '/statemachine', heading: 'State Machine' },
      { name: 'API Demo', path: '/api-demo', heading: 'API' },
    ];

    for (const navTest of navTests) {
      try {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Try to find and click the menu item (Ant Design uses li.ant-menu-item)
        const menuItem = page.locator(`.ant-menu-item:has-text("${navTest.name}")`).first();
        await menuItem.click({ timeout: 5000 });
        await page.waitForLoadState('networkidle');

        // Check URL or heading
        const url = page.url();
        const hasCorrectPath = url.includes(navTest.path);

        if (!hasCorrectPath) {
          throw new Error(`Expected path ${navTest.path}, got ${url}`);
        }

        logTest(`Should navigate to ${navTest.name} page`, true);
      } catch (error) {
        logTest(`Should navigate to ${navTest.name} page`, false, error);
      }
    }
    
    // Test Suite 3: Responsive Design
    log('\n📋 Test Suite: Responsive Design', colors.blue);
    
    try {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const h1 = await page.locator('h1').first();
      await h1.waitFor({ state: 'visible', timeout: 5000 });
      logTest('Should work on mobile viewport', true);
    } catch (error) {
      logTest('Should work on mobile viewport', false, error);
    }
    
    try {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const h1 = await page.locator('h1').first();
      await h1.waitFor({ state: 'visible', timeout: 5000 });
      logTest('Should work on tablet viewport', true);
    } catch (error) {
      logTest('Should work on tablet viewport', false, error);
    }
    
    try {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const h1 = await page.locator('h1').first();
      await h1.waitFor({ state: 'visible', timeout: 5000 });
      logTest('Should work on desktop viewport', true);
    } catch (error) {
      logTest('Should work on desktop viewport', false, error);
    }
    
    // Test Suite 4: Error Handling
    log('\n📋 Test Suite: Error Handling', colors.blue);
    
    try {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Filter out known acceptable errors
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('Failed to load resource') &&
        !error.includes('net::ERR_') &&
        !error.includes('favicon')
      );
      
      if (criticalErrors.length > 0) {
        throw new Error(`Found ${criticalErrors.length} console errors: ${criticalErrors.join(', ')}`);
      }
      
      logTest('Should not have critical console errors', true);
    } catch (error) {
      logTest('Should not have critical console errors', false, error);
    }
    
    // Test Suite 5: Performance
    log('\n📋 Test Suite: Performance', colors.blue);
    
    try {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 10000) {
        throw new Error(`Load time too slow: ${loadTime}ms`);
      }
      
      logTest(`Should load within reasonable time (${loadTime}ms)`, true);
    } catch (error) {
      logTest('Should load within reasonable time', false, error);
    }
    
    // Test Suite 6: Accessibility
    log('\n📋 Test Suite: Accessibility', colors.blue);
    
    try {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const h1Count = await page.locator('h1').count();
      if (h1Count === 0) throw new Error('No h1 found');
      logTest('Should have proper heading hierarchy', true);
    } catch (error) {
      logTest('Should have proper heading hierarchy', false, error);
    }
    
    try {
      await page.goto(BASE_URL);
      // Ant Design Menu is rendered as ul.ant-menu
      const nav = await page.locator('.ant-menu, nav, [role="navigation"]').count();
      if (nav === 0) throw new Error('No navigation found');
      logTest('Should have accessible navigation', true);
    } catch (error) {
      logTest('Should have accessible navigation', false, error);
    }
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    await browser.close();
  }
  
  // Print summary
  log('\n' + '='.repeat(60), colors.cyan);
  log('📊 Test Summary', colors.cyan);
  log('='.repeat(60), colors.cyan);
  log(`Total Tests: ${testsPassed + testsFailed}`, colors.blue);
  log(`Passed: ${testsPassed}`, colors.green);
  log(`Failed: ${testsFailed}`, testsFailed > 0 ? colors.red : colors.green);
  
  if (failedTests.length > 0) {
    log('\n❌ Failed Tests:', colors.red);
    failedTests.forEach(({ name, error }) => {
      log(`  - ${name}`, colors.red);
      if (error) {
        log(`    ${error.message}`, colors.yellow);
      }
    });
  }
  
  log('='.repeat(60) + '\n', colors.cyan);
  
  // Exit with appropriate code
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`\n💥 Unhandled error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

