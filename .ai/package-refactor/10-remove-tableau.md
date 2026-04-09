# Actionable Step: Remove Remaining Tableau References from Codebase

**Objective:** Clean up all remaining Tableau WDC references in test files, SCSS, config, and variable names within the functional codebase.

**Prerequisites:** Steps 4/6/7 (rename to `reporting-react`, remove WDC code, update saas-app) are complete.

## Remaining References

### 1. `packages/reporting-react/src/test/integration.test.tsx`

Tests still mock `window.tableau` and assert against `mockTableau.submit()`, `mockTableau.connectionData`, etc. These tests verify Tableau WDC behavior that no longer exists in the component code.

- Remove all `mockTableau` setup/teardown
- Remove test cases: "should load report data and send to Tableau", "should handle missing Tableau API"
- Replace with tests that verify the component renders report data in a table without any WDC side effects

### 2. `packages/reporting-react/src/components/ReportTableRows.test.tsx`

Same issue as above — extensive Tableau WDC assertions throughout:
- `mockTableau.submit`, `mockTableau.connectionData`, `connectionData.tableauData`, `connectionData.tableauColumns`
- Entire `describe('Tableau Integration')` block

Actions:
- Remove the `describe('Tableau Integration')` block
- Remove all `mockTableau` setup and `window.tableau` mocking
- Remove assertions that check `tableauData`, `tableauColumns`, or `mockTableau.submit`
- Keep tests that verify data fetching and table rendering behavior

### 3. `packages/reporting-react/src/test/setup.ts`

Lines 64–65 mock `window.tableau` globally for all tests.

- Remove the `window.tableau` mock block

### 4. `packages/reporting-react/src/pages/Reports.scss`

Line 186: comment `// Global table styles for Tableau - Dark theme`

- Change to `// Global table styles - Dark theme`

### 5. `packages/reporting-react/src/App.scss`

Line 2: comment `* Tableau React - App Styles`
Line 34: comment `// Global table styles for Tableau`

- Change to `* Reporting React - App Styles` and `// Global table styles`

### 6. `packages/reporting-react/playwright.config.ts`

Line 4: comment `Playwright Configuration for Tableau React E2E Tests`

- Change to `Playwright Configuration for Reporting React E2E Tests`

### 7. `packages/statemachine-react/src/components/RangeCondition/RangeCondition.test.tsx`

Lines 318–319: variable named `tableauReact` used as alias for `@cyoda/ui-lib-react` import.

```typescript
const tableauReact = await import('@cyoda/ui-lib-react');
const ModellingPopUp = tableauReact.ModellingPopUp as any;
```

- Rename variable to `uiLib` or `uiLibReact`

## Acceptance Criteria

- [ ] No `window.tableau` mocking in any test setup or test file
- [ ] No `mockTableau` variables or assertions in test files
- [ ] No Tableau WDC test cases (submit, connectionData, tableauColumns, etc.)
- [ ] SCSS comments reference "Reporting" not "Tableau"
- [ ] Playwright config comment updated
- [ ] `tableauReact` variable renamed in statemachine-react test
- [ ] All tests still pass after cleanup

