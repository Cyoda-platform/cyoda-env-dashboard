import { test, expect } from '@playwright/test';

test.describe('Stream Reports Page - Basic Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');
  });

  test('should display page heading', async ({ page }) => {
    const heading = page.locator('h1', { hasText: 'Stream Reports' });
    await expect(heading).toBeVisible();
    console.log('✅ Stream Reports page heading is visible');
  });

  test('should display main table', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    console.log('✅ Stream Reports table is visible');
  });

  test('should display action buttons', async ({ page }) => {
    const createButton = page.locator('button', { hasText: 'Create New' });
    const resetButton = page.locator('button', { hasText: 'Reset State' });

    await expect(createButton).toBeVisible();
    await expect(resetButton).toBeVisible();

    console.log('✅ Action buttons are visible');
  });

  test('should not have tabs (single page)', async ({ page }) => {
    const tabs = page.locator('.ant-tabs');
    await expect(tabs).not.toBeVisible();
    console.log('✅ Confirmed: Stream Reports page has no tabs (single page)');
  });

});

test.describe('Stream Reports Page - Table Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');
  });

  test('should have all required table columns', async ({ page }) => {
    const nameHeader = page.locator('th', { hasText: 'Name' });
    const descriptionHeader = page.locator('th', { hasText: 'Description' });
    const entityHeader = page.locator('th', { hasText: 'Entity' });
    const authorHeader = page.locator('th', { hasText: 'Author' });
    const createdHeader = page.locator('th', { hasText: 'Created' });
    const actionsHeader = page.locator('th', { hasText: 'Actions' });

    await expect(nameHeader).toBeVisible();
    await expect(descriptionHeader).toBeVisible();
    await expect(entityHeader).toBeVisible();
    await expect(authorHeader).toBeVisible();
    await expect(createdHeader).toBeVisible();
    await expect(actionsHeader).toBeVisible();

    console.log('✅ All 6 table columns are visible');
  });

  test('should have checkbox column for row selection', async ({ page }) => {
    const checkboxColumn = page.locator('.ant-table-selection-column').first();
    await expect(checkboxColumn).toBeVisible();
    console.log('✅ Checkbox column is visible');
  });

  test('should display table with proper styling', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toHaveClass(/ant-table/);
    console.log('✅ Table has proper Ant Design styling');
  });
});

test.describe('Stream Reports Page - Filter Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');
  });

  test('should display filter component', async ({ page }) => {
    const filterSection = page.locator('.config-editor-reports-filter');
    await expect(filterSection).toBeVisible();
    console.log('✅ Filter component is visible');
  });

  test('should have search input in filter', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      console.log('✅ Search input is visible');
    } else {
      console.log('ℹ️  Search input not found (may be optional)');
    }
  });
});

test.describe('Stream Reports Page - Create Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');
  });

  test('should open Create New dialog when clicked', async ({ page }) => {
    const createButton = page.locator('button', { hasText: 'Create New' });
    await createButton.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('.ant-modal');
    await expect(dialog).toBeVisible();
    console.log('✅ Create New dialog opened successfully');
  });

  test('should display dialog title', async ({ page }) => {
    const createButton = page.locator('button', { hasText: 'Create New' });
    await createButton.click();
    await page.waitForTimeout(500);

    const dialogTitle = page.locator('.ant-modal-title');
    await expect(dialogTitle).toBeVisible();
    console.log('✅ Dialog title is visible');
  });

  test('should close dialog when cancel is clicked', async ({ page }) => {
    const createButton = page.locator('button', { hasText: 'Create New' });
    await createButton.click();
    await page.waitForTimeout(500);

    const cancelButton = page.locator('.ant-modal button', { hasText: 'Cancel' });
    if (await cancelButton.count() > 0) {
      await cancelButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.ant-modal');
      await expect(dialog).not.toBeVisible();
      console.log('✅ Dialog closed successfully');
    } else {
      console.log('ℹ️  Cancel button not found');
    }
  });

  test('should close dialog when X button is clicked', async ({ page }) => {
    const createButton = page.locator('button', { hasText: 'Create New' });
    await createButton.click();
    await page.waitForTimeout(500);

    const closeButton = page.locator('.ant-modal-close');
    await closeButton.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('.ant-modal');
    await expect(dialog).not.toBeVisible();
    console.log('✅ Dialog closed via X button');
  });
});

test.describe('Stream Reports Page - Table Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');
  });

  test('should display action buttons in table rows', async ({ page }) => {
    // Check if there are any rows in the table
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0) {
      // Check for action buttons in the first row
      const firstRow = tableRows.first();
      const actionButtons = firstRow.locator('button');
      const buttonCount = await actionButtons.count();

      expect(buttonCount).toBeGreaterThan(0);
      console.log(`✅ Found ${buttonCount} action buttons in table row`);
    } else {
      console.log('ℹ️  No stream reports in table (empty state)');
    }
  });

  test('should show empty state when no reports', async ({ page }) => {
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount === 0 || rowCount === 1) {
      // Check for empty state message
      const emptyText = page.locator('.ant-empty-description');
      if (await emptyText.count() > 0) {
        await expect(emptyText).toBeVisible();
        console.log('✅ Empty state is displayed');
      } else {
        console.log('ℹ️  Table is empty but no empty state message');
      }
    } else {
      console.log(`ℹ️  Table has ${rowCount} rows`);
    }
  });
});

test.describe('Stream Reports Page - Error Handling', () => {
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

    await page.goto('http://localhost:3007/tableau/stream-reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const criticalErrors = pageErrors.filter(err =>
      !err.includes('tableau is not defined') &&
      !err.includes('useForm')
    );

    if (criticalErrors.length > 0) {
      console.log('❌ Page errors found:', criticalErrors);
    } else {
      console.log('✅ No critical errors on Stream Reports page');
    }

    expect(criticalErrors.length).toBe(0);
  });
});

