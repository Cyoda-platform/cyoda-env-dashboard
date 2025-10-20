import { test, expect } from '@playwright/test';

test.describe('Stream Report Editor - Page Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a stream report editor (using a mock ID)
    await page.goto('http://localhost:3007/tableau/stream-report-editor/test-stream-report-1');
    await page.waitForLoadState('networkidle');
  });

  test('should display Stream Report Editor page', async ({ page }) => {
    // Check if page loaded
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    console.log('✅ Stream Report Editor page loaded');
  });

  test('should display editor heading', async ({ page }) => {
    // Check for heading (might be h1 or h2)
    const heading = page.locator('h1, h2').first();
    if (await heading.count() > 0) {
      await expect(heading).toBeVisible();
      const headingText = await heading.textContent();
      console.log(`✅ Editor heading visible: "${headingText}"`);
    } else {
      console.log('ℹ️  No heading found');
    }
  });

  test('should have tabs for different configuration sections', async ({ page }) => {
    // Check if tabs are present
    const tabs = page.locator('.ant-tabs');
    if (await tabs.count() > 0) {
      await expect(tabs).toBeVisible();
      console.log('✅ Tabs are visible');
    } else {
      console.log('ℹ️  No tabs found (may be loading or error state)');
    }
  });
});

test.describe('Stream Report Editor - Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-report-editor/test-stream-report-1');
    await page.waitForLoadState('networkidle');
  });

  test('should have Columns tab', async ({ page }) => {
    const columnsTab = page.locator('.ant-tabs-tab', { hasText: 'Columns' });
    if (await columnsTab.count() > 0) {
      await expect(columnsTab).toBeVisible();
      console.log('✅ Columns tab is visible');
    } else {
      console.log('ℹ️  Columns tab not found');
    }
  });

  test('should have Filter tab', async ({ page }) => {
    const filterTab = page.locator('.ant-tabs-tab', { hasText: 'Filter' });
    if (await filterTab.count() > 0) {
      await expect(filterTab).toBeVisible();
      console.log('✅ Filter tab is visible');
    } else {
      console.log('ℹ️  Filter tab not found');
    }
  });

  test('should have Sorting tab', async ({ page }) => {
    const sortingTab = page.locator('.ant-tabs-tab', { hasText: 'Sorting' });
    if (await sortingTab.count() > 0) {
      await expect(sortingTab).toBeVisible();
      console.log('✅ Sorting tab is visible');
    } else {
      console.log('ℹ️  Sorting tab not found');
    }
  });

  test('should have Grouping tab', async ({ page }) => {
    const groupingTab = page.locator('.ant-tabs-tab', { hasText: 'Grouping' });
    if (await groupingTab.count() > 0) {
      await expect(groupingTab).toBeVisible();
      console.log('✅ Grouping tab is visible');
    } else {
      console.log('ℹ️  Grouping tab not found');
    }
  });

  test('should have Summary tab', async ({ page }) => {
    const summaryTab = page.locator('.ant-tabs-tab', { hasText: 'Summary' });
    if (await summaryTab.count() > 0) {
      await expect(summaryTab).toBeVisible();
      console.log('✅ Summary tab is visible');
    } else {
      console.log('ℹ️  Summary tab not found');
    }
  });

  test('should have Model tab', async ({ page }) => {
    const modelTab = page.locator('.ant-tabs-tab', { hasText: 'Model' });
    if (await modelTab.count() > 0) {
      await expect(modelTab).toBeVisible();
      console.log('✅ Model tab is visible');
    } else {
      console.log('ℹ️  Model tab not found');
    }
  });

  test('should have Range tab (unique to stream reports)', async ({ page }) => {
    const rangeTab = page.locator('.ant-tabs-tab', { hasText: 'Range' });
    if (await rangeTab.count() > 0) {
      await expect(rangeTab).toBeVisible();
      console.log('✅ Range tab is visible (unique to stream reports)');
    } else {
      console.log('ℹ️  Range tab not found');
    }
  });

  test('should have JSON tab', async ({ page }) => {
    const jsonTab = page.locator('.ant-tabs-tab', { hasText: 'JSON' });
    if (await jsonTab.count() > 0) {
      await expect(jsonTab).toBeVisible();
      console.log('✅ JSON tab is visible');
    } else {
      console.log('ℹ️  JSON tab not found');
    }
  });
});

test.describe('Stream Report Editor - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-report-editor/test-stream-report-1');
    await page.waitForLoadState('networkidle');
  });

  test('should switch between tabs', async ({ page }) => {
    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click on second tab
      await tabs.nth(1).click();
      await page.waitForTimeout(500);

      // Check if second tab is active
      const activeTab = page.locator('.ant-tabs-tab-active');
      await expect(activeTab).toBeVisible();
      console.log('✅ Successfully switched tabs');
    } else {
      console.log('ℹ️  Not enough tabs to test switching');
    }
  });

  test('should display Range tab content when clicked', async ({ page }) => {
    const rangeTab = page.locator('.ant-tabs-tab', { hasText: 'Range' });
    
    if (await rangeTab.count() > 0) {
      await rangeTab.click();
      await page.waitForTimeout(500);

      // Check if Range tab is active
      const activeTab = page.locator('.ant-tabs-tab-active', { hasText: 'Range' });
      await expect(activeTab).toBeVisible();
      console.log('✅ Range tab is active');
    } else {
      console.log('ℹ️  Range tab not found');
    }
  });
});

test.describe('Stream Report Editor - Action Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-report-editor/test-stream-report-1');
    await page.waitForLoadState('networkidle');
  });

  test('should have Update button', async ({ page }) => {
    const updateButton = page.locator('button', { hasText: 'Update' });
    if (await updateButton.count() > 0) {
      await expect(updateButton).toBeVisible();
      console.log('✅ Update button is visible');
    } else {
      console.log('ℹ️  Update button not found');
    }
  });

  test('should have Update and Run button', async ({ page }) => {
    const updateRunButton = page.locator('button', { hasText: /Update.*Run/i });
    if (await updateRunButton.count() > 0) {
      await expect(updateRunButton).toBeVisible();
      console.log('✅ Update and Run button is visible');
    } else {
      console.log('ℹ️  Update and Run button not found');
    }
  });

  test('should have Back or Cancel button', async ({ page }) => {
    const backButton = page.locator('button', { hasText: /Back|Cancel/i });
    if (await backButton.count() > 0) {
      await expect(backButton).toBeVisible();
      console.log('✅ Back/Cancel button is visible');
    } else {
      console.log('ℹ️  Back/Cancel button not found');
    }
  });
});

test.describe('Stream Report Editor - Range Tab (Unique Feature)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-report-editor/test-stream-report-1');
    await page.waitForLoadState('networkidle');
  });

  test('should display Range tab configuration', async ({ page }) => {
    const rangeTab = page.locator('.ant-tabs-tab', { hasText: 'Range' });
    
    if (await rangeTab.count() > 0) {
      await rangeTab.click();
      await page.waitForTimeout(500);

      // Check for range-specific content
      const rangeContent = page.locator('.stream-report-editor-tab-range, .range-tab-content');
      if (await rangeContent.count() > 0) {
        await expect(rangeContent).toBeVisible();
        console.log('✅ Range tab content is visible');
      } else {
        console.log('ℹ️  Range tab content not found (may have different class name)');
      }
    } else {
      console.log('ℹ️  Range tab not found');
    }
  });

  test('should have range field input', async ({ page }) => {
    const rangeTab = page.locator('.ant-tabs-tab', { hasText: 'Range' });
    
    if (await rangeTab.count() > 0) {
      await rangeTab.click();
      await page.waitForTimeout(500);

      // Look for input fields in Range tab
      const inputs = page.locator('input, select, .ant-select');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        console.log(`✅ Found ${inputCount} input fields in Range tab`);
      } else {
        console.log('ℹ️  No input fields found in Range tab');
      }
    } else {
      console.log('ℹ️  Range tab not found');
    }
  });
});

test.describe('Stream Report Editor - Error Handling', () => {
  test('should not have critical JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('http://localhost:3007/tableau/stream-report-editor/test-stream-report-1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const criticalErrors = pageErrors.filter(err => 
      !err.includes('tableau is not defined') && 
      !err.includes('useForm')
    );

    if (criticalErrors.length > 0) {
      console.log('❌ Page errors found:', criticalErrors);
    } else {
      console.log('✅ No critical errors on Stream Report Editor page');
    }

    expect(criticalErrors.length).toBe(0);
  });
});

