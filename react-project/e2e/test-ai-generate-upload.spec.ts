import { test, expect } from '@playwright/test';
import path from 'path';

test('test AI Generate file upload', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:3009/data-mapper');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Click AI Generate button
  const aiGenerateButton = page.getByRole('button', { name: /AI Generate/i });
  await aiGenerateButton.click();

  // Wait for modal to appear
  await page.waitForTimeout(1000);

  // Take screenshot of modal
  await page.screenshot({ path: 'e2e-screenshots/ai-generate-modal.png', fullPage: true });

  // Check if modal is visible
  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible();

  // Check if upload button is visible
  const uploadButton = page.getByRole('button', { name: /Select JSON File/i });
  await expect(uploadButton).toBeVisible();

  // Create a test JSON file
  const testData = {
    name: 'Test Configuration',
    type: 'dataMapper',
    settings: {
      delimiter: ',',
      hasHeader: true
    }
  };

  // Create a temporary file
  const testFilePath = path.join(__dirname, '../test-config.json');
  const fs = require('fs');
  fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2));

  // Upload the file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFilePath);

  // Wait a bit
  await page.waitForTimeout(1000);

  // Take screenshot after upload
  await page.screenshot({ path: 'e2e-screenshots/ai-generate-after-upload.png', fullPage: true });

  // Check if file preview is visible
  const filePreview = page.locator('.file-preview');
  console.log('File preview visible:', await filePreview.isVisible());

  // Check if Generate button is enabled
  const generateButton = page.getByRole('button', { name: /Generate Configuration/i });
  console.log('Generate button visible:', await generateButton.isVisible());
  console.log('Generate button disabled:', await generateButton.isDisabled());

  // Clean up
  fs.unlinkSync(testFilePath);
});

