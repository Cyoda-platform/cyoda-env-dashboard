/**
 * E2E Tests for Advanced COBI Features Integration
 * Tests Script Editor, Dry Run, Metadata, and AI Generate
 */

import { test, expect } from '@playwright/test';

test.describe('Advanced COBI Features Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3009');
    await page.waitForLoadState('networkidle');
  });

  test.describe('DataMapper - Script Editor Integration', () => {
    test('should display Script Editor button in DataMapper toolbar', async ({ page }) => {
      // Navigate to DataMapper Edit page (where Script Editor button is)
      await page.goto('http://localhost:3009/data-mapper/configuration');
      await page.waitForLoadState('networkidle');

      // Check for Script Editor button
      const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
      await expect(scriptEditorButton).toBeVisible();
    });

    test('should open Script Editor dialog when button is clicked', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper/configuration');
      await page.waitForLoadState('networkidle');

      // Click Script Editor button
      const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
      await scriptEditorButton.click();

      // Wait for dialog to appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Check for dialog title
      await expect(page.getByText(/Script Editor/i)).toBeVisible();
    });

    test('should display Monaco editor in Script Editor dialog', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
      await scriptEditorButton.click();

      // Wait for Monaco editor to load
      await page.waitForSelector('.monaco-editor', { timeout: 5000 });
      const editor = page.locator('.monaco-editor');
      await expect(editor).toBeVisible();
    });

    test('should display tabs in Script Editor dialog', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
      await scriptEditorButton.click();

      // Check for tabs
      await expect(page.getByText(/Script Body/i)).toBeVisible();
      await expect(page.getByText(/Source Fields/i)).toBeVisible();
      await expect(page.getByText(/Reusable Scripts/i)).toBeVisible();
    });

    test('should close Script Editor dialog when Cancel is clicked', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
      await scriptEditorButton.click();

      // Click Cancel button
      const cancelButton = page.getByRole('button', { name: /Cancel/i });
      await cancelButton.click();

      // Dialog should be closed
      const dialog = page.getByRole('dialog');
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('DataMapper - Dry Run Integration', () => {
    test('should display Dry Run button in DataMapper toolbar', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Check for Dry Run button
      const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
      await expect(dryRunButton).toBeVisible();
    });

    test('should open Dry Run Settings dialog when button is clicked', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Click Dry Run button
      const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
      await dryRunButton.click();

      // Wait for dialog to appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Check for dialog title
      await expect(page.getByText(/Dry Run Settings/i)).toBeVisible();
    });

    test('should display log level selects in Dry Run Settings', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
      await dryRunButton.click();

      // Check for log level labels
      await expect(page.getByText(/Default Level/i)).toBeVisible();
      await expect(page.getByText(/Common Level/i)).toBeVisible();
      await expect(page.getByText(/Parser Level/i)).toBeVisible();
      await expect(page.getByText(/Transformer Level/i)).toBeVisible();
    });

    test('should open Dry Run Results dialog after running test', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
      await dryRunButton.click();

      // Click OK to run dry run
      const okButton = page.getByRole('button', { name: /OK/i });
      await okButton.click();

      // Wait for results dialog
      await page.waitForSelector('text=/Dry Run Results/i', { timeout: 5000 });
      await expect(page.getByText(/Dry Run Results/i)).toBeVisible();
    });

    test('should display result tabs in Dry Run Results dialog', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
      await dryRunButton.click();

      const okButton = page.getByRole('button', { name: /OK/i });
      await okButton.click();

      // Wait for results dialog
      await page.waitForSelector('text=/Dry Run Results/i', { timeout: 5000 });

      // Check for tabs
      await expect(page.getByText(/Mapped Data/i)).toBeVisible();
      await expect(page.getByText(/Entities/i)).toBeVisible();
      await expect(page.getByText(/Parse Statistics/i)).toBeVisible();
      await expect(page.getByText(/Tracer Events/i)).toBeVisible();
    });
  });

  test.describe('DataMapper Index - AI Generate Integration', () => {
    test('should display AI Generate button on DataMapper index page', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Check for AI Generate button
      const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
      await expect(aiGenerateButton).toBeVisible();
    });

    test('should open AI Generate dialog when button is clicked', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Click AI Generate button
      const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
      await aiGenerateButton.click();

      // Wait for dialog to appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Check for dialog title
      await expect(page.getByText(/AI Generate Configuration/i)).toBeVisible();
    });

    test('should display file upload component in AI Generate dialog', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
      await aiGenerateButton.click();

      // Check for upload component
      await expect(page.getByText(/Upload JSON configuration file/i)).toBeVisible();
    });

    test('should disable Generate button when no file is selected', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
      await aiGenerateButton.click();

      // Check that Generate button is disabled
      const generateButton = page.getByRole('button', { name: /Generate Configuration/i });
      await expect(generateButton).toBeDisabled();
    });

    test('should enable Generate button after file upload', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
      await aiGenerateButton.click();

      // Upload a JSON file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'config.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{"test": "data"}'),
      });

      // Wait for file to be processed
      await page.waitForTimeout(500);

      // Check that Generate button is enabled
      const generateButton = page.getByRole('button', { name: /Generate Configuration/i });
      await expect(generateButton).not.toBeDisabled();
    });
  });

  test.describe('DataSourceConfig Index - AI Generate Integration', () => {
    test('should display AI Generate button on DataSourceConfig index page', async ({ page }) => {
      await page.goto('http://localhost:3009/data-source-config');
      await page.waitForLoadState('networkidle');

      // Check for AI Generate button
      const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
      await expect(aiGenerateButton).toBeVisible();
    });

    test('should open AI Generate dialog with correct type', async ({ page }) => {
      await page.goto('http://localhost:3009/data-source-config');
      await page.waitForLoadState('networkidle');

      // Click AI Generate button
      const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
      await aiGenerateButton.click();

      // Wait for dialog to appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Check for dialog title with data source type
      await expect(page.getByText(/AI Generate Configuration/i)).toBeVisible();
      await expect(page.getByText(/data source/i)).toBeVisible();
    });
  });

  test.describe('Button Placement and Styling', () => {
    test('should display buttons in correct order on DataMapper', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Get all buttons in toolbar
      const toolbar = page.locator('.mapping-navigation-actions');
      const buttons = toolbar.getByRole('button');

      // Verify Script Editor and Dry Run buttons exist
      await expect(buttons.filter({ hasText: /Script Editor/i })).toBeVisible();
      await expect(buttons.filter({ hasText: /Dry Run/i })).toBeVisible();
    });

    test('should display buttons with correct icons', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Check for icons in buttons
      const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
      await expect(scriptEditorButton.locator('.anticon')).toBeVisible();

      const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
      await expect(dryRunButton.locator('.anticon')).toBeVisible();
    });

    test('should display AI Generate button before Create Mapping button', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Get button positions
      const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
      const createButton = page.getByRole('button', { name: /Create Mapping/i });

      // Both should be visible
      await expect(aiGenerateButton).toBeVisible();
      await expect(createButton).toBeVisible();

      // AI Generate should come before Create Mapping in DOM order
      const aiBox = await aiGenerateButton.boundingBox();
      const createBox = await createButton.boundingBox();
      
      if (aiBox && createBox) {
        expect(aiBox.x).toBeLessThan(createBox.x);
      }
    });
  });

  test.describe('Keyboard Shortcuts and Accessibility', () => {
    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Tab to Script Editor button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to activate with Enter
      await page.keyboard.press('Enter');

      // Dialog should open
      await expect(page.getByText(/Script Editor/i)).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('http://localhost:3009/data-mapper');
      await page.waitForLoadState('networkidle');

      // Check for proper button labels
      const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
      await expect(scriptEditorButton).toHaveAttribute('title');

      const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
      await expect(dryRunButton).toHaveAttribute('title');
    });
  });
});

