# Table Responsive Migration Guide

## Overview

This guide explains how to make tables responsive so they don't overflow their containers when the left side menu is expanded/collapsed.

## Problem

Tables were overflowing their containers, causing:
- Horizontal scrolling at the page level
- Poor UX when menu expands/collapses
- Tables extending beyond viewport

## Solution

Use shared SCSS mixins from `@cyoda/ui-lib-react/src/styles/_table-mixins.scss`.

## Quick Start

### Step 1: Import Mixins

In your SCSS file:

**For components in `@cyoda/ui-lib-react` package:**
```scss
@use '../../styles/table-mixins' as table;
```

**For components in other packages (e.g., `@cyoda/tableau-react`, `@cyoda/http-api-react`):**
```scss
// Adjust the number of ../ based on your file location
// From packages/tableau-react/src/components/
@use '../../../ui-lib-react/src/styles/table-mixins' as table;

// From packages/tableau-react/src/pages/
@use '../../../ui-lib-react/src/styles/table-mixins' as table;

// From packages/http-api-react/src/components/StreamGrid/
@use '../../../../ui-lib-react/src/styles/table-mixins' as table;
```

### Step 2: Apply to Containers

```scss
// Page container
.my-page {
  @include table.page-container;
}

// Table wrapper
.my-table {
  @include table.table-container-wrapper;
}
```

### Step 3: Update Table Component

```tsx
<Table
  scroll={{ x: true, y: 400 }}  // Changed from x: 'max-content'
  // ... other props
/>
```

## Available Mixins

| Mixin | Use Case | Key Features |
|-------|----------|--------------|
| `page-container` | Page-level wrapper | 100% width, prevents overflow |
| `table-container-wrapper` | Direct table wrapper | Fixed layout, horizontal scroll |
| `resizable-columns` | Resizable columns | React-resizable styles |
| `flex-table-wrapper` | Table in flex container | min-width: 0, flex: 1 |
| `report-table-section` | Flex container with tables | display: flex, gap: 20px |

## Migration Checklist

For each table component:

- [ ] Import table mixins in SCSS file
- [ ] Apply `page-container` to page wrapper
- [ ] Apply `table-container-wrapper` to table wrapper
- [ ] Apply `flex-table-wrapper` if in flex container
- [ ] Apply `resizable-columns` if using resizable columns
- [ ] Update `scroll` prop to `{{ x: true, y: height }}`
- [ ] Test with menu expanded/collapsed
- [ ] Test column resizing (if applicable)
- [ ] Verify no horizontal page scroll

## Components Status

### ✅ Completed

- `@cyoda/tableau-react/src/components/HistoryTable`
- `@cyoda/tableau-react/src/pages/Reports`
- `@cyoda/tableau-react/src/components/ReportTableRows`
- `@cyoda/tableau-react/src/components/ReportTableGroup`
- `@cyoda/http-api-react/src/components/StreamGrid`
- `@cyoda/ui-lib-react/src/components/EntityDetailModal/EntityAudit`
- `@cyoda/ui-lib-react/src/components/EntityDetailModal/EntityDataLineage`
- `@cyoda/ui-lib-react/src/components/TransitionChangesTable`
- `@cyoda/ui-lib-react/src/components/ConfigEditorStreamGrid`
- `@cyoda/ui-lib-react/src/components/ErrorTable`
- `@cyoda/ui-lib-react/src/components/DataTable`

### 🔄 To Migrate

#### Medium Priority

- [ ] `@cyoda/ui-lib-react/src/components/TableComponent` (generic wrapper - may not need changes)
- ~~`@cyoda/ui-lib-react/src/components/ConsistencyTable`~~ (not using Ant Design Table)
- ~~`@cyoda/ui-lib-react/src/components/ConsistencyDialogTable`~~ (not using Ant Design Table)

#### Low Priority

- [ ] `@cyoda/ui-lib-react/src/components/ChatBotFormInfo`
- [ ] `@cyoda/ui-lib-react/src/components/ChatBotPrompts`
- [ ] `@cyoda/cyoda-sass-react/src/components/TrinoEditTable`
- [ ] `@cyoda/cyoda-sass-react/src/components/dialogs/ModelsPopUp`
- [ ] `@cyoda/cyoda-sass-react/src/components/dialogs/HiddenFieldsPopUp`
- [ ] `@cyoda/cyoda-sass-react/src/components/dialogs/HiddenTablesPopUp`

## Example: ReportTableRows Migration

### Before

```scss
// ReportTableRows.scss
.report-table-rows {
  width: 100%;
  
  .ant-table {
    font-size: 14px;
  }
}
```

```tsx
<Table
  scroll={{ x: 'max-content', y: 400 }}
  // ...
/>
```

### After

```scss
// ReportTableRows.scss
@use '@cyoda/ui-lib-react/src/styles/table-mixins' as table;

.report-table-rows {
  @include table.table-container-wrapper;
  
  .ant-table {
    font-size: 14px;
  }
}
```

```tsx
<Table
  scroll={{ x: true, y: 400 }}
  // ...
/>
```

## Example: Page with Flex Layout

### Before

```scss
.my-page {
  padding: 16px;
  
  .table-section {
    display: flex;
    gap: 20px;
    
    .table-wrapper {
      flex: 1;
    }
  }
}
```

### After

```scss
@use '@cyoda/ui-lib-react/src/styles/table-mixins' as table;

.my-page {
  @include table.page-container;
  padding: 16px;
  
  .table-section {
    @include table.report-table-section;
    
    .table-wrapper {
      @include table.flex-table-wrapper;
    }
  }
}

.my-table {
  @include table.table-container-wrapper;
}
```

## Testing

After migration, test:

1. **Menu Collapsed**: Table should fit within container
2. **Menu Expanded**: Table should shrink, no page-level horizontal scroll
3. **Column Resizing**: Should redistribute proportionally (if resizable)
4. **Horizontal Scroll**: Should appear within table if content too wide
5. **Vertical Scroll**: Should work as expected
6. **Responsive**: Should work on different screen sizes

## Troubleshooting

### Table still overflows

- Check that all parent containers have `overflow: hidden`
- Verify `min-width: 0` on flex items
- Ensure `scroll={{ x: true }}` is set

### Columns not resizing properly

- Verify `resizable-columns` mixin is applied
- Check that `ResizableTitle` component is used
- Ensure column widths are managed in state

### Horizontal scroll not appearing

- Check `overflow-x: auto` on `.ant-table-content`
- Verify `table-layout: fixed` is applied
- Ensure total column widths exceed container

## Resources

- Mixins: `react-project/packages/ui-lib-react/src/styles/_table-mixins.scss`
- Documentation: `react-project/packages/ui-lib-react/src/styles/README.md`
- Example: `react-project/packages/tableau-react/src/components/HistoryTable.tsx`

## Next Steps

1. Review the "To Migrate" list above
2. Start with high-priority components
3. Follow the migration steps for each component
4. Test thoroughly
5. Update this document as components are migrated

---

**Created**: 2025-11-05  
**Status**: In Progress  
**Owner**: Development Team

