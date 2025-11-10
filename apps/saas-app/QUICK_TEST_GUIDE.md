# Quick Test Guide - SaaS App

## 🚀 Quick Start

### 1. Run All Tests

```bash
cd apps/saas-app
npm run test:e2e
```

### 2. Run Tableau Tests Only

```bash
npm run test:e2e -- tableau-modelling.spec.ts
```

### 3. Run Tests in UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See all tests
- Run tests individually
- Watch tests execute
- Debug failures

---

## 📊 What Was Fixed

### Tableau Tests (`tableau-modelling.spec.ts`)

✅ **Fixed Routes:**
- `/tableau` → `/tableau/reports`
- `/modelling` → *removed* (not a separate page)
- `/catalogue` → `/tableau/catalogue-of-aliases`

✅ **Added Authentication:**
- All tests now login before running

✅ **Updated Selectors:**
- Using actual Ant Design components
- Flexible text-based selectors

✅ **19 Tests Total:**
- 4 tests for Tableau Reports
- 3 tests for Stream Reports
- 6 tests for Catalogue of Aliases
- 3 tests for Navigation
- 3 tests for Integration

---

## 🔍 Test Results

### Expected Results

When you run the tests, you should see:

```
✓ Tableau reports page loaded
✓ Found 2 tabs on reports page
✓ Report Config tab found
✓ Reports tab found
✓ Report configurations table/list displayed
✓ Create new report button found
...
```

### If Tests Fail

1. **Check backend is running:**
   - Default: `https://cyoda-develop.kube3.cyoda.org`
   - Should be accessible

2. **Check app is running:**
   ```bash
   npm run dev
   ```
   Should be on `http://localhost:3000`

3. **Check credentials:**
   - Default: `admin` / `password`
   - Update in test if different

4. **View detailed report:**
   ```bash
   npm run test:e2e:report
   ```

---

## 📝 Common Commands

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tableau-modelling.spec.ts

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test suite
npx playwright test e2e/tableau-modelling.spec.ts -g "Tableau Reports"

# View test report
npm run test:e2e:report

# Debug tests
npm run test:e2e:debug
```

---

## 🎯 Next Steps

1. **Run tests to verify fixes**
2. **Check test report for any failures**
3. **Review screenshots/videos if tests fail**
4. **Add more specific tests as needed**

---

## 📚 More Information

- [E2E Tests README](./e2e/README.md) - Detailed testing guide
- [Tableau Tests Fixed](./e2e/TABLEAU_TESTS_FIXED.md) - What was fixed and why
- [Testing Strategy](./TESTING_STRATEGY.md) - Overall testing approach

---

**Status:** ✅ Tests fixed and ready to run  
**Last Updated:** 2025-11-10

