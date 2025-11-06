# Functional Mapping Improvements Plan

## Current State

The React version has a **basic** functional mapping dialog with:
- ✅ Name field
- ✅ Target path (disabled)
- ✅ Source paths selection (add/remove)
- ✅ Statements list (add/edit/delete as JSON)
- ❌ **No Blockly visual editor**
- ❌ **No advanced features**

## Vue Version Features (What We Need to Add)

### 1. **Blockly Visual Editor** 🎯 (CRITICAL)
The Vue version has a full Blockly workspace where users can:
- Drag and drop blocks to create transformations
- Visual programming instead of JSON editing
- Real-time code generation
- Block validation

**Components**:
- `FunctionalMapping.vue` - Main Blockly editor component
- Blockly workspace with custom blocks
- Code display showing generated JSON
- Height: 450px

### 2. **Advanced Actions** 🔧
- **Add Variable** - Create custom variables
- **Export XML Blockly** - Export workspace as XML
- **Import XML Blockly** - Import workspace from XML
- **Documentation** - Function descriptions
- **Search** - Search for functions/transformers
- **Regenerate** - Regenerate blocks when errors occur

### 3. **Error Handling** ⚠️
- Detect non-existent parameters
- Show warning alerts
- Regenerate current block
- Regenerate all blocks

### 4. **Dialogs & Helpers** 📋
- **VariableDialog** - Add custom variables
- **FunctionDescriptionDialog** - Show function docs
- **FunctionDescriptionSearchByClassNameDialog** - Search functions
- **CyodaModellingPopUp** - Entity field selector
- **DialogMappingSetModes** - Collection modes configuration
- **FunctionalMappingDiff** - Compare changes

### 5. **Integration Features** 🔗
- **Meta paths** - Extract meta value reads
- **Source paths** - Auto-populate from Blockly
- **Destination path** - Entity field selector
- **Test execution** - Run test with sample data
- **Fullscreen mode** - Toggle fullscreen
- **Drag dialog** - Draggable dialog

## Implementation Plan

### Phase 1: Integrate Blockly Editor (HIGH PRIORITY)
**Goal**: Replace JSON editor with Blockly visual editor

**Tasks**:
1. Create `FunctionalMappingEditor` component
2. Initialize Blockly workspace
3. Load existing blocks from Blockly folder
4. Generate JSON from Blockly workspace
5. Display generated code

**Files to Create**:
- `FunctionalMappingEditor.tsx` - Main Blockly component
- `FunctionalMappingEditor.css` - Styles

**Estimated Time**: 2-3 hours

### Phase 2: Add Advanced Actions (MEDIUM PRIORITY)
**Goal**: Add toolbar with actions

**Tasks**:
1. Add Variable dialog
2. Export/Import XML functionality
3. Function search
4. Documentation viewer

**Files to Create**:
- `VariableDialog.tsx`
- `FunctionDescriptionDialog.tsx`
- `FunctionalMappingSearch.tsx`

**Estimated Time**: 2-3 hours

### Phase 3: Error Handling & Validation (MEDIUM PRIORITY)
**Goal**: Detect and fix errors

**Tasks**:
1. Detect non-existent parameters
2. Show error alerts
3. Regenerate blocks functionality

**Estimated Time**: 1-2 hours

### Phase 4: Additional Dialogs (LOW PRIORITY)
**Goal**: Add helper dialogs

**Tasks**:
1. Entity field selector (CyodaModellingPopUp)
2. Collection modes dialog
3. Diff viewer

**Files to Create**:
- `EntityFieldSelector.tsx`
- `CollectionModesDialog.tsx`
- `FunctionalMappingDiff.tsx`

**Estimated Time**: 2-3 hours

### Phase 5: Test Execution (LOW PRIORITY)
**Goal**: Run functional mapping with test data

**Tasks**:
1. Create test execution component
2. Run transformation
3. Display results

**Estimated Time**: 1-2 hours

## Priority Breakdown

### 🔴 CRITICAL (Must Have)
1. **Blockly Visual Editor** - Core functionality
   - Replace JSON editor with Blockly workspace
   - Load/save blocks
   - Generate JSON code

### 🟡 IMPORTANT (Should Have)
2. **Export/Import XML** - Save/load workspace
3. **Function Search** - Find blocks easily
4. **Error Detection** - Validate blocks
5. **Documentation** - Help users

### 🟢 NICE TO HAVE (Could Have)
6. **Add Variable** - Custom variables
7. **Test Execution** - Run with sample data
8. **Diff Viewer** - Compare changes
9. **Fullscreen Mode** - Better UX
10. **Collection Modes** - Advanced config

## Quick Win: Minimal Viable Improvement

**Goal**: Get Blockly editor working in 1-2 hours

**Steps**:
1. Copy `FunctionalMappingEditor.tsx` from Tools page
2. Integrate into `FunctionalMappingSettings.tsx`
3. Replace statements section with Blockly workspace
4. Generate JSON from Blockly on save
5. Load existing statements into Blockly

**Result**: Users can visually create functional mappings!

## Files to Modify

### Existing Files
1. `FunctionalMappingSettings.tsx` - Add Blockly editor
2. `FunctionalMappingSettings.css` - Add styles
3. `DataMapper.tsx` - Handle functional mapping creation

### New Files to Create
1. `FunctionalMappingEditor.tsx` - Blockly workspace
2. `FunctionalMappingToolbar.tsx` - Actions toolbar
3. `VariableDialog.tsx` - Add variables
4. `FunctionDescriptionDialog.tsx` - Documentation
5. `FunctionalMappingSearch.tsx` - Search functions

## Technical Details

### Blockly Integration
```typescript
import * as Blockly from 'blockly/core';
import JSONGenerator from './FunctionalMapping/generators/json_generator';

// Initialize workspace
const workspace = Blockly.inject(divRef.current, {
  toolbox: toolboxXml,
  grid: { spacing: 20, length: 3, colour: '#ccc' },
  zoom: { controls: true, wheel: true },
});

// Set functional mapping config
JSONGenerator.vue = { functionalMappingConfig };

// Generate code
const code = JSONGenerator.workspaceToCode(workspace);
const parsed = JSON.parse(code);
const statements = parsed.statements || [];
```

### XML Export/Import
```typescript
// Export
const xml = Blockly.Xml.workspaceToDom(workspace);
const xmlText = Blockly.Xml.domToText(xml);
downloadFile(xmlText, 'functional-mapping.xml');

// Import
const dom = Blockly.Xml.textToDom(xmlText);
Blockly.Xml.domToWorkspace(dom, workspace);
```

## Benefits

### For Users
- ✅ **Visual programming** - No need to write JSON
- ✅ **Easier to learn** - Drag and drop blocks
- ✅ **Less errors** - Block validation
- ✅ **Faster development** - Pre-built blocks
- ✅ **Better documentation** - Inline help

### For Developers
- ✅ **Reuse existing code** - Blockly blocks already exist
- ✅ **Consistent with Vue** - Same UX
- ✅ **Maintainable** - Visual editor is easier to debug
- ✅ **Extensible** - Easy to add new blocks

## Next Steps

1. **Review this plan** with the user
2. **Prioritize features** - What's most important?
3. **Start with Phase 1** - Blockly editor integration
4. **Iterate** - Add features incrementally

## Questions for User

1. Do you want the full Blockly editor or just basic improvements?
2. Which features are most important?
3. Should we start with Phase 1 (Blockly editor)?
4. Do you have sample functional mappings to test with?

---

**Recommendation**: Start with **Phase 1** to get the Blockly visual editor working. This is the biggest improvement and will make functional mappings much easier to use!

