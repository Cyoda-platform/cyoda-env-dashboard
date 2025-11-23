# E2E Tests for Processing Manager

This directory contains end-to-end (E2E) tests for the Processing Manager React application using Playwright.

## Test Files

### 1. `all-tabs-test.spec.ts`
**Comprehensive tab testing** - Tests all main tabs and subtabs in the Processing Manager UI.

**Coverage:**
- ✅ Processing Manager tab (summary, shards table)
- ✅ Processing Events tab (6 subtabs: statistics, polling, events view, error view, entities error list, sift logger)
- ✅ Time Statistics tab (2 subtabs: time stats, count stats)
- ✅ Transactions tab (with entities list view)
- ✅ PM Components tab (4 subtabs: execution queues, monitors, service processes, runnable components)
- ✅ Composite Indexes tab (with filter)
- ✅ Caches List tab
- ✅ Network Info tab
- ✅ ZooKeeper Info tab (3 subtabs: current node, online nodes, shards distribution)
- ✅ Mock API toggle functionality
- ✅ Console errors check

**Tests:** 11 tests

---

### 2. `state-machine.spec.ts`
**State Machine functionality** - Tests state machine diagram, transitions, and interactions.

**Coverage:**
- ✅ State machine diagram display
- ✅ State machine details section
- ✅ Transitions table
- ✅ Clicking on state nodes
- ✅ Transition details panel
- ✅ Filter transitions by state
- ✅ Search transitions
- ✅ Zoom in/out controls
- ✅ State machine statistics
- ✅ Error handling

**Tests:** 10 tests

---

### 3. `shards-management.spec.ts`
**Shards Management** - Tests shards table, actions, and ZooKeeper integration.

**Coverage:**
- ✅ Shards table with data
- ✅ Shard columns (Shard ID, Node ID, Status, Action)
- ✅ Shard action menu (Reassign, Reset)
- ✅ Filter shards by status
- ✅ Search shards
- ✅ ZooKeeper Info tab
- ✅ Current Node Info
- ✅ Loaded Online Nodes
- ✅ Loaded Shards Distribution
- ✅ Rebalance shards button
- ✅ Table pagination
- ✅ Table sorting
- ✅ Error handling

**Tests:** 14 tests

---

### 4. `processing-events.spec.ts`
**Processing Events** - Tests events tables, filters, and error views.

**Coverage:**
- ✅ Process Events Statistics
- ✅ Polling Info
- ✅ Processing Events View with filters
- ✅ Filter events by queue
- ✅ Filter events by status
- ✅ Processing Events Error View
- ✅ Filter error events by error type
- ✅ Entities Error List View
- ✅ Load entities error list with filter
- ✅ Sift Logger
- ✅ Search events
- ✅ Event details panel
- ✅ Table pagination
- ✅ Export events data
- ✅ Error handling

**Tests:** 14 tests

---

## Running E2E Tests

### Prerequisites

1. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   The server should be running on `http://localhost:3008` (configured in `playwright.config.ts`)

### Run Tests

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run tests in UI mode** (interactive):
```bash
npm run test:e2e:ui
```

**Run tests in headed mode** (see browser):
```bash
npm run test:e2e:headed
```

**Debug tests:**
```bash
npm run test:e2e:debug
```

**View test report:**
```bash
npm run test:e2e:report
```

**Run specific test file:**
```bash
npx playwright test e2e/state-machine.spec.ts
```

**Run specific test:**
```bash
npx playwright test -g "should display state machine diagram"
```

---

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL:** `http://localhost:3008`
- **Browser:** Chromium (Desktop Chrome)
- **Workers:** 1 (sequential execution)
- **Retries:** 0 (local), 2 (CI)
- **Timeout:** 30s navigation, 10s actions
- **Screenshots:** On failure
- **Video:** On failure
- **Trace:** On first retry

---

## Test Structure

Each test file follows this structure:

```typescript
import { test, expect } from '@playwright/test';

const TEST_NODE = 'test-node-01';
const BASE_URL = `/processing-ui/nodes/${TEST_NODE}`;

test.describe('Feature Name - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate, enable mock API, wait for load
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

---

## Mock API

Tests use mock API data for consistent results:

```javascript
// Enable mock API in beforeEach
await page.evaluate(() => {
  if (typeof (window as any).enableMockApi === 'function') {
    (window as any).enableMockApi();
  }
});
```

---

## Best Practices

1. **Wait for elements:** Use `waitForSelector` and `waitForTimeout` appropriately
2. **Check visibility:** Use `isVisible()` before interacting with elements
3. **Handle optional elements:** Use conditional checks for elements that may not exist
4. **Filter console errors:** Ignore known warnings (deprecated, favicon, ResizeObserver)
5. **Use descriptive test names:** Start with "should" and describe expected behavior
6. **Log progress:** Use `console.log` to track test execution
7. **Test error handling:** Include tests for error scenarios

---

## Debugging Tips

1. **Use headed mode** to see what's happening:
   ```bash
   npm run test:e2e:headed
   ```

2. **Use debug mode** to step through tests:
   ```bash
   npm run test:e2e:debug
   ```

3. **Check screenshots** in `test-results/` folder after failures

4. **View HTML report** for detailed results:
   ```bash
   npm run test:e2e:report
   ```

5. **Add `page.pause()`** in test to pause execution:
   ```typescript
   await page.pause(); // Opens Playwright Inspector
   ```

---

## CI/CD Integration

For CI/CD pipelines:

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run tests
npm run test:e2e
```

---

## Coverage Summary

**Total E2E Tests:** 49 tests across 4 files

**Coverage:**
- ✅ All main tabs (9 tabs)
- ✅ All subtabs (20+ subtabs)
- ✅ Filters and search functionality
- ✅ Table interactions (sorting, pagination)
- ✅ Action buttons and menus
- ✅ State machine diagram
- ✅ Shards management
- ✅ ZooKeeper integration
- ✅ Processing events
- ✅ Error handling
- ✅ Console error detection

**Test Quality:**
- ✅ Comprehensive coverage of critical user flows
- ✅ Tests for both happy path and edge cases
- ✅ Error handling and console error detection
- ✅ Mock API for consistent test data
- ✅ Graceful handling of optional UI elements

---

## Maintenance

When adding new features:

1. Add corresponding E2E tests
2. Update this README with new test coverage
3. Ensure tests pass before merging
4. Keep mock API data up to date

---

## Troubleshooting

**Tests fail with "Timeout":**
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify base URL is correct

**Tests fail with "Element not found":**
- Check if element selector is correct
- Verify element is visible before interacting
- Add appropriate wait conditions

**Mock API not working:**
- Check if `enableMockApi()` is called in `beforeEach`
- Verify mock API implementation in the app

**Browser not launching:**
- Run `npx playwright install` to install browsers
- Check system requirements for Playwright

