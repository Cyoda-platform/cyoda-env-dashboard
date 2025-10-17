# Functional Mapping - Testing Guide

## 🚀 Quick Start

The dev server is running at: **http://localhost:3009**

## 📋 Test Checklist

### 1. Basic Functional Mapping Creation

#### Step 1: Navigate to Data Mapper
1. Open http://localhost:3009
2. Click on "Data Mapper" in the navigation
3. Select or create a data mapping configuration

#### Step 2: Create a Functional Mapping Line
1. **Click on a source field circle** (left side)
2. **Select "Functional Mapping"** from the popover menu
3. **Drag to a target field circle** (right side)
4. The line should appear in **orange color**

✅ **Expected Result**: Orange functional mapping line appears between source and target

---

### 2. Open Functional Mapping Settings

#### Step 1: Click on the Orange Line
1. Click on the orange functional mapping line
2. The "Functional Mapping Settings" dialog should open

✅ **Expected Result**: Dialog opens with three tabs:
- Visual Editor (Blockly)
- Generated Code
- Manual JSON Editor

---

### 3. Test Blockly Visual Editor

#### Step 1: Verify Blockly Workspace
1. The **Visual Editor (Blockly)** tab should be active by default
2. You should see:
   - **Toolbar** with buttons: Search, Add Variable, Export XML, Import XML, Documentation
   - **Blockly workspace** (450px height) with grid
   - **Toolbox** on the left with block categories
   - **CodeDisplay** component below (collapsible)

#### Step 2: Test Toolbar Actions

##### A. Search Blocks
1. Click on the **Search** cascader
2. You should see 4 categories:
   - Statements
   - Expressions
   - Functions
   - Transformers
3. Try searching for a block (e.g., "concat")
4. Select a block from the dropdown

✅ **Expected Result**: Search works and shows categorized blocks

##### B. Add Variable
1. Click **"Add Variable"** button
2. A dialog should open asking for variable name
3. Enter a name (e.g., "myVar")
4. Click OK

✅ **Expected Result**: Variable is created in Blockly workspace

##### C. Export XML
1. Click **"Export XML"** button
2. An XML file should download

✅ **Expected Result**: XML file downloads with workspace content

##### D. Import XML
1. Click **"Import XML"** button
2. Select the XML file you just exported
3. Workspace should be updated

✅ **Expected Result**: Workspace loads from XML file

##### E. Documentation
1. Click **"Documentation"** button
2. A drawer should open from the right
3. You should see:
   - Search box
   - Collapsible sections for Simple, Reduce, Enlarge functions
   - Transformer documentation by type

✅ **Expected Result**: Documentation drawer opens with searchable function/transformer docs

---

### 4. Test Blockly Block Creation

#### Step 1: Drag Blocks
1. From the toolbox, drag a **"Set Dst Value"** block to the workspace
2. Drag an **"Expression"** block (e.g., String) and connect it
3. The blocks should snap together

#### Step 2: Verify Real-time Code Generation
1. Switch to the **"Generated Code"** tab
2. You should see JSON code automatically generated from your blocks
3. Go back to **"Visual Editor"** tab
4. Add more blocks
5. Switch to **"Generated Code"** again

✅ **Expected Result**: Code updates in real-time as you add/modify blocks

---

### 5. Test Source Path Management

#### Step 1: Add Source Paths
1. In the dialog, find the **"Add Source Path"** dropdown
2. Select a source path from the list
3. It should appear as a tag in the "Selected Source Paths" section

#### Step 2: Remove Source Paths
1. Click the **X** on a source path tag
2. The tag should be removed

✅ **Expected Result**: Source paths can be added and removed

---

### 6. Test Manual JSON Editor

#### Step 1: Switch to Manual JSON Editor Tab
1. Click on the **"Manual JSON Editor"** tab
2. You should see a code editor with JSON

#### Step 2: Edit JSON Manually
1. Try editing the JSON directly
2. The changes should be preserved

✅ **Expected Result**: Manual JSON editing works

---

### 7. Test Save Functionality

#### Step 1: Save Functional Mapping
1. Create some blocks in the Blockly editor
2. Click **"OK"** button
3. The dialog should close
4. The functional mapping should be saved

#### Step 2: Reopen and Verify
1. Click on the same orange line again
2. The dialog should open with your blocks preserved

✅ **Expected Result**: Functional mapping is saved and can be reopened

---

### 8. Test Error Detection (Optional)

If you have non-existent parameters in your functional mapping:

1. Open the functional mapping dialog
2. You should see a **warning alert** at the top:
   - "Error with Non Existent parameters"
   - "Regenerate current" button
   - "Regenerate all blocks" button

✅ **Expected Result**: Error detection works and regenerate buttons are available

---

### 9. Test CodeDisplay Component

#### Step 1: Expand/Collapse Code
1. In the Visual Editor tab, below the Blockly workspace
2. You should see a **"Expand code"** button
3. Click it to expand
4. Click **"Collapse code"** to collapse

✅ **Expected Result**: Code display expands and collapses smoothly

---

## 🎯 Advanced Testing

### Test Complex Functional Mapping

1. Create a functional mapping with:
   - Multiple source paths
   - Variables
   - Nested function calls
   - Conditional logic (if-else)
   - Transformers

2. Verify:
   - All blocks connect properly
   - Code generation is correct
   - Save/load works
   - Export/Import XML preserves everything

---

## 🐛 Known Issues to Watch For

1. **Blockly workspace not loading**: Check browser console for errors
2. **Blocks not connecting**: Make sure block types are compatible
3. **Code not generating**: Check if workspace has valid blocks
4. **XML import fails**: Ensure XML file is valid Blockly XML

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

[ ] 1. Basic functional mapping creation
[ ] 2. Open functional mapping settings
[ ] 3. Blockly visual editor loads
[ ] 4. Toolbar actions work:
    [ ] Search blocks
    [ ] Add variable
    [ ] Export XML
    [ ] Import XML
    [ ] Documentation
[ ] 5. Block creation and connection
[ ] 6. Real-time code generation
[ ] 7. Source path management
[ ] 8. Manual JSON editor
[ ] 9. Save functionality
[ ] 10. CodeDisplay expand/collapse

Issues Found:
_________________________________
_________________________________
_________________________________

Overall Status: [ ] PASS  [ ] FAIL
```

---

## 🎉 Success Criteria

The functional mapping feature is working correctly if:

✅ All toolbar actions work without errors
✅ Blockly blocks can be dragged and connected
✅ Code generates in real-time
✅ Functional mappings can be saved and reopened
✅ XML export/import works
✅ Documentation is accessible
✅ No console errors during normal usage

---

## 📝 Notes

- The dev server is running on port 3009
- All components have been migrated from Vue to React
- The feature includes all functionality from the Vue version plus enhancements
- Test with different browsers (Chrome, Firefox, Safari) for compatibility

---

## 🆘 Troubleshooting

### Issue: Blockly workspace is blank
**Solution**: Check if functions, transformers, and dictionaries are loading from API

### Issue: Blocks won't connect
**Solution**: Verify block types are compatible (check block definitions)

### Issue: Code not generating
**Solution**: Ensure workspace has at least one valid statement block

### Issue: Dialog won't open
**Solution**: Check browser console for errors, verify functional mapping data structure

---

## 📞 Support

If you encounter any issues during testing:
1. Check the browser console for errors
2. Verify the dev server is running
3. Check network requests in browser DevTools
4. Review the FUNCTIONAL_MAPPING_COMPLETE_MIGRATION.md for implementation details

