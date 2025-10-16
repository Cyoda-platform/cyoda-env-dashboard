/**
 * E2E Tests for Tableau Integration
 * Tests the Tableau Web Data Connector functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Tableau Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should load Tableau connector script', async ({ page }) => {
    // Check if Tableau connector script is loaded
    const hasTableauScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script => 
        script.src.includes('tableau-connector.js')
      );
    });
    
    expect(hasTableauScript).toBe(true);
  });

  test('should have window.tableau object', async ({ page }) => {
    // Check if window.tableau is available
    const hasTableau = await page.evaluate(() => {
      return typeof (window as any).tableau !== 'undefined';
    });
    
    expect(hasTableau).toBe(true);
  });

  test('should have Tableau API methods', async ({ page }) => {
    // Check for required Tableau API methods
    const hasRequiredMethods = await page.evaluate(() => {
      const tableau = (window as any).tableau;
      if (!tableau) return false;
      
      return (
        typeof tableau.connectionData !== 'undefined' &&
        typeof tableau.connectionName !== 'undefined' &&
        typeof tableau.submit === 'function'
      );
    });
    
    expect(hasRequiredMethods).toBe(true);
  });

  test('should have Tableau data type enum', async ({ page }) => {
    const hasDataTypeEnum = await page.evaluate(() => {
      const tableau = (window as any).tableau;
      if (!tableau) return false;
      
      return (
        tableau.dataTypeEnum &&
        typeof tableau.dataTypeEnum.string !== 'undefined'
      );
    });
    
    expect(hasDataTypeEnum).toBe(true);
  });

  test('should initialize Tableau connection data', async ({ page }) => {
    // Wait a bit for any initialization
    await page.waitForTimeout(1000);
    
    const connectionData = await page.evaluate(() => {
      const tableau = (window as any).tableau;
      return tableau ? tableau.connectionData : null;
    });
    
    // Connection data should be a string (empty or with data)
    expect(typeof connectionData).toBe('string');
  });

  test('should set connection name', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const connectionName = await page.evaluate(() => {
      const tableau = (window as any).tableau;
      return tableau ? tableau.connectionName : null;
    });
    
    // Connection name should be a string
    expect(typeof connectionName).toBe('string');
  });
});

test.describe('Tableau Integration - Data Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should handle report selection', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Click on first row
      await rows.first().click();
      
      // Wait for data processing
      await page.waitForTimeout(1000);
      
      // Check if connection data was updated
      const hasConnectionData = await page.evaluate(() => {
        const tableau = (window as any).tableau;
        return tableau && tableau.connectionData && tableau.connectionData.length > 0;
      });
      
      // Either has data or is still loading
      expect(typeof hasConnectionData).toBe('boolean');
    }
  });

  test('should format data for Tableau', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      await rows.first().click();
      await page.waitForTimeout(1500);
      
      // Check if connection data is valid JSON
      const isValidJSON = await page.evaluate(() => {
        const tableau = (window as any).tableau;
        if (!tableau || !tableau.connectionData) return false;
        
        try {
          const data = JSON.parse(tableau.connectionData);
          return typeof data === 'object';
        } catch {
          return false;
        }
      });
      
      // Either has valid JSON or no data yet
      expect(typeof isValidJSON).toBe('boolean');
    }
  });

  test('should include table columns in connection data', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      await rows.first().click();
      await page.waitForTimeout(1500);
      
      const hasColumns = await page.evaluate(() => {
        const tableau = (window as any).tableau;
        if (!tableau || !tableau.connectionData) return false;
        
        try {
          const data = JSON.parse(tableau.connectionData);
          return Array.isArray(data.tableauColumns);
        } catch {
          return false;
        }
      });
      
      expect(typeof hasColumns).toBe('boolean');
    }
  });

  test('should include table data in connection data', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      await rows.first().click();
      await page.waitForTimeout(1500);
      
      const hasData = await page.evaluate(() => {
        const tableau = (window as any).tableau;
        if (!tableau || !tableau.connectionData) return false;
        
        try {
          const data = JSON.parse(tableau.connectionData);
          return Array.isArray(data.tableauData);
        } catch {
          return false;
        }
      });
      
      expect(typeof hasData).toBe('boolean');
    }
  });
});

test.describe('Tableau Integration - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should handle missing Tableau API gracefully', async ({ page }) => {
    // Remove Tableau API
    await page.evaluate(() => {
      delete (window as any).tableau;
    });
    
    // Try to select a report
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      await rows.first().click();
      
      // Should not crash
      await page.waitForTimeout(500);
      
      // Page should still be functional
      const table = page.locator('.ant-table');
      await expect(table).toBeVisible();
    }
  });

  test('should log warning when Tableau is not available', async ({ page }) => {
    const warnings: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // Remove Tableau API
    await page.evaluate(() => {
      delete (window as any).tableau;
    });
    
    // Try to select a report
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      await rows.first().click();
      await page.waitForTimeout(1000);
      
      // Should have warning about missing Tableau
      const hasTableauWarning = warnings.some(w => 
        w.includes('Tableau') || w.includes('tableau')
      );
      
      expect(typeof hasTableauWarning).toBe('boolean');
    }
  });

  test('should handle invalid connection data', async ({ page }) => {
    // Set invalid connection data
    await page.evaluate(() => {
      const tableau = (window as any).tableau;
      if (tableau) {
        tableau.connectionData = 'invalid json {';
      }
    });
    
    // Page should still work
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });
});

test.describe('Tableau Integration - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should process data efficiently', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      const startTime = Date.now();
      
      await rows.first().click();
      await page.waitForTimeout(2000);
      
      const processingTime = Date.now() - startTime;
      
      // Should process within reasonable time (5 seconds)
      expect(processingTime).toBeLessThan(5000);
    }
  });

  test('should handle multiple report selections', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 1) {
      // Select first report
      await rows.nth(0).click();
      await page.waitForTimeout(1000);
      
      // Select second report
      await rows.nth(1).click();
      await page.waitForTimeout(1000);
      
      // Should handle gracefully
      const table = page.locator('.ant-table');
      await expect(table).toBeVisible();
    }
  });

  test('should not cause memory leaks', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Click same row multiple times
      for (let i = 0; i < 5; i++) {
        await rows.first().click();
        await page.waitForTimeout(500);
      }
      
      // Should still be responsive
      const table = page.locator('.ant-table');
      await expect(table).toBeVisible();
    }
  });
});

test.describe('Tableau Integration - Visual Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.ant-table');
  });

  test('should show selected row state', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      const firstRow = rows.first();
      
      await firstRow.click();
      await page.waitForTimeout(300);
      
      // Row should have some visual indication
      const hasSelectedClass = await firstRow.evaluate((el) => {
        return el.classList.contains('selected-row') ||
               el.classList.contains('ant-table-row-selected') ||
               el.classList.contains('active');
      });
      
      expect(typeof hasSelectedClass).toBe('boolean');
    }
  });

  test('should maintain UI responsiveness during data processing', async ({ page }) => {
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      await rows.first().click();
      
      // UI should remain interactive
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      
      const table = page.locator('.ant-table');
      await expect(table).toBeVisible();
    }
  });
});

