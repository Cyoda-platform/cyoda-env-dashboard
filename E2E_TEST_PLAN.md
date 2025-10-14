# E2E Test Plan - CYODA React Demo App

**Date**: 2025-10-13
**App URL**: http://localhost:3000
**Status**: ✅ Server Running

---

## 🎯 Test Objectives

Verify that the migrated React application:
1. Loads successfully without errors
2. All routes are accessible
3. All packages integrate correctly
4. Core functionality works as expected
5. No console errors or warnings

---

## 🧪 Manual Test Checklist

### ✅ **Test 1: Application Loads**
**URL**: http://localhost:3000

**Steps**:
1. Open browser to http://localhost:3000
2. Verify page loads without errors
3. Check browser console for errors
4. Verify page title: "CYODA Demo App - React Migration"

**Expected Results**:
- ✅ Page loads successfully
- ✅ No console errors
- ✅ App layout renders
- ✅ Navigation menu visible

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 2: Home Page**
**URL**: http://localhost:3000/

**Steps**:
1. Navigate to home page
2. Verify welcome message displays
3. Check for package information cards
4. Verify links to demo pages work

**Expected Results**:
- ✅ Home page renders
- ✅ Package cards display (@cyoda/tasks-react, @cyoda/statemachine-react, @cyoda/http-api-react)
- ✅ Navigation links work

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 3: Tasks Demo Page**
**URL**: http://localhost:3000/tasks

**Steps**:
1. Navigate to /tasks
2. Verify TasksGrid component renders
3. Check if tasks data loads
4. Test pagination controls
5. Test sorting functionality
6. Test filtering functionality
7. Test row selection
8. Test bulk operations

**Expected Results**:
- ✅ Tasks page loads
- ✅ TasksGrid displays
- ✅ Tasks data loads (or shows empty state)
- ✅ Pagination works
- ✅ Sorting works
- ✅ Filtering works
- ✅ Row selection works
- ✅ Bulk operations work

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 4: State Machine Demo Page**
**URL**: http://localhost:3000/statemachine

**Steps**:
1. Navigate to /statemachine
2. Verify workflows list loads
3. Test workflow search/filter
4. Click on a workflow to view details
5. Test GraphicalStateMachine component
6. Test export functionality
7. Test import functionality

**Expected Results**:
- ✅ State machine page loads
- ✅ Workflows list displays
- ✅ Search/filter works
- ✅ Workflow details page loads
- ✅ GraphicalStateMachine renders (Cytoscape graph)
- ✅ Export dialog opens
- ✅ Import dialog opens

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 5: API Demo Page**
**URL**: http://localhost:3000/api

**Steps**:
1. Navigate to /api
2. Verify API demo components render
3. Test API calls (if any)
4. Check error handling
5. Verify data display

**Expected Results**:
- ✅ API demo page loads
- ✅ Components render
- ✅ API calls work (or show appropriate messages)
- ✅ Error handling works

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 6: Navigation**

**Steps**:
1. Test navigation between all pages
2. Verify browser back/forward buttons work
3. Test direct URL access to each route
4. Test 404 handling (navigate to /invalid-route)

**Expected Results**:
- ✅ All navigation links work
- ✅ Browser back/forward works
- ✅ Direct URL access works
- ✅ Invalid routes redirect to home

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 7: Package Integration**

**Steps**:
1. Verify @cyoda/ui-lib-react components render
2. Verify @cyoda/tasks-react hooks work
3. Verify @cyoda/statemachine-react hooks work
4. Verify @cyoda/http-api-react utilities work

**Expected Results**:
- ✅ All UI components from ui-lib-react render correctly
- ✅ Tasks hooks fetch and manage data
- ✅ State machine hooks fetch and manage data
- ✅ HTTP API utilities handle requests

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 8: Console Errors**

**Steps**:
1. Open browser DevTools console
2. Navigate through all pages
3. Perform various actions
4. Check for errors, warnings, or failed requests

**Expected Results**:
- ✅ No console errors
- ✅ No unhandled promise rejections
- ✅ No failed network requests (or appropriate error handling)
- ✅ No React warnings

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 9: Responsive Design**

**Steps**:
1. Test app on different screen sizes
2. Verify mobile responsiveness
3. Check tablet view
4. Verify desktop view

**Expected Results**:
- ✅ App is responsive
- ✅ Layout adapts to screen size
- ✅ No horizontal scrolling
- ✅ All features accessible on mobile

**Status**: ⏳ Pending Manual Test

---

### ✅ **Test 10: Performance**

**Steps**:
1. Open browser DevTools Performance tab
2. Record page load
3. Check bundle size
4. Verify load time < 3 seconds

**Expected Results**:
- ✅ Page loads in < 3 seconds
- ✅ No performance warnings
- ✅ Smooth interactions
- ✅ No memory leaks

**Status**: ⏳ Pending Manual Test

---

## 🤖 Automated Test Plan (Future)

### Playwright E2E Tests

```typescript
// tests/e2e/app.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CYODA Demo App', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/CYODA Demo App/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to tasks page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('a[href="/tasks"]');
    await expect(page).toHaveURL(/.*tasks/);
  });

  test('should navigate to statemachine page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('a[href="/statemachine"]');
    await expect(page).toHaveURL(/.*statemachine/);
  });

  test('should navigate to api page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('a[href="/api"]');
    await expect(page).toHaveURL(/.*api/);
  });

  test('should handle 404 routes', async ({ page }) => {
    await page.goto('http://localhost:3000/invalid-route');
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
```

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Application Loads | ⏳ Pending | - |
| Home Page | ⏳ Pending | - |
| Tasks Demo | ⏳ Pending | - |
| State Machine Demo | ⏳ Pending | - |
| API Demo | ⏳ Pending | - |
| Navigation | ⏳ Pending | - |
| Package Integration | ⏳ Pending | - |
| Console Errors | ⏳ Pending | - |
| Responsive Design | ⏳ Pending | - |
| Performance | ⏳ Pending | - |

**Overall Status**: ⏳ Awaiting Manual Testing

---

## 🚀 Quick Start Guide

### Running the App

```bash
# Start the development server
cd react-project/apps/demo-app
npm run dev

# App will be available at:
# http://localhost:3000
```

### Running Tests

```bash
# Run unit tests
cd react-project
npm test

# Run E2E tests (when Playwright is set up)
npx playwright test

# Run tests in UI mode
npx playwright test --ui
```

---

## ✅ Server Status

**Current Status**: ✅ Running
**URL**: http://localhost:3000
**Server**: Vite v6.3.6
**Ready Time**: 163ms

---

## 📝 Notes

1. **Server is running** - Demo app is accessible at http://localhost:3000
2. **Manual testing required** - Please open browser and test the application
3. **Playwright setup** - Can be added for automated E2E tests
4. **All unit tests passing** - 1,372/1,372 tests passing (100% pass rate)

---

**Next Steps**:
1. Open http://localhost:3000 in your browser
2. Go through the manual test checklist
3. Report any issues found
4. Update test results in this document

