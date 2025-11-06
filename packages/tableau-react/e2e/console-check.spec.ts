/**
 * Console Error Check - See what errors are in the browser console
 */

import { test } from '@playwright/test';

test('should check console errors on report-configs page', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const logs: string[] = [];
  
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.log('❌ ERROR:', text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
      console.log('⚠️  WARNING:', text);
    } else {
      logs.push(text);
      console.log('ℹ️  LOG:', text);
    }
  });
  
  page.on('pageerror', (error) => {
    console.log('💥 PAGE ERROR:', error.message);
    console.log('Stack:', error.stack);
  });
  
  await page.goto('/tableau/report-configs');
  
  // Wait a bit for page to load
  await page.waitForTimeout(3000);
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total errors: ${errors.length}`);
  console.log(`Total warnings: ${warnings.length}`);
  console.log(`Total logs: ${logs.length}`);
  
  if (errors.length > 0) {
    console.log('\n=== ALL ERRORS ===');
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }
});

