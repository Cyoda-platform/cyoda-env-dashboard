# Testing Guide: High Priority Components

## Quick Start

### 1. Start the Development Server
```bash
cd react-project
npm run dev
```

The server will start at: **http://localhost:3009/**

### 2. Navigate to Data Mapper
1. Open http://localhost:3009/ in your browser
2. Click **"Data Mapper Configuration"** in the left sidebar
3. You should see the Data Mapper interface

---

## Test Scenarios

### ✅ Test 1: Validation Error Alert

**Objective**: Verify that validation errors are displayed when saving invalid configurations.

**Steps**:
1. Open Data Mapper Configuration page
2. Select or create an entity mapping
3. Create a column mapping with an invalid transformer (if possible)
4. Click Save or trigger a save action
5. **Expected Result**: Red error alert appears at the top showing validation errors

**What to Look For**:
- ⚠️ Red alert box with "Error" title
- Ordered list of validation errors
- Each error shows: source path → target path + error message
- "Open Settings" links (if handlers are implemented)

**Screenshot Location**: Top of the page, above navigation buttons

**Pass Criteria**:
- ✅ Alert appears when validation fails
- ✅ Alert does NOT appear when validation passes
- ✅ Error messages are clear and specific
- ✅ Alert disappears after fixing errors

---

### ✅ Test 2: Not Exist Relations Alert

**Objective**: Verify that broken relations are detected and can be deleted.

**Steps**:
1. Open Data Mapper Configuration page
2. Select an entity mapping
3. Create a column mapping with a source path that doesn't exist
   - Example: `root:/nonexistent/field`
4. **Expected Result**: Orange warning alert appears showing the broken relation

**Alternative Test** (if you can't create broken relations):
1. Modify the source data to remove a field that's referenced in a mapping
2. Refresh the page
3. **Expected Result**: Orange warning alert appears

**What to Look For**:
- ⚠️ Orange/yellow warning alert
- Title: "Non-existent Relations Detected (X)"
- List of broken relations with:
  - Type badge (Column Mapping, Functional Mapping, Metadata)
  - Source → Target paths
  - Reason (e.g., "Source path does not exist")
  - Delete button for each relation

**Interaction Test**:
1. Click the "Delete" button on a broken relation
2. **Expected Result**: 
   - Relation is removed from the configuration
   - Success message appears
   - Alert updates (count decreases or disappears)

**Pass Criteria**:
- ✅ Alert appears when broken relations exist
- ✅ Alert does NOT appear when all relations are valid
- ✅ Delete button removes the relation
- ✅ Success message appears after deletion
- ✅ Alert disappears when all broken relations are deleted

---

### ✅ Test 3: Entity Filter Badge

**Objective**: Verify that the filter badge appears when an entity has an active filter.

**Steps**:
1. Open Data Mapper Configuration page
2. Select an entity mapping
3. Click "Edit Entity" button
4. In the entity settings dialog, add a filter expression
   - Example: `name == "test"` or any valid filter
5. Save the entity
6. **Expected Result**: Orange "Filter" badge appears next to entity class name

**What to Look For**:
- Location: Target header, next to "Entity: ClassName"
- Badge text: "Filter"
- Badge color: Orange (#faad14)
- Badge size: Small, compact

**Interaction Test**:
1. Edit the entity again
2. Remove the filter expression
3. Save the entity
4. **Expected Result**: Badge disappears

**Pass Criteria**:
- ✅ Badge appears when filter is set
- ✅ Badge does NOT appear when filter is empty/null
- ✅ Badge is orange colored
- ✅ Badge text is "Filter"
- ✅ Badge is properly aligned with entity name

---

## Visual Inspection Checklist

### Validation Error Alert
- [ ] Alert is red colored
- [ ] Alert has error icon
- [ ] Alert is at the top of the page
- [ ] Error list is numbered (1, 2, 3...)
- [ ] Error messages are readable
- [ ] "Open Settings" links are clickable (if present)
- [ ] Alert is not closable (no X button)

### Not Exist Relations Alert
- [ ] Alert is orange/yellow colored
- [ ] Alert has warning icon
- [ ] Alert is below validation errors (if both present)
- [ ] Relation count is shown in title
- [ ] Each relation is in a separate card
- [ ] Type badges are colored (orange)
- [ ] Paths are in monospace font
- [ ] Reason text is italic and gray
- [ ] Delete buttons are red
- [ ] List is scrollable if many relations

### Entity Filter Badge
- [ ] Badge is orange colored
- [ ] Badge text is "Filter"
- [ ] Badge is next to entity class name
- [ ] Badge is small and compact
- [ ] Badge is properly aligned
- [ ] Badge only appears when filter is active

---

## Automated Tests

### Run Unit Tests
```bash
cd react-project
npm test -- ValidationErrorAlert NotExistRelationsAlert --run
```

**Expected Output**:
```
✓ ValidationErrorAlert.test.tsx (3 tests) 12ms
✓ NotExistRelationsAlert.test.tsx (3 tests) 125ms

Test Files  2 passed (2)
Tests       6 passed (6)
```

**Pass Criteria**:
- ✅ All 6 tests pass
- ✅ No errors or warnings
- ✅ Tests complete in < 5 seconds

---

## Browser Compatibility Testing

### Test in Multiple Browsers

**Chrome**:
1. Open http://localhost:3009/ in Chrome
2. Run all test scenarios
3. Check console for errors

**Firefox**:
1. Open http://localhost:3009/ in Firefox
2. Run all test scenarios
3. Check console for errors

**Safari** (if on Mac):
1. Open http://localhost:3009/ in Safari
2. Run all test scenarios
3. Check console for errors

**Pass Criteria**:
- ✅ All features work in all browsers
- ✅ No console errors
- ✅ Visual appearance is consistent

---

## Responsive Design Testing

### Test at Different Screen Sizes

**Desktop (1920x1080)**:
- [ ] All alerts are visible
- [ ] Badge is properly positioned
- [ ] No horizontal scrolling

**Laptop (1366x768)**:
- [ ] All alerts are visible
- [ ] Badge is properly positioned
- [ ] No horizontal scrolling

**Tablet (768x1024)**:
- [ ] Alerts are readable
- [ ] Badge is visible
- [ ] Layout adapts properly

---

## Accessibility Testing

### Keyboard Navigation
1. Use Tab key to navigate through the page
2. **Expected**: All interactive elements are reachable
3. **Expected**: Delete buttons can be activated with Enter/Space

### Screen Reader Testing (Optional)
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate to alerts
3. **Expected**: Alert content is announced
4. **Expected**: Error messages are read clearly

---

## Performance Testing

### Load Time
1. Open DevTools → Network tab
2. Refresh the page
3. **Expected**: Page loads in < 3 seconds
4. **Expected**: No failed requests

### Memory Usage
1. Open DevTools → Performance tab
2. Record a session while interacting with alerts
3. **Expected**: No memory leaks
4. **Expected**: Smooth interactions (60fps)

---

## Edge Cases to Test

### Validation Error Alert
- [ ] No entity mapping selected
- [ ] Entity mapping with no relations
- [ ] Multiple validation errors (5+)
- [ ] Very long error messages
- [ ] Save button not touched yet

### Not Exist Relations Alert
- [ ] No broken relations
- [ ] Many broken relations (10+)
- [ ] Broken relations of all types (column, functional, metadata)
- [ ] Deleting the last broken relation
- [ ] Source data is null/undefined

### Entity Filter Badge
- [ ] Filter is empty string
- [ ] Filter is null
- [ ] Filter is undefined
- [ ] Very long filter expression
- [ ] Switching between entities with/without filters

---

## Troubleshooting

### Alert Not Appearing

**Validation Error Alert**:
- Check if `isSaveButtonTouched` is true
- Check if there are actual validation errors
- Check browser console for errors

**Not Exist Relations Alert**:
- Check if source data is loaded
- Check if target fields are populated
- Verify broken relations exist in the mapping

**Entity Filter Badge**:
- Check if `selectedEntityMapping.filter` is truthy
- Verify entity mapping is selected
- Check browser console for errors

### Delete Button Not Working

1. Check browser console for errors
2. Verify `onDeleteRelation` handler is called
3. Check if mapping configuration is updated
4. Verify success message appears

### Styling Issues

1. Check if CSS files are loaded
2. Verify Ant Design styles are imported
3. Check for CSS conflicts
4. Clear browser cache

---

## Reporting Issues

If you find any issues, please report them with:

1. **Description**: What went wrong?
2. **Steps to Reproduce**: How to recreate the issue?
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happened?
5. **Screenshots**: Visual evidence
6. **Browser**: Which browser and version?
7. **Console Errors**: Any errors in the console?

---

## Success Criteria Summary

### All Tests Pass When:
- ✅ Validation errors are displayed correctly
- ✅ Broken relations are detected and deletable
- ✅ Filter badge appears/disappears correctly
- ✅ All 6 unit tests pass
- ✅ No console errors
- ✅ Works in all major browsers
- ✅ Responsive on all screen sizes
- ✅ Accessible via keyboard
- ✅ No performance issues

---

## Quick Test Checklist

Use this for rapid testing:

- [ ] Start dev server
- [ ] Navigate to Data Mapper
- [ ] Create invalid mapping → See validation error
- [ ] Create broken relation → See warning alert
- [ ] Click delete → Relation removed
- [ ] Add entity filter → See badge
- [ ] Remove filter → Badge disappears
- [ ] Run unit tests → All pass
- [ ] Check console → No errors

**If all checked**: ✅ Implementation is working correctly!

---

**Happy Testing! 🎉**

