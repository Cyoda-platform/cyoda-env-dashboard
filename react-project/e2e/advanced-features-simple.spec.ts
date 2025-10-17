/**
 * Simple E2E Tests for Advanced COBI Features Integration
 * Tests basic visibility and functionality of integrated features
 */

import { test, expect } from '@playwright/test';

test.describe('Advanced COBI Features - Simple Integration Tests', () => {
  
  test('should display AI Generate button on DataMapper index page', async ({ page }) => {
    await page.goto('http://localhost:3009/data-mapper');
    await page.waitForLoadState('networkidle');

    // Check for AI Generate button
    const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
    await expect(aiGenerateButton).toBeVisible();
    
    // Check for Create Mapping button
    const createButton = page.getByRole('button', { name: /Create Mapping/i });
    await expect(createButton).toBeVisible();
  });

  test('should open AI Generate dialog when button is clicked on DataMapper index', async ({ page }) => {
    await page.goto('http://localhost:3009/data-mapper');
    await page.waitForLoadState('networkidle');

    // Click AI Generate button
    const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
    await aiGenerateButton.click();

    // Wait for dialog to appear
    await page.waitForTimeout(500);
    
    // Check for dialog (it should be visible)
    const dialog = page.locator('.ant-modal');
    await expect(dialog).toBeVisible();
  });

  test('should display Script Editor and Dry Run buttons on DataMapper edit page', async ({ page }) => {
    await page.goto('http://localhost:3009/data-mapper/configuration');
    await page.waitForLoadState('networkidle');

    // Check for Script Editor button
    const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
    await expect(scriptEditorButton).toBeVisible();

    // Check for Dry Run button
    const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
    await expect(dryRunButton).toBeVisible();
  });

  test('should open Script Editor dialog when button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3009/data-mapper/configuration');
    await page.waitForLoadState('networkidle');

    // Click Script Editor button
    const scriptEditorButton = page.getByRole('button', { name: /Script Editor/i });
    await scriptEditorButton.click();

    // Wait for dialog to appear
    await page.waitForTimeout(500);
    
    // Check for dialog
    const dialog = page.locator('.ant-modal');
    await expect(dialog).toBeVisible();
  });

  test('should open Dry Run Settings dialog when button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3009/data-mapper/configuration');
    await page.waitForLoadState('networkidle');

    // Click Dry Run button
    const dryRunButton = page.getByRole('button', { name: /Dry Run/i });
    await dryRunButton.click();

    // Wait for dialog to appear
    await page.waitForTimeout(500);
    
    // Check for dialog
    const dialog = page.locator('.ant-modal');
    await expect(dialog).toBeVisible();
  });

  test('should display AI Generate button on DataSourceConfig index page', async ({ page }) => {
    await page.goto('http://localhost:3009/data-mapper/data-source-config-creation');
    await page.waitForLoadState('networkidle');

    // Check for AI Generate button
    const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
    await expect(aiGenerateButton).toBeVisible();
  });

  test('should open AI Generate dialog on DataSourceConfig index page', async ({ page }) => {
    await page.goto('http://localhost:3009/data-mapper/data-source-config-creation');
    await page.waitForLoadState('networkidle');

    // Click AI Generate button
    const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
    await aiGenerateButton.click();

    // Wait for dialog to appear
    await page.waitForTimeout(500);
    
    // Check for dialog
    const dialog = page.locator('.ant-modal');
    await expect(dialog).toBeVisible();
  });
});

