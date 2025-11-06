# Comprehensive Test Plan for Statemachine React Application

## Test Environment
- URL: http://localhost:3014/
- Browser: Chrome/Firefox/Safari
- Date: 2025-10-22

---

## 1. Workflows List Page (`/workflows`)

### 1.1 Page Load
- [ ] Page loads without errors
- [ ] Table displays with mock data
- [ ] All columns visible: Entity, Name, Active, Persisted, Creation Date, Actions
- [ ] Data is sorted by Creation Date (descending) by default

### 1.2 Filter Functionality
- [ ] Filter input is visible with search icon
- [ ] Typing in filter updates table in real-time
- [ ] Filter works for workflow name
- [ ] Filter works for entity class name
- [ ] Clear button (X) clears the filter
- [ ] Filter is case-insensitive

### 1.3 Table Features
- [ ] Row selection checkboxes work
- [ ] Select all checkbox works
- [ ] Pagination controls visible
- [ ] Page size selector works (5, 10, 20, 50)
- [ ] Total count displays correctly
- [ ] Sorting works for all sortable columns

### 1.4 Action Buttons (per row)
- [ ] "Workflow" button (eye icon) navigates to workflow detail
- [ ] "Instances" button (table icon) navigates to instances page
- [ ] "Copy" button (copy icon) copies workflow
- [ ] "Delete" button (trash icon) shows confirmation modal
- [ ] All buttons have tooltips
- [ ] Loading states show during async operations

### 1.5 Header Actions
- [ ] "Create new workflow" button visible
- [ ] "Create new workflow" button navigates to `/workflow/new`
- [ ] Export/Import component visible
- [ ] Export button enabled when rows selected
- [ ] Import button always enabled

---

## 2. Create New Workflow (`/workflow/new`)

### 2.1 Page Load
- [ ] Page loads without errors
- [ ] Form displays with all fields
- [ ] All tabs visible: General, Settings, Decision Tree
- [ ] Layout mode selector visible (Tabular, Graphical, Config)

### 2.2 General Tab - Fields
- [ ] Entity Class dropdown populated
- [ ] Entity Class dropdown searchable
- [ ] Entity Class is required (validation)
- [ ] Name field visible
- [ ] Name is required (validation)
- [ ] Description textarea visible
- [ ] Documentation Link field visible
- [ ] Documentation Link validates URL format
- [ ] Active toggle switch visible
- [ ] Active toggle works

### 2.3 Settings Tab
- [ ] Criteria multi-select visible
- [ ] Criteria multi-select populated with data
- [ ] Criteria multi-select allows multiple selections
- [ ] "Use Decision Tree" checkbox visible
- [ ] "Use Decision Tree" checkbox toggles Decision Tree tab

### 2.4 Decision Tree Tab
- [ ] Tab is disabled by default
- [ ] Tab becomes enabled when checkbox is checked
- [ ] Alert message displays when tab is active
- [ ] Placeholder content visible

### 2.5 Form Actions
- [ ] Save button visible
- [ ] Save button disabled when form invalid
- [ ] Save button enabled when form valid
- [ ] Cancel button visible
- [ ] Cancel button navigates back

### 2.6 Layout Modes
- [ ] Tabular mode shows form
- [ ] Graphical mode shows graph (or placeholder)
- [ ] Config mode shows JSON viewer
- [ ] Mode selector buttons work

---

## 3. Edit Workflow (`/workflow/:workflowId`)

### 3.1 Page Load
- [ ] Page loads with workflow data
- [ ] All fields populated with existing data
- [ ] States list visible
- [ ] Transitions list visible

### 3.2 States Management
- [ ] States table displays
- [ ] "Add State" button visible
- [ ] "Add State" opens modal/form
- [ ] State name field required
- [ ] "Is Initial" checkbox works
- [ ] "Is Final" checkbox works
- [ ] Save state creates new state
- [ ] Edit state button works
- [ ] Copy state button works
- [ ] Delete state button shows confirmation
- [ ] Delete state removes state

### 3.3 Transitions Management
- [ ] Transitions table displays
- [ ] "Add Transition" button visible
- [ ] "Add Transition" opens modal/form
- [ ] Transition name field required
- [ ] From State dropdown populated
- [ ] To State dropdown populated
- [ ] "View States" button shows states modal
- [ ] Save transition creates new transition
- [ ] Edit transition button works
- [ ] Copy transition button works
- [ ] Delete transition button shows confirmation
- [ ] Delete transition removes transition

### 3.4 Workflow Update
- [ ] Modify workflow name
- [ ] Modify workflow description
- [ ] Toggle active status
- [ ] Change criteria selection
- [ ] Save button updates workflow
- [ ] Success message displays
- [ ] Data persists after save

---

## 4. Copy Workflow

### 4.1 Copy Action
- [ ] Click copy button on workflow
- [ ] Loading indicator shows
- [ ] Success message displays
- [ ] Navigates to copied workflow
- [ ] Copied workflow has "(Copy)" suffix
- [ ] Copied workflow is editable (persistedType=persisted)
- [ ] All fields are enabled
- [ ] Save button is enabled

---

## 5. Delete Workflow

### 5.1 Delete Action
- [ ] Click delete button
- [ ] Confirmation modal appears
- [ ] Modal has "Delete" and "Cancel" buttons
- [ ] Cancel button closes modal without deleting
- [ ] Delete button removes workflow
- [ ] Success message displays
- [ ] Table refreshes
- [ ] Workflow no longer in list

---

## 6. States Page (`/state/:stateId`)

### 6.1 Page Load
- [ ] Page loads with state data
- [ ] Form displays with all fields
- [ ] State name field populated
- [ ] Workflow ID displayed
- [ ] Is Initial checkbox reflects state
- [ ] Is Final checkbox reflects state

### 6.2 State Update
- [ ] Modify state name
- [ ] Toggle Is Initial
- [ ] Toggle Is Final
- [ ] Save button updates state
- [ ] Success message displays
- [ ] Navigate back works

---

## 7. Transitions Page (`/transition/:transitionId`)

### 7.1 Page Load
- [ ] Page loads with transition data
- [ ] Form displays with all fields
- [ ] Transition name populated
- [ ] From State dropdown populated
- [ ] To State dropdown populated
- [ ] Workflow ID displayed

### 7.2 Transition Update
- [ ] Modify transition name
- [ ] Change from state
- [ ] Change to state
- [ ] Save button updates transition
- [ ] Success message displays
- [ ] Navigate back works

---

## 8. Criteria Page (`/criteria/:criteriaId`)

### 8.1 Page Load
- [ ] Page loads with criteria data
- [ ] Form displays with all fields
- [ ] Criteria name populated
- [ ] Description populated
- [ ] Entity class displayed

### 8.2 Criteria Management
- [ ] Modify criteria name
- [ ] Modify description
- [ ] Save button updates criteria
- [ ] Copy button works
- [ ] Delete button works
- [ ] Success messages display

---

## 9. Processes Page (`/process/:processId`)

### 9.1 Page Load
- [ ] Page loads with process data
- [ ] Form displays with all fields
- [ ] Process name populated
- [ ] Description populated
- [ ] Entity class displayed

### 9.2 Process Management
- [ ] Modify process name
- [ ] Modify description
- [ ] Save button updates process
- [ ] Copy button works
- [ ] Delete button works
- [ ] Success messages display

---

## 10. Instances Page (`/instances`)

### 10.1 Page Load
- [ ] Page loads without errors
- [ ] Table displays with mock data
- [ ] Filter by entity class works
- [ ] All columns visible

### 10.2 Instance Actions
- [ ] Click on instance navigates to detail
- [ ] Filter works correctly
- [ ] Pagination works

---

## 11. Instance Detail Page (`/instances/:instanceId`)

### 11.1 Page Load
- [ ] Page loads without errors
- [ ] Entity data displays
- [ ] Current state visible
- [ ] Workflow information visible
- [ ] Entity fields displayed

---

## 12. Export/Import Functionality

### 12.1 Export
- [ ] Select workflows in table
- [ ] Export button enabled
- [ ] Click export opens dialog
- [ ] Export dialog shows selected workflows
- [ ] Export button downloads JSON file
- [ ] JSON file contains correct data

### 12.2 Import
- [ ] Click import button
- [ ] Import dialog opens
- [ ] File upload area visible
- [ ] Upload JSON file
- [ ] Import validates file format
- [ ] Import creates workflows
- [ ] Success message displays
- [ ] Table refreshes with new data

---

## 13. Config View (JSON Viewer)

### 13.1 Display
- [ ] Click Config button in layout selector
- [ ] JSON viewer displays
- [ ] Alert message at top
- [ ] JSON is formatted (2-space indent)
- [ ] Scrollable if content is long
- [ ] Monospace font used
- [ ] Proper styling applied

---

## 14. Error Handling

### 14.1 Network Errors
- [ ] Failed API calls show error messages
- [ ] Loading states clear on error
- [ ] User can retry failed operations

### 14.2 Validation Errors
- [ ] Required fields show validation errors
- [ ] URL validation works
- [ ] Form cannot be submitted when invalid
- [ ] Error messages are clear

---

## 15. Navigation

### 15.1 Routes
- [ ] All routes work correctly
- [ ] Back button works
- [ ] Browser back/forward works
- [ ] URL parameters preserved
- [ ] Deep linking works

---

## Issues Found
(To be filled during testing)

1. 
2. 
3. 

---

## Test Results Summary
- Total Tests: TBD
- Passed: TBD
- Failed: TBD
- Blocked: TBD

