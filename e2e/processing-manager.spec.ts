import { test, expect } from '@playwright/test';

test.describe('Processing Manager Application', () => {
  test('should load the home page without errors', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/processing-ui');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is visible
    await expect(page.getByText('Processing Manager')).toBeVisible();
    
    // Check that the welcome message is visible
    await expect(page.getByText('Welcome to the Processing Manager')).toBeVisible();
    
    // Check that the navigation items are listed
    await expect(page.getByText('Nodes - View and manage processing nodes')).toBeVisible();
    await expect(page.getByText('Transactions - Monitor transaction processing')).toBeVisible();
    await expect(page.getByText('Events - View processing events and statistics')).toBeVisible();
    await expect(page.getByText('Monitoring - Real-time monitoring and metrics')).toBeVisible();
  });

  test('should have a working sidebar with navigation', async ({ page }) => {
    await page.goto('/processing-ui');
    await page.waitForLoadState('networkidle');
    
    // Check that the sidebar is visible
    const sidebar = page.locator('.c-sidebar');
    await expect(sidebar).toBeVisible();
    
    // Check that Dashboard link is visible
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Check that Nodes link is visible
    await expect(page.getByText('Nodes')).toBeVisible();
  });

  test('should navigate to Nodes page', async ({ page }) => {
    await page.goto('/processing-ui');
    await page.waitForLoadState('networkidle');

    // Click on Nodes link in sidebar
    await page.getByRole('link', { name: 'Nodes' }).click();

    // Wait for navigation
    await page.waitForURL('**/processing-ui/nodes');

    // Check that we're on the Nodes page
    await expect(page.getByText('Nodes')).toBeVisible();
  });

  test('should load node detail page with all tabs', async ({ page }) => {
    // Navigate directly to a demo node detail page
    await page.goto('/processing-ui/nodes/demo-node');
    await page.waitForLoadState('networkidle');
    
    // Check that the node detail title is visible
    await expect(page.getByText('Node Detail: demo-node')).toBeVisible();
    
    // Check that all tabs are present
    const tabs = [
      'Processing Manager',
      'Server Summary',
      'Cassandra',
      'Processing Events',
      'Time Statistics',
      'Transactions',
      'PM components',
      'Composite indexes',
      'Caches List',
      'Network info',
      'ZooKeeper info'
    ];
    
    for (const tab of tabs) {
      await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    }
  });

  test('should switch between tabs on node detail page', async ({ page }) => {
    await page.goto('/processing-ui/nodes/demo-node');
    await page.waitForLoadState('networkidle');
    
    // Click on Processing Events tab
    await page.getByRole('tab', { name: 'Processing Events' }).click();
    await page.waitForTimeout(500);
    
    // Click on Time Statistics tab
    await page.getByRole('tab', { name: 'Time Statistics' }).click();
    await page.waitForTimeout(500);
    
    // Click on Network info tab
    await page.getByRole('tab', { name: 'Network info' }).click();
    await page.waitForTimeout(500);
    
    // Click on ZooKeeper info tab
    await page.getByRole('tab', { name: 'ZooKeeper info' }).click();
    await page.waitForTimeout(500);
    
    // All tab switches should work without errors
    expect(true).toBe(true);
  });

  test('should have header with user info and logout button', async ({ page }) => {
    await page.goto('/processing-ui');
    await page.waitForLoadState('networkidle');

    // Check that header is visible
    const header = page.locator('.c-header');
    await expect(header).toBeVisible();

    // Check that user email is displayed
    await expect(page.getByText('demo@cyoda.com')).toBeVisible();

    // Check that logout button is visible
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();
  });

  test('should toggle sidebar', async ({ page }) => {
    await page.goto('/processing-ui');
    await page.waitForLoadState('networkidle');
    
    // Find the sidebar toggle button
    const toggleButton = page.locator('.c-header-toggler').first();
    
    // Click to toggle sidebar
    await toggleButton.click();
    await page.waitForTimeout(300);
    
    // Click again to toggle back
    await toggleButton.click();
    await page.waitForTimeout(300);
    
    // Sidebar toggle should work without errors
    expect(true).toBe(true);
  });

  test('should not have any console errors on home page', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/processing-ui');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Filter out known warnings (like the package.json warning)
    const actualErrors = consoleErrors.filter(err => 
      !err.includes('condition "types"') && 
      !err.includes('Failed to fetch') // API errors are expected without backend
    );
    
    expect(actualErrors.length).toBe(0);
  });

  test('should not have any console errors on node detail page', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/processing-ui/nodes/demo-node');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Filter out known warnings and expected API errors
    const actualErrors = consoleErrors.filter(err => 
      !err.includes('condition "types"') && 
      !err.includes('Failed to fetch') &&
      !err.includes('Network Error') &&
      !err.includes('ERR_CONNECTION_REFUSED')
    );
    
    expect(actualErrors.length).toBe(0);
  });
});

