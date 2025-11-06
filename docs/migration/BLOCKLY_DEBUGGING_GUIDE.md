# Blockly Visual Editor - Debugging Guide

## 🔍 What I've Done

### 1. **Added Missing Imports** ✅
- ✅ Imported `blockly/msg/en` for English locale
- ✅ Imported custom field `field_dst_path.js`
- ✅ Imported `HelperFunctionalMapping` for block helpers

### 2. **Fixed Workspace Initialization** ✅
- ✅ Set Blockly locale with `Blockly.setLocale(En)`
- ✅ Added toolbox configuration to workspace options
- ✅ Initialized `JSONGenerator.vue` with proper callbacks
- ✅ Disabled flyout auto-close for better UX

### 3. **Added Debug Logging** ✅
- ✅ Added console logs to track initialization
- ✅ Added logs for API data loading
- ✅ Added logs for toolbox updates
- ✅ Added logs for workspace creation

## 🧪 How to Test

### Step 1: Open Browser Console
1. Open http://localhost:3009
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Clear the console (click the 🚫 icon)

### Step 2: Open Functional Mapping Dialog
1. Navigate to Data Mapper
2. Create a functional mapping line (orange)
3. Click on the orange line to open the dialog

### Step 3: Check Console Logs
You should see logs like this:

```
[Blockly] Initializing workspace...
[Blockly] Toolbox configuration: {kind: 'categoryToolbox', contents: Array(5)}
[Blockly] Workspace injected: Workspace {...}
[Blockly] Flyout auto-close disabled
[Blockly] Loading functions, transformers, and dictionaries...
[Blockly] Loaded functions: 15
[Blockly] Loaded transformers: 42
[Blockly] Loaded dictionaries: 3
[Blockly] Toolbox updated
```

### Step 4: Check Visual Elements
Look for these elements in the dialog:

#### ✅ Expected to See:
1. **Toolbox on the left** - Should have categories:
   - Statements (blue)
   - Expressions (green)
   - Transformers (brown) - after API loads
   - Functions (purple) - after API loads
   - Dropdown expressions (blue) - if dictionaries available

2. **Grid in the workspace** - Gray dots in a grid pattern

3. **Zoom controls** - Bottom right corner (+ and - buttons)

4. **Toolbar at the top** with buttons:
   - Search blocks (cascader)
   - Add new variable
   - Export XML Blockly
   - Import XML Blockly
   - Documentation
   - Regenerate current
   - Regenerate all blocks

#### ❌ If You Don't See:
- **No toolbox**: Check console for errors
- **Empty categories**: API might not be loaded yet
- **Blank workspace**: Check if blocklyDiv has height
- **No grid**: Workspace might not be initialized

## 🐛 Common Issues and Solutions

### Issue 1: Toolbox Not Appearing
**Symptoms**: Left sidebar is empty or missing

**Check**:
1. Open console and look for `[Blockly] Toolbox configuration:`
2. Verify the toolbox object has `contents` array
3. Check if `getToolbox()` is returning proper structure

**Solution**:
- If toolbox is empty, check `HelperFunctionalMapping.getStatements()` and `HelperFunctionalMapping.getExpressions()`
- Verify these helper methods exist and return arrays

### Issue 2: Categories Are Empty
**Symptoms**: Toolbox appears but clicking categories shows no blocks

**Check**:
1. Look for `[Blockly] Loaded functions:` and `[Blockly] Loaded transformers:` in console
2. Check if numbers are > 0
3. Look for API errors in Network tab

**Solution**:
- If API fails, you'll see errors like `http proxy error: /api/platform-mapping-plugin/config/list-all-functions`
- This means backend is not running or not accessible
- Statements and Expressions should still work (they don't need API)

### Issue 3: Workspace Is Blank
**Symptoms**: No grid, no zoom controls, completely blank

**Check**:
1. Look for `[Blockly] Workspace injected:` in console
2. Inspect the blocklyDiv element - should have height
3. Check if Blockly CSS is loaded

**Solution**:
- Verify `blocklyDivRef.current` exists before injection
- Check if dialog is visible when workspace is created
- Ensure Blockly CSS is imported

### Issue 4: Blocks Don't Appear When Dragging
**Symptoms**: Can click categories but can't drag blocks

**Check**:
1. Look for JavaScript errors in console
2. Check if block definitions are loaded
3. Verify custom blocks are registered

**Solution**:
- Check if all block imports are present at top of file
- Verify `GeneratedFunctions.init()`, `GeneratedTransformers.init()`, `GeneratedDictionaries.init()` are called
- Look for "Unknown block type" errors

### Issue 5: Custom Field Errors
**Symptoms**: Errors about `field_dst_value` not found

**Check**:
1. Verify `field_dst_path.js` is imported
2. Check if `Blockly.fieldRegistry.register('field_dst_value', FieldDst)` is called
3. Look for import errors

**Solution**:
- Ensure import path is correct: `'./FunctionalMappingSettings/FunctionalMapping/fields/field_dst_path.js'`
- Verify the file exists in React project
- Check if HelperFormat is available

## 📊 What to Report

If the Blockly editor still doesn't work, please provide:

### 1. Console Logs
Copy all logs that start with `[Blockly]` and paste them

### 2. Errors
Copy any red error messages from console

### 3. Network Errors
Check Network tab for failed API requests:
- `/api/platform-mapping-plugin/config/list-all-functions`
- `/api/platform-mapping-plugin/config/list-all-transformers`
- `/api/platform-mapping-plugin/config/list-all-dictionaries`

### 4. Visual State
Take a screenshot of what you see in the dialog

### 5. Specific Behavior
Describe what happens when you:
- Click on "Statements" category
- Click on "Expressions" category
- Try to drag a block
- Click on a block in the toolbox

## 🎯 Expected Behavior

### When Everything Works:

1. **Dialog Opens**
   - Toolbox appears on left with categories
   - Workspace shows grid pattern
   - Zoom controls in bottom right
   - Toolbar at top

2. **Click "Statements"**
   - Flyout opens showing 3 blocks:
     - Assign Variable
     - Set Dst Value
     - Return
   - Can drag blocks to workspace

3. **Click "Expressions"**
   - Flyout opens showing blocks:
     - String
     - Long
     - Double
     - Boolean
     - Src Value Read
     - Meta Value Read
     - Variable Read
   - Can drag blocks to workspace

4. **Drag Block to Workspace**
   - Block appears in workspace
   - Can move block around
   - Can connect blocks together
   - Blocks snap when close to each other

5. **Code Generation**
   - Switch to "Generated Code" tab
   - See JSON code representing blocks
   - Code updates in real-time as blocks change

## 🔧 Next Steps

### If Toolbox Works:
1. Test dragging blocks
2. Test connecting blocks
3. Test code generation
4. Test save/load functionality

### If Toolbox Doesn't Work:
1. Share console logs
2. Share any errors
3. Share screenshot
4. I'll investigate further

## 📝 Files Modified

1. **FunctionalMappingSettings.tsx**
   - Added Blockly locale import
   - Added custom field import
   - Added debug logging
   - Fixed workspace initialization
   - Added JSONGenerator.vue callbacks

## ✅ Verification Checklist

Run through this checklist and report which items pass/fail:

- [ ] Dialog opens without errors
- [ ] Console shows `[Blockly] Initializing workspace...`
- [ ] Console shows `[Blockly] Workspace injected:`
- [ ] Console shows `[Blockly] Loading functions...`
- [ ] Toolbox appears on left side
- [ ] Can see "Statements" category
- [ ] Can see "Expressions" category
- [ ] Clicking "Statements" shows blocks
- [ ] Clicking "Expressions" shows blocks
- [ ] Can drag a block to workspace
- [ ] Block appears in workspace
- [ ] Can move block around
- [ ] Grid is visible
- [ ] Zoom controls work
- [ ] No red errors in console

Please run through this checklist and let me know which items fail!

