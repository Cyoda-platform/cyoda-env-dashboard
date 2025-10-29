#!/usr/bin/env node

import { chromium } from '@playwright/test';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

console.log('\n🎨 React Flow Workflow Visualization Test\n');
console.log('='.repeat(80));

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

// Collect console messages
const consoleMessages = [];
page.on('console', (msg) => {
  consoleMessages.push({ type: msg.type(), text: msg.text() });
  if (msg.type() === 'error') {
    console.log(`  ❌ Console Error: ${msg.text()}`);
  }
});

try {
  console.log('\n📋 Step 1: Loading Application');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('  ✅ Application loaded');

  // Wait for React to render
  await page.waitForTimeout(2000);

  console.log('\n📋 Step 2: Navigating to Workflows');
  
  // Try to find and click on Workflows menu item
  const workflowsLink = page.locator('text=/Workflows|Рабочие процессы/i').first();
  const workflowsExists = await workflowsLink.count() > 0;
  
  if (workflowsExists) {
    console.log('  ✅ Found Workflows menu item');
    await workflowsLink.click();
    await page.waitForTimeout(2000);
    console.log('  ✅ Clicked Workflows menu');
  } else {
    console.log('  ⚠️  Workflows menu not found, trying direct navigation');
    await page.goto(`${BASE_URL}/workflows`, { waitUntil: 'networkidle' });
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'react-project/test-screenshots/workflow-list.png', fullPage: true });
  console.log('  📸 Screenshot: workflow-list.png');

  console.log('\n📋 Step 3: Opening a Workflow');
  
  // Try to find a workflow item to click
  const workflowItem = page.locator('[class*="workflow"], [class*="table"] tr').first();
  const workflowExists = await workflowItem.count() > 0;
  
  if (workflowExists) {
    console.log('  ✅ Found workflow item');
    await workflowItem.click();
    await page.waitForTimeout(2000);
    console.log('  ✅ Clicked workflow item');
  } else {
    console.log('  ⚠️  No workflow items found, checking for create button');
  }

  await page.screenshot({ path: 'react-project/test-screenshots/workflow-detail.png', fullPage: true });
  console.log('  📸 Screenshot: workflow-detail.png');

  console.log('\n📋 Step 4: Checking for React Flow Elements');
  
  // Check for React Flow container
  const reactFlowContainer = page.locator('.react-flow, [class*="react-flow"]');
  const hasReactFlow = await reactFlowContainer.count() > 0;
  
  if (hasReactFlow) {
    console.log('  ✅ React Flow container found!');
    
    // Check for nodes
    const nodes = page.locator('.react-flow__node, [class*="state-node"]');
    const nodeCount = await nodes.count();
    console.log(`  ✅ Found ${nodeCount} node(s)`);
    
    // Check for edges
    const edges = page.locator('.react-flow__edge, [class*="transition-edge"]');
    const edgeCount = await edges.count();
    console.log(`  ✅ Found ${edgeCount} edge(s)`);
    
    // Check for controls
    const controls = page.locator('.react-flow__controls');
    const hasControls = await controls.count() > 0;
    console.log(`  ${hasControls ? '✅' : '❌'} React Flow controls: ${hasControls ? 'Found' : 'Not found'}`);
    
    // Check for minimap
    const minimap = page.locator('.react-flow__minimap');
    const hasMinimap = await minimap.count() > 0;
    console.log(`  ${hasMinimap ? '✅' : '❌'} React Flow minimap: ${hasMinimap ? 'Found' : 'Not found'}`);
    
    // Check for background
    const background = page.locator('.react-flow__background');
    const hasBackground = await background.count() > 0;
    console.log(`  ${hasBackground ? '✅' : '❌'} React Flow background: ${hasBackground ? 'Found' : 'Not found'}`);
    
  } else {
    console.log('  ❌ React Flow container NOT found');
    
    // Check for old Cytoscape container
    const cytoscapeContainer = page.locator('[id*="cy"], [class*="cytoscape"]');
    const hasCytoscape = await cytoscapeContainer.count() > 0;
    console.log(`  ${hasCytoscape ? '⚠️' : 'ℹ️'} Cytoscape container: ${hasCytoscape ? 'Found (old implementation)' : 'Not found'}`);
  }

  console.log('\n📋 Step 5: Checking for Custom Components');
  
  // Check for StateNode components
  const stateNodes = page.locator('[class*="state-node"]');
  const stateNodeCount = await stateNodes.count();
  console.log(`  ${stateNodeCount > 0 ? '✅' : '❌'} State nodes: ${stateNodeCount} found`);
  
  // Check for TransitionEdge components
  const transitionEdges = page.locator('[class*="transition-edge"]');
  const transitionEdgeCount = await transitionEdges.count();
  console.log(`  ${transitionEdgeCount > 0 ? '✅' : '❌'} Transition edges: ${transitionEdgeCount} found`);

  console.log('\n📋 Step 6: Checking for Panel Controls');
  
  // Check for fullscreen button
  const fullscreenBtn = page.locator('button[title*="Fullscreen"], button[title*="fullscreen"]');
  const hasFullscreenBtn = await fullscreenBtn.count() > 0;
  console.log(`  ${hasFullscreenBtn ? '✅' : '❌'} Fullscreen button: ${hasFullscreenBtn ? 'Found' : 'Not found'}`);
  
  // Check for minimap toggle button
  const minimapBtn = page.locator('button[title*="MiniMap"], button[title*="minimap"]');
  const hasMinimapBtn = await minimapBtn.count() > 0;
  console.log(`  ${hasMinimapBtn ? '✅' : '❌'} MiniMap toggle button: ${hasMinimapBtn ? 'Found' : 'Not found'}`);

  await page.screenshot({ path: 'react-project/test-screenshots/react-flow-graph.png', fullPage: true });
  console.log('  📸 Screenshot: react-flow-graph.png');

  console.log('\n📋 Step 7: Console Errors Check');
  const errors = consoleMessages.filter(m => m.type === 'error');
  const warnings = consoleMessages.filter(m => m.type === 'warning');
  
  console.log(`  ${errors.length === 0 ? '✅' : '❌'} Console errors: ${errors.length}`);
  console.log(`  ${warnings.length === 0 ? '✅' : '⚠️'} Console warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('\n  Error details:');
    errors.slice(0, 5).forEach(err => {
      console.log(`    - ${err.text}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test completed successfully!');
  console.log('='.repeat(80) + '\n');

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  await page.screenshot({ path: 'react-project/test-screenshots/error-screenshot.png', fullPage: true });
  console.log('📸 Error screenshot saved: error-screenshot.png\n');
} finally {
  await browser.close();
}

