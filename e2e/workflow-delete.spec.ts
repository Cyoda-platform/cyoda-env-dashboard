/**
 * E2E Test: Workflow Delete Functionality
 * Tests that deleting a workflow removes it from the table without page refresh
 */

import { test, expect } from '@playwright/test';

test.describe('Workflow Delete Functionality', () => {
  test('Should delete workflow and update table without refresh', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3014');
    
    // Navigate to Workflows page
    await page.click('text=Workflows');
    await page.waitForURL('**/workflows');
    
    // Wait for table to load
    await page.waitForSelector('.ant-table-tbody tr');
    
    // Count initial workflows
    const initialRows = await page.locator('.ant-table-tbody tr').count();
    console.log(`Initial workflow count: ${initialRows}`);
    expect(initialRows).toBeGreaterThan(0);
    
    // Get the first workflow name for verification
    const firstWorkflowName = await page.locator('.ant-table-tbody tr').first().locator('td').nth(1).textContent();
    console.log(`First workflow name: ${firstWorkflowName}`);

    // Click delete button on the first workflow (the danger button with DeleteOutlined icon)
    await page.locator('.ant-table-tbody tr').first().locator('button.ant-btn-dangerous').click();
    
    // Wait for confirmation modal
    await page.waitForSelector('.ant-modal');
    
    // Confirm deletion
    await page.click('.ant-modal button:has-text("Delete")');
    
    // Wait for success message
    await page.waitForSelector('.ant-message-success');
    
    // Wait a bit for the table to update
    await page.waitForTimeout(1000);
    
    // Count workflows after deletion
    const finalRows = await page.locator('.ant-table-tbody tr').count();
    console.log(`Final workflow count: ${finalRows}`);
    
    // Verify the count decreased by 1
    expect(finalRows).toBe(initialRows - 1);
    
    // Verify the deleted workflow is no longer in the table
    const allWorkflowNames = await page.locator('.ant-table-tbody tr td:nth-child(2)').allTextContents();
    console.log(`Remaining workflows: ${allWorkflowNames.join(', ')}`);
    expect(allWorkflowNames).not.toContain(firstWorkflowName);
    
    console.log('✅ Workflow deleted successfully without page refresh!');
  });
});

