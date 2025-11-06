#!/usr/bin/env node

/**
 * Playwright test script for Cyoda SaaS App on port 3000
 * Comprehensive testing with issue detection and fix loop
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
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
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

function logIssue(component, severity, description, details = null) {
  issues.push({ component, severity, description, details });
  const severityColor = severity === 'critical' ? colors.red : 
                        severity === 'warning' ? colors.yellow : colors.cyan;
  log(`  ⚠️  [${severity.toUpperCase()}] ${component}: ${description}`, severityColor);
  if (details) {
    log(`     Details: ${details}`, colors.cyan);
  }
}

async function runTests() {
  log('\n🚀 Cyoda SaaS App - Comprehensive E2E Tests (Port 3000)', colors.cyan);
  log('=' .repeat(80), colors.cyan);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // Slow down for better visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Collect console messages and errors
  const consoleMessages = [];
  const consoleErrors = [];
  const networkErrors = [];
  
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

  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    });
  });
  
  try {
    // Test Suite 1: Application Loading
    log('\n📋 Test Suite 1: Application Loading', colors.blue);
    
    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
      logTest('Application loads successfully', true);
    } catch (error) {
      logTest('Application loads successfully', false, error);
      logIssue('Application', 'critical', 'Failed to load application', error.message);
    }
    
    // Take initial screenshot
    await page.screenshot({ path: 'react-project/test-screenshots/saas-app-01-initial.png', fullPage: true });
    log('  📸 Screenshot: saas-app-01-initial.png', colors.cyan);
    
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

    // Test 4: Check for content rendering
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      const bodyText = await page.locator('body').textContent();
      logTest('Page has content', bodyText && bodyText.length > 0);
    } catch (error) {
      logTest('Page has content', false, error);
      logIssue('Rendering', 'critical', 'No content rendered in body');
    }

    // Test Suite 2: Navigation & Layout
    log('\n📋 Test Suite 2: Navigation & Layout', colors.blue);
    
    // Test 5: Check for header
    try {
      const header = await page.locator('header, .ant-layout-header').count();
      logTest('Header element exists', header > 0);
      if (header === 0) {
        logIssue('Layout', 'warning', 'No header element found');
      }
    } catch (error) {
      logTest('Header element exists', false, error);
    }

    // Test 6: Check for navigation menu
    try {
      const menu = await page.locator('.ant-menu, nav').count();
      logTest('Navigation menu exists', menu > 0);
      if (menu === 0) {
        logIssue('Navigation', 'warning', 'No navigation menu found');
      }
    } catch (error) {
      logTest('Navigation menu exists', false, error);
    }

    // Test 7: Check for menu items
    try {
      const menuItems = await page.locator('.ant-menu-item').all();
      logTest(`Found ${menuItems.length} menu items`, menuItems.length > 0);
      if (menuItems.length === 0) {
        logIssue('Navigation', 'warning', 'No menu items found');
      }
    } catch (error) {
      logTest('Menu items exist', false, error);
    }

    await page.screenshot({ path: 'react-project/test-screenshots/saas-app-02-layout.png', fullPage: true });
    log('  📸 Screenshot: saas-app-02-layout.png', colors.cyan);

    // Test Suite 3: Routing
    log('\n📋 Test Suite 3: Routing & Navigation', colors.blue);

    // Test 8: Check current URL
    try {
      const currentUrl = page.url();
      logTest(`Current URL: ${currentUrl}`, true);
      log(`     URL: ${currentUrl}`, colors.cyan);
    } catch (error) {
      logTest('Get current URL', false, error);
    }

    // Test 9: Try navigating to Trino
    try {
      const trinoLink = page.locator('a[href*="trino"], .ant-menu-item:has-text("Trino")').first();
      const trinoLinkCount = await trinoLink.count();
      
      if (trinoLinkCount > 0) {
        await trinoLink.click();
        await page.waitForTimeout(2000);
        const url = page.url();
        logTest('Navigate to Trino page', url.includes('trino'));
        await page.screenshot({ path: 'react-project/test-screenshots/saas-app-03-trino.png', fullPage: true });
        log('  📸 Screenshot: saas-app-03-trino.png', colors.cyan);
      } else {
        logTest('Navigate to Trino page', false);
        logIssue('Navigation', 'warning', 'Trino link not found');
      }
    } catch (error) {
      logTest('Navigate to Trino page', false, error);
      logIssue('Navigation', 'warning', 'Failed to navigate to Trino', error.message);
    }

    // Test 10: Try navigating to Tableau (nested under Reporting)
    try {
      // First, expand the Reporting submenu
      const reportingMenu = page.locator('.ant-menu-submenu:has-text("Reporting")').first();
      const reportingMenuCount = await reportingMenu.count();

      if (reportingMenuCount > 0) {
        // Click to expand the submenu
        await reportingMenu.click();
        await page.waitForTimeout(1000);

        // Now find and click the Report config editor link
        const tableauLink = page.locator('.ant-menu-item:has-text("Report config editor")').first();
        const tableauLinkCount = await tableauLink.count();

        if (tableauLinkCount > 0) {
          await tableauLink.click();
          await page.waitForTimeout(2000);
          const url = page.url();
          logTest('Navigate to Tableau Reports page', url.includes('tableau'));
          await page.screenshot({ path: 'react-project/test-screenshots/saas-app-04-tableau.png', fullPage: true });
          log('  📸 Screenshot: saas-app-04-tableau.png', colors.cyan);
        } else {
          logTest('Navigate to Tableau Reports page', false);
          logIssue('Navigation', 'warning', 'Tableau Report config editor link not found in submenu');
        }
      } else {
        logTest('Navigate to Tableau Reports page', false);
        logIssue('Navigation', 'warning', 'Reporting submenu not found');
      }
    } catch (error) {
      logTest('Navigate to Tableau Reports page', false, error);
      logIssue('Navigation', 'warning', 'Failed to navigate to Tableau', error.message);
    }

    // Test 11: Try navigating to Workflows (nested under Lifecycle)
    try {
      const lifecycleMenu = page.locator('.ant-menu-submenu:has-text("Lifecycle")').first();
      const lifecycleMenuCount = await lifecycleMenu.count();

      if (lifecycleMenuCount > 0) {
        await lifecycleMenu.click();
        await page.waitForTimeout(1000);

        const workflowLink = page.locator('.ant-menu-item:has-text("Workflow")').first();
        const workflowLinkCount = await workflowLink.count();

        if (workflowLinkCount > 0) {
          await workflowLink.click();
          await page.waitForTimeout(2000);
          const url = page.url();
          logTest('Navigate to Workflows page', url.includes('workflows'));
          await page.screenshot({ path: 'react-project/test-screenshots/saas-app-05-workflows.png', fullPage: true });
          log('  📸 Screenshot: saas-app-05-workflows.png', colors.cyan);
        } else {
          logTest('Navigate to Workflows page', false);
          logIssue('Navigation', 'warning', 'Workflow link not found in submenu');
        }
      } else {
        logTest('Navigate to Workflows page', false);
        logIssue('Navigation', 'warning', 'Lifecycle submenu not found');
      }
    } catch (error) {
      logTest('Navigate to Workflows page', false, error);
      logIssue('Navigation', 'warning', 'Failed to navigate to Workflows', error.message);
    }

    // Test 12: Try navigating to Tasks
    try {
      const tasksLink = page.locator('.ant-menu-item:has-text("Tasks")').first();
      const tasksLinkCount = await tasksLink.count();

      if (tasksLinkCount > 0) {
        await tasksLink.click();
        await page.waitForTimeout(2000);
        const url = page.url();
        logTest('Navigate to Tasks page', url.includes('tasks'));
        await page.screenshot({ path: 'react-project/test-screenshots/saas-app-06-tasks.png', fullPage: true });
        log('  📸 Screenshot: saas-app-06-tasks.png', colors.cyan);
      } else {
        logTest('Navigate to Tasks page', false);
        logIssue('Navigation', 'warning', 'Tasks link not found');
      }
    } catch (error) {
      logTest('Navigate to Tasks page', false, error);
      logIssue('Navigation', 'warning', 'Failed to navigate to Tasks', error.message);
    }

    // Test 13: Try navigating to Entity Viewer
    try {
      const entityViewerLink = page.locator('.ant-menu-item:has-text("Entity viewer")').first();
      const entityViewerLinkCount = await entityViewerLink.count();

      if (entityViewerLinkCount > 0) {
        await entityViewerLink.click();
        await page.waitForTimeout(2000);
        const url = page.url();
        logTest('Navigate to Entity Viewer page', url.includes('entity-viewer'));
        await page.screenshot({ path: 'react-project/test-screenshots/saas-app-07-entity-viewer.png', fullPage: true });
        log('  📸 Screenshot: saas-app-07-entity-viewer.png', colors.cyan);
      } else {
        logTest('Navigate to Entity Viewer page', false);
        logIssue('Navigation', 'warning', 'Entity viewer link not found');
      }
    } catch (error) {
      logTest('Navigate to Entity Viewer page', false, error);
      logIssue('Navigation', 'warning', 'Failed to navigate to Entity Viewer', error.message);
    }

    // Test 14: Try navigating to Processing
    try {
      const processingLink = page.locator('.ant-menu-item:has-text("Processing")').first();
      const processingLinkCount = await processingLink.count();

      if (processingLinkCount > 0) {
        await processingLink.click();
        await page.waitForTimeout(2000);
        const url = page.url();
        logTest('Navigate to Processing page', url.includes('processing-ui'));
        await page.screenshot({ path: 'react-project/test-screenshots/saas-app-08-processing.png', fullPage: true });
        log('  📸 Screenshot: saas-app-08-processing.png', colors.cyan);
      } else {
        logTest('Navigate to Processing page', false);
        logIssue('Navigation', 'warning', 'Processing link not found');
      }
    } catch (error) {
      logTest('Navigate to Processing page', false, error);
      logIssue('Navigation', 'warning', 'Failed to navigate to Processing', error.message);
    }

    // Test Suite 4: Console & Network Errors
    log('\n📋 Test Suite 4: Console & Network Errors', colors.blue);

    // Test 15: Check for console errors
    if (consoleErrors.length === 0) {
      logTest('No console errors', true);
    } else {
      logTest(`Found ${consoleErrors.length} console errors`, false);
      consoleErrors.forEach((error, index) => {
        logIssue('Console', 'warning', `Console error ${index + 1}`, error);
      });
    }

    // Test 16: Check for network errors
    if (networkErrors.length === 0) {
      logTest('No network errors', true);
    } else {
      logTest(`Found ${networkErrors.length} network errors`, false);
      networkErrors.forEach((error, index) => {
        logIssue('Network', 'warning', `Network error ${index + 1}`, `${error.url} - ${error.failure?.errorText || 'Unknown'}`);
      });
    }

    // Wait a bit to see final state
    await page.waitForTimeout(2000);
    
  } catch (error) {
    log(`\n❌ Fatal error during tests: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    // Summary
    log('\n' + '='.repeat(80), colors.cyan);
    log('📊 Test Summary', colors.bold + colors.cyan);
    log('='.repeat(80), colors.cyan);
    log(`✅ Tests Passed: ${testsPassed}`, colors.green);
    log(`❌ Tests Failed: ${testsFailed}`, colors.red);
    log(`⚠️  Issues Found: ${issues.length}`, colors.yellow);
    
    if (failedTests.length > 0) {
      log('\n❌ Failed Tests:', colors.red);
      failedTests.forEach(test => log(`  - ${test}`, colors.red));
    }
    
    if (issues.length > 0) {
      log('\n⚠️  Issues Detected:', colors.yellow);
      const criticalIssues = issues.filter(i => i.severity === 'critical');
      const warningIssues = issues.filter(i => i.severity === 'warning');
      const infoIssues = issues.filter(i => i.severity === 'info');
      
      if (criticalIssues.length > 0) {
        log(`\n🔴 Critical Issues (${criticalIssues.length}):`, colors.red);
        criticalIssues.forEach((issue, index) => {
          log(`  ${index + 1}. [${issue.component}] ${issue.description}`, colors.red);
          if (issue.details) log(`     ${issue.details}`, colors.cyan);
        });
      }
      
      if (warningIssues.length > 0) {
        log(`\n🟡 Warnings (${warningIssues.length}):`, colors.yellow);
        warningIssues.forEach((issue, index) => {
          log(`  ${index + 1}. [${issue.component}] ${issue.description}`, colors.yellow);
          if (issue.details) log(`     ${issue.details}`, colors.cyan);
        });
      }
      
      if (infoIssues.length > 0) {
        log(`\n🔵 Info (${infoIssues.length}):`, colors.cyan);
        infoIssues.forEach((issue, index) => {
          log(`  ${index + 1}. [${issue.component}] ${issue.description}`, colors.cyan);
          if (issue.details) log(`     ${issue.details}`, colors.cyan);
        });
      }
    }
    
    log('\n' + '='.repeat(80), colors.cyan);
    
    await browser.close();
    
    // Exit with appropriate code
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

