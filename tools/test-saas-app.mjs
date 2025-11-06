#!/usr/bin/env node

/**
 * Playwright test script for Cyoda SaaS React application
 * Tests the application and identifies any issues
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
  log('\n🚀 Cyoda SaaS React Application Tests', colors.cyan);
  log('=' .repeat(80), colors.cyan);
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Collect console messages and errors
  const consoleMessages = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    logIssue('JavaScript', 'critical', `Page error: ${error.message}`);
  });
  
  try {
    // Test 1: Application loads
    log('\n📋 Test Suite 1: Application Loading', colors.blue);
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
      logTest('Application loads successfully', true);
    } catch (error) {
      logTest('Application loads successfully', false, error);
      logIssue('Application', 'critical', 'Failed to load application');
    }
    
    // Take initial screenshot
    await page.screenshot({ path: 'react-project/saas-app-initial.png', fullPage: true });
    log('  📸 Screenshot saved: saas-app-initial.png', colors.cyan);
    
    // Test 2: Check page title
    try {
      const title = await page.title();
      logTest(`Page has title: "${title}"`, title.length > 0);
      if (!title || title === 'Vite App') {
        logIssue('Page Title', 'warning', 'Using default Vite title');
      }
    } catch (error) {
      logTest('Page has title', false, error);
    }
    
    // Test 3: Check for React root
    try {
      const root = await page.locator('#root').count();
      logTest('React root element exists', root > 0);
      if (root === 0) {
        logIssue('React', 'critical', 'No #root element found');
      }
    } catch (error) {
      logTest('React root element exists', false, error);
    }
    
    // Test 4: Check for main content
    log('\n📋 Test Suite 2: Content Verification', colors.blue);
    
    try {
      const bodyText = await page.locator('body').textContent();
      logTest('Page has content', bodyText && bodyText.trim().length > 0);
      
      // Check for common UI elements
      const hasButtons = await page.locator('button').count();
      logTest(`Found ${hasButtons} button(s)`, hasButtons > 0);
      
      const hasInputs = await page.locator('input').count();
      logTest(`Found ${hasInputs} input(s)`, hasInputs >= 0);
      
      const hasLinks = await page.locator('a').count();
      logTest(`Found ${hasLinks} link(s)`, hasLinks >= 0);
    } catch (error) {
      logTest('Page has content', false, error);
    }
    
    // Test 5: Check for navigation/header
    try {
      const header = await page.locator('header, nav, .header, .navbar, .ant-layout-header').count();
      logTest('Has navigation/header element', header > 0);
      if (header === 0) {
        logIssue('Navigation', 'warning', 'No header or navigation found');
      }
    } catch (error) {
      logTest('Has navigation/header element', false, error);
    }
    
    // Test 6: Check for Ant Design components
    log('\n📋 Test Suite 3: UI Framework Check', colors.blue);
    
    try {
      const antComponents = await page.locator('[class*="ant-"]').count();
      logTest(`Found ${antComponents} Ant Design component(s)`, antComponents > 0);
      if (antComponents === 0) {
        logIssue('UI Framework', 'warning', 'No Ant Design components detected');
      }
    } catch (error) {
      logTest('Ant Design components present', false, error);
    }
    
    // Test 7: Check for console errors
    log('\n📋 Test Suite 4: Console & Errors', colors.blue);
    
    await page.waitForTimeout(2000); // Wait for any async errors
    
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
        logIssue('Console', 'critical', err);
      });
      if (criticalErrors.length > 5) {
        log(`    ... and ${criticalErrors.length - 5} more errors`, colors.red);
      }
    }
    
    // Test 8: Check for specific SaaS features
    log('\n📋 Test Suite 5: SaaS Features', colors.blue);
    
    try {
      // Look for schema-related content
      const bodyText = await page.locator('body').textContent();
      const hasSchemaContent = bodyText.toLowerCase().includes('schema') || 
                               bodyText.toLowerCase().includes('table') ||
                               bodyText.toLowerCase().includes('database');
      logTest('Has schema/database related content', hasSchemaContent);
      
      // Check for forms
      const forms = await page.locator('form, .ant-form').count();
      logTest(`Found ${forms} form(s)`, forms >= 0);
      
    } catch (error) {
      logTest('SaaS features check', false, error);
    }
    
    // Test 9: Try to interact with the page
    log('\n📋 Test Suite 6: Interactivity', colors.blue);
    
    try {
      // Try to find and click a button
      const buttons = await page.locator('button').all();
      if (buttons.length > 0) {
        logTest('Page has interactive buttons', true);
        
        // Try clicking the first visible button
        try {
          const firstButton = buttons[0];
          const isVisible = await firstButton.isVisible();
          if (isVisible) {
            const buttonText = await firstButton.textContent();
            await firstButton.click();
            await page.waitForTimeout(1000);
            logTest(`Clicked button: "${buttonText?.trim()}"`, true);
            
            // Take screenshot after interaction
            await page.screenshot({ path: 'react-project/saas-app-after-click.png', fullPage: true });
            log('  📸 Screenshot saved: saas-app-after-click.png', colors.cyan);
          }
        } catch (error) {
          logTest('Button interaction', false, error);
        }
      } else {
        logTest('Page has interactive buttons', false);
        logIssue('Interactivity', 'warning', 'No buttons found on page');
      }
    } catch (error) {
      logTest('Interactivity check', false, error);
    }
    
    // Test 10: Check routing (if applicable)
    log('\n📋 Test Suite 7: Routing', colors.blue);

    try {
      // Check for both traditional links and menu items
      const links = await page.locator('a[href]').all();
      const menuItems = await page.locator('.ant-menu-item, [role="menuitem"]').all();
      const totalNavElements = links.length + menuItems.length;

      if (totalNavElements > 0) {
        logTest(`Found ${totalNavElements} navigation element(s) (${links.length} links, ${menuItems.length} menu items)`, true);

        // Try clicking first menu item if available
        if (menuItems.length > 0) {
          try {
            const firstMenuItem = menuItems[0];
            const menuText = await firstMenuItem.textContent();
            await firstMenuItem.click();
            await page.waitForTimeout(1000);
            logTest(`Clicked menu item: "${menuText?.trim()}"`, true);

            // Take screenshot
            await page.screenshot({
              path: `react-project/saas-app-menu-navigation.png`,
              fullPage: true
            });
          } catch (error) {
            logTest('Menu navigation', false, error);
          }
        }

        // Try clicking first internal link if available
        for (const link of links.slice(0, 3)) {
          try {
            const href = await link.getAttribute('href');
            if (href && !href.startsWith('http') && href !== '#') {
              const linkText = await link.textContent();
              await link.click();
              await page.waitForTimeout(1000);
              logTest(`Navigated to: "${linkText?.trim()}" (${href})`, true);

              // Take screenshot
              await page.screenshot({
                path: `react-project/saas-app-route-${href.replace(/\//g, '-')}.png`,
                fullPage: true
              });
              break;
            }
          } catch (error) {
            // Continue to next link
          }
        }
      } else {
        logTest('Has navigation links or menu items', false);
        logIssue('Routing', 'warning', 'No navigation links or menu items found');
      }
    } catch (error) {
      logTest('Routing check', false, error);
    }
    
  } catch (error) {
    log(`\n❌ Fatal error during testing: ${error.message}`, colors.red);
    logIssue('Testing', 'critical', `Fatal error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Print summary
  log('\n' + '='.repeat(80), colors.cyan);
  log('📊 Test Summary', colors.cyan);
  log('='.repeat(80), colors.cyan);
  
  const total = testsPassed + testsFailed;
  const passRate = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0;
  
  log(`\nTotal Tests: ${total}`, colors.cyan);
  log(`Passed: ${testsPassed}`, colors.green);
  log(`Failed: ${testsFailed}`, colors.red);
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? colors.green : colors.yellow);
  
  if (failedTests.length > 0) {
    log('\n❌ Failed Tests:', colors.red);
    failedTests.forEach(test => log(`  - ${test}`, colors.red));
  }
  
  if (issues.length > 0) {
    log('\n⚠️  Issues Found:', colors.yellow);
    const critical = issues.filter(i => i.severity === 'critical');
    const warnings = issues.filter(i => i.severity === 'warning');
    const info = issues.filter(i => i.severity === 'info');
    
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
    
    if (info.length > 0) {
      log(`\n  Info (${info.length}):`, colors.cyan);
      info.forEach(issue => {
        log(`    - [${issue.component}] ${issue.description}`, colors.cyan);
      });
    }
  } else {
    log('\n✅ No issues found!', colors.green);
  }
  
  log('\n' + '='.repeat(80), colors.cyan);
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(error => {
  log(`\n💥 Unhandled error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

