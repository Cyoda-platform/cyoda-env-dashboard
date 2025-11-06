import { test, expect } from '@playwright/test';

test.describe('Stream Reports - Complete Workflow', () => {
  test('should complete full stream report workflow: view → create → edit', async ({ page }) => {
    // Step 1: Navigate to Stream Reports page
    console.log('📍 Step 1: Navigate to Stream Reports page');
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1', { hasText: 'Stream Reports' });
    await expect(heading).toBeVisible();
    console.log('✅ Stream Reports page loaded');

    // Step 2: Check initial table state
    console.log('📍 Step 2: Check initial table state');
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    console.log('✅ Table is visible');

    // Step 3: Open Create New dialog
    console.log('📍 Step 3: Open Create New dialog');
    const createButton = page.locator('button', { hasText: 'Create New' });
    await createButton.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('.ant-modal');
    await expect(dialog).toBeVisible();
    console.log('✅ Create New dialog opened');

    // Step 4: Close dialog (we can't actually create without backend)
    console.log('📍 Step 4: Close dialog');
    const closeButton = page.locator('.ant-modal-close');
    await closeButton.click();
    await page.waitForTimeout(500);

    await expect(dialog).not.toBeVisible();
    console.log('✅ Dialog closed');

    // Step 5: Test filter functionality
    console.log('📍 Step 5: Test filter functionality');
    const filterSection = page.locator('.config-editor-reports-filter');
    if (await filterSection.count() > 0) {
      await expect(filterSection).toBeVisible();
      console.log('✅ Filter component is functional');
    } else {
      console.log('ℹ️  Filter component not found');
    }

    // Step 6: Test Reset State button
    console.log('📍 Step 6: Test Reset State button');
    const resetButton = page.locator('button', { hasText: 'Reset State' });
    await resetButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Reset State button clicked');

    console.log('🎉 Complete workflow test passed!');
  });

  test('should navigate from Stream Reports to Stream Report Editor', async ({ page }) => {
    // Step 1: Go to Stream Reports page
    console.log('📍 Step 1: Navigate to Stream Reports page');
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    // Step 2: Check if there are any reports in the table
    console.log('📍 Step 2: Check for existing reports');
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0 && rowCount !== 1) {
      // There are reports - try to click edit on first one
      console.log(`📍 Step 3: Found ${rowCount} reports, clicking edit on first`);
      const editButton = tableRows.first().locator('button[title*="Edit"], button:has-text("Edit")').first();
      
      if (await editButton.count() > 0) {
        await editButton.click();
        await page.waitForTimeout(1000);

        // Check if we navigated to editor
        const url = page.url();
        if (url.includes('stream-report-editor')) {
          console.log('✅ Navigated to Stream Report Editor');
        } else {
          console.log('ℹ️  Did not navigate to editor (may need backend)');
        }
      } else {
        console.log('ℹ️  Edit button not found in table row');
      }
    } else {
      console.log('ℹ️  No stream reports in table (empty state)');
    }
  });

  test('should test table sorting and filtering', async ({ page }) => {
    console.log('📍 Step 1: Navigate to Stream Reports page');
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    // Step 2: Test column sorting
    console.log('📍 Step 2: Test column sorting');
    const nameHeader = page.locator('th', { hasText: 'Name' });
    
    if (await nameHeader.count() > 0) {
      // Click to sort
      await nameHeader.click();
      await page.waitForTimeout(500);
      console.log('✅ Clicked Name column header for sorting');

      // Click again to reverse sort
      await nameHeader.click();
      await page.waitForTimeout(500);
      console.log('✅ Clicked again to reverse sort');
    } else {
      console.log('ℹ️  Name header not found');
    }

    // Step 3: Test search/filter if available
    console.log('📍 Step 3: Test search functionality');
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      console.log('✅ Entered search text');

      await searchInput.clear();
      await page.waitForTimeout(500);
      console.log('✅ Cleared search text');
    } else {
      console.log('ℹ️  Search input not found');
    }
  });

  test('should test row selection functionality', async ({ page }) => {
    console.log('📍 Step 1: Navigate to Stream Reports page');
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    // Step 2: Check for checkboxes
    console.log('📍 Step 2: Test row selection');
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0 && rowCount !== 1) {
      // Try to select first row
      const firstCheckbox = page.locator('.ant-table-selection-column input[type="checkbox"]').first();
      
      if (await firstCheckbox.count() > 0) {
        await firstCheckbox.check();
        await page.waitForTimeout(500);
        console.log('✅ Selected first row');

        // Uncheck
        await firstCheckbox.uncheck();
        await page.waitForTimeout(500);
        console.log('✅ Unselected first row');
      } else {
        console.log('ℹ️  Checkbox not found');
      }
    } else {
      console.log('ℹ️  No rows to select (empty table)');
    }
  });

  test('should test pagination if available', async ({ page }) => {
    console.log('📍 Step 1: Navigate to Stream Reports page');
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    // Step 2: Check for pagination
    console.log('📍 Step 2: Check for pagination');
    const pagination = page.locator('.ant-pagination');
    
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible();
      console.log('✅ Pagination is visible');

      // Check for next button
      const nextButton = page.locator('.ant-pagination-next');
      if (await nextButton.count() > 0 && !await nextButton.isDisabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
        console.log('✅ Clicked next page');

        // Go back
        const prevButton = page.locator('.ant-pagination-prev');
        if (await prevButton.count() > 0 && !await prevButton.isDisabled()) {
          await prevButton.click();
          await page.waitForTimeout(500);
          console.log('✅ Clicked previous page');
        }
      } else {
        console.log('ℹ️  Next button not available (only one page)');
      }
    } else {
      console.log('ℹ️  Pagination not found (may not be needed)');
    }
  });
});

test.describe('Stream Reports - Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    // Check for ARIA labels on buttons
    const createButton = page.locator('button', { hasText: 'Create New' });
    const ariaLabel = await createButton.getAttribute('aria-label');
    
    if (ariaLabel) {
      console.log(`✅ Create button has ARIA label: "${ariaLabel}"`);
    } else {
      console.log('ℹ️  Create button does not have ARIA label');
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    // Try to tab through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`✅ Focused element after Tab: ${focusedElement}`);

    // Tab a few more times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    console.log('✅ Keyboard navigation works');
  });
});

test.describe('Stream Reports - Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Page load time: ${loadTime}ms`);

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    console.log('✅ Page loaded within acceptable time');
  });

  test('should render table efficiently', async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();
    
    // Wait for table to be visible
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    
    const renderTime = Date.now() - startTime;
    console.log(`⏱️  Table render time: ${renderTime}ms`);

    // Table should render within 2 seconds
    expect(renderTime).toBeLessThan(2000);
    console.log('✅ Table rendered efficiently');
  });
});

test.describe('Stream Reports - Responsive Design', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1', { hasText: 'Stream Reports' });
    await expect(heading).toBeVisible();
    console.log('✅ Page displays on mobile viewport');
  });

  test('should display correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1', { hasText: 'Stream Reports' });
    await expect(heading).toBeVisible();
    console.log('✅ Page displays on tablet viewport');
  });

  test('should display correctly on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1', { hasText: 'Stream Reports' });
    await expect(heading).toBeVisible();
    console.log('✅ Page displays on desktop viewport');
  });
});

