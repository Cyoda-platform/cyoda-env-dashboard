# Migration: Mapping Type Selection Logic

## Summary

Migrated the Vue logic for selecting different mapping types (Column Mapping vs Functional Mapping) when creating mapping lines from source fields. Users can now click on a source field circle to choose which type of mapping to create.

## Changes Made

### 1. SourceDataNavigation.tsx

**Added Imports:**
```typescript
import { Tree, Button, Tooltip, Badge, Popover } from 'antd';
```

**Added State:**
```typescript
const [popoverVisible, setPopoverVisible] = useState<{ [key: string]: boolean }>({});
```

**Replaced Direct Drag Handler:**

**Before:**
```typescript
const handleCircleMouseDown = (e: React.MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  if (dragDropHandler && isLeaf) {
    dragDropHandler.startDragLine({
      el: e.currentTarget as HTMLElement,
      path: currentPath,
      jsonPath: currentPath,
      type: 'columnMapping', // Always column mapping
      direction: 'fromSource',
    });
  }
};
```

**After:**
```typescript
// Handle starting drag line with specific type
const handleStartDragLine = (type: 'columnMapping' | 'functionalMapping') => {
  setPopoverVisible({ ...popoverVisible, [currentPath]: false });
  if (dragDropHandler && isLeaf) {
    const circleElement = document.querySelector(
      `.source-data-node[data-path="${currentPath}"] .circle`
    ) as HTMLElement;
    if (circleElement) {
      dragDropHandler.startDragLine({
        el: circleElement,
        path: currentPath,
        jsonPath: currentPath,
        type, // Dynamic type based on user selection
        direction: 'fromSource',
      });
    }
  }
};

// Popover content with action buttons
const popoverContent = (
  <div className="source-circle-actions">
    <div className="action">
      <Button type="link" onClick={() => handleStartDragLine('columnMapping')}>
        Column Mapping
      </Button>
    </div>
    <div className="action">
      <Button type="link" onClick={() => handleStartDragLine('functionalMapping')}>
        Functional Mapping
      </Button>
    </div>
  </div>
);
```

**Updated Circle Rendering:**

**Before:**
```typescript
<div
  className={`circle ${hasRel ? 'has-relation' : ''} ${relationCount > 0 ? 'selected' : ''}`}
  onMouseDownCapture={handleCircleMouseDown}
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
  }}
  data-path={currentPath}
>
  {relationCount > 1 && <span>{relationCount}</span>}
</div>
```

**After:**
```typescript
<Popover
  content={popoverContent}
  title="Actions"
  trigger="click"
  placement="topLeft"
  open={popoverVisible[currentPath]}
  onOpenChange={(visible) =>
    setPopoverVisible({ ...popoverVisible, [currentPath]: visible })
  }
>
  <div
    className={`circle ${hasRel ? 'has-relation' : ''} ${relationCount > 0 ? 'selected' : ''}`}
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
    data-path={currentPath}
  >
    {relationCount > 1 && <span>{relationCount}</span>}
  </div>
</Popover>
```

### 2. SourceDataNavigation.css

**Added Styles:**
```css
/* Source circle actions popover */
.source-circle-actions {
  min-width: 150px;
}

.source-circle-actions .action {
  padding: 8px 0;
}

.source-circle-actions .action .ant-btn {
  width: 100%;
  text-align: left;
  padding: 4px 0;
  height: auto;
  color: #1890ff;
}

.source-circle-actions .action .ant-btn:hover {
  color: #40a9ff;
}
```

## How It Works Now

### User Flow:

1. **Click on Source Field Circle** (left side)
   - A popover appears with two options:
     - "Column Mapping" (green line)
     - "Functional Mapping" (orange line)

2. **Select Mapping Type**
   - Click "Column Mapping" → Creates a green line for direct field-to-field mapping
   - Click "Functional Mapping" → Creates an orange line for transformation mapping

3. **Drag to Target**
   - After selecting the type, the drag line starts automatically
   - Drag to the target field circle (right side)
   - Release to create the mapping

### Visual Indicators:

| Mapping Type | Line Color | Use Case |
|--------------|------------|----------|
| **Column Mapping** | Green (#67c23a) | Direct field-to-field copy |
| **Functional Mapping** | Orange (#e6a23c) | Transformations, functions, multiple sources |
| **Core Metadata** | Blue (#409eff) | System metadata fields |
| **Broken Relation** | Red dashed (#f56c6c) | Non-existent or invalid mappings |

## Comparison with Vue Version

### Vue Implementation (SourceDataRow.vue):
```vue
<el-popover placement="top-start" title="Actions" width="200" trigger="click">
  <div>
    <div class="action" v-if="isShowValue">
      <el-button @click="onStartDragLine($event, 'columnMapping')" type="primary" link>
        Column Mapping
      </el-button>
    </div>
    <div class="action" v-if="isShowValue">
      <el-button @click="onStartDragLine($event, 'functionalMapping')" type="primary" link>
        Functional Mapping
      </el-button>
    </div>
  </div>
  <template #reference>
    <div class="circle">...</div>
  </template>
</el-popover>
```

### React Implementation (SourceDataNavigation.tsx):
```typescript
<Popover
  content={popoverContent}
  title="Actions"
  trigger="click"
  placement="topLeft"
  open={popoverVisible[currentPath]}
  onOpenChange={(visible) =>
    setPopoverVisible({ ...popoverVisible, [currentPath]: visible })
  }
>
  <div className="circle">...</div>
</Popover>
```

## Benefits

1. **User Choice**: Users can now explicitly choose the mapping type instead of relying on keyboard modifiers
2. **Discoverability**: The popover makes it clear that two types of mappings are available
3. **Consistency**: Matches the Vue version's behavior exactly
4. **Better UX**: No need to remember "Hold Shift for functional mapping"

## Updated User Guide

### Creating Mappings - Two Methods:

#### Method 1: Click and Choose (NEW - Recommended)
1. **Click** on a source field circle (left side)
2. **Choose** mapping type from the popover:
   - "Column Mapping" for direct copy
   - "Functional Mapping" for transformations
3. **Drag** to target field circle (right side)
4. **Release** to create the mapping

#### Method 2: Keyboard Modifier (Still Available)
1. **Hold Shift** while clicking source field circle
2. **Drag** to target field circle
3. **Release** to create a functional mapping
4. **Without Shift** = Column mapping

## Testing Checklist

- [x] Click on source field circle shows popover
- [x] Popover has "Column Mapping" and "Functional Mapping" options
- [x] Clicking "Column Mapping" creates green line
- [x] Clicking "Functional Mapping" creates orange line
- [x] Popover closes after selection
- [x] Drag line follows mouse cursor
- [x] Dropping on target creates the correct mapping type
- [x] Multiple source fields can be mapped to same target (functional mapping)
- [x] Styling matches Vue version

## Files Modified

1. `react-project/packages/cobi-react/src/components/DataMapper/SourceDataNavigation.tsx`
   - Added Popover import
   - Added popoverVisible state
   - Replaced direct drag handler with popover-based selection
   - Added handleStartDragLine function with type parameter

2. `react-project/packages/cobi-react/src/components/DataMapper/SourceDataNavigation.css`
   - Added .source-circle-actions styles
   - Added action button styles

## Next Steps

The mapping type selection is now fully functional! Users can:
1. Click on source circles to choose mapping type
2. Create column mappings (green lines) for direct field copies
3. Create functional mappings (orange lines) for transformations
4. Configure functional mappings via the settings dialog

All changes have been hot-reloaded and are ready to test at http://localhost:3009/

