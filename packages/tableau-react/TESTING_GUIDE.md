# Tableau React - Testing Guide

## 📋 Overview

The Tableau React package has been split into **5 separate test suites** for easier testing and debugging. This allows you to run specific groups of tests independently, making it faster to identify and fix issues.

---

## 🗂️ Test Structure

### Test Groups

| Group | Files | Description | Timeout |
|-------|-------|-------------|---------|
| **Stores** | 1 file | Zustand store tests (chartsDataStore) | 5s |
| **Components** | 4 files | Component tests (HistoryTable, ReportTableRows, etc.) | 10s |
| **Modelling** | 3 files | Modelling component tests (Aliases, PopUps) | 10s |
| **Pages** | 3 files | Page component tests (Reports, CatalogueOfAliases, etc.) | 15s |
| **Integration** | 1 file | Integration tests (multiple components) | 15s |

### Test Files by Group

#### 1. **Store Tests** (Fastest - ~1-2 seconds)
```
src/stores/chartsDataStore.test.ts
```
- 17 tests
- Tests Zustand store functionality
- No complex UI rendering

#### 2. **Component Tests** (~5-10 seconds)
```
src/components/HistoryTable.test.tsx
src/components/ReportTableRows.test.tsx
src/components/CatalogueOfAliasesFilter.test.tsx
src/components/CatalogueAliasChangeStateDialog.test.tsx
```
- ~40 tests total
- Tests individual components in isolation
- Mocked dependencies

#### 3. **Modelling Tests** (~5-10 seconds)
```
src/components/Modelling/Alias/ModellingAliases.test.tsx
src/components/Modelling/Alias/ModellingPopUpAlias.test.tsx
src/components/Modelling/Alias/ModellingPopUpAliasNew.test.tsx
```
- Tests for modelling-specific components
- Alias management functionality

#### 4. **Page Tests** (~10-20 seconds)
```
src/pages/Reports.test.tsx
src/pages/CatalogueOfAliases.test.tsx
src/pages/ReportConfigsStream.test.tsx
```
- ~30 tests total
- Tests full page components
- More complex interactions
- May have longer timeouts

#### 5. **Integration Tests** (~5-10 seconds)
```
src/test/integration.test.tsx
```
- 8 tests
- Tests multiple components working together
- End-to-end workflows

---

## 🚀 Running Tests

### Quick Reference

```bash
# Run all unit tests (all 5 groups sequentially)
npm run test:unit

# Run specific test groups
npm run test:stores          # Fastest - run first!
npm run test:components      # Component tests
npm run test:modelling       # Modelling tests
npm run test:pages          # Page tests (slower)
npm run test:integration    # Integration tests

# Run with watch mode (auto-rerun on changes)
npm run test:stores:watch
npm run test:components:watch
npm run test:modelling:watch
npm run test:pages:watch
npm run test:integration:watch

# Run all tests (unit + E2E)
npm run test:all

# Run E2E tests only
npm run test:e2e
```

### Recommended Testing Workflow

When developing or debugging, run tests in this order:

1. **Start with stores** (fastest feedback):
   ```bash
   npm run test:stores
   ```

2. **Then components**:
   ```bash
   npm run test:components
   ```

3. **Then modelling**:
   ```bash
   npm run test:modelling
   ```

4. **Then pages** (slower):
   ```bash
   npm run test:pages
   ```

5. **Finally integration**:
   ```bash
   npm run test:integration
   ```

6. **Run all unit tests** before committing:
   ```bash
   npm run test:unit
   ```

---

## 🔧 Configuration Files

Each test group has its own Vitest configuration:

| Config File | Purpose | Timeout |
|-------------|---------|---------|
| `vitest.config.stores.ts` | Store tests | 5s |
| `vitest.config.components.ts` | Component tests | 10s |
| `vitest.config.modelling.ts` | Modelling tests | 10s |
| `vitest.config.pages.ts` | Page tests | 15s |
| `vitest.config.integration.ts` | Integration tests | 15s |
| `vitest.config.ts` | Default (all tests) | 10s |

---

## 🐛 Debugging Tests

### Run a Single Test File

```bash
# Using the specific config
vitest run --config vitest.config.components.ts src/components/HistoryTable.test.tsx

# Or using the default config with a pattern
npm run test -- src/components/HistoryTable.test.tsx
```

### Run Tests in Watch Mode

Watch mode automatically reruns tests when files change:

```bash
npm run test:components:watch
```

### Run Tests with UI

```bash
npm run test:ui
```

### Common Issues and Solutions

#### 1. **Tests Timeout**
- **Symptom**: Tests hang or timeout after 10-15 seconds
- **Solution**: 
  - Check if you're running the right test group (pages need more time)
  - Increase timeout in the specific config file
  - Check for infinite loops or missing mock responses

#### 2. **DOM Cleanup Errors**
- **Symptom**: "createRoot" errors or "act()" warnings
- **Solution**: 
  - Ensure `cleanup()` is called in `afterEach`
  - Check that all async operations complete before test ends

#### 3. **Mock Issues**
- **Symptom**: "Cannot read property of undefined" errors
- **Solution**: 
  - Verify all dependencies are properly mocked
  - Check mock return values match expected structure

---

## 📊 Test Coverage

### Current Coverage

| Group | Files | Tests | Status |
|-------|-------|-------|--------|
| Stores | 1 | 17 | ✅ Passing |
| Components | 4 | ~40 | ✅ Passing |
| Modelling | 3 | ~20 | ✅ Passing |
| Pages | 3 | ~30 | ⚠️ Some issues |
| Integration | 1 | 8 | ✅ Passing |
| **Total** | **12** | **~115** | **~95% passing** |

### Generate Coverage Report

```bash
# For specific group
vitest run --config vitest.config.components.ts --coverage

# For all tests
npm run test -- --coverage
```

---

## 🎯 Best Practices

### 1. **Run Relevant Tests First**
- Working on a component? Run `npm run test:components`
- Working on a page? Run `npm run test:pages`
- Working on store logic? Run `npm run test:stores`

### 2. **Use Watch Mode During Development**
```bash
npm run test:components:watch
```

### 3. **Run All Tests Before Committing**
```bash
npm run test:unit
```

### 4. **Keep Tests Fast**
- Mock external dependencies
- Avoid unnecessary `waitFor` calls
- Use appropriate timeouts

### 5. **Clean Up After Tests**
```typescript
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

---

## 🔄 Migration from Old Test Structure

### Before (Single Test Command)
```bash
npm run test  # Runs ALL tests at once (slow, hard to debug)
```

### After (Modular Test Commands)
```bash
npm run test:stores       # Fast feedback
npm run test:components   # Specific to what you're working on
npm run test:pages        # Only when needed
npm run test:unit         # All unit tests (when ready to commit)
```

### Benefits
- ✅ **Faster feedback** - Run only what you need
- ✅ **Easier debugging** - Isolate failing tests
- ✅ **Better organization** - Clear test boundaries
- ✅ **Parallel development** - Team members can work on different areas
- ✅ **CI/CD friendly** - Can run groups in parallel

---

## 📝 Adding New Tests

### 1. Determine the Test Group
- Is it a store? → `src/stores/*.test.ts`
- Is it a component? → `src/components/*.test.tsx`
- Is it a modelling component? → `src/components/Modelling/**/*.test.tsx`
- Is it a page? → `src/pages/*.test.tsx`
- Is it integration? → `src/test/*.test.tsx`

### 2. Run the Appropriate Test Group
```bash
npm run test:components:watch  # If adding component test
```

### 3. Follow Existing Patterns
- Use the same setup/teardown as similar tests
- Mock dependencies consistently
- Use appropriate timeouts

---

## 🚦 CI/CD Integration

### Sequential Execution (Safer)
```bash
npm run test:unit  # Runs all groups sequentially
```

### Parallel Execution (Faster)
```bash
# Run in parallel (requires CI/CD support)
npm run test:stores & \
npm run test:components & \
npm run test:modelling & \
npm run test:pages & \
npm run test:integration & \
wait
```

---

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Run tests in isolation to identify the problem
3. Check the specific config file for that test group
4. Review test output for specific error messages
5. Consult the main `TESTING_SUMMARY.md` for known issues

---

## ✅ Summary

- **5 test groups** for better organization
- **Separate configs** for each group
- **Faster feedback** with targeted testing
- **Easier debugging** with isolated test runs
- **Watch mode** for development
- **All tests** still available via `npm run test:unit`

Happy testing! 🎉

