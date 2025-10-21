/**
 * E2E Tests for Stream Reports Export/Import Functionality
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Stream Reports - Export/Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/reports/stream');
    await page.waitForLoadState('networkidle');
  });

  test('should display export and import buttons', async ({ page }) => {
    // Check for Export button
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeVisible();

    // Check for Import button
    const importButton = page.getByRole('button', { name: /import/i });
    await expect(importButton).toBeVisible();
  });

  test('should disable export button when no rows selected', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).toBeDisabled();
  });

  test('should enable export button when rows are selected', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');

    // Select first row
    const firstCheckbox = page.locator('.ant-table-tbody .ant-checkbox-input').first();
    await firstCheckbox.check();

    // Export button should be enabled
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).not.toBeDisabled();
  });

  test('should export selected stream reports', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');

    // Select first row
    const firstCheckbox = page.locator('.ant-table-tbody .ant-checkbox-input').first();
    await firstCheckbox.check();

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/export_stream_reports_.*\.json/);

    // Save and verify file content
    const downloadPath = path.join(__dirname, '../test-results', download.suggestedFilename());
    await download.saveAs(downloadPath);

    // Read and parse the file
    const fileContent = fs.readFileSync(downloadPath, 'utf-8');
    const exportedData = JSON.parse(fileContent);

    // Verify structure
    expect(exportedData).toHaveProperty('version');
    expect(exportedData).toHaveProperty('exportDate');
    expect(exportedData).toHaveProperty('definitions');
    expect(Array.isArray(exportedData.definitions)).toBe(true);
    expect(exportedData.definitions.length).toBeGreaterThan(0);

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should import stream reports from JSON file', async ({ page }) => {
    // Create a test import file
    const testImportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      definitions: [
        {
          name: 'Imported Test Stream Report',
          description: 'This is an imported stream report',
          entityClass: 'com.test.ImportedEntity',
          columns: [
            { name: 'id', label: 'ID', type: 'string' },
            { name: 'name', label: 'Name', type: 'string' },
          ],
        },
      ],
    };

    const importFilePath = path.join(__dirname, '../test-results', 'test-import.json');
    fs.writeFileSync(importFilePath, JSON.stringify(testImportData, null, 2));

    // Click import button
    const importButton = page.getByRole('button', { name: /import/i });
    
    // Set up file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await importButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(importFilePath);

    // Wait for success message
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // Verify the imported report appears in the table
    await page.waitForTimeout(1000); // Wait for table to refresh
    await expect(page.getByText('Imported Test Stream Report')).toBeVisible();

    // Clean up
    fs.unlinkSync(importFilePath);
  });

  test('should show error for invalid import file', async ({ page }) => {
    // Create an invalid import file
    const invalidData = { invalid: 'data' };
    const importFilePath = path.join(__dirname, '../test-results', 'invalid-import.json');
    fs.writeFileSync(importFilePath, JSON.stringify(invalidData));

    // Click import button
    const importButton = page.getByRole('button', { name: /import/i });
    
    // Set up file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await importButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(importFilePath);

    // Wait for error message
    await expect(page.locator('.ant-message-error')).toBeVisible({ timeout: 5000 });

    // Clean up
    fs.unlinkSync(importFilePath);
  });

  test('should reset state when reset button is clicked', async ({ page }) => {
    // Apply a filter
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    await searchInput.fill('test search');

    // Verify filter is applied
    await expect(searchInput).toHaveValue('test search');

    // Click reset state button
    const resetButton = page.getByRole('button', { name: /reset state/i });
    await resetButton.click();

    // Wait for success message
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // Verify filter is cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should export multiple selected reports', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');

    // Get all checkboxes
    const checkboxes = page.locator('.ant-table-tbody .ant-checkbox-input');
    const count = await checkboxes.count();

    // Select first 2 rows (if available)
    if (count >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();

      // Set up download listener
      const downloadPromise = page.waitForEvent('download');

      // Click export button
      const exportButton = page.getByRole('button', { name: /export/i });
      await exportButton.click();

      // Wait for download
      const download = await downloadPromise;

      // Save and verify file content
      const downloadPath = path.join(__dirname, '../test-results', download.suggestedFilename());
      await download.saveAs(downloadPath);

      // Read and parse the file
      const fileContent = fs.readFileSync(downloadPath, 'utf-8');
      const exportedData = JSON.parse(fileContent);

      // Verify we exported 2 definitions
      expect(exportedData.definitions.length).toBe(2);

      // Clean up
      fs.unlinkSync(downloadPath);
    }
  });

  test('should select all rows with select all checkbox', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');

    // Click select all checkbox
    const selectAllCheckbox = page.locator('.ant-table-thead .ant-checkbox-input').first();
    await selectAllCheckbox.check();

    // Verify export button is enabled
    const exportButton = page.getByRole('button', { name: /export/i });
    await expect(exportButton).not.toBeDisabled();

    // Uncheck select all
    await selectAllCheckbox.uncheck();

    // Verify export button is disabled again
    await expect(exportButton).toBeDisabled();
  });
});

test.describe('Stream Reports - Entity Detail Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tableau/reports/stream');
    await page.waitForLoadState('networkidle');
  });

  test('should open entity detail modal on row double-click in stream grid', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');

    // Click play button on first report
    const playButton = page.locator('button[aria-label*="play" i]').first();
    await playButton.click();

    // Wait for stream grid modal to open
    await expect(page.locator('.ant-modal-title:has-text("Stream Data")')).toBeVisible();

    // Wait for data to load in stream grid
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 10000 });

    // Double-click on first row
    const firstRow = page.locator('.ant-table-tbody tr').first();
    await firstRow.dblclick();

    // Verify entity detail modal opens
    await expect(page.locator('.ant-modal-title:has-text("Entity Details")')).toBeVisible();

    // Verify tabs are present
    await expect(page.getByText('Details')).toBeVisible();
    await expect(page.getByText('Data Lineage')).toBeVisible();
    await expect(page.getByText('Audit')).toBeVisible();
  });

  test('should switch between tabs in entity detail modal', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');

    // Click play button on first report
    const playButton = page.locator('button[aria-label*="play" i]').first();
    await playButton.click();

    // Wait for stream grid modal
    await expect(page.locator('.ant-modal-title:has-text("Stream Data")')).toBeVisible();
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 10000 });

    // Double-click on first row
    const firstRow = page.locator('.ant-table-tbody tr').first();
    await firstRow.dblclick();

    // Wait for entity detail modal
    await expect(page.locator('.ant-modal-title:has-text("Entity Details")')).toBeVisible();

    // Click Data Lineage tab
    await page.getByText('Data Lineage').click();
    await page.waitForTimeout(500);

    // Click Audit tab
    await page.getByText('Audit').click();
    await page.waitForTimeout(500);

    // Click back to Details tab
    await page.getByText('Details').click();
    await page.waitForTimeout(500);
  });

  test('should close entity detail modal', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');

    // Click play button on first report
    const playButton = page.locator('button[aria-label*="play" i]').first();
    await playButton.click();

    // Wait for stream grid modal
    await expect(page.locator('.ant-modal-title:has-text("Stream Data")')).toBeVisible();
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 10000 });

    // Double-click on first row
    const firstRow = page.locator('.ant-table-tbody tr').first();
    await firstRow.dblclick();

    // Wait for entity detail modal
    await expect(page.locator('.ant-modal-title:has-text("Entity Details")')).toBeVisible();

    // Close the modal
    const closeButton = page.locator('.ant-modal-close').last();
    await closeButton.click();

    // Verify modal is closed
    await expect(page.locator('.ant-modal-title:has-text("Entity Details")')).not.toBeVisible();
  });
});

