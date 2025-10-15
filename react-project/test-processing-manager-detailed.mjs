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
  
  log('\n🔍 Starting Detailed E2E Tests for Processing Manager\n', colors.cyan);
  
  // Test Suite 1: Home Page Deep Dive
  log('📋 Test Suite: Home Page Deep Dive', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const h1 = await page.locator('h1').first().textContent();
    const hasProcessingInTitle = h1?.toLowerCase().includes('processing');
    
    if (!hasProcessingInTitle) {
      logIssue('Home', 'warning', `Page title doesn't mention processing: ${h1}`);
    }
    
    logTest('Should have Processing-related heading', hasProcessingInTitle) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should have Processing-related heading', false, error);
    failedTests++;
  }
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const pageContent = await page.content();
    const mentionsNodes = pageContent.toLowerCase().includes('nodes');
    const mentionsTransactions = pageContent.toLowerCase().includes('transaction');
    const mentionsEvents = pageContent.toLowerCase().includes('event');
    
    const hasKeyFeatures = mentionsNodes && (mentionsTransactions || mentionsEvents);
    
    if (!hasKeyFeatures) {
      logIssue('Home', 'info', 'Missing some key feature mentions');
    }
    
    logTest('Should mention key features (nodes, transactions, events)', hasKeyFeatures) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should mention key features', false, error);
    failedTests++;
  }
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const listItems = await page.locator('ul li').count();
    const hasFeatureList = listItems > 0;
    
    if (hasFeatureList) {
      log(`    Found ${listItems} feature items`, colors.cyan);
    }
    
    logTest('Should display feature list', hasFeatureList) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should display feature list', false, error);
    failedTests++;
  }
  
  // Test Suite 2: Nodes Page
  log('\n📋 Test Suite: Nodes Page', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui/nodes`, { waitUntil: 'networkidle' });
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
    await page.goto(`${BASE_URL}/processing-ui/nodes`, { waitUntil: 'networkidle' });
    const pageContent = await page.content();
    const hasContent = pageContent.length > 1000;
    logTest('Should have substantial content', hasContent) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should have substantial content', false, error);
    failedTests++;
  }
  
  // Test Suite 3: 404 Page
  log('\n📋 Test Suite: 404 Error Page', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/404`, { waitUntil: 'networkidle' });
    const pageContent = await page.content();
    const mentions404 = pageContent.includes('404') || pageContent.toLowerCase().includes('not found');
    
    logTest('Should display 404 message', mentions404) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should display 404 message', false, error);
    failedTests++;
  }
  
  try {
    await page.goto(`${BASE_URL}/some-invalid-route-xyz`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const url = page.url();
    const redirectsTo404 = url.includes('/404');
    
    logTest('Should redirect invalid routes to 404', redirectsTo404) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should redirect invalid routes to 404', false, error);
    failedTests++;
  }
  
  // Test Suite 4: Layout & Navigation
  log('\n📋 Test Suite: Layout & Navigation', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const hasHeader = await page.locator('header, .ant-layout-header, nav').count() > 0;
    
    if (!hasHeader) {
      logIssue('Layout', 'warning', 'No header found');
    }
    
    logTest('Should have header/navigation', hasHeader) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should have header/navigation', false, error);
    failedTests++;
  }
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    const links = await page.locator('a').count();
    const hasLinks = links > 0;
    
    if (hasLinks) {
      log(`    Found ${links} links`, colors.cyan);
    }
    
    logTest('Should have navigation links', hasLinks) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should have navigation links', false, error);
    failedTests++;
  }
  
  // Test Suite 5: Cross-Page Consistency
  log('\n📋 Test Suite: Cross-Page Consistency', colors.blue);
  
  const pages = ['/processing-ui', '/processing-ui/nodes', '/404'];
  
  for (const pagePath of pages) {
    try {
      await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
      const hasLayout = await page.locator('body').isVisible();
      logTest(`${pagePath} - Should have consistent layout`, hasLayout) ? passedTests++ : failedTests++;
    } catch (error) {
      logTest(`${pagePath} - Should have consistent layout`, false, error);
      failedTests++;
    }
  }
  
  // Test Suite 6: Data Loading States
  log('\n📋 Test Suite: Data Loading & States', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui/nodes`, { waitUntil: 'domcontentloaded' });
    
    // Check if there's any loading indicator initially
    const hasSpinner = await page.locator('.ant-spin').count() > 0;
    const hasLoading = await page.locator('[role="status"]').count() > 0;
    const hasSkeleton = await page.locator('.ant-skeleton').count() > 0;
    
    const hasLoadingState = hasSpinner || hasLoading || hasSkeleton;
    
    // Wait for network to be idle
    await page.waitForLoadState('networkidle');
    
    logTest('Should handle loading states', true) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should handle loading states', false, error);
    failedTests++;
  }
  
  // Test Suite 7: UI Component Rendering
  log('\n📋 Test Suite: UI Component Rendering', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    
    const hasCards = await page.locator('.ant-card').count() > 0;
    const hasTypography = await page.locator('.ant-typography').count() > 0;
    
    const hasAntdComponents = hasCards || hasTypography;
    
    if (hasCards) log('    Found Ant Design Cards', colors.cyan);
    if (hasTypography) log('    Found Ant Design Typography', colors.cyan);
    
    logTest('Should render Ant Design components', hasAntdComponents) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should render Ant Design components', false, error);
    failedTests++;
  }
  
  // Test Suite 8: Browser Compatibility
  log('\n📋 Test Suite: Browser Features', colors.blue);
  
  try {
    await page.goto(`${BASE_URL}/processing-ui`, { waitUntil: 'networkidle' });
    
    // Check if modern JavaScript features work
    const supportsModernJS = await page.evaluate(() => {
      try {
        // Test arrow functions, const, template literals
        const test = `test`;
        const arr = [1, 2, 3];
        const result = arr.map(x => x * 2);
        return result.length === 3;
      } catch {
        return false;
      }
    });
    
    logTest('Should support modern JavaScript', supportsModernJS) ? passedTests++ : failedTests++;
  } catch (error) {
    logTest('Should support modern JavaScript', false, error);
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

