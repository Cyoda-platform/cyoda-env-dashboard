#!/usr/bin/env node

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3008';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, error = null) {
  if (passed) {
    log(`  ✓ ${testName}`, colors.green);
  } else {
    log(`  ✗ ${testName}`, colors.red);
    if (error) {
      log(`    ${error.message}`, colors.yellow);
    }
  }
  return passed;
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let passedTests = 0;
  let failedTests = 0;
  const issues = [];
  
  function logIssue(page, severity, message) {
    issues.push({ page, severity, message });
  }
  
  log('\n🎭 Starting E2E Tests for Processing Manager\n', colors.cyan);
  
  // Test Suite 1: Home Page / Redirect
  log('📋 Test Suite: Home Page & Routing', colors.blue);
  
  try {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
    const success = response?.status() === 200;
    logTest('Should load the application', success) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should load the application', false, error);
    failedTests++;
  }
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const url = page.url();
    const redirected = url.includes('/processing-ui');
    logTest('Should redirect to /processing-ui', redirected) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should redirect to /processing-ui', false, error);
    failedTests++;
  }
  
  // Test Suite 2: Processing UI Home Page
  log('\n📋 Test Suite: Processing UI Home Page', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const h1Count = await page.locator('h1').count();
    const hasHeading = h1Count > 0;
    
    if (hasHeading) {
      const h1Text = await page.locator('h1').first().textContent();
      log(`    Found heading: "${h1Text}"`, colors.cyan);
    }
    
    logTest('Should have main heading', hasHeading) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should have main heading', false, error);
    failedTests++;
  }
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const pageContent = await page.content();
    const hasContent = pageContent.length > 1000;
    logTest('Should have substantial content', hasContent) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should have substantial content', false, error);
    failedTests++;
  }
  
  // Test Suite 3: Navigation & Routes
  log('\n📋 Test Suite: Navigation & Routes', colors.blue);
  
  const routes = [
    { path: '/processing-ui', name: 'Home' },
    { path: '/processing-ui/nodes', name: 'Nodes' },
    { path: '/404', name: '404 Page' },
  ];
  
  for (const route of routes) {
    try {
      const response = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 10000 });
      const success = response?.status() === 200;
      logTest(`Should load ${route.name} (${route.path})`, success) ? passedTests++ : failedTests++;
    } catch (error) {
      logTest(`Should load ${route.name} (${route.path})`, false, error);
      failedTests++;
    }
  }
  
  // Test Suite 4: Error Handling
  log('\n📋 Test Suite: Error Handling', colors.blue);
  
  try {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('DevTools')
    );
    
    const noCriticalErrors = criticalErrors.length === 0;
    
    if (!noCriticalErrors) {
      logIssue('Processing UI', 'error', `Console errors: ${criticalErrors.join(', ')}`);
    }
    
    logTest('Should not have critical console errors', noCriticalErrors) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should not have critical console errors', false, error);
    failedTests++;
  }
  
  // Test Suite 5: Responsive Design
  log('\n📋 Test Suite: Responsive Design', colors.blue);
  
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];
  
  for (const viewport of viewports) {
    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      
      const bodyVisible = await page.locator('body').isVisible();
      logTest(`Should work on ${viewport.name} viewport`, bodyVisible) ? passedTests++ : failedTests++;
    } catch (error) {
      logTest(`Should work on ${viewport.name} viewport`, false, error);
      failedTests++;
    }
  }
  
  // Test Suite 6: Performance
  log('\n📋 Test Suite: Performance', colors.blue);
  
  try {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    const performant = loadTime < 3000;
    logTest(`Should load within reasonable time (${loadTime}ms)`, performant) ? passedTests++ : failedTests++;
    
    if (!performant) {
      logIssue('Performance', 'warning', `Slow load time: ${loadTime}ms`);
    }
  } catch (error) {
    logTest('Should load within reasonable time', false, error);
    failedTests++;
  }
  
  // Test Suite 7: Accessibility
  log('\n📋 Test Suite: Accessibility', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const h1Count = await page.locator('h1').count();
    const hasProperHeading = h1Count >= 1;
    logTest('Should have proper heading hierarchy', hasProperHeading) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should have proper heading hierarchy', false, error);
    failedTests++;
  }
  
  // Test Suite 8: Check for Navigation/Menu
  log('\n📋 Test Suite: UI Components', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    
    // Check for common UI elements
    const hasNav = await page.locator('nav, .ant-menu, header').count() > 0;
    const hasButtons = await page.locator('button').count() > 0;
    const hasLinks = await page.locator('a').count() > 0;
    
    const hasUIElements = hasNav || hasButtons || hasLinks;
    
    if (hasNav) log('    Found navigation elements', colors.cyan);
    if (hasButtons) log('    Found buttons', colors.cyan);
    if (hasLinks) log('    Found links', colors.cyan);
    
    logTest('Should have interactive UI elements', hasUIElements) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should have interactive UI elements', false, error);
    failedTests++;
  }
  
  await browser.close();
  
  // Print Summary
  log('\n============================================================', colors.cyan);
  log('📊 Test Summary', colors.cyan);
  log('============================================================', colors.cyan);
  log(`Total Tests: ${passedTests + failedTests}`, colors.blue);
  log(`Passed: ${passedTests}`, colors.green);
  log(`Failed: ${failedTests}`, failedTests > 0 ? colors.red : colors.green);
  
  if (issues.length > 0) {
    log(`\n⚠️  Issues Found: ${issues.length}`, colors.yellow);
    issues.forEach(issue => {
      const color = issue.severity === 'error' ? colors.red : 
                    issue.severity === 'warning' ? colors.yellow : colors.blue;
      log(`  [${issue.severity.toUpperCase()}] ${issue.page}: ${issue.message}`, color);
    });
  }
  
  log('============================================================\n', colors.cyan);
  
  process.exit(failedTests > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});

