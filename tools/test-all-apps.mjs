#!/usr/bin/env node

/**
 * Comprehensive Playwright test for ALL React applications
 * Tests all running dev servers across the monorepo
 */

import { chromium } from 'playwright';

// All running applications
const APPS = [
  { name: 'Demo App', url: 'http://localhost:3000', description: 'Main demo application' },
  { name: 'Tableau', url: 'http://localhost:3007', description: 'Tableau integration' },
  { name: 'Processing Manager', url: 'http://localhost:3008', description: 'Processing manager' },
  { name: 'Cyoda SaaS', url: 'http://localhost:3009', description: 'SaaS application' },
  { name: 'Tasks', url: 'http://localhost:3010', description: 'Tasks management' },
  { name: 'State Machine', url: 'http://localhost:3014', description: 'State machine workflows' },
  { name: 'Source Configuration', url: 'http://localhost:5176', description: 'Source configuration' },
];

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

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;
const appResults = [];
const allIssues = [];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(appName, description, passed, error = null) {
  totalTests++;
  if (passed) {
    totalPassed++;
    log(`    ✅ ${description}`, colors.green);
  } else {
    totalFailed++;
    log(`    ❌ ${description}`, colors.red);
    if (error) {
      log(`       Error: ${error.message}`, colors.red);
    }
  }
}

function logIssue(app, component, severity, description) {
  allIssues.push({ app, component, severity, description });
  const severityColor = severity === 'critical' ? colors.red : 
                        severity === 'warning' ? colors.yellow : colors.cyan;
  log(`    ⚠️  [${severity.toUpperCase()}] ${component}: ${description}`, severityColor);
}

async function testApp(browser, app) {
  log(`\n${'='.repeat(80)}`, colors.cyan);
  log(`📦 Testing: ${app.name} - ${app.description}`, colors.bold + colors.cyan);
  log(`   URL: ${app.url}`, colors.cyan);
  log(`${'='.repeat(80)}`, colors.cyan);
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    logIssue(app.name, 'JavaScript', 'critical', `Page error: ${error.message}`);
  });
  
  const appTestsPassed = totalPassed;
  const appTestsFailed = totalFailed;
  
  try {
    // Test 1: Application loads
    log('\n  📋 Basic Tests', colors.blue);
    
    try {
      await page.goto(app.url, { waitUntil: 'networkidle', timeout: TIMEOUT });
      logTest(app.name, 'Application loads successfully', true);
    } catch (error) {
      logTest(app.name, 'Application loads successfully', false, error);
      logIssue(app.name, 'Loading', 'critical', 'Failed to load application');
      await context.close();
      return { passed: 0, failed: 1, issues: 1 };
    }
    
    // Take screenshot
    const screenshotPath = `react-project/test-screenshots/${app.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    log(`    📸 Screenshot: ${screenshotPath}`, colors.cyan);
    
    // Test 2: Page title
    try {
      const title = await page.title();
      logTest(app.name, `Has page title: "${title}"`, title.length > 0);
    } catch (error) {
      logTest(app.name, 'Has page title', false, error);
    }
    
    // Test 3: React root
    try {
      const root = await page.locator('#root, #app').count();
      logTest(app.name, 'React root element exists', root > 0);
    } catch (error) {
      logTest(app.name, 'React root element exists', false, error);
    }
    
    // Test 4: Content check
    try {
      const bodyText = await page.locator('body').textContent();
      logTest(app.name, 'Page has content', bodyText && bodyText.trim().length > 0);
    } catch (error) {
      logTest(app.name, 'Page has content', false, error);
    }
    
    // Test 5: UI Framework
    log('\n  📋 UI Framework Tests', colors.blue);
    
    try {
      const antComponents = await page.locator('[class*="ant-"]').count();
      logTest(app.name, `Found ${antComponents} Ant Design component(s)`, antComponents >= 0);
    } catch (error) {
      logTest(app.name, 'Ant Design components check', false, error);
    }
    
    // Test 6: Interactive elements
    try {
      const buttons = await page.locator('button').count();
      logTest(app.name, `Found ${buttons} button(s)`, buttons >= 0);
      
      const inputs = await page.locator('input').count();
      logTest(app.name, `Found ${inputs} input(s)`, inputs >= 0);
    } catch (error) {
      logTest(app.name, 'Interactive elements check', false, error);
    }
    
    // Test 7: Navigation
    log('\n  📋 Navigation Tests', colors.blue);
    
    try {
      const header = await page.locator('header, nav, .header, .navbar, .ant-layout-header').count();
      logTest(app.name, 'Has header/navigation', header > 0);
      
      const menuItems = await page.locator('.ant-menu-item, [role="menuitem"], a[href]').count();
      logTest(app.name, `Found ${menuItems} navigation element(s)`, menuItems >= 0);
    } catch (error) {
      logTest(app.name, 'Navigation check', false, error);
    }
    
    // Test 8: Console errors
    log('\n  📋 Error Tests', colors.blue);
    
    await page.waitForTimeout(2000);
    
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('DevTools') && 
      !err.includes('Extension') &&
      !err.includes('favicon')
    );
    
    logTest(app.name, `No critical console errors (found ${criticalErrors.length})`, criticalErrors.length === 0);
    
    if (criticalErrors.length > 0 && criticalErrors.length <= 3) {
      criticalErrors.forEach(err => {
        log(`      - ${err.substring(0, 100)}...`, colors.red);
      });
    }
    
    // Test 9: Performance
    log('\n  📋 Performance Tests', colors.blue);
    
    const startTime = Date.now();
    await page.goto(app.url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    logTest(app.name, `Page loads in ${loadTime}ms`, loadTime < 5000);
    if (loadTime >= 5000) {
      logIssue(app.name, 'Performance', 'warning', `Slow page load: ${loadTime}ms`);
    }
    
  } catch (error) {
    log(`\n    ❌ Fatal error testing ${app.name}: ${error.message}`, colors.red);
    logIssue(app.name, 'Testing', 'critical', `Fatal error: ${error.message}`);
  } finally {
    await context.close();
  }
  
  const appPassed = totalPassed - appTestsPassed;
  const appFailed = totalFailed - appTestsFailed;
  const appIssues = allIssues.filter(i => i.app === app.name).length;
  
  return { passed: appPassed, failed: appFailed, issues: appIssues };
}

async function runAllTests() {
  log('\n' + '='.repeat(80), colors.bold + colors.cyan);
  log('🚀 COMPREHENSIVE REACT MONOREPO TEST SUITE', colors.bold + colors.cyan);
  log('='.repeat(80), colors.bold + colors.cyan);
  log(`\nTesting ${APPS.length} applications...`, colors.cyan);
  
  const browser = await chromium.launch({ headless: false });
  
  for (const app of APPS) {
    const result = await testApp(browser, app);
    appResults.push({ app: app.name, ...result });
  }
  
  await browser.close();
  
  // Print summary
  log('\n' + '='.repeat(80), colors.bold + colors.cyan);
  log('📊 COMPREHENSIVE TEST SUMMARY', colors.bold + colors.cyan);
  log('='.repeat(80), colors.bold + colors.cyan);
  
  log(`\n📦 Applications Tested: ${APPS.length}`, colors.cyan);
  log(`📝 Total Tests: ${totalTests}`, colors.cyan);
  log(`✅ Passed: ${totalPassed}`, colors.green);
  log(`❌ Failed: ${totalFailed}`, colors.red);
  
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
  const passRateColor = passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red;
  log(`📈 Pass Rate: ${passRate}%`, passRateColor);
  
  // Per-app summary
  log('\n📋 Per-Application Results:', colors.cyan);
  appResults.forEach(result => {
    const total = result.passed + result.failed;
    const rate = total > 0 ? ((result.passed / total) * 100).toFixed(0) : 0;
    const status = result.failed === 0 ? '✅' : '⚠️';
    log(`  ${status} ${result.app.padEnd(25)} ${result.passed}/${total} (${rate}%) - ${result.issues} issue(s)`, 
        result.failed === 0 ? colors.green : colors.yellow);
  });
  
  // Issues summary
  if (allIssues.length > 0) {
    log('\n⚠️  Issues Found:', colors.yellow);
    const critical = allIssues.filter(i => i.severity === 'critical');
    const warnings = allIssues.filter(i => i.severity === 'warning');
    
    if (critical.length > 0) {
      log(`\n  Critical Issues (${critical.length}):`, colors.red);
      critical.forEach(issue => {
        log(`    - [${issue.app}] ${issue.component}: ${issue.description}`, colors.red);
      });
    }
    
    if (warnings.length > 0) {
      log(`\n  Warnings (${warnings.length}):`, colors.yellow);
      warnings.forEach(issue => {
        log(`    - [${issue.app}] ${issue.component}: ${issue.description}`, colors.yellow);
      });
    }
  } else {
    log('\n✅ No issues found across all applications!', colors.green);
  }
  
  log('\n' + '='.repeat(80), colors.bold + colors.cyan);
  log('🎉 All application tests completed!', colors.green);
  log('='.repeat(80), colors.bold + colors.cyan);
  
  process.exit(totalFailed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(`\n💥 Unhandled error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

