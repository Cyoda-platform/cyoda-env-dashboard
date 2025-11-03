# Testing Strategy for SaaS App

This document outlines the testing strategy for the Cyoda SaaS application, including both unit tests and end-to-end (E2E) tests.

## Overview

The SaaS app uses a **dual testing approach**:

1. **Unit Tests with Mocks** - Fast, isolated tests for components and hooks
2. **E2E Tests with Real Backend** - Comprehensive tests against real Cyoda backend

This approach provides both **speed during development** (unit tests) and **confidence before deployment** (E2E tests).

---

## Unit Tests (Vitest)

### Purpose
- Test individual components, hooks, and utilities in isolation
- Fast feedback during development
- Verify component behavior with mocked data

### Technology
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks for API calls and external dependencies

### Location
Unit tests are located in the individual packages:
- `packages/tasks-react/src/**/*.test.tsx`
- `packages/statemachine-react/src/**/*.test.tsx`
- `packages/tableau-react/src/**/*.test.tsx`
- `packages/processing-manager-react/src/**/*.test.tsx`
- `packages/http-api-react/src/**/*.test.tsx`
- `packages/ui-lib-react/src/**/*.test.tsx`

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for specific package
npm run test -- packages/tasks-react
```

### Unit Test Philosophy
- **Use mocks** for API calls, external services, and complex dependencies
- **Test behavior**, not implementation details
- **Keep tests fast** - unit tests should run in milliseconds
- **Test edge cases** - error states, loading states, empty states

### Example Unit Test

```typescript
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TasksList } from './TasksList';

// Mock the API hook
vi.mock('@cyoda/http-api-react', () => ({
  useTasksQuery: vi.fn(() => ({
    data: [{ id: '1', title: 'Test Task', state: 'OPEN' }],
    isLoading: false,
    error: null,
  })),
}));

test('should render tasks list', () => {
  render(<TasksList />);
  expect(screen.getByText('Test Task')).toBeInTheDocument();
});
```

---

## E2E Tests (Playwright)

### Purpose
- Test complete user workflows against real Cyoda backend
- Verify integration between frontend and backend
- Ensure real data flows correctly through the application
- Catch issues that unit tests cannot detect

### Technology
- **Framework**: Playwright
- **Backend**: Real Cyoda backend at `https://cyoda-develop.kube3.cyoda.org`
- **Browser**: Chromium (can be extended to Firefox, WebKit)

### Location
E2E tests are located in the SaaS app:
- `apps/saas-app/e2e/saas-app.spec.ts` - General app tests
- `apps/saas-app/e2e/tasks.spec.ts` - Tasks feature tests
- `apps/saas-app/e2e/entity-viewer.spec.ts` - Entity Viewer tests
- `apps/saas-app/e2e/tableau-modelling.spec.ts` - Tableau/Modelling tests
- `apps/saas-app/e2e/statemachine.spec.ts` - State Machine tests
- `apps/saas-app/e2e/processing-manager.spec.ts` - Processing Manager tests

### Running E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/tasks.spec.ts

# View test report
npm run test:e2e:report
```

### E2E Test Philosophy
- **Use real backend data** - No mocks, no fake data
- **Test user workflows** - Complete scenarios from start to finish
- **Be resilient** - Handle varying backend states gracefully
- **Don't modify production data** - Avoid clicking destructive actions
- **Use longer timeouts** - Real backend calls can be slow

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('should load and display tasks from real backend', async ({ page }) => {
  // Navigate to tasks page
  await page.goto('/tasks');
  
  // Wait for real API call to complete
  const response = await page.waitForResponse(
    response => response.url().includes('/api/alerts/tasks/paged'),
    { timeout: 30000 }
  );
  
  // Verify response is successful
  expect(response.status()).toBe(200);
  
  // Verify tasks are displayed in UI
  const tasksList = page.locator('.ant-table');
  await expect(tasksList).toBeVisible();
});
```

---

## Backend Configuration

### Development Backend
The SaaS app connects to the Cyoda backend configured in:
- **File**: `apps/saas-app/.env`
- **URL**: `https://cyoda-develop.kube3.cyoda.org`

### Changing Backend URL
To test against a different backend:

1. Update `.env` file:
```bash
VITE_APP_BASE_URL=https://your-backend-url.com/
```

2. Update `vite.config.ts` proxy configuration:
```typescript
proxy: {
  '/api': {
    target: 'https://your-backend-url.com',
    changeOrigin: true,
    secure: false,
  },
  // ... other proxies
}
```

3. Restart the dev server:
```bash
npm run dev
```

---

## Test Coverage

### What Unit Tests Cover
✅ Component rendering with different props  
✅ User interactions (clicks, inputs, etc.)  
✅ State management logic  
✅ Hook behavior with mocked data  
✅ Error handling with mocked errors  
✅ Edge cases and boundary conditions  

### What E2E Tests Cover
✅ Complete user workflows  
✅ Real API integration  
✅ Navigation between pages  
✅ Real data display  
✅ Backend error handling  
✅ Authentication flows  
✅ Cross-feature integration  

### What We Don't Test
❌ Backend API implementation (backend team's responsibility)  
❌ Third-party library internals  
❌ Browser-specific bugs (unless critical)  

---

## CI/CD Integration

### Recommended CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Execution Order
1. **Unit Tests** - Run first (fast, catch basic issues)
2. **E2E Tests** - Run after unit tests pass (slower, comprehensive)

---

## Best Practices

### For Unit Tests
1. **Keep tests focused** - One test should verify one behavior
2. **Use descriptive test names** - `should display error message when API fails`
3. **Mock external dependencies** - API calls, timers, random values
4. **Test user-visible behavior** - Not implementation details
5. **Keep tests fast** - Avoid unnecessary waits or delays

### For E2E Tests
1. **Test critical user paths** - Login, view data, perform actions
2. **Handle async operations** - Use `waitForResponse`, `waitForSelector`
3. **Be defensive** - Check if elements exist before interacting
4. **Use data-testid attributes** - For stable selectors
5. **Don't rely on specific data** - Backend data may change
6. **Use longer timeouts** - Real backend can be slow (30s+)

### For Both
1. **Write tests as you code** - Don't leave testing for later
2. **Run tests before committing** - Catch issues early
3. **Fix failing tests immediately** - Don't let them accumulate
4. **Review test failures carefully** - They often reveal real bugs
5. **Keep tests maintainable** - Refactor tests as you refactor code

---

## Troubleshooting

### Unit Tests Failing
- **Check mocks** - Are they returning the expected data?
- **Check imports** - Are you importing from the right packages?
- **Check async operations** - Are you awaiting promises?
- **Check test isolation** - Are tests affecting each other?

### E2E Tests Failing
- **Check backend availability** - Is the backend running and accessible?
- **Check authentication** - Do you need to login first?
- **Check timeouts** - Increase timeout for slow backend responses
- **Check selectors** - Has the UI changed?
- **Check network** - Are there CORS or proxy issues?

### Common Issues

**Issue**: E2E tests fail with "Timeout waiting for response"  
**Solution**: Increase timeout or check if backend endpoint exists

**Issue**: Unit tests fail with "Cannot find module"  
**Solution**: Check import paths and package dependencies

**Issue**: E2E tests fail with "Element not found"  
**Solution**: Add `waitForSelector` or check if element exists conditionally

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Summary

| Aspect | Unit Tests | E2E Tests |
|--------|-----------|-----------|
| **Speed** | Fast (milliseconds) | Slow (seconds) |
| **Scope** | Individual components | Complete workflows |
| **Data** | Mocked | Real backend |
| **Purpose** | Development feedback | Deployment confidence |
| **Run Frequency** | Every save | Before commit/deploy |
| **Maintenance** | Low | Medium |

**Remember**: Both types of tests are important. Unit tests give you speed and confidence during development. E2E tests give you confidence that the entire system works together correctly with real data.

