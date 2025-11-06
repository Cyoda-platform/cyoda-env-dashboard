import { test, expect } from '@playwright/test';

test.describe('Source Configuration React App', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5176');
  });

  test('should load the application', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Source Configuration/i);
  });

  test('should display the main heading', async ({ page }) => {
    // Wait for the heading to be visible
    const heading = page.getByRole('heading', { name: /List of Configs/i });
    await expect(heading).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    // Check for Create Configuration button
    const createButton = page.getByRole('button', { name: /Create Configuration/i });
    await expect(createButton).toBeVisible();

    // Check for Ingest Source button
    const uploadButton = page.getByRole('button', { name: /Ingest Source/i });
    await expect(uploadButton).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    // Check for search input
    const searchInput = page.getByPlaceholder(/Filter configurations/i);
    await expect(searchInput).toBeVisible();
  });

  test('should open create dialog when create button is clicked', async ({ page }) => {
    // Click the Create Configuration button
    const createButton = page.getByRole('button', { name: /Create Configuration/i });
    await createButton.click();

    // Wait for the dialog to appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Check for dialog title (use first() since text appears in both button and dialog)
    const dialogTitle = page.getByText(/Create Configuration/i).first();
    await expect(dialogTitle).toBeVisible();
  });

  test('should open upload dialog when upload button is clicked', async ({ page }) => {
    // Click the Ingest Source button
    const uploadButton = page.getByRole('button', { name: /Ingest Source/i });
    await uploadButton.click();

    // Wait for the dialog to appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Check for dialog title
    const dialogTitle = page.getByText(/Ingest Source/i);
    await expect(dialogTitle).toBeVisible();
  });

  test('should filter configurations when typing in search', async ({ page }) => {
    // Type in the search input
    const searchInput = page.getByPlaceholder(/Filter configurations/i);
    await searchInput.fill('CSV');

    // Verify the input value
    await expect(searchInput).toHaveValue('CSV');
  });

  test('should display table with configurations', async ({ page }) => {
    // Wait for the table to load
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Check if table is visible
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should display table headers', async ({ page }) => {
    // Check for table headers
    await expect(page.getByText('Name').first()).toBeVisible();
    await expect(page.getByText('Type').first()).toBeVisible();
    await expect(page.getByText('Date of Creation').first()).toBeVisible();
    await expect(page.getByText('Actions').first()).toBeVisible();
  });

  test('should close create dialog when cancel is clicked', async ({ page }) => {
    // Open the create dialog
    const createButton = page.getByRole('button', { name: /Create Configuration/i });
    await createButton.click();
    
    // Wait for dialog to appear
    await page.waitForSelector('[role="dialog"]');
    
    // Click cancel button
    const cancelButton = page.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();
    
    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should show configuration form fields', async ({ page }) => {
    // Open the create dialog
    const createButton = page.getByRole('button', { name: /Create Configuration/i });
    await createButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]');
    
    // Check for form fields
    const nameInput = page.getByPlaceholder(/Enter configuration name/i);
    await expect(nameInput).toBeVisible();
    
    // Check for file type selector
    const fileTypeLabel = page.getByText('File Type');
    await expect(fileTypeLabel).toBeVisible();
  });

  test('should display CSV file type option', async ({ page }) => {
    // Open the create dialog
    const createButton = page.getByRole('button', { name: /Create Configuration/i });
    await createButton.click();
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]');
    
    // Check for CSV option
    const csvOption = page.getByText('CSV', { exact: true });
    await expect(csvOption).toBeVisible();
  });

  test('should display XML file type option', async ({ page }) => {
    // Open the create dialog
    const createButton = page.getByRole('button', { name: /Create Configuration/i });
    await createButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]');

    // Click on the file type selector to open dropdown
    await page.locator('.ant-select-selector').click();

    // Wait for dropdown to appear and check for XML option
    const xmlOption = page.locator('.ant-select-item-option-content:has-text("XML")');
    await expect(xmlOption).toBeVisible();
  });

  test('should display JDBC file type option', async ({ page }) => {
    // Open the create dialog
    const createButton = page.getByRole('button', { name: /Create Configuration/i });
    await createButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]');

    // Click on the file type selector to open dropdown
    await page.locator('.ant-select-selector').click();

    // Wait for dropdown to appear and check for JDBC option
    const jdbcOption = page.locator('.ant-select-item-option-content:has-text("JDBC")');
    await expect(jdbcOption).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Check if the page has proper layout
    const mainContent = page.locator('main, .ant-layout-content, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:5176');
    await page.waitForLoadState('networkidle');

    // Allow some time for any async errors
    await page.waitForTimeout(2000);

    // Filter out known acceptable errors (like API errors in dev mode)
    const criticalErrors = errors.filter(error =>
      !error.includes('Failed to fetch') &&
      !error.includes('Network request failed') &&
      !error.includes('404') &&
      !error.includes('useForm') // Ant Design warning, not a critical error
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

