#!/usr/bin/env node

/**
 * Detailed E2E Test Script for Demo App Pages
 * This script performs deep testing of each demo page
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
const issues = [];

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

function logIssue(page, severity, description) {
  issues.push({ page, severity, description });
  const color = severity === 'critical' ? colors.red : severity === 'warning' ? colors.yellow : colors.blue;
  log(`    [${severity.toUpperCase()}] ${description}`, color);
}

async function runTests() {
  log('\n🔍 Starting Detailed E2E Tests for Demo App\n', colors.cyan);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set default timeout
  page.setDefaultTimeout(TIMEOUT);
  
  // Track console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  try {
    // Test Suite 1: Home Page Deep Dive
    log('📋 Test Suite: Home Page Deep Dive', colors.blue);
    
    try {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Check for main sections
      const sections = await page.locator('section, .section, .ant-card').count();
      if (sections === 0) {
        logIssue('Home', 'warning', 'No clear sections found on home page');
      }
      
      logTest('Should have structured content sections', sections > 0);
    } catch (error) {
      logTest('Should have structured content sections', false, error);
    }
    
    try {
      await page.goto(BASE_URL);
      
      // Check for package information
      const hasHttpApi = await page.locator('text=/HTTP.*API/i').count() > 0;
      const hasTasks = await page.locator('text=/Tasks/i').count() > 0;
      const hasStateMachine = await page.locator('text=/State.*Machine/i').count() > 0;
      
      if (!hasHttpApi) logIssue('Home', 'warning', 'HTTP API package not mentioned');
      if (!hasTasks) logIssue('Home', 'warning', 'Tasks package not mentioned');
      if (!hasStateMachine) logIssue('Home', 'warning', 'State Machine package not mentioned');
      
      logTest('Should mention all migrated packages', hasHttpApi && hasTasks && hasStateMachine);
    } catch (error) {
      logTest('Should mention all migrated packages', false, error);
    }
    
    // Test Suite 2: Tasks Demo Page
    log('\n📋 Test Suite: Tasks Demo Page', colors.blue);
    
    try {
      await page.goto(`${BASE_URL}/tasks`);
      await page.waitForLoadState('networkidle');
      
      const h1 = await page.locator('h1').first().textContent();
      const hasTasksInTitle = h1?.toLowerCase().includes('task');
      
      if (!hasTasksInTitle) {
        logIssue('Tasks', 'warning', `Page title doesn't mention tasks: ${h1}`);
      }
      
      logTest('Should have Tasks-related heading', hasTasksInTitle);
    } catch (error) {
      logTest('Should have Tasks-related heading', false, error);
    }
    
    try {
      await page.goto(`${BASE_URL}/tasks`);
      
      // Check for features list
      const features = await page.locator('ul li, .ant-list-item').count();
      if (features === 0) {
        logIssue('Tasks', 'info', 'No features list found');
      }
      
      logTest(`Should display features list (${features} items)`, features > 0);
    } catch (error) {
      logTest('Should display features list', false, error);
    }
    
    try {
      await page.goto(`${BASE_URL}/tasks`);
      
      // Check for code examples or hooks mentioned
      const hasCodeExample = await page.locator('code, pre, .code-block').count() > 0;
      const mentionsHooks = await page.locator('text=/useTasks|useTask/i').count() > 0;
      
      if (!hasCodeExample && !mentionsHooks) {
        logIssue('Tasks', 'info', 'No code examples or hook references found');
      }
      
      logTest('Should show usage examples or hooks', hasCodeExample || mentionsHooks);
    } catch (error) {
      logTest('Should show usage examples or hooks', false, error);
    }
    
    // Test Suite 3: State Machine Demo Page
    log('\n📋 Test Suite: State Machine Demo Page', colors.blue);
    
    try {
      await page.goto(`${BASE_URL}/statemachine`);
      await page.waitForLoadState('networkidle');
      
      const h1 = await page.locator('h1').first().textContent();
      const hasStateMachineInTitle = h1?.toLowerCase().includes('state') || h1?.toLowerCase().includes('machine');
      
      if (!hasStateMachineInTitle) {
        logIssue('StateMachine', 'warning', `Page title doesn't mention state machine: ${h1}`);
      }
      
      logTest('Should have State Machine-related heading', hasStateMachineInTitle);
    } catch (error) {
      logTest('Should have State Machine-related heading', false, error);
    }
    
    try {
      await page.goto(`${BASE_URL}/statemachine`);
      
      // Check for workflow/instance mentions
      const mentionsWorkflow = await page.locator('text=/workflow/i').count() > 0;
      const mentionsInstance = await page.locator('text=/instance/i').count() > 0;
      
      if (!mentionsWorkflow && !mentionsInstance) {
        logIssue('StateMachine', 'info', 'No workflow or instance terminology found');
      }
      
      logTest('Should mention workflows or instances', mentionsWorkflow || mentionsInstance);
    } catch (error) {
      logTest('Should mention workflows or instances', false, error);
    }
    
    try {
      await page.goto(`${BASE_URL}/statemachine`);
      
      // Check for GraphicalStateMachine mention
      const mentionsGraphical = await page.locator('text=/graphical/i').count() > 0;
      const mentionsVisualization = await page.locator('text=/visualiz/i').count() > 0;
      
      logTest('Should mention graphical features', mentionsGraphical || mentionsVisualization);
    } catch (error) {
      logTest('Should mention graphical features', false, error);
    }
    
    // Test Suite 4: API Demo Page
    log('\n📋 Test Suite: API Demo Page', colors.blue);

    try {
      await page.goto(`${BASE_URL}/api-demo`);
      await page.waitForLoadState('networkidle');

      const h1 = await page.locator('h1').first().textContent();
      const hasApiInTitle = h1?.toLowerCase().includes('api');

      if (!hasApiInTitle) {
        logIssue('API', 'warning', `Page title doesn't mention API: ${h1}`);
      }

      logTest('Should have API-related heading', hasApiInTitle);
    } catch (error) {
      logTest('Should have API-related heading', false, error);
    }

    try {
      await page.goto(`${BASE_URL}/api-demo`);
      await page.waitForLoadState('networkidle');

      // Check for hooks list - look for code elements or text containing "use"
      const pageContent = await page.content();
      const mentionsHooks = pageContent.includes('useReports') ||
                           pageContent.includes('useLogin') ||
                           pageContent.includes('useEntities') ||
                           await page.locator('code').count() > 0;

      if (!mentionsHooks) {
        logIssue('API', 'info', 'No React hooks mentioned');
      }

      logTest('Should list API hooks', mentionsHooks);
    } catch (error) {
      logTest('Should list API hooks', false, error);
    }

    try {
      await page.goto(`${BASE_URL}/api-demo`);
      await page.waitForLoadState('networkidle');

      // Check for axios mention
      const pageContent = await page.content();
      const mentionsAxios = pageContent.toLowerCase().includes('axios');

      logTest('Should mention axios configuration', mentionsAxios);
    } catch (error) {
      logTest('Should mention axios configuration', false, error);
    }
    
    // Test Suite 5: Cross-Page Consistency
    log('\n📋 Test Suite: Cross-Page Consistency', colors.blue);
    
    const pages = ['/', '/tasks', '/statemachine', '/api-demo'];
    
    for (const pagePath of pages) {
      try {
        await page.goto(`${BASE_URL}${pagePath}`);
        await page.waitForLoadState('networkidle');
        
        // Check for consistent header
        const hasHeader = await page.locator('header, .app-header, .ant-layout-header').count() > 0;
        
        if (!hasHeader) {
          logIssue(pagePath, 'warning', 'No header found');
        }
        
        logTest(`${pagePath} - Should have header`, hasHeader);
      } catch (error) {
        logTest(`${pagePath} - Should have header`, false, error);
      }
    }
    
    for (const pagePath of pages) {
      try {
        await page.goto(`${BASE_URL}${pagePath}`);
        await page.waitForLoadState('networkidle');
        
        // Check for consistent footer
        const hasFooter = await page.locator('footer, .app-footer, .ant-layout-footer').count() > 0;
        
        if (!hasFooter) {
          logIssue(pagePath, 'info', 'No footer found');
        }
        
        logTest(`${pagePath} - Should have footer`, hasFooter);
      } catch (error) {
        logTest(`${pagePath} - Should have footer`, false, error);
      }
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
  
  if (issues.length > 0) {
    log(`\n⚠️  Issues Found: ${issues.length}`, colors.yellow);
    issues.forEach(({ page, severity, description }) => {
      const color = severity === 'critical' ? colors.red : severity === 'warning' ? colors.yellow : colors.blue;
      log(`  [${severity.toUpperCase()}] ${page}: ${description}`, color);
    });
  }
  
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

