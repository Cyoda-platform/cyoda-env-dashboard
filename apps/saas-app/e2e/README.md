# E2E Tests for SaaS App

This directory contains end-to-end (E2E) tests for the Cyoda SaaS application using Playwright.

## Overview

These tests run against the **real Cyoda backend** at `https://cyoda-develop.kube3.cyoda.org` to verify that the application works correctly with real data.

## Test Files

- **`saas-app.spec.ts`** - General app tests (navigation, layout, error handling, performance)
- **`saas-app-with-backend.spec.ts`** - Tests with real backend data integration
- **`tableau-modelling.spec.ts`** - ✅ **UPDATED** Tableau Reporting tests (Reports, Stream Reports, Catalogue of Aliases)
- **`tasks.spec.ts`** - Tasks feature tests (list, detail, filters, pagination)
- **`entity-viewer.spec.ts`** - Entity Viewer tests (entity types, schema, fields, JOINs)
- **`statemachine.spec.ts`** - State Machine tests (workflows, states, transitions)
- **`processing-manager.spec.ts`** - Processing Manager tests (nodes, queues, stats)

### ✅ Recently Updated: Tableau Tests

The `tableau-modelling.spec.ts` file has been updated to work with the SaaS app integration:

**What was fixed:**
- ❌ Old paths: `/tableau`, `/modelling`, `/catalogue` → ✅ New paths: `/tableau/reports`, `/tableau/reports/stream`, `/tableau/catalogue-of-aliases`
- ✅ Added authentication (login before each test)
- ✅ Updated selectors to match SaaS app UI
- ✅ Added navigation tests
- ✅ Added integration tests
- ✅ More resilient error handling

**Test Coverage:**
- **Tableau Reports** - Main reports page with tabs
- **Stream Reports** - Stream report configurations
- **Catalogue of Aliases** - Alias management with CRUD operations
- **Navigation** - Menu navigation and route accessibility
- **Integration** - Console errors, backend data, error handling

## Prerequisites

1. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install
   ```

2. **Start the dev server** (in a separate terminal):
   ```bash
   npm run dev
   ```
   The dev server must be running on `http://localhost:3000` for E2E tests to work.

3. **Backend connection**: Ensure the backend at `https://cyoda-develop.kube3.cyoda.org` is accessible.

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```
This opens Playwright's UI where you can:
- See all tests
- Run tests individually
- Watch tests execute in real-time
- Debug failures

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
# Run Tableau tests
npx playwright test e2e/tableau-modelling.spec.ts

# Run Tasks tests
npx playwright test e2e/tasks.spec.ts

# Run all tests with "backend" in the name
npx playwright test -g "backend"
```

### Run specific test
```bash
npx playwright test e2e/tasks.spec.ts -g "should load tasks page"

# Run only Tableau Reports tests
npx playwright test e2e/tableau-modelling.spec.ts -g "Tableau Reports"

# Run only Catalogue of Aliases tests
npx playwright test e2e/tableau-modelling.spec.ts -g "Catalogue of Aliases"
```

### View test report
```bash
npm run test:e2e:report
```

## Test Configuration

Configuration is in `playwright.config.ts`:
- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:3000`
- **Browser**: Chromium
- **Workers**: 1 (sequential execution to avoid conflicts with real backend)
- **Retries**: 1 (retry once on failure due to real backend variability)
- **Timeouts**: 60s per test, 30s for navigation

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/feature');
    
    // Wait for API call
    await page.waitForResponse(
      response => response.url().includes('/api/endpoint'),
      { timeout: 30000 }
    );
    
    // Verify UI
    const element = page.locator('.selector');
    await expect(element).toBeVisible();
  });
});
```

### Best Practices

1. **Wait for API responses** - Don't rely on fixed timeouts
   ```typescript
   await page.waitForResponse(
     response => response.url().includes('/api/endpoint') && response.status() === 200
   );
   ```

2. **Use longer timeouts** - Real backend can be slow
   ```typescript
   { timeout: 30000 } // 30 seconds
   ```

3. **Check if elements exist** - Backend data may vary
   ```typescript
   const hasElement = await element.count() > 0;
   if (hasElement) {
     // Test with element
   }
   ```

4. **Don't modify production data** - Avoid clicking destructive actions
   ```typescript
   // DON'T: await page.click('button:has-text("Delete")');
   // DO: Check if button exists
   const deleteButton = page.locator('button:has-text("Delete")');
   const hasDelete = await deleteButton.count() > 0;
   console.log('✓ Delete button available');
   ```

5. **Use descriptive test names**
   ```typescript
   test('should display tasks from real backend', async ({ page }) => {
     // ...
   });
   ```

## Debugging Tests

### Debug mode
```bash
npx playwright test --debug
```
This opens the Playwright Inspector where you can:
- Step through tests
- Inspect elements
- See console logs
- View network requests

### Screenshots on failure
Screenshots are automatically captured on test failure and saved to `test-results/`.

### Video on failure
Videos are automatically recorded on test failure and saved to `test-results/`.

### Trace on retry
Traces are automatically captured when tests are retried. View them with:
```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## Common Issues

### Issue: "Timeout waiting for response"
**Solution**: Increase timeout or check if backend endpoint exists
```typescript
await page.waitForResponse(
  response => response.url().includes('/api/endpoint'),
  { timeout: 60000 } // Increase to 60s
);
```

### Issue: "Element not found"
**Solution**: Add wait or check conditionally
```typescript
await page.waitForSelector('.element', { timeout: 10000 });
// OR
const hasElement = await page.locator('.element').count() > 0;
```

### Issue: "Backend returns 401/404"
**Solution**: 
- 401: Authentication required - login first
- 404: Endpoint doesn't exist on this backend

### Issue: "Tests fail randomly"
**Solution**: 
- Increase retries in `playwright.config.ts`
- Add more explicit waits
- Check for race conditions

## CI/CD Integration

To run E2E tests in CI/CD:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Strategy](../TESTING_STRATEGY.md)

## Notes

- These tests use **real backend data**, not mocks
- Tests run **sequentially** to avoid conflicts
- Tests are **resilient** to varying backend states
- Tests **don't modify production data**
- Tests have **longer timeouts** for real backend calls

