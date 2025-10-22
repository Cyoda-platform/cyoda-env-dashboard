# Manual Test Checklist - Statemachine React Application

## Quick Test Guide
Open http://localhost:3014/ and follow these steps:

---

## ✅ WORKFLOWS LIST PAGE

### Test 1: Page Load
1. Navigate to http://localhost:3014/
2. ✓ Page redirects to `/workflows`
3. ✓ Table displays with 3 workflows
4. ✓ Columns visible: Entity, Name, Active, Persisted, Creation Date, Actions
5. ✓ Data sorted by Creation Date (descending)

### Test 2: Filter
1. Type "Order" in filter box
2. ✓ Table shows only "Order Processing Workflow"
3. Type "Customer"
4. ✓ Table shows only "Customer Onboarding"
5. Click X to clear filter
6. ✓ All 3 workflows visible again

### Test 3: Table Sorting
1. Click "Name" column header
2. ✓ Table sorts alphabetically
3. Click "Active" column header
4. ✓ Table sorts by active status

### Test 4: Row Selection
1. Click checkbox on first row
2. ✓ Row is selected
3. Click "Select All" checkbox
4. ✓ All rows selected
5. Click "Select All" again
6. ✓ All rows deselected

### Test 5: Action Buttons
1. Click "Workflow" button (eye icon) on first row
2. ✓ Navigates to workflow detail page
3. Go back, click "Instances" button (table icon)
4. ✓ Navigates to instances page with entityClassName filter
5. Go back, click "Copy" button (copy icon)
6. ✓ Shows loading state
7. ✓ Success message appears
8. ✓ Navigates to copied workflow
9. ✓ Copied workflow has "(Copy)" in name

### Test 6: Delete Workflow
1. Click "Delete" button (trash icon)
2. ✓ Confirmation modal appears
3. Click "Cancel"
4. ✓ Modal closes, workflow not deleted
5. Click "Delete" again, then "Delete" in modal
6. ✓ Success message appears
7. ✓ Workflow removed from table

---

## ✅ CREATE NEW WORKFLOW

### Test 7: Navigate to Create
1. Click "Create new workflow" button
2. ✓ Navigates to `/workflow/new`
3. ✓ Form displays with empty fields

### Test 8: Form Validation
1. Click "Save" without filling fields
2. ✓ Validation errors appear
3. ✓ "Entity Class is required" message shows
4. ✓ "Name is required" message shows

### Test 9: Entity Class Selection
1. Click Entity Class dropdown
2. ✓ Dropdown shows entity classes
3. Type "Order" in search
4. ✓ Filters to matching entities
5. Select "com.example.Order"
6. ✓ Field populated

### Test 10: Fill Form Fields
1. Enter name: "Test Workflow"
2. Enter description: "Test description"
3. Enter documentation link: "not-a-url"
4. ✓ URL validation error appears
5. Change to: "https://example.com"
6. ✓ Validation error clears
7. Toggle "Active" switch
8. ✓ Switch changes state

### Test 11: Settings Tab
1. Click "Settings" tab
2. ✓ Criteria multi-select visible
3. Click criteria dropdown
4. ✓ Shows available criteria
5. Select multiple criteria
6. ✓ Selected criteria display as tags

### Test 12: Decision Tree
1. In Settings tab, check "Use Decision Tree"
2. ✓ Checkbox becomes checked
3. Click "Decision Tree" tab
4. ✓ Tab is now enabled (not grayed out)
5. ✓ Alert message displays
6. Go back to Settings, uncheck "Use Decision Tree"
7. ✓ Decision Tree tab becomes disabled

### Test 13: Save Workflow
1. Fill all required fields
2. Click "Save"
3. ✓ Success message appears
4. ✓ Navigates to workflow detail page
5. ✓ All fields populated with saved data

---

## ✅ EDIT WORKFLOW

### Test 14: Load Workflow
1. From workflows list, click "Workflow" button on a workflow
2. ✓ Workflow detail page loads
3. ✓ Form fields populated with workflow data
4. ✓ States list visible
5. ✓ Transitions list visible

### Test 15: Update Workflow
1. Change workflow name
2. Change description
3. Toggle active status
4. Click "Save"
5. ✓ Success message appears
6. Refresh page
7. ✓ Changes persisted

### Test 16: Layout Modes
1. Click "Graphical" button
2. ✓ Graphical view displays
3. Click "Config" button
4. ✓ JSON viewer displays
5. ✓ JSON is formatted
6. ✓ Alert message at top
7. Click "Tabular" button
8. ✓ Form view displays

---

## ✅ STATES MANAGEMENT

### Test 17: View States
1. In workflow detail, scroll to States section
2. ✓ States table displays
3. ✓ Shows state name, initial, final columns

### Test 18: Add State
1. Click "Add State" button
2. ✓ Modal/form appears
3. Enter state name: "NEW_STATE"
4. Check "Is Initial"
5. Click "Save"
6. ✓ Success message appears
7. ✓ New state appears in table

### Test 19: Edit State
1. Click "Edit" button on a state
2. ✓ Form populated with state data
3. Change state name
4. Click "Save"
5. ✓ Success message appears
6. ✓ State updated in table

### Test 20: Copy State
1. Click "Copy" button on a state
2. ✓ Success message appears
3. ✓ Copied state appears with "(Copy)" suffix

### Test 21: Delete State
1. Click "Delete" button on a state
2. ✓ Confirmation modal appears
3. Click "Delete"
4. ✓ Success message appears
5. ✓ State removed from table

---

## ✅ TRANSITIONS MANAGEMENT

### Test 22: View Transitions
1. In workflow detail, scroll to Transitions section
2. ✓ Transitions table displays
3. ✓ Shows name, from state, to state columns

### Test 23: Add Transition
1. Click "Add Transition" button
2. ✓ Modal/form appears
3. Enter transition name: "NEW_TRANSITION"
4. Select from state
5. Select to state
6. Click "Save"
7. ✓ Success message appears
8. ✓ New transition appears in table

### Test 24: View States Modal
1. Click "View States" button in transitions list
2. ✓ Modal appears with states list
3. ✓ States displayed correctly
4. Click "Close"
5. ✓ Modal closes

### Test 25: Copy Transition
1. Click "Copy" button on a transition
2. ✓ Success message appears
3. ✓ Copied transition appears with "(Copy)" suffix

### Test 26: Delete Transition
1. Click "Delete" button on a transition
2. ✓ Confirmation modal appears
3. Click "Delete"
4. ✓ Success message appears
5. ✓ Transition removed from table

---

## ✅ CRITERIA & PROCESSES

### Test 27: Criteria List
1. Navigate to a criteria detail page
2. ✓ Form displays with criteria data
3. Modify criteria name
4. Click "Save"
5. ✓ Success message appears

### Test 28: Processes List
1. Navigate to a process detail page
2. ✓ Form displays with process data
3. Modify process name
4. Click "Save"
5. ✓ Success message appears

---

## ✅ INSTANCES

### Test 29: Instances List
1. Navigate to `/instances`
2. ✓ Page loads
3. Select entity class from dropdown
4. Click "Search"
5. ✓ Instances table displays
6. ✓ Pagination controls visible

### Test 30: Instance Detail
1. Click on an instance
2. ✓ Instance detail page loads
3. ✓ Entity data displays
4. ✓ Current state visible

---

## ✅ EXPORT/IMPORT

### Test 31: Export
1. Go to workflows list
2. Select one or more workflows
3. Click "Export" button
4. ✓ Export dialog opens
5. ✓ Selected workflows listed
6. Click "Export"
7. ✓ JSON file downloads

### Test 32: Import
1. Click "Import" button
2. ✓ Import dialog opens
3. Upload a JSON file
4. ✓ File validates
5. Click "Import"
6. ✓ Success message appears
7. ✓ Table refreshes with imported data

---

## ✅ CONFIG VIEW

### Test 33: JSON Viewer
1. Open a workflow
2. Click "Config" button
3. ✓ JSON viewer displays
4. ✓ Alert message at top
5. ✓ JSON formatted with 2-space indent
6. ✓ Monospace font used
7. ✓ Scrollable if content is long

---

## 🐛 ISSUES FOUND

### Fixed Issues:
1. ✅ Mock workflows missing `active`, `persisted`, `creationDate` fields
2. ✅ Decision Tree tab not reactive to checkbox changes
3. ✅ Navigation paths with `/statemachine/` prefix

### Remaining Issues:
(None found yet - continue testing)

---

## 📊 TEST SUMMARY

- **Total Tests**: 33
- **Passed**: TBD
- **Failed**: TBD
- **Blocked**: TBD

---

## 🔍 NEXT STEPS

1. Run through all tests manually
2. Document any failures
3. Fix any issues found
4. Re-test fixed issues
5. Mark all tests as complete

