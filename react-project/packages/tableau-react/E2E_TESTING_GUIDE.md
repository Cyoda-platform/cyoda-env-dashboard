# E2E Testing Guide - Tableau React

**Package**: @cyoda/tableau-react  
**Testing Framework**: Playwright  
**Test Count**: 80+ E2E tests  
**Coverage**: Full application workflow  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What is E2E Testing?

End-to-End (E2E) testing validates the entire application workflow from the user's perspective. Unlike unit tests that test individual components in isolation, E2E tests:

- Test the complete user journey
- Verify integration between components
- Test real browser behavior
- Validate UI/UX functionality
- Catch integration issues

### Why Playwright?

- **Fast**: Parallel test execution
- **Reliable**: Auto-waiting and retry mechanisms
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Mobile**: Test responsive designs
- **Developer-friendly**: Great debugging tools

---

## 🚀 Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Tableau React package installed

### Installation

Playwright is already installed as a dev dependency. To install browsers:

```bash
npx playwright install
```

To install with system dependencies:

```bash
npx playwright install --with-deps
```

### Configuration

The Playwright configuration is in `playwright.config.ts`:

```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  projects: ['chromium', 'firefox', 'webkit', 'Mobile Chrome', 'Mobile Safari']
}
```

---

## 🏃 Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

### Run Specific Test File

```bash
npx playwright test e2e/reports.spec.ts
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests on Mobile

```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### View Test Report

```bash
npm run test:e2e:report
```

### Run All Tests (Unit + E2E)

```bash
npm run test:all
```

---

## 📁 Test Structure

### Test Files

```
e2e/
├── reports.spec.ts              # Main reports page tests (40+ tests)
├── history-table.spec.ts        # History table component tests (30+ tests)
└── tableau-integration.spec.ts  # Tableau WDC integration tests (20+ tests)
```

### Test Organization

Each test file is organized into describe blocks:

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

---

## 📝 Test Coverage

### Reports Page Tests (40+ tests)

**File**: `e2e/reports.spec.ts`

- ✅ Page rendering and structure
- ✅ Table display and interactions
- ✅ Navigation between routes
- ✅ Accessibility features
- ✅ Performance metrics
- ✅ Visual regression testing
- ✅ Responsive design (mobile, tablet, desktop)

### History Table Tests (30+ tests)

**File**: `e2e/history-table.spec.ts`

- ✅ Table structure and display
- ✅ Row interactions (click, hover, select)
- ✅ Column sorting
- ✅ Data formatting (dates, numbers, status)
- ✅ Empty states and loading states
- ✅ Responsive behavior
- ✅ Keyboard navigation

### Tableau Integration Tests (20+ tests)

**File**: `e2e/tableau-integration.spec.ts`

- ✅ Tableau API availability
- ✅ Connection data formatting
- ✅ Data transformation
- ✅ Error handling
- ✅ Performance optimization
- ✅ Visual feedback
- ✅ Multiple report selections

---

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display correctly', async ({ page }) => {
    const element = page.locator('.my-element');
    await expect(element).toBeVisible();
  });
});
```

### Common Patterns

#### Waiting for Elements

```typescript
// Wait for selector
await page.waitForSelector('.ant-table');

// Wait for URL
await page.waitForURL('/tableau/reports');

// Wait for timeout
await page.waitForTimeout(1000);
```

#### Interacting with Elements

```typescript
// Click
await page.locator('button').click();

// Type
await page.locator('input').fill('text');

// Hover
await page.locator('.row').hover();

// Select
await page.locator('select').selectOption('value');
```

#### Assertions

```typescript
// Visibility
await expect(page.locator('.element')).toBeVisible();

// Text content
await expect(page.locator('h1')).toHaveText('Tableau');

// Count
const count = await page.locator('tr').count();
expect(count).toBeGreaterThan(0);

// URL
await expect(page).toHaveURL(/tableau/);
```

#### Screenshots

```typescript
// Take screenshot
await page.screenshot({ path: 'screenshot.png' });

// Visual regression
await expect(page).toHaveScreenshot('page.png');
```

---

## 🎯 Best Practices

### 1. Use Data Test IDs

```typescript
// Good
await page.locator('[data-testid="submit-button"]').click();

// Avoid
await page.locator('button.btn-primary').click();
```

### 2. Wait for Elements

```typescript
// Good
await page.waitForSelector('.table');
await page.locator('.row').click();

// Avoid
await page.locator('.row').click(); // Might fail if not loaded
```

### 3. Use Descriptive Test Names

```typescript
// Good
test('should display error message when form is invalid', ...);

// Avoid
test('test 1', ...);
```

### 4. Keep Tests Independent

```typescript
// Good - Each test sets up its own state
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// Avoid - Tests depending on each other
```

### 5. Use Page Object Model

```typescript
// Create page objects for reusable logic
class ReportsPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/');
  }
  
  async selectReport(index: number) {
    await this.page.locator('.ant-table-tbody tr').nth(index).click();
  }
}
```

---

## 🔄 CI/CD Integration

### GitHub Actions

A workflow file is provided at `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Running in CI

```bash
# Set CI environment variable
CI=true npm run test:e2e
```

In CI mode:
- Tests run in headless mode
- Retries are enabled (2 retries)
- Tests run sequentially (not parallel)
- Screenshots/videos saved on failure

---

## 🐛 Troubleshooting

### Tests Failing Locally

1. **Clear browser cache**:
   ```bash
   npx playwright install --force
   ```

2. **Update Playwright**:
   ```bash
   npm install -D @playwright/test@latest
   ```

3. **Check dev server is running**:
   ```bash
   npm run dev
   ```

### Flaky Tests

1. **Add explicit waits**:
   ```typescript
   await page.waitForSelector('.element');
   ```

2. **Increase timeout**:
   ```typescript
   test('my test', async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
   });
   ```

3. **Use retry mechanism**:
   ```typescript
   // In playwright.config.ts
   retries: 2
   ```

### Debugging Tests

1. **Run in debug mode**:
   ```bash
   npm run test:e2e:debug
   ```

2. **Use headed mode**:
   ```bash
   npm run test:e2e:headed
   ```

3. **Add console logs**:
   ```typescript
   console.log(await page.locator('.element').textContent());
   ```

4. **Take screenshots**:
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

### Common Issues

**Issue**: "Timeout waiting for selector"
**Solution**: Increase timeout or add explicit wait

**Issue**: "Element is not visible"
**Solution**: Wait for element to be visible before interacting

**Issue**: "Tests pass locally but fail in CI"
**Solution**: Check for timing issues, add retries

---

## 📊 Test Reports

### HTML Report

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

The report includes:
- Test results summary
- Screenshots of failures
- Videos of test runs
- Detailed error messages
- Performance metrics

### Report Location

```
playwright-report/
├── index.html          # Main report
├── data/              # Test data
└── trace/             # Execution traces
```

---

## 🎓 Learning Resources

### Official Documentation
- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Tutorials
- [Getting Started](https://playwright.dev/docs/intro)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Debugging](https://playwright.dev/docs/debug)

---

## 📈 Test Statistics

- **Total E2E Tests**: 80+
- **Test Files**: 3
- **Browsers Tested**: 5 (Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari)
- **Average Test Duration**: ~30 seconds
- **Coverage**: Full application workflow

---

## 🎉 Summary

The Tableau React package has comprehensive E2E test coverage with:

- ✅ 80+ end-to-end tests
- ✅ Cross-browser testing (5 browsers)
- ✅ Mobile responsive testing
- ✅ Visual regression testing
- ✅ Accessibility testing
- ✅ Performance testing
- ✅ CI/CD integration ready

**All tests are passing and ready for production!** 🚀

