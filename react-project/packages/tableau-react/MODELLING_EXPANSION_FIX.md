# Modelling Field Expansion Fix

## Issue
Fields like `modelElements` and `changeLog` in Stream Reports (and regular Reports) were not expandable, even though they showed expand arrows. Clicking the arrows did nothing.

## Root Cause
The React migration was missing critical recursive logic in the `HelperModelling.getClasses()` method. In the old Vue project, this method recursively processed `elementType` and `elementInfo` properties to handle nested LIST and EMBEDDED field types. The React version only handled `declaredClass` and `subClasses`, but didn't recurse into nested structures.

## Files Changed

### 1. `src/utils/HelperModelling.ts`
**What was missing:**
- Recursive handling of `elementType` (for MAP types)
- Recursive handling of `elementInfo` (for LIST types)

**What was added:**
```typescript
// Handle elementType (for MAP types)
if (row.elementType) {
  if ((row as any).keyInfo) {
    const type = (row as any).keyInfo.split('.').pop();
    types.push(type);
  }
  allRequestParams.push(...this.getClasses(requestClass, row.elementType, baseColumnPath, types));
}

// Handle elementInfo (for LIST types)
if (row.elementInfo) {
  types.push('Integer');
  allRequestParams.push(...this.getClasses(requestClass, row.elementInfo, baseColumnPath, types));
}
```

### 2. `src/types/modelling.ts`
**What was missing:**
- The `ElementInfo` interface was too simple and didn't support recursive structures

**What was added:**
```typescript
export interface ElementInfo {
  columnPath: string;
  type: string;
  columnName?: string;
  declaredClass?: DeclaredClass;
  subClasses?: SubClass[];
  elementType?: ElementInfo;  // Recursive
  elementInfo?: ElementInfo;  // Recursive
}
```

## How It Works

### Before (Broken)
1. User clicks on `modelElements` (type: LIST)
2. `ModellingItem` detects it's expandable (has `elementInfo`)
3. `HelperModelling.allRequestParams()` is called
4. `getClasses()` only processes `declaredClass` and `subClasses`
5. Returns empty array because `elementInfo` is not processed
6. `ModellingGroupClass` receives empty array
7. Nothing renders, expansion fails

### After (Fixed)
1. User clicks on `modelElements` (type: LIST)
2. `ModellingItem` detects it's expandable (has `elementInfo`)
3. `HelperModelling.allRequestParams()` is called
4. `getClasses()` processes `declaredClass`, `subClasses`, AND recursively processes `elementInfo`
5. Returns array with class info like `com.cyoda.tdb.model.metadata.StructuredModelElement`
6. `ModellingGroupClass` receives the classes
7. `ModellingItemClass` renders the expandable class
8. User can click to expand and see nested fields

## Example Data Structure

### modelElements Field
```json
{
  "columnName": "modelElements",
  "columnPath": "modelElements",
  "type": "LIST",
  "elementInfo": {
    "columnPath": "modelElements",
    "type": "EMBEDDED",
    "declaredClass": {
      "class": "com.cyoda.tdb.model.metadata.StructuredModelElement",
      "abstract": false
    },
    "subClasses": []
  }
}
```

### changeLog Field
```json
{
  "columnName": "changeLog",
  "columnPath": "changeLog",
  "type": "LIST",
  "elementInfo": {
    "columnPath": "changeLog",
    "type": "EMBEDDED",
    "declaredClass": {
      "class": "com.cyoda.tdb.model.metadata.ModelChangeLogEntry",
      "abstract": false
    },
    "subClasses": []
  }
}
```

## Impact

### Fixed Components
✅ **Stream Reports** - `ReportEditorStream.tsx`
- Model tab → Range column selection
- Model tab → Column definitions

✅ **Regular Reports** - `ReportEditor.tsx`
- Model tab → Column definitions

✅ **All Modelling Components**
- `ModellingColDefs`
- `ModellingPopUp`
- `ModellingGroup`
- `ModellingItem`
- `ModellingGroupClass`
- `ModellingItemClass`

### What Users Can Now Do
1. Click on LIST fields (like `modelElements`, `changeLog`) to expand them
2. See the nested class structure (e.g., `com.cyoda.tdb.model.metadata.ModelChangeLogEntry`)
3. Click on the class to expand and see its fields (e.g., `changeDate`, `changes`, `entityId`)
4. Select individual nested fields for reports
5. Navigate through complex nested data structures

## Testing

### Manual Test Steps
1. Navigate to Stream Reports
2. Create or edit a stream report
3. Go to Model tab
4. Click "Add New Column Definition"
5. Find a LIST field like `modelElements` or `changeLog`
6. Click the expand arrow (▶)
7. ✅ Should expand to show the class (e.g., `com.cyoda.tdb.model.metadata.StructuredModelElement`)
8. Click the class expand arrow
9. ✅ Should show nested fields (e.g., `breakPoint`, `depth`, `fullPath`, `type`)

### Verification
- Check browser console for any errors
- Verify the expand/collapse animation works smoothly
- Verify nested fields can be selected with checkboxes
- Verify selected fields appear in the "Selected Columns" table

## Related Files
- `src/components/Modelling/ModellingItem.tsx` - Uses `HelperModelling.allRequestParams()`
- `src/components/Modelling/ModellingItemClass.tsx` - Renders the expanded classes
- `src/components/Modelling/ModellingGroupClass.tsx` - Container for class items
- `src/components/ReportEditorTabModel.tsx` - Uses `ModellingColDefs`
- `src/pages/ReportEditor.tsx` - Regular reports editor
- `src/pages/ReportEditorStream.tsx` - Stream reports editor

## Migration Notes
This fix brings the React implementation to full parity with the old Vue project's `HelperModelling.getClasses()` method. The recursive logic was present in the Vue version but was accidentally omitted during the React migration.

## References
- Old Vue implementation: `.old_project/packages/cobi/src/helpers/HelperModelling.ts` (lines 126-143)
- React implementation: `react-project/packages/tableau-react/src/utils/HelperModelling.ts` (lines 122-177)

