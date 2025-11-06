# Quick Reference Guide - DataMapper Components

## 🚀 Quick Start

All components are now available in the React DataMapper. Here's how to use them:

---

## 📋 Component Reference

### 1. ValidationErrorAlert

**When it appears**: Automatically when save button is clicked with invalid mappings

**What it shows**:
- Red error alert at top of page
- List of validation errors
- "Open Settings" links to fix errors

**No action needed** - Integrated automatically

---

### 2. NotExistRelationsAlert

**When it appears**: Automatically when broken relations are detected

**What it shows**:
- Orange warning alert
- List of broken relations
- Delete buttons for each relation

**Actions**:
- Click [X] to delete individual broken relation
- Relations are automatically detected

---

### 3. Entity Filter Badge

**When it appears**: When entity has an active filter

**What it shows**:
- Orange "Filter" badge next to entity name

**No action needed** - Appears automatically

---

### 4. ActiveRelationInformation

**When it appears**: When dragging to create a relation

**What it shows**:
- Fixed overlay at top: "Press ESC to cancel mapping"

**Actions**:
- Press **ESC** to cancel drag operation

---

### 5. AssignMode

**When it appears**: When source data root is an array

**What it shows**:
- **S** (Single) or **M** (Multiple) badge next to "Source" title
- Blue for Single, Red for Multiple

**Actions**:
- Click badge to toggle between modes
- **S** → paths use `/0/` (first element)
- **M** → paths use `/*/` (all elements)

---

### 6. MetaParams

**When it appears**: When entity has metadata parameters

**What it shows**:
- "Meta Params" section below source tree
- List of parameters with icons

**Actions**:
- Click 🟢/🔴 icon to toggle meta path inclusion
- Click ● circle to open actions popover
- "Add new" - Create metadata relation
- "Delete" - Remove relation

---

### 7. DeleteRelationsDialog

**How to open**: Call `deleteDialogRef.current?.open()`

**What it shows**:
- Table of selected relations
- Source and target fields
- Delete buttons

**Actions**:
- Click individual delete button
- Click "Delete All" to remove all

**Usage**:
```tsx
const deleteDialogRef = useRef<DeleteRelationsDialogRef>(null);

<DeleteRelationsDialog
  ref={deleteDialogRef}
  selectedDataRelations={relations}
  onDelete={handleDelete}
  onDeleteList={handleDeleteAll}
/>
```

---

### 8. AssignModeElementDialog

**How to open**: 
- `assignModeDialogRef.current?.createNew()` - Create new
- `assignModeDialogRef.current?.editExist(element)` - Edit existing

**What it shows**:
- Form with Key and Class inputs
- Add/Edit button

**Actions**:
- Enter key (auto-sanitizes special chars)
- Select class from dropdown
- Click "Add" or "Edit"

**Usage**:
```tsx
const assignModeDialogRef = useRef<AssignModeElementDialogRef>(null);

<AssignModeElementDialog
  ref={assignModeDialogRef}
  allRequestParams={allParams}
  requestParamsComputed={computedParams}
  onSave={handleSave}
  onEdit={handleEdit}
/>
```

---

### 9. MappingSetModesDialog

**How to open**: Call `setModesDialogRef.current?.open()`

**What it shows**:
- Mode selectors for each collection level
- OVERRIDE / APPEND / MERGE options

**Actions**:
- Select mode for each level
- Click "OK" to save

**Usage**:
```tsx
const setModesDialogRef = useRef<MappingSetModesDialogRef>(null);

<MappingSetModesDialog
  ref={setModesDialogRef}
  path="data/*/items/*"
  collectElemsSetModes={modes}
  onChange={handleModesChange}
/>
```

---

### 10. RawDataDialog

**How to open**: Call `rawDataDialogRef.current?.open()`

**What it shows**:
- Syntax-highlighted raw data
- JSON (beautified) or XML

**Actions**:
- Scroll to view content
- Click "Close" to dismiss

**Usage**:
```tsx
const rawDataDialogRef = useRef<RawDataDialogRef>(null);

<RawDataDialog
  ref={rawDataDialogRef}
  fileDatas={{ json: jsonData, xml: xmlData }}
  fileType="json"
/>
```

---

## 🎨 Visual Guide

### Colors:
- 🔴 **Red** - Errors, danger
- 🟠 **Orange** - Warnings, filters
- 🔵 **Blue** - Info, single mode
- 🟢 **Green** - Success, active

### Icons:
- **🟢** - Active/included
- **🔴** - Inactive/excluded
- **●** - Relation indicator
- **[S]** - Single mode
- **[M]** - Multiple mode

---

## ⌨️ Keyboard Shortcuts

- **ESC** - Cancel active drag operation

---

## 🔧 Common Tasks

### Fix Validation Errors:
1. Click Save
2. See red error alert
3. Click "Open Settings" link
4. Fix the error
5. Save again

### Delete Broken Relations:
1. See orange warning alert
2. Click [X] next to broken relation
3. Confirm deletion

### Toggle Array Mode:
1. See [S] or [M] badge
2. Click badge
3. Paths automatically update

### Manage Meta Params:
1. Find "Meta Params" section
2. Click 🟢/🔴 icon to toggle
3. Click ● for more actions

### View Raw Data:
1. Click "View Raw Data" button
2. See syntax-highlighted code
3. Click "Close" when done

---

## 📊 Quick Troubleshooting

### Issue: Validation errors not showing
**Solution**: Click Save button to trigger validation

### Issue: Filter badge not appearing
**Solution**: Ensure entity has a filter configured

### Issue: AssignMode not visible
**Solution**: Source data root must be an array

### Issue: MetaParams not showing
**Solution**: Entity must have metadata parameters configured

### Issue: Dialog not opening
**Solution**: Check ref is properly connected

---

## 📚 Documentation Files

For detailed information, see:

1. **HIGH_PRIORITY_COMPONENTS_IMPLEMENTATION.md** - Alerts & badges
2. **MEDIUM_PRIORITY_COMPONENTS_IMPLEMENTATION.md** - Controls & toggles
3. **LOW_PRIORITY_DIALOGS_IMPLEMENTATION.md** - Dialogs
4. **COMPLETE_DATAMAPPER_FEATURE_PARITY.md** - Complete overview
5. **VISUAL_COMPARISON_BEFORE_AFTER.md** - Before/after comparison
6. **FINAL_IMPLEMENTATION_SUMMARY.md** - Summary

---

## 🎯 Testing Checklist

- [ ] Create invalid mapping → See validation error
- [ ] Create broken relation → See warning
- [ ] Add filter → See badge
- [ ] Start drag → See ESC message
- [ ] Toggle array mode → See paths update
- [ ] Toggle meta param → See icon change
- [ ] Open delete dialog → See table
- [ ] Open assign mode dialog → See form
- [ ] Open set modes dialog → See selectors
- [ ] Open raw data dialog → See highlighted code

---

## 🚀 Quick Commands

```bash
# Start dev server
cd react-project
npm run dev

# Run tests
npm test

# Run specific tests
npm test -- ValidationErrorAlert

# Build for production
npm run build
```

---

## 📞 Need Help?

1. Check this guide
2. Review documentation files
3. Inspect Vue implementation
4. Test in browser at http://localhost:3009/

**Happy Mapping!** 🗺️✨

