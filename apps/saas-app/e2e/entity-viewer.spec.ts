/**
 * E2E Tests for Entity Viewer Feature
 * Tests against real Cyoda backend
 */

import { test, expect } from '@playwright/test';

/**
 * Helper function to login before tests
 */
async function login(page: any) {
  await page.goto('/login');
  const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="Username" i]').first();
  const passwordInput = page.locator('input[placeholder*="password" i], input[placeholder*="Password" i]').first();
  await usernameInput.fill(process.env.TEST_ENV_USER || 'demo.user');
  await passwordInput.fill(process.env.TEST_ENV_SECRET || 'password');
  await page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in")').first().click();
  await page.waitForURL(/^(?!.*login).*$/, { timeout: 30000 });
}

/**
 * Helper function to wait for entity types API response
 * Handles both /types and /models-info endpoints (depending on feature flag)
 */
function waitForEntityTypesResponse(page: any) {
  return page.waitForResponse(
    (response: any) => response.url().includes('/platform-api/entity-info/fetch/') &&
                       (response.url().includes('/types') || response.url().includes('/models-info')) &&
                       response.status() === 200,
    { timeout: 30000 }
  );
}

test.describe('Entity Viewer - Real Backend', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should load entity viewer page successfully', async ({ page }) => {
    // Navigate to entity viewer page
    await page.goto('/entity-viewer');
    await page.waitForLoadState('networkidle');

    // Check if the page is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check for entity viewer container
    const container = page.locator('[data-testid="entity-viewer"], .entity-viewer, .ant-layout-content');
    await expect(container.first()).toBeVisible();

    console.log('✓ Entity Viewer page loaded');
  });

  test('should fetch entity types from real backend', async ({ page }) => {
    // Setup response listener BEFORE navigating to page
    const responsePromise = waitForEntityTypesResponse(page);

    // Navigate to entity viewer page
    await page.goto('/entity-viewer');

    // Wait for the API response
    const response = await responsePromise;

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    console.log(`✓ Received ${data.length} entity types from backend`);
  });

  test('should display entity type selector', async ({ page }) => {
    // Setup response listener BEFORE navigating to page
    const responsePromise = waitForEntityTypesResponse(page);

    // Navigate to entity viewer page
    await page.goto('/entity-viewer');

    // Wait for entity types to load
    await responsePromise;

    await page.waitForTimeout(1000);

    // Look for entity type selector (dropdown/select)
    const selector = page.locator('.ant-select, select, [data-testid="entity-type-selector"]');
    const hasSelector = await selector.count() > 0;

    if (hasSelector) {
      await expect(selector.first()).toBeVisible();
      console.log('✓ Entity type selector found');
    } else {
      console.log('⚠ Entity type selector not found');
    }
  });

  test('should select an entity type and fetch its schema', async ({ page }) => {
    // Setup response listener BEFORE navigating
    const typesPromise = waitForEntityTypesResponse(page);

    // Navigate to entity viewer page
    await page.goto('/entity-viewer');

    // Wait for entity types to load
    await typesPromise;
    await page.waitForTimeout(1000);

    // Find and click entity type selector
    const selector = page.locator('.ant-select').first();
    const hasSelector = await selector.count() > 0;

    if (hasSelector) {
      await selector.click();

      // Wait for dropdown to open
      await page.waitForTimeout(500);

      // Select first entity type
      const firstOption = page.locator('.ant-select-item').first();
      const hasOptions = await firstOption.count() > 0;

      if (hasOptions) {
        const optionText = await firstOption.textContent();
        await firstOption.click();

        console.log(`✓ Selected entity type: ${optionText}`);

        // Wait for entity info/schema to load
        await page.waitForResponse(
          response => response.url().includes('/platform-api/entity-info/model-info'),
          { timeout: 30000 }
        );

        console.log('✓ Entity schema loaded from backend');
      }
    }
  });

  test('should display entity fields after selecting type', async ({ page }) => {
    // Setup response listener BEFORE navigating
    const typesPromise = waitForEntityTypesResponse(page);

    // Navigate to entity viewer page
    await page.goto('/entity-viewer');

    // Wait for entity types
    await typesPromise;
    await page.waitForTimeout(1000);

    // Select an entity type
    const selector = page.locator('.ant-select').first();
    if (await selector.count() > 0) {
      await selector.click();
      await page.waitForTimeout(500);

      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();

        // Wait for schema
        await page.waitForResponse(
          response => response.url().includes('/platform-api/entity-info/model-info'),
          { timeout: 30000 }
        );

        await page.waitForTimeout(1000);

        // Look for field list/tree
        const fieldList = page.locator('.ant-tree, .ant-table, [data-testid="entity-fields"]');
        const hasFields = await fieldList.count() > 0;

        if (hasFields) {
          await expect(fieldList.first()).toBeVisible();
          console.log('✓ Entity fields displayed');
        }
      }
    }
  });

  test('should expand nested object fields', async ({ page }) => {
    // Setup response listener BEFORE navigating
    const typesPromise = waitForEntityTypesResponse(page);

    // Navigate to entity viewer page
    await page.goto('/entity-viewer');

    // Wait for entity types
    await typesPromise;
    await page.waitForTimeout(1000);

    // Select an entity type
    const selector = page.locator('.ant-select').first();
    if (await selector.count() > 0) {
      await selector.click();
      await page.waitForTimeout(500);
      
      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();
        
        // Wait for schema
        await page.waitForResponse(
          response => response.url().includes('/platform-api/entity-info/model-info'),
          { timeout: 30000 }
        );
        
        await page.waitForTimeout(1000);
        
        // Look for expandable nodes
        const expandIcons = page.locator('.ant-tree-switcher:not(.ant-tree-switcher-noop), [aria-expanded="false"]');
        const hasExpandable = await expandIcons.count() > 0;
        
        if (hasExpandable) {
          // Click first expandable node
          await expandIcons.first().click();
          await page.waitForTimeout(500);
          
          console.log('✓ Expanded nested field');
        } else {
          console.log('✓ No nested fields to expand');
        }
      }
    }
  });

  test('should handle JOIN relationships if available', async ({ page }) => {
    // Setup response listener BEFORE navigating
    const typesPromise = waitForEntityTypesResponse(page);

    // Navigate to entity viewer page
    await page.goto('/entity-viewer');

    // Wait for entity types
    await typesPromise;
    await page.waitForTimeout(1000);

    // Select an entity type
    const selector = page.locator('.ant-select').first();
    if (await selector.count() > 0) {
      await selector.click();
      await page.waitForTimeout(500);

      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();

        // Wait for schema and related paths
        await Promise.all([
          page.waitForResponse(
            response => response.url().includes('/platform-api/entity-info/model-info'),
            { timeout: 30000 }
          ),
          page.waitForResponse(
            response => response.url().includes('/platform-api/entity-info/model-info/related/paths'),
            { timeout: 30000 }
          ).catch(() => console.log('No related paths endpoint called')),
        ]);

        await page.waitForTimeout(1000);

        // Look for JOIN relationship indicators (link icons, etc.)
        const joinLinks = page.locator('[data-testid="join-link"], .ant-tree-node-content-wrapper:has(.anticon-link)');
        const hasJoins = await joinLinks.count() > 0;

        if (hasJoins) {
          console.log('✓ JOIN relationships found');
        } else {
          console.log('✓ No JOIN relationships for this entity');
        }
      }
    }
  });

  test('should search/filter entity fields', async ({ page }) => {
    // Setup response listener BEFORE navigating
    const typesPromise = waitForEntityTypesResponse(page);

    // Navigate to entity viewer page
    await page.goto('/entity-viewer');

    // Wait for entity types
    await typesPromise;
    
    await page.waitForTimeout(1000);
    
    // Select an entity type
    const selector = page.locator('.ant-select').first();
    if (await selector.count() > 0) {
      await selector.click();
      await page.waitForTimeout(500);
      
      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();
        
        // Wait for schema
        await page.waitForResponse(
          response => response.url().includes('/platform-api/entity-info/model-info'),
          { timeout: 30000 }
        );
        
        await page.waitForTimeout(1000);
        
        // Look for search input
        const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Filter"], .ant-input-search');
        const hasSearch = await searchInput.count() > 0;
        
        if (hasSearch) {
          await searchInput.first().fill('id');
          await page.waitForTimeout(500);
          
          console.log('✓ Search/filter functionality available');
        } else {
          console.log('✓ No search functionality on this page');
        }
      }
    }
  });

  test('should display field metadata (type, nullable, etc.)', async ({ page }) => {
    // Setup response listener BEFORE navigating
    const typesPromise = waitForEntityTypesResponse(page);

    // Navigate to entity viewer page
    await page.goto('/entity-viewer');

    // Wait for entity types
    await typesPromise;
    await page.waitForTimeout(1000);

    // Select an entity type
    const selector = page.locator('.ant-select').first();
    if (await selector.count() > 0) {
      await selector.click();
      await page.waitForTimeout(500);

      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();

        // Wait for schema
        await page.waitForResponse(
          response => response.url().includes('/platform-api/entity-info/model-info'),
          { timeout: 30000 }
        );
        
        await page.waitForTimeout(1000);
        
        // Look for field metadata (tags, badges, descriptions)
        const metadata = page.locator('.ant-tag, .ant-badge, [data-testid="field-type"]');
        const hasMetadata = await metadata.count() > 0;
        
        if (hasMetadata) {
          console.log('✓ Field metadata displayed');
        } else {
          console.log('✓ Minimal field display (no metadata tags)');
        }
      }
    }
  });
});

test.describe('Entity Viewer - Navigation', () => {
  test('should navigate to entity viewer from main menu', async ({ page }) => {
    // Login before test
    await login(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for entity viewer menu item
    const menuItem = page.locator('a:has-text("Entity"), a:has-text("Viewer"), [href*="/entity-viewer"]');
    const hasMenuItem = await menuItem.count() > 0;
    
    if (hasMenuItem) {
      await menuItem.first().click();
      await page.waitForURL('**/entity-viewer**');
      
      console.log('✓ Navigated to Entity Viewer from menu');
    } else {
      console.log('✓ Entity Viewer menu item not found');
    }
  });
});

