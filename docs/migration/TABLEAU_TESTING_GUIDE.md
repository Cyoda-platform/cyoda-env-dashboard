# Tableau Reporting - Testing & Fixes Guide

## Overview
This guide documents the fixes applied to the Tableau reporting functionality and provides comprehensive testing instructions.

## Fixes Applied

### 1. Mock Server Data Structure
**Issue**: Report definitions in mock server didn't match the expected structure for the Report Editor.

**Fix**: Updated sample report definitions to include:
- `requestClass` field (required for entity selection)
- `colDefs` array with proper `@bean`, `fullPath`, and `alias` fields
- `columns` array with `@bean` and `name` fields
- `condition` object with proper filter structure
- `singletonReport` boolean flag

**Files Modified**:
- `react-project/packages/tableau-react/test-data/mock-server.mjs`

### 2. Navigation Menu Removal
**Issue**: Duplicate navigation menu on Stream Reports page (already in left sidebar).

**Fix**: Removed `ReportsNavigation` component from Stream Reports page.

**Files Modified**:
- `react-project/packages/tableau-react/src/pages/ReportConfigsStream.tsx`

### 3. API Endpoints Added
Added missing endpoints to mock server:
- SQL Schema endpoints (`/platform-api/sql/schema/listAll`, etc.)
- Workflow/Statemachine endpoints (`/platform-api/statemachine/workflows`, etc.)
- Entity Model endpoints (`/platform-api/model/`, etc.)

## Testing Instructions

### Prerequisites
1. Start the mock API server:
   ```bash
   cd react-project
   node packages/tableau-react/test-data/mock-server.mjs
   ```

2. Start the development server:
   ```bash
   npm run dev:saas
   ```

3. Open browser to: http://localhost:3000

### Test Cases

#### Test 1: Report Config Editor - List View
**URL**: http://localhost:3000/tableau/reports

**Expected Behavior**:
- ✅ Page loads without errors
- ✅ Two tabs visible: "Report Config" and "Reports"
- ✅ Report Config tab shows list of report definitions
- ✅ Three sample reports visible: Customer Report, Transaction Report, Product Report
- ✅ Can filter reports by name, entity type, author
- ✅ Can create new report
- ✅ Can edit existing report
- ✅ Can delete report

**Test Steps**:
1. Navigate to http://localhost:3000/tableau/reports
2. Verify "Report Config" tab is active
3. Check that 3 reports are listed in the table
4. Click on "Customer Report" to edit
5. Verify redirect to edit page

#### Test 2: Report Editor - Model Tab
**URL**: http://localhost:3000/tableau/report-editor/RPT-001

**Expected Behavior**:
- ✅ Page loads with "Edit Distributed Report: Customer Report" title
- ✅ Model tab is active by default
- ✅ Entity Class dropdown shows "Customer" selected
- ✅ "Add New Column Definition" button is enabled
- ✅ "Selected Columns:" section shows table with columns
- ✅ Table shows 5 rows: id, customerId, firstName, lastName, email
- ✅ Each row has "PATH" column showing the field name
- ✅ Each row has "ACTION" column with "Remove" button

**Test Steps**:
1. Navigate to http://localhost:3000/tableau/report-editor/RPT-001
2. Verify Model tab is active
3. Check Entity Class dropdown value
4. Verify "Selected Columns:" table is visible
5. Count rows in table (should be 5)
6. Verify each row shows path and Remove button

#### Test 3: Report Editor - Columns Tab
**URL**: http://localhost:3000/tableau/report-editor/RPT-001

**Expected Behavior**:
- ✅ Columns tab is clickable
- ✅ Transfer component shows two lists
- ✅ Left list: "Possible columns values" shows available columns
- ✅ Right list: "Selected columns values" shows 4 selected columns (id, customerId, firstName, lastName)
- ✅ Can move columns between lists
- ✅ Can search in both lists
- ✅ Changes are saved when clicking Save button

**Test Steps**:
1. Navigate to http://localhost:3000/tableau/report-editor/RPT-001
2. Click "Columns" tab
3. Verify Transfer component is visible
4. Check left list has available columns
5. Check right list has 4 selected columns
6. Try moving a column from left to right
7. Click Save button
8. Verify success message

#### Test 4: Report Editor - FilterBuilder Tab
**URL**: http://localhost:3000/tableau/report-editor/RPT-001

**Expected Behavior**:
- ✅ FilterBuilder tab is clickable
- ✅ "Settings" section shows:
  - Singleton Report toggle (off by default)
  - As at date picker (empty by default)
- ✅ "Filter Conditions" section shows:
  - FilterBuilderGroup component
  - "Add Condition" button
  - "Add Group" button
- ✅ Can add filter conditions
- ✅ Can select field, operator, and value
- ✅ Can add nested groups with AND/OR logic

**Test Steps**:
1. Navigate to http://localhost:3000/tableau/report-editor/RPT-001
2. Click "FilterBuilder" tab
3. Verify Settings section is visible
4. Toggle "Singleton Report" switch
5. Verify "Filter Conditions" section
6. Click "Add Condition" button
7. Select a field from dropdown
8. Select an operator
9. Enter a value
10. Click Save button

#### Test 5: Report Editor - Other Tabs
**URL**: http://localhost:3000/tableau/report-editor/RPT-001

**Expected Behavior**:
- ✅ Sorting tab: Shows sorting configuration
- ✅ Grouping tab: Shows grouping configuration
- ✅ Summary tab: Shows summary/aggregation configuration
- ✅ JSON tab: Shows raw JSON of report definition

**Test Steps**:
1. Navigate to http://localhost:3000/tableau/report-editor/RPT-001
2. Click each tab: Sorting, Grouping, Summary, JSON
3. Verify each tab loads without errors
4. Check JSON tab shows valid JSON

#### Test 6: Stream Reports
**URL**: http://localhost:3000/tableau/reports/stream

**Expected Behavior**:
- ✅ Page loads without errors
- ✅ NO navigation menu at top (removed duplicate)
- ✅ "Create New" button visible
- ✅ "Reset State" button visible
- ✅ Filter section visible
- ✅ Table shows stream report definitions
- ✅ Can create new stream report
- ✅ Can edit existing stream report

**Test Steps**:
1. Navigate to http://localhost:3000/tableau/reports/stream
2. Verify NO navigation menu at top of page
3. Verify left sidebar has "Stream Reports" menu item
4. Check "Create New" button is visible
5. Click "Create New" to open dialog
6. Fill in report details
7. Click Save

#### Test 7: Catalogue of Aliases
**URL**: http://localhost:3000/tableau/catalogue-of-aliases

**Expected Behavior**:
- ✅ Page loads without errors
- ✅ "Create New" button visible
- ✅ "Export" and "Import" buttons visible
- ✅ Filter section visible
- ✅ Table shows alias definitions
- ✅ Can create new alias
- ✅ Can edit existing alias
- ✅ Can delete alias

**Test Steps**:
1. Navigate to http://localhost:3000/tableau/catalogue-of-aliases
2. Verify page title "Catalogue of Aliases"
3. Check action buttons are visible
4. Verify filter section
5. Check table loads

## Known Issues & Solutions

### Issue 1: Selected Columns Not Visible
**Symptom**: Table in Model tab appears empty or columns are not visible.

**Root Cause**: Data structure mismatch between mock server and component expectations.

**Solution**: ✅ Fixed - Updated mock server data to include proper `colDefs` array.

**Verification**:
```bash
curl http://localhost:8080/platform-api/reporting/definitions/RPT-001 | jq '.colDefs'
```
Should return array of column definitions with `@bean`, `fullPath`, and `alias` fields.

### Issue 2: FilterBuilder Not Working
**Symptom**: FilterBuilder tab shows errors or doesn't allow adding conditions.

**Root Cause**: Missing or malformed `condition` object in report definition.

**Solution**: ✅ Fixed - Ensured all report definitions have proper `condition` structure:
```json
{
  "@bean": "com.cyoda.core.conditions.queryable.Group",
  "operator": "AND",
  "conditions": []
}
```

**Verification**: Check browser console for errors when clicking FilterBuilder tab.

### Issue 3: Entity Class Dropdown Empty
**Symptom**: Entity Class dropdown in Model tab shows no options.

**Root Cause**: `/platform-api/reporting/types/fetch` endpoint not returning data.

**Solution**: ✅ Fixed - Mock server now returns entity types based on `entityStore`.

**Verification**:
```bash
curl http://localhost:8080/platform-api/reporting/types/fetch
```
Should return array of entity types.

## API Endpoints Reference

### Report Definitions
- `GET /platform-api/reporting/definitions` - List all reports
- `GET /platform-api/reporting/definitions/:id` - Get single report
- `POST /platform-api/reporting/definitions?name=:name` - Create report
- `PUT /platform-api/reporting/definitions/:id` - Update report
- `DELETE /platform-api/reporting/definitions/:id` - Delete report

### Entity Types
- `GET /platform-api/reporting/types/fetch` - Get entity types for dropdown
- `GET /platform-api/reporting/types` - Get entity types for filter

### Stream Reports
- `GET /platform-api/reporting/stream-definitions` - List stream reports
- `GET /platform-api/reporting/stream-definitions/:id` - Get stream report
- `POST /platform-api/reporting/stream-definitions` - Create stream report
- `PUT /platform-api/reporting/stream-definitions/:id` - Update stream report
- `DELETE /platform-api/reporting/stream-definitions/:id` - Delete stream report

## Sample Data

### Sample Report Definition (RPT-001)
```json
{
  "id": "RPT-001",
  "name": "Customer Report",
  "requestClass": "com.cyoda.tms.model.entities.Customer",
  "colDefs": [
    { "@bean": "com.cyoda.core.reporting.model.ColDef", "fullPath": "id", "alias": "id" },
    { "@bean": "com.cyoda.core.reporting.model.ColDef", "fullPath": "customerId", "alias": "customerId" }
  ],
  "columns": [
    { "@bean": "com.cyoda.core.reporting.model.Column", "name": "id" },
    { "@bean": "com.cyoda.core.reporting.model.Column", "name": "customerId" }
  ],
  "condition": {
    "@bean": "com.cyoda.core.conditions.queryable.Group",
    "operator": "AND",
    "conditions": []
  },
  "singletonReport": false
}
```

## Troubleshooting

### Problem: Page shows 404 errors in console
**Solution**: Check that mock server is running on port 8080.

### Problem: Data not loading
**Solution**: Check browser Network tab for failed API calls. Verify mock server logs.

### Problem: Changes not saving
**Solution**: Check browser console for errors. Verify PUT endpoint is working.

### Problem: FilterBuilder shows errors
**Solution**: Ensure `condition` object exists and has proper structure.

## Next Steps

1. ✅ Test all tabs in Report Editor
2. ✅ Verify Selected Columns table shows data
3. ✅ Test FilterBuilder functionality
4. ✅ Test Columns transfer component
5. ✅ Test Stream Reports page
6. ✅ Test Catalogue of Aliases page
7. Create automated E2E tests for critical flows
8. Add more sample data for comprehensive testing

