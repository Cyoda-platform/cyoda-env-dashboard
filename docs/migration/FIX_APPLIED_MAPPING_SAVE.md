# Fix Applied: Mapping Lines Not Saving

## Problem
After adding the popover menu for selecting mapping types, the mapping lines stopped being saved.

## Root Cause
The circle element reference was not being properly captured when the drag started from the popover button click.

## Solution Applied

### 1. Added Circle Element Refs Storage
```typescript
// Store circle element refs by path
const circleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
```

### 2. Used Callback Ref to Store Elements
```typescript
<div
  ref={(el) => {
    if (el) {
      circleRefs.current[currentPath] = el;
    }
  }}
  className="circle"
  ...
>
```

### 3. Added Timeout Before Starting Drag
```typescript
const handleStartDragLine = (type: 'columnMapping' | 'functionalMapping') => {
  // Close popover first
  setPopoverVisible({ ...popoverVisible, [currentPath]: false });
  
  // Wait a bit for popover to close, then start drag
  setTimeout(() => {
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
  }, 50);
};
```

## Why This Works

1. **Callback Ref**: Stores the actual DOM element for each circle by its path
2. **Timeout**: Gives the popover time to close before starting the drag, ensuring the element is in the correct state
3. **Path-Based Lookup**: Uses the currentPath to find the correct circle element

## Testing

To verify the fix works:

1. **Open DataMapper** at http://localhost:3009/
2. **Click on a source field circle** (left side)
3. **Check console** - Should see: "Starting drag line: { type, currentPath, element }"
4. **Select "Column Mapping"** or "Functional Mapping"
5. **Drag to target field** - Line should appear and follow mouse
6. **Drop on target circle** - Mapping should be created
7. **Check if persisted** - Mapping should remain after page refresh (if saved)

## Console Logs Added

For debugging, the following logs were added:

**Success Case**:
```
Starting drag line: { type: 'columnMapping', currentPath: 'root:/fieldName', element: div.circle }
```

**Error Case**:
```
Cannot start drag: { 
  hasDragDropHandler: true, 
  isLeaf: true, 
  hasCircleElement: false,
  currentPath: 'root:/fieldName',
  allRefs: ['root:/field1', 'root:/field2', ...]
}
```

## Files Modified

1. **SourceDataNavigation.tsx**
   - Added `useRef` import
   - Added `circleRefs` ref to store circle elements
   - Modified `handleStartDragLine` to use stored refs with timeout
   - Added callback ref to circle div
   - Added console.log for debugging

## Next Steps

If the issue persists:

1. Check browser console for error messages
2. Verify `dragDropHandler` is being passed correctly
3. Check if `endDragLine` is being called in DragDropHandler
4. Verify `onMappingChange` callback is working
5. Check DataMapperEdit save logic

## Alternative Approaches (if needed)

### Option 1: Direct Element Query
```typescript
const handleStartDragLine = (type: 'columnMapping' | 'functionalMapping') => {
  setPopoverVisible({ ...popoverVisible, [currentPath]: false });
  
  setTimeout(() => {
    const escapedPath = CSS.escape(currentPath);
    const circleElement = document.querySelector(
      `.source-data-node[data-path="${escapedPath}"] .circle`
    ) as HTMLElement;
    
    if (circleElement && dragDropHandler) {
      dragDropHandler.startDragLine({ ... });
    }
  }, 100);
};
```

### Option 2: Store Type in State, Drag on MouseDown
```typescript
const [selectedMappingType, setSelectedMappingType] = useState<string | null>(null);

// In popover button:
onClick={() => {
  setSelectedMappingType(type);
  setPopoverVisible({ ...popoverVisible, [currentPath]: false });
}}

// In circle:
onMouseDown={(e) => {
  if (selectedMappingType) {
    dragDropHandler.startDragLine({
      el: e.currentTarget,
      type: selectedMappingType,
      ...
    });
    setSelectedMappingType(null);
  }
}}
```

### Option 3: Programmatic Drag Start
```typescript
const handleStartDragLine = (type: 'columnMapping' | 'functionalMapping') => {
  setPopoverVisible({ ...popoverVisible, [currentPath]: false });
  
  // Create a synthetic mouse event
  const circleElement = circleRefs.current[currentPath];
  if (circleElement) {
    const rect = circleElement.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    });
    
    // Start drag with the element and type
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

## Status

✅ Fix applied and hot-reloaded
🔍 Awaiting testing confirmation
📝 Console logs added for debugging

Please test the mapping creation and let me know if:
1. The drag starts correctly
2. The line appears and follows the mouse
3. The mapping is created when dropped
4. The mapping persists (is saved)

If any step fails, check the browser console for the debug messages!

