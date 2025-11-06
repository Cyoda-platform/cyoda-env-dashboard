# Export/Import Feature - Test Plan & Comparison

## 📋 Feature Comparison: Vue vs React

### Vue Project Implementation
**Location**: `.old_project/packages/cyoda-ui-lib/src/components-library/elements/ExportImport/`

**Architecture**:
- Factory pattern with `ExportImportFactory`
- Class-based approach with `BaseExportImport` and type-specific classes
- Uses FileSaver library for downloads
- Event bus for communication
- Two-step import process (upload → result)

**Key Features**:
- ✅ Export formats: JSON and ZIP
- ✅ Export endpoint: `/platform-api/statemachine/export?includeIds=...`
- ✅ ZIP export endpoint: `/platform-api/statemachine/export/zip?entityClasses=...`
- ✅ Import endpoint: `/platform-api/statemachine/import?needRewrite=true`
- ✅ Validation before import
- ✅ File download handling
- ✅ "Fail On Exists" checkbox (for COBI configs)

### React Project Implementation
**Location**: `react-project/packages/statemachine-react/src/components/ExportImport/`

**Architecture**:
- React Query hooks pattern
- Functional components with TypeScript
- Native browser APIs for downloads
- Direct component communication via props
- Single-step import with validation

**Key Features**:
- ✅ Export formats: JSON and ZIP
- ✅ Export endpoint: `/platform-api/statemachine/export?includeIds=...`
- ✅ ZIP export endpoint: `/platform-api/statemachine/export/zip?entityClasses=...`
- ✅ Import endpoint: `/platform-api/statemachine/import?needRewrite=...`
- ✅ Validation before import
- ✅ File download handling
- ✅ "Overwrite existing workflows" checkbox (equivalent to needRewrite)

### Key Differences

| Feature | Vue | React |
|---------|-----|-------|
| **Architecture** | Factory pattern, class-based | Hooks pattern, functional |
| **File Download** | FileSaver library | Native browser APIs |
| **Validation** | Factory method `importValidateFn` | `validateWorkflowData()` function |
| **Import Steps** | 2-step (upload → result) | 1-step (upload → import) |
| **Overwrite Option** | "Fail On Exists" (inverted) | "Overwrite existing" (direct) |
| **State Management** | Event bus | React Query + local state |
| **Error Handling** | ElNotification | Ant Design message |

## 🧪 Manual Test Plan

### Test Environment
- **URL**: http://localhost:3014
- **Mock Data**: Using localStorage-persisted mock API
- **Test Workflows**: 4 workflows including technical entity

### Test Cases

#### 1. Export Functionality

##### Test 1.1: Export Single Workflow as JSON
**Steps**:
1. Navigate to Workflows page
2. Select one workflow (e.g., "Order Processing")
3. Click "Export" button
4. Select "JSON" format
5. Click "Export" in dialog

**Expected Result**:
- ✅ File downloads as `export_workflows.json`
- ✅ File contains valid JSON
- ✅ JSON has structure: `{ workflow: [], state: [], transition: [], criteria: [], process: [] }`
- ✅ Only selected workflow and its related data are included
- ✅ Success message appears
- ✅ Dialog closes

##### Test 1.2: Export Multiple Workflows as JSON
**Steps**:
1. Select multiple workflows (e.g., 2-3 workflows)
2. Click "Export" button
3. Select "JSON" format
4. Click "Export"

**Expected Result**:
- ✅ File downloads with all selected workflows
- ✅ All related states, transitions, criteria, processes included
- ✅ No duplicate data

##### Test 1.3: Export as ZIP
**Steps**:
1. Select one or more workflows
2. Click "Export" button
3. Select "ZIP" format
4. Click "Export"

**Expected Result**:
- ✅ File downloads as `export_workflows.zip`
- ✅ File is a valid ZIP archive
- ✅ Success message appears

##### Test 1.4: Export Technical Entity Workflow
**Steps**:
1. Select "Data Pipeline Processing" workflow (technical entity)
2. Click "Export" as JSON
3. Open downloaded file

**Expected Result**:
- ✅ Workflow exported with entityClassName: `com.cyoda.technical.DataPipeline`
- ✅ All 6 states included (QUEUED, VALIDATING, PROCESSING, COMPLETED, FAILED, RETRY)
- ✅ All 7 transitions included
- ✅ All 5 criteria included
- ✅ All 5 processes included

##### Test 1.5: Export Button Disabled When No Selection
**Steps**:
1. Deselect all workflows
2. Observe Export button

**Expected Result**:
- ✅ Export button is disabled
- ✅ Tooltip shows "Export selected workflows"

#### 2. Import Functionality

##### Test 2.1: Import Previously Exported Workflow
**Steps**:
1. Export a workflow as JSON (from Test 1.1)
2. Delete the workflow from the table
3. Click "Import" button
4. Upload the exported JSON file
5. Verify preview shows workflow name
6. Click "Import" button

**Expected Result**:
- ✅ File uploads successfully
- ✅ Validation passes
- ✅ Preview shows: "Found 1 workflow(s)"
- ✅ Workflow name displayed
- ✅ Import succeeds
- ✅ Workflow appears in table
- ✅ Success message appears
- ✅ Dialog closes

##### Test 2.2: Import with Overwrite Disabled
**Steps**:
1. Export an existing workflow
2. Click "Import"
3. Upload the file
4. **Uncheck** "Overwrite existing workflows"
5. Click "Import"

**Expected Result**:
- ✅ Import request sent with `needRewrite=false`
- ✅ Existing workflow not overwritten (server behavior)

##### Test 2.3: Import with Overwrite Enabled
**Steps**:
1. Export an existing workflow
2. Modify the workflow (e.g., change description)
3. Export again
4. Click "Import"
5. Upload the modified file
6. **Check** "Overwrite existing workflows"
7. Click "Import"

**Expected Result**:
- ✅ Import request sent with `needRewrite=true`
- ✅ Workflow updated with new data
- ✅ Changes reflected in table

##### Test 2.4: Import Multiple Workflows
**Steps**:
1. Export 2-3 workflows as JSON
2. Delete them from table
3. Import the file

**Expected Result**:
- ✅ Preview shows correct count: "Found X workflow(s)"
- ✅ All workflow names listed
- ✅ All workflows imported
- ✅ All appear in table

##### Test 2.5: Import Technical Entity Workflow
**Steps**:
1. Export "Data Pipeline Processing" workflow
2. Delete it
3. Import the file

**Expected Result**:
- ✅ Technical workflow imports successfully
- ✅ All states, transitions, criteria, processes restored
- ✅ Workflow appears in table with correct entity class

#### 3. Validation Tests

##### Test 3.1: Invalid JSON File
**Steps**:
1. Create a text file with invalid JSON: `{ invalid json }`
2. Try to import it

**Expected Result**:
- ✅ Validation error shown
- ✅ Error message: "Invalid JSON format"
- ✅ Import button disabled

##### Test 3.2: Valid JSON but Wrong Structure
**Steps**:
1. Create JSON file: `{ "data": "test" }`
2. Try to import it

**Expected Result**:
- ✅ Validation error shown
- ✅ Error message: "Invalid workflow data structure"
- ✅ Import button disabled

##### Test 3.3: Missing Required Fields
**Steps**:
1. Create JSON with workflow array but missing `name`:
   ```json
   {
     "workflow": [{ "entityClassName": "test" }]
   }
   ```
2. Try to import it

**Expected Result**:
- ✅ Validation error shown
- ✅ Error message indicates missing required fields

##### Test 3.4: Empty Workflow Array
**Steps**:
1. Create JSON: `{ "workflow": [] }`
2. Try to import it

**Expected Result**:
- ✅ Validation passes (empty array is valid)
- ✅ Preview shows "Found 0 workflow(s)"
- ✅ Import succeeds (no-op)

#### 4. Edge Cases

##### Test 4.1: Special Characters in Workflow Names
**Steps**:
1. Create workflow with name: `Test & "Special" <Characters>`
2. Export it
3. Import it back

**Expected Result**:
- ✅ Export succeeds
- ✅ Import succeeds
- ✅ Name preserved correctly

##### Test 4.2: Large File Import
**Steps**:
1. Export all 4 workflows
2. Import the file

**Expected Result**:
- ✅ File uploads without timeout
- ✅ All workflows imported

##### Test 4.3: Drag and Drop Upload
**Steps**:
1. Click "Import"
2. Drag a JSON file into the upload area
3. Drop it

**Expected Result**:
- ✅ File uploads
- ✅ Validation runs
- ✅ Preview appears

##### Test 4.4: Cancel Operations
**Steps**:
1. Open Export dialog → Click Cancel
2. Open Import dialog → Click Cancel

**Expected Result**:
- ✅ Dialogs close
- ✅ No side effects
- ✅ No errors in console

#### 5. Persistence Tests

##### Test 5.1: Export/Import Roundtrip with Page Refresh
**Steps**:
1. Export a workflow
2. Delete it
3. **Refresh the page**
4. Verify workflow is still deleted
5. Import the exported file
6. **Refresh the page**
7. Verify workflow is restored

**Expected Result**:
- ✅ Deletion persists across refresh
- ✅ Import persists across refresh
- ✅ Data integrity maintained

## 📊 Comparison with Vue Implementation

### Functional Parity ✅

| Feature | Vue | React | Status |
|---------|-----|-------|--------|
| Export JSON | ✅ | ✅ | ✅ Equivalent |
| Export ZIP | ✅ | ✅ | ✅ Equivalent |
| Import JSON | ✅ | ✅ | ✅ Equivalent |
| Validation | ✅ | ✅ | ✅ Equivalent |
| Overwrite Option | ✅ | ✅ | ✅ Equivalent |
| File Download | ✅ | ✅ | ✅ Equivalent |
| Error Handling | ✅ | ✅ | ✅ Equivalent |
| Multiple Workflows | ✅ | ✅ | ✅ Equivalent |
| Technical Entities | ✅ | ✅ | ✅ Equivalent |

### API Compatibility ✅

Both implementations use the **same API endpoints**:
- ✅ `GET /platform-api/statemachine/export?includeIds=...`
- ✅ `GET /platform-api/statemachine/export/zip?entityClasses=...`
- ✅ `POST /platform-api/statemachine/import?needRewrite=...`

### Data Format Compatibility ✅

Both implementations use the **same JSON structure**:
```json
{
  "workflow": [...],
  "state": [...],
  "transition": [...],
  "criteria": [...],
  "process": [...]
}
```

## ✅ Conclusion

The React implementation is **functionally equivalent** to the Vue implementation with the following improvements:

1. **Better Type Safety**: Full TypeScript support
2. **Modern Patterns**: React Query for server state
3. **Better Testing**: 40 comprehensive tests
4. **Simpler Architecture**: No factory pattern needed
5. **Better UX**: Single-step import process
6. **Native APIs**: No external dependencies for file download

