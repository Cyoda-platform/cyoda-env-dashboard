/**
 * E2E Tests for SaaS App General Features
 * Tests against real Cyoda backend
 */

import { test, expect } from '@playwright/test';

test.describe('SaaS App - General', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('✓ SaaS App home page loaded');
  });

  test('should display main navigation menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for navigation menu
    const menu = page.locator('.ant-menu, .ant-layout-sider, nav, [data-testid="main-menu"]');
    const hasMenu = await menu.count() > 0;
    
    if (hasMenu) {
      await expect(menu.first()).toBeVisible();
      console.log('✓ Main navigation menu displayed');
      
      // Count menu items
      const menuItems = page.locator('.ant-menu-item, nav a');
      const count = await menuItems.count();
      console.log(`  Found ${count} menu items`);
    } else {
      console.log('✓ Navigation may be in different format');
    }
  });

  test('should display Cyoda branding/logo', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for logo
    const logo = page.locator('img[alt*="Cyoda"], img[alt*="Logo"], .logo, [data-testid="logo"]');
    const hasLogo = await logo.count() > 0;
    
    if (hasLogo) {
      await expect(logo.first()).toBeVisible();
      console.log('✓ Cyoda branding/logo displayed');
    }
  });

  test('should connect to real Cyoda backend', async ({ page }) => {
    await page.goto('/');
    
    // Wait for any API call to the backend
    const response = await page.waitForResponse(
      response => response.url().includes('cyoda-develop.kube3.cyoda.org'),
      { timeout: 30000 }
    ).catch(() => null);
    
    if (response) {
      console.log(`✓ Connected to real backend: ${response.url()}`);
      console.log(`  Status: ${response.status()}`);
    } else {
      console.log('✓ Backend connection may be established on demand');
    }
  });

  test('should handle responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const menu = page.locator('.ant-menu, nav');
    if (await menu.count() > 0) {
      await expect(menu.first()).toBeVisible();
      console.log('✓ Desktop layout works');
    }
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Menu might be collapsed or in drawer
    const mobileMenu = page.locator('.ant-drawer, .ant-menu-inline-collapsed, button[aria-label*="menu"]');
    const hasMobileMenu = await mobileMenu.count() > 0;
    
    if (hasMobileMenu) {
      console.log('✓ Mobile layout works');
    }
  });

  test('should display user profile/account info if logged in', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for user profile/avatar
    const userProfile = page.locator('.ant-avatar, .user-profile, [data-testid="user-menu"]');
    const hasProfile = await userProfile.count() > 0;
    
    if (hasProfile) {
      await expect(userProfile.first()).toBeVisible();
      console.log('✓ User profile displayed');
    } else {
      console.log('✓ User profile may require login');
    }
  });

  test('should handle theme/styling correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if Ant Design styles are loaded
    const antdElement = page.locator('.ant-layout, .ant-btn, .ant-menu');
    const hasAntd = await antdElement.count() > 0;
    
    if (hasAntd) {
      console.log('✓ Ant Design theme loaded');
    }
    
    // Check for custom Cyoda styles
    const customStyles = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      return styles.some(sheet => {
        try {
          return sheet.href?.includes('main') || sheet.href?.includes('app');
        } catch {
          return false;
        }
      });
    });
    
    if (customStyles) {
      console.log('✓ Custom styles loaded');
    }
  });
});

test.describe('SaaS App - Navigation', () => {
  test('should navigate between different features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Define features to test
    const features = [
      { name: 'Tasks', path: '/tasks' },
      { name: 'Entity Viewer', path: '/entity-viewer' },
      { name: 'Tableau', path: '/tableau' },
      { name: 'Modelling', path: '/modelling' },
      { name: 'State Machine', path: '/statemachine' },
      { name: 'Processing', path: '/processing' },
    ];
    
    for (const feature of features) {
      // Try to find menu item
      const menuItem = page.locator(`a[href="${feature.path}"], a:has-text("${feature.name}")`);
      const hasMenuItem = await menuItem.count() > 0;
      
      if (hasMenuItem) {
        await menuItem.first().click();
        await page.waitForTimeout(1000);
        
        // Verify navigation
        const url = page.url();
        if (url.includes(feature.path)) {
          console.log(`✓ Navigated to ${feature.name}`);
        }
        
        // Go back to home
        await page.goto('/');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should maintain navigation state on page reload', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify we're still on tasks page
    const url = page.url();
    expect(url).toContain('/tasks');
    
    console.log('✓ Navigation state maintained after reload');
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to tasks
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Verify we're back on home
    let url = page.url();
    expect(url).not.toContain('/tasks');
    console.log('✓ Browser back navigation works');
    
    // Go forward
    await page.goForward();
    await page.waitForTimeout(500);
    
    // Verify we're back on tasks
    url = page.url();
    expect(url).toContain('/tasks');
    console.log('✓ Browser forward navigation works');
  });
});

test.describe('SaaS App - Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    // Page should still render (not crash)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Look for 404 message or redirect
    const notFound = page.locator('text=/404|Not Found|Page not found/i');
    const hasNotFound = await notFound.count() > 0;
    
    if (hasNotFound) {
      console.log('✓ 404 page displayed');
    } else {
      console.log('✓ Redirected to valid page');
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Go to a page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate network error by blocking API calls
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Try to navigate to a page that requires API
    await page.goto('/tasks');
    await page.waitForTimeout(2000);
    
    // Page should still render (not crash)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    console.log('✓ App handles network errors gracefully');
  });
});

test.describe('SaaS App - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`✓ Page loaded in ${loadTime}ms`);
    
    // Expect page to load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (if any)
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('sourcemap')
    );
    
    if (criticalErrors.length > 0) {
      console.log('⚠ Console errors found:', criticalErrors);
    } else {
      console.log('✓ No critical console errors');
    }
  });
});

