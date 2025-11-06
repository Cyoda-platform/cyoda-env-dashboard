# Debugging: Mapping Lines Not Being Saved

## Issue
After adding the popover menu for selecting mapping types, the mapping lines are no longer being saved.

## Changes Made
1. Added Popover component to source circles
2. Changed from direct drag handler to popover-based selection
3. Using callback refs to store circle elements

## Potential Issues

### 1. Circle Element Reference
**Problem**: The circle element is now wrapped in a Popover, which might affect how we get the element reference.

**Solution Applied**:
- Using `circleRefs.current[currentPath]` to store and retrieve circle elements
- Using callback ref: `ref={(el) => { if (el) { circleRefs.current[currentPath] = el; } }}`

### 2. Stale Closures in useMemo
**Problem**: `buildTreeData` is inside `useMemo` but accesses `popoverVisible` and `setPopoverVisible` which are not in dependencies.

**Current Dependencies**:
```typescript
[sourceData, allDataRelations, selectedEntityMapping.isPolymorphicList, dragDropHandler]
```

**Missing**:
- `popoverVisible`
- `setPopoverVisible`
- `circleRefs`

### 3. Drag Start Logic
The drag is initiated from `handleStartDragLine`:
```typescript
const handleStartDragLine = (type: 'columnMapping' | 'functionalMapping') => {
  setPopoverVisible({ ...popoverVisible, [currentPath]: false });
  const circleElement = circleRefs.current[currentPath];
  
  if (dragDropHandler && isLeaf && circleElement) {
    dragDropHandler.startDragLine({
      el: circleElement,
      path: currentPath,
      jsonPath: currentPath,
      type,
      direction: 'fromSource',
    });
  }
};
```

## Testing Steps

1. **Open Browser Console** - Check for errors or console.log messages
2. **Click on Source Circle** - Should see popover
3. **Click "Column Mapping"** - Should see console.log: "Starting drag line"
4. **Check if drag starts** - Line should appear
5. **Drag to target** - Line should follow mouse
6. **Drop on target** - Mapping should be created
7. **Check if saved** - Mapping should persist

## Console Logs Added

```typescript
console.log('Starting drag line:', { type, currentPath, element: circleElement });
```

```typescript
console.error('Cannot start drag:', { 
  hasDragDropHandler: !!dragDropHandler, 
  isLeaf, 
  hasCircleElement: !!circleElement,
  currentPath
});
```

## Next Steps

1. Check browser console for logs
2. Verify circle element is being stored in circleRefs
3. Verify dragDropHandler is available
4. Check if endDragLine is being called
5. Check if onMappingChange is being called
6. Verify the mapping is being added to the entity mapping
7. Check if the parent component is receiving the update

## Files to Check

1. `SourceDataNavigation.tsx` - Circle rendering and drag start
2. `DragDropHandler.tsx` - Drag logic and endDragLine
3. `DataMapper.tsx` - handleMappingChange callback
4. `DataMapperEdit.tsx` - Save logic

## Quick Fix to Try

If the issue is with the ref, try using a simpler approach:

```typescript
const handleStartDragLine = (type: 'columnMapping' | 'functionalMapping') => {
  setPopoverVisible({ ...popoverVisible, [currentPath]: false });
  
  // Wait for popover to close, then find the element
  setTimeout(() => {
    const circleElement = document.querySelector(
      `.source-data-node[data-path="${CSS.escape(currentPath)}"] .circle`
    ) as HTMLElement;
    
    if (circleElement && dragDropHandler) {
      dragDropHandler.startDragLine({
        el: circleElement,
        path: currentPath,
        jsonPath: currentPath,
        type,
        direction: 'fromSource',
      });
    }
  }, 100);
};
```

## Alternative: Use Event-Based Approach

Instead of storing refs, we could pass the type through a data attribute and handle the click directly:

```typescript
<div
  className="circle"
  data-path={currentPath}
  data-mapping-type={selectedType}
  onMouseDown={(e) => {
    if (selectedType) {
      dragDropHandler.startDragLine({
        el: e.currentTarget,
        path: currentPath,
        jsonPath: currentPath,
        type: selectedType,
        direction: 'fromSource',
      });
    }
  }}
>
```

But this would require a different UI pattern (e.g., radio buttons to select type first).

