# Fix: LIST/MAP Column Type Handling in Report Editor

## Problem

When adding columns of type `LIST` or `MAP` to a report definition, the save operation was failing with a 400 error:

```
Error parsing bean: com.cyoda.core.reports.columndefs.ReportColDef::type, 
Unable to create type: LIST
```

## Root Cause

The issue was that for `LIST` and `MAP` type fields, we were setting `colType` to the container type (`LIST` or `MAP`) instead of the actual Java class type of the elements within the container.

For example, when selecting a field like `changes.[*]` (which is a LIST of `ModelChange` objects):
- ❌ **Wrong**: `colType: 'LIST'`
- ✅ **Correct**: `colType: 'com.cyoda.tdb.model.metadata.ModelChange'`

## Solution

### Understanding the Data Structure

In Cyoda's entity model, `LIST` and `MAP` fields have a nested structure:

```typescript
{
  columnName: "changes",
  columnPath: "changes.[*]",
  type: "LIST",  // Container type
  elementType: {  // The actual element type
    columnPath: "changes.[*]@com#cyoda#tdb#model#metadata#ModelChange",
    type: "EMBEDDED",
    clazzType: "com.cyoda.tdb.model.metadata.ModelChange"  // This is what we need!
  }
}
```

### Implementation

We need to "unwrap" the container type to get the element type:

```typescript
// Get the element (unwrap LIST/MAP types to get the actual element type)
const getElement = useMemo(() => {
  let element = reportInfoRow;
  if (element.elementType) {
    element = element.elementType;
  }
  if (element.elementInfo) {
    element = element.elementInfo;
  }
  return element;
}, [reportInfoRow]);

// Use the element's clazzType for colType
const label = useMemo(() => {
  const element = getElement;
  return {
    fullPath,
    colType: element.clazzType || reportInfoRow.type,
  };
}, [fullPath, getElement, reportInfoRow.type]);
```

## Files Changed

### 1. `packages/tableau-react/src/components/Modelling/ModellingItem.tsx`

**Changes:**
- Added `getElement` memoized value that unwraps `LIST`/`MAP` types by checking for `elementType` or `elementInfo`
- Updated `label.colType` to use `element.clazzType` instead of `reportInfoRow.type`
- Updated checkbox data attributes to use the unwrapped element:
  - `data-clazz-type={getElement.clazzType || reportInfoRow.type}`
  - `data-column-path={getElement.columnPath}`

**Why:** This ensures that when a user selects a `LIST` or `MAP` field, we capture the correct Java class type of the elements, not the container type.

### 2. `packages/tableau-react/src/components/Modelling/ModellingPopUp.tsx`

**No changes needed** - This component already correctly reads the `data-clazz-type` attribute from the checkbox and uses it for the `colType` field.

## Testing

To verify the fix:

1. Open a report editor
2. Click "Add New Column Definition"
3. Select a field of type `LIST` (e.g., `changeLog.[*]` → `changes.[*]`)
4. Click "Apply"
5. Click "Update" to save the report
6. ✅ The report should save successfully without errors

## Related Vue Project Code

This implementation matches the Vue project's approach in `CyodaModellingItem.vue`:

```javascript
function getElement() {
  let element = props.reportInfoRow;
  if (element.elementType) {
    element = element.elementType;
  }
  if (element.elementInfo) {
    element = element.elementInfo;
  }
  return element;
}

// Later used as:
label.value = {
  fullPath: fullPath.value,
  colType: element.clazzType!
};
```

## Important Notes

1. **`parts` field format**: The `parts` field should remain in the bean wrapper format `{@meta: '...', value: [...]}` when sent to the server. Do NOT unwrap it to a plain array.

2. **`colType` vs `type`**: 
   - `type` is the field type (`LEAF`, `LIST`, `MAP`, `EMBEDDED`)
   - `colType` is the Java class type (e.g., `com.cyoda.tdb.model.metadata.ModelChange`)
   - For `LIST`/`MAP` fields, we need the element's `clazzType`, not the container's `type`

3. **Backward compatibility**: The fallback `|| reportInfoRow.type` ensures that `LEAF` and `EMBEDDED` fields still work correctly when `clazzType` is not available.

