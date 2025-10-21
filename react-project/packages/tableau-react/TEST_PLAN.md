# Tableau React - Comprehensive Test Plan

## 📋 Overview

This document maps the provided test cases to the React implementation and provides a comprehensive testing strategy for the Tableau Reports functionality.

**Test Date**: 2025-10-21  
**Package**: @cyoda/tableau-react  
**Status**: Ready for Testing

---

## 🎯 Test Case Mapping

### C50: Access to Report Config Editor Screen
**Priority**: Critical | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorReports.vue`  
**React Implementation**: `ReportConfigs.tsx`

**Test Steps**:
1. ✅ User is logged in to the application
2. ✅ COBI is configured in the application
3. ✅ Click on "Report Config" tab in the menu
4. ✅ Report config editor screen is visible

**Expected Results**:
- ✅ "Create New" button exists
- ✅ "Create from Template" button exists
- ✅ Table of existing report definitions
- ✅ Filter configurations (Authors, Entity Types, Search)
- ✅ Searching field

**React Test Files**:
- `e2e/report-configs.spec.ts` - E2E tests
- `src/pages/ReportConfigs.test.tsx` - Unit tests

**Status**: ✅ IMPLEMENTED

---

### C51: Searching by Report Name
**Priority**: Low | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorReportsFilter.vue`  
**React Implementation**: `ConfigEditorReportsFilter.tsx`

**Test Steps**:
1. ✅ You have a list of report configurations
2. ✅ Start typing the name or description in the search field
3. ✅ Results are filtered in real-time

**Expected Results**:
- ✅ Search field filters by name and description
- ✅ Results update as you type
- ✅ Clear button resets search

**React Test Files**:
- `e2e/report-configs.spec.ts` - Search functionality tests
- `src/components/ConfigEditorReportsFilter.test.tsx` - Unit tests

**Status**: ✅ IMPLEMENTED

---

### C52: Filtering by Filter Groups
**Priority**: Low | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorReportsFilter.vue`  
**React Implementation**: `ConfigEditorReportsFilter.tsx`

**Test Steps**:
1. ✅ You have a list of report configurations
2. ✅ Choose options from existing groups:
   - Author or Group
   - Entity
   - Time (if applicable)
   - Date (if applicable)

**Expected Results**:
- ✅ Result list matches the given filters
- ✅ Multiple filters can be applied simultaneously
- ✅ Filters are persisted in localStorage

**React Test Files**:
- `e2e/report-configs.spec.ts` - Filter tests
- `src/components/ConfigEditorReportsFilter.test.tsx` - Unit tests

**Status**: ✅ IMPLEMENTED

---

### C1549: Sorting by Headers
**Priority**: Low | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorReports.vue` (data-tables component)  
**React Implementation**: `ReportConfigs.tsx` (Ant Design Table)

**Test Steps**:
1. ✅ You have a list of report configurations
2. ✅ Click on sorting icon of every header

**Expected Results**:
- ✅ You can sort the list of report configs by:
  - Config name
  - Description
  - Type
  - User
  - Created date

**React Test Files**:
- `e2e/report-configs.spec.ts` - Sorting tests
- Ant Design Table provides built-in sorting

**Status**: ✅ IMPLEMENTED

---

### C54: Edit a Report Configuration
**Priority**: Critical | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorSimple.vue`  
**React Implementation**: `ReportEditor.tsx`

**Test Steps**:
1. ✅ You've got a sample report configuration
2. ✅ Click Edit icon
3. ✅ You see Edit Distributed Report screen
4. ✅ Make changes in each tab:
   - Model
   - Summary
   - Grouping
   - Sorting
   - Columns
   - Filter Builder
5. ✅ Click Update

**Expected Results**:
- ✅ Get the message "Report was Updated"
- ✅ All tabs are functional
- ✅ Changes are saved

**React Test Files**:
- `e2e/report-editor.spec.ts` - Full workflow tests
- `src/pages/ReportEditor.test.tsx` - Unit tests
- `src/components/ReportEditorTab*.test.tsx` - Tab component tests

**Status**: ✅ IMPLEMENTED

---

### C55: Copy a Report Configuration
**Priority**: Medium | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorSaveAs.vue`  
**React Implementation**: `CloneReportDialog.tsx`

**Test Steps**:
1. ✅ You've got a sample report configuration
2. ✅ Click Copy icon
3. ✅ Copy window is opened
4. ✅ Enter a new name or leave the suggested name
5. ✅ Add description if necessary
6. ✅ Click Save

**Expected Results**:
- ✅ Edit Distributed Report screen of the newly created report config is opened
- ✅ All configuration is copied
- ✅ New report has unique ID

**React Test Files**:
- `e2e/report-configs.spec.ts` - Clone workflow tests
- `src/components/CloneReportDialog.test.tsx` - Unit tests

**Status**: ✅ IMPLEMENTED

---

### C56: Run a Report Configuration
**Priority**: Critical | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorReports.vue` (onRunReport)  
**React Implementation**: `ReportConfigs.tsx` (handleRunReport)

**Test Steps**:
1. ✅ You've got an existing report configuration
2. ✅ Click Run icon
3. ✅ Wait for execution

**Expected Results**:
- ✅ Get the message "Success Report is completed"
- ✅ Loading indicator shows during execution
- ✅ Report appears in Reports tab

**React Test Files**:
- `e2e/report-configs.spec.ts` - Run report tests
- `e2e/complete-workflow.spec.ts` - Full workflow

**Status**: ✅ IMPLEMENTED

---

### C57: Delete a Report Configuration
**Priority**: High | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorReports.vue` (onDelete)  
**React Implementation**: `ReportConfigs.tsx` (handleDelete)

**Test Steps**:
1. ✅ You've got an existing report configuration
2. ✅ Click Delete icon
3. ✅ Confirm deleting
4. ✅ If the config has reports on it, confirm deleting of reports

**Expected Results**:
- ✅ The report config is deleted
- ✅ Confirmation dialog appears
- ✅ Table updates after deletion

**React Test Files**:
- `e2e/report-configs.spec.ts` - Delete tests
- Uses Ant Design Modal for confirmation

**Status**: ✅ IMPLEMENTED

---

### C58: Create a New Report Configuration
**Priority**: Critical | **Type**: Smoke & Sanity

**Vue Implementation**: `ConfigEditorNew.vue`  
**React Implementation**: `CreateReportDialog.tsx`

**Test Steps**:
1. ✅ Click Create new
2. ✅ Enter Name and Description
3. ✅ Select Entity Class
4. ✅ Click Confirm
5. ✅ Go to Model tab - Add two or more column definitions
6. ✅ Select and Add two or more Aliases
7. ✅ Go to Columns tab - Choose and add columns values
8. ✅ Go to Sorting tab - Choose and Add a sorting value
9. ✅ Go to Grouping tab - Choose and Add a grouping value
10. ✅ Go to Summary tab - Choose and Add a summary value
11. ✅ Go to FilterBuilder tab - Select a match
12. ✅ Click Update

**Expected Results**:
- ✅ Get the message "Report was Updated"
- ✅ All tabs are functional
- ✅ Report is created successfully

**React Test Files**:
- `e2e/complete-workflow.spec.ts` - Full creation workflow
- `src/components/CreateReportDialog.test.tsx` - Unit tests
- `src/pages/ReportEditor.test.tsx` - Editor tests

**Status**: ✅ IMPLEMENTED

---

### C1663: Export and Import Reports
**Priority**: High | **Type**: Smoke & Sanity

**Vue Implementation**: `ExportImport.vue`  
**React Implementation**: `ExportImport.tsx` (from cobi-react)

**Test Steps**:
1. ✅ Select one report configuration and click Export
2. ✅ Delete this report from table
3. ✅ Import it back
4. ✅ Select at least two report configurations and click Export
5. ✅ Delete these reports from table
6. ✅ Import them back

**Expected Results**:
- ✅ File is exported (single)
- ✅ Report is deleted
- ✅ Report is imported back
- ✅ Files are exported (multiple)
- ✅ Reports are deleted
- ✅ Reports are imported back

**React Test Files**:
- `e2e/report-configs.spec.ts` - Export/Import tests
- Uses shared ExportImport component from cobi-react

**Status**: ⚠️ PARTIALLY IMPLEMENTED (Export/Import component exists in cobi-react)

---

### C1785: Save Column Width Settings and Sorting by Headers
**Priority**: Medium | **Type**: Functional

**Vue Implementation**: `ConfigEditorReports.vue` (TableSaveStateMixin)  
**React Implementation**: `ReportConfigs.tsx` (localStorage persistence)

**Test Steps**:
1. ✅ Go to Reports page
2. ✅ Set width of columns and sort records by any header
3. ✅ Refresh the page
4. ✅ Check that all settings were saved

**Expected Results**:
- ✅ Column widths are persisted
- ✅ Sorting state is persisted
- ✅ Settings restored on page reload

**React Test Files**:
- `e2e/report-configs.spec.ts` - State persistence tests
- Uses localStorage for persistence

**Status**: ✅ IMPLEMENTED

---

### C4462: Reports Result
**Priority**: Medium | **Type**: Smoke & Sanity

**Vue Implementation**: `HistoryReports.vue`  
**React Implementation**: `HistoryReportsTab.tsx`

**Test Steps**:
1. ✅ Run a report with grouping, sorting, and at least one condition
2. ✅ Go to reports results page
3. ✅ Check:
   - Filters
   - Sorting by DateTime header
   - Page settings
   - Lazy loading toggle on and off
   - Group display InTable and OutTable
   - Information icon and all three tabs (Group by, Sort by, Conditions)
   - Copy icon
   - Edit icon for Grouping settings (deletion, adding, update)
   - Info about an entity by clicking on a result row

**Expected Results**:
- ✅ All features are functional
- ✅ Grouping works correctly
- ✅ Sorting works correctly
- ✅ Filters work correctly

**React Test Files**:
- `e2e/reports.spec.ts` - Reports tab tests
- `src/pages/HistoryReportsTab.test.tsx` - Unit tests

**Status**: ✅ IMPLEMENTED

---

### C4467: Run Report from Reports Results Tab
**Priority**: Medium | **Type**: Functional

**Vue Implementation**: `HistoryReports.vue`  
**React Implementation**: `HistoryReportsTab.tsx`

**Test Steps**:
1. ✅ Choose a report
2. ✅ Check Run buttons: Run and Run and Show Result
3. ✅ Edit a report from this page
4. ✅ Add some filters and click Reset state button

**Expected Results**:
- ✅ Run buttons work correctly
- ✅ Edit functionality works
- ✅ Reset state clears filters

**React Test Files**:
- `e2e/reports.spec.ts` - Run from results tests

**Status**: ✅ IMPLEMENTED

---

### C8222: Entity Type Toggle
**Priority**: Medium | **Type**: Other

**Vue Implementation**: Various components  
**React Implementation**: `CreateReportDialog.tsx`, `ReportConfigs.tsx`

**Test Steps**:
1. ✅ Switch toggle to Business and Technical entity on the main Reports page
2. ✅ Switch toggle on creation tab

**Expected Results**:
- ✅ Entity type filter works
- ✅ Only relevant entities are shown

**React Test Files**:
- `e2e/report-configs.spec.ts` - Entity type tests
- `src/components/CreateReportDialog.test.tsx` - Unit tests

**Status**: ✅ IMPLEMENTED

---

## 🧪 Test Execution Strategy

### 1. Unit Tests (Vitest)
```bash
cd react-project/packages/tableau-react
npm run test
```

**Coverage Areas**:
- Component rendering
- User interactions
- State management
- API integration
- Form validation

### 2. E2E Tests (Playwright)
```bash
cd react-project/packages/tableau-react
npm run test:e2e
```

**Coverage Areas**:
- Full user workflows
- Cross-browser compatibility
- Visual regression
- Performance

### 3. Manual Testing
- Test with real backend API
- Test with actual Tableau Desktop
- Test edge cases
- Test accessibility

---

## 📊 Test Coverage Summary

| Test Case | Priority | Status | React Implementation | Test Files |
|-----------|----------|--------|---------------------|------------|
| C50 | Critical | ✅ | ReportConfigs.tsx | report-configs.spec.ts |
| C51 | Low | ✅ | ConfigEditorReportsFilter.tsx | report-configs.spec.ts |
| C52 | Low | ✅ | ConfigEditorReportsFilter.tsx | report-configs.spec.ts |
| C1549 | Low | ✅ | ReportConfigs.tsx | report-configs.spec.ts |
| C54 | Critical | ✅ | ReportEditor.tsx | report-editor.spec.ts |
| C55 | Medium | ✅ | CloneReportDialog.tsx | report-configs.spec.ts |
| C56 | Critical | ✅ | ReportConfigs.tsx | report-configs.spec.ts |
| C57 | High | ✅ | ReportConfigs.tsx | report-configs.spec.ts |
| C58 | Critical | ✅ | CreateReportDialog.tsx | complete-workflow.spec.ts |
| C1663 | High | ⚠️ | ExportImport.tsx | report-configs.spec.ts |
| C1785 | Medium | ✅ | ReportConfigs.tsx | report-configs.spec.ts |
| C4462 | Medium | ✅ | HistoryReportsTab.tsx | reports.spec.ts |
| C4467 | Medium | ✅ | HistoryReportsTab.tsx | reports.spec.ts |
| C8222 | Medium | ✅ | CreateReportDialog.tsx | report-configs.spec.ts |

**Overall Status**: 13/14 test cases fully implemented (92.9%)

---

## 🔍 Known Issues & Limitations

1. **Export/Import**: Partially implemented - component exists but may need integration testing
2. **Backend Integration**: Tests use mocked API - need real backend testing
3. **Tableau Desktop**: Need testing with actual Tableau Desktop application

---

## ✅ Next Steps

1. Run unit tests and verify all pass
2. Run E2E tests and verify all pass
3. Test with real backend API
4. Test with Tableau Desktop
5. Document any issues found
6. Create bug reports for any failures

