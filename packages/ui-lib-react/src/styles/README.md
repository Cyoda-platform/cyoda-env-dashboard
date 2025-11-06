# Shared UI Styles

This directory contains shared SCSS files that can be imported across all CYODA React packages to ensure consistent styling.

## Button Hover Fix

### Problem
Ant Design buttons were showing **black text/background on hover** across the entire project, which was a poor user experience and didn't match the CYODA brand colors.

### Solution
We've created a centralized `button-fix.scss` file that:
- ✅ Fixes black hover states on all button types
- ✅ Uses CYODA brand colors (#00D4AA teal/cyan)
- ✅ Provides consistent hover effects across all packages
- ✅ Handles all button variants (primary, default, text, link, dangerous)
- ✅ Includes proper disabled and loading states
- ✅ Works in both light and dark themes

### Usage

#### In Your Package

Add this import to your main SCSS file (e.g., `App.scss`, `index.scss`, or `main.scss`):

```scss
// Import shared button fix styles
@import '@cyoda/ui-lib-react/src/styles/button-fix.scss';
```

Or if importing from a sibling package:

```scss
// Import shared button fix styles
@import '../ui-lib-react/src/styles/button-fix.scss';
```

Or from an app directory:

```scss
// Import shared button fix styles
@import '../../packages/ui-lib-react/src/styles/button-fix.scss';
```

#### In Your Theme Configuration

For best results, also update your Ant Design theme configuration in `App.tsx`:

```tsx
import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00D4AA',
          colorPrimaryHover: '#00E5BF',
          colorLink: '#00D4AA',
          colorLinkHover: '#00E5BF',
          borderRadius: 6,
        },
        components: {
          Button: {
            colorPrimary: '#00D4AA',
            colorPrimaryHover: '#00E5BF',
            colorPrimaryActive: '#00B894',
            primaryColor: '#FFFFFF',
            defaultBg: 'transparent',
            defaultBorderColor: 'rgba(0, 212, 170, 0.5)',
            defaultColor: '#00D4AA',
            defaultHoverBg: 'rgba(0, 212, 170, 0.1)',
            defaultHoverBorderColor: '#00D4AA',
            defaultHoverColor: '#00E5BF',
          },
        },
      }}
    >
      {/* Your app content */}
    </ConfigProvider>
  );
};
```

### Button Variants Covered

#### Primary Button
- **Normal**: Teal background (#00D4AA), white text
- **Hover**: Lighter teal (#00E5BF), white text, subtle shadow
- **Active**: Darker teal (#00B894)
- **Disabled**: 50% opacity

#### Default Button
- **Normal**: Transparent background, teal border, teal text
- **Hover**: Light teal background (10% opacity), solid teal border
- **Active**: Slightly darker background (15% opacity)

#### Text Button
- **Normal**: Teal text, no background/border
- **Hover**: Light teal background (10% opacity)
- **Active**: Slightly darker background (15% opacity)

#### Link Button
- **Normal**: Teal text, no background/border
- **Hover**: Lighter teal text
- **Active**: Darker teal text

#### Dangerous Button
- **Primary**: Red background (#EF4444)
- **Default**: Red text and border
- **Hover**: Lighter red with appropriate background

### Color Palette

```scss
// Primary Colors (CYODA Teal/Cyan)
$primary: #00D4AA;
$primary-light: #00E5BF;
$primary-dark: #00B894;

// Danger Colors
$danger: #EF4444;
$danger-light: #F87171;
$danger-dark: #DC2626;

// Text Colors
$text-white: #FFFFFF;
```

### Packages Already Updated

- ✅ `tableau-react`
- ✅ `saas-app`
- ✅ `processing-manager-react`

### Packages To Update

To apply this fix to other packages, add the import statement to:

- `cobi-react/src/main.tsx` or `index.css`
- `cyoda-sass-react/src/index.scss`
- `source-configuration-react/src/index.css`
- `statemachine-react/src/index.css`
- `tasks-react/src/index.css`

### Testing

After importing the styles, test the following:

1. **Primary buttons** - Should show teal background, white text, lighter teal on hover
2. **Default buttons** - Should show teal border/text, light background on hover
3. **Text buttons** - Should show teal text, light background on hover
4. **Link buttons** - Should show teal text, lighter teal on hover
5. **Dangerous buttons** - Should show red colors, lighter red on hover
6. **Disabled buttons** - Should show 50% opacity, no hover effect
7. **Buttons in modals** - Should work correctly in dark backgrounds
8. **Button groups** - Should maintain proper borders

### Customization

If you need to customize the colors for a specific package, you can override the variables after importing:

```scss
@import '@cyoda/ui-lib-react/src/styles/button-fix.scss';

// Override for this package
.ant-btn.ant-btn-primary {
  background: #YOUR_COLOR !important;
  
  &:hover:not(:disabled) {
    background: #YOUR_HOVER_COLOR !important;
  }
}
```

### Known Issues

None currently. If you encounter any issues with button hover states, please:

1. Ensure the import is added to your main SCSS file
2. Check that the import path is correct
3. Verify that no other CSS is overriding these styles with higher specificity
4. Clear your browser cache and rebuild the project

### Support

For questions or issues, contact the CYODA development team.

---

## Table Mixins

The `_table-mixins.scss` file provides mixins for creating responsive tables that don't overflow their containers when the left menu is expanded/collapsed.

### Problem

Tables were overflowing their containers when the left side menu was expanded, causing horizontal scrolling at the page level instead of within the table.

### Solution

We've created reusable SCSS mixins that:
- ✅ Ensure tables stay within container bounds
- ✅ Enable resizable columns with proportional redistribution
- ✅ Provide horizontal scroll within the table (not the page)
- ✅ Work with flex layouts
- ✅ Support both fixed and adaptive column widths

### Available Mixins

#### 1. `table-container-wrapper`

Use on the direct wrapper of an Ant Design Table component.

**For components in `@cyoda/ui-lib-react`:**
```scss
@use '../../styles/table-mixins' as table;

.my-table-wrapper {
  @include table.table-container-wrapper;
}
```

**For components in other packages:**
```scss
// From packages/tableau-react/src/components/
@use '../../../ui-lib-react/src/styles/table-mixins' as table;

// From packages/http-api-react/src/components/StreamGrid/
@use '../../../../ui-lib-react/src/styles/table-mixins' as table;

.my-table-wrapper {
  @include table.table-container-wrapper;
}
```

**Features:**
- Sets width to 100% with max-width constraint
- Uses `table-layout: fixed` for proportional columns
- Enables horizontal scroll if needed
- Prevents overflow

#### 2. `resizable-columns`

Use when you want resizable columns functionality.

```scss
.my-table-wrapper {
  @include table.table-container-wrapper;
  @include table.resizable-columns;
}
```

**Features:**
- Imports react-resizable CSS
- Adds resize handle styles
- Visual feedback on hover

#### 3. `page-container`

Use on page-level containers.

```scss
.my-page {
  @include table.page-container;
  padding: 16px;
}
```

#### 4. `flex-table-wrapper`

Use when table is in a flex container.

```scss
.table-wrapper {
  @include table.flex-table-wrapper;
}
```

**Critical:** Adds `min-width: 0` to allow flex items to shrink.

#### 5. `report-table-section`

Use for flex containers with multiple elements.

```scss
.report-section {
  @include table.report-table-section;
}
```

### Complete Example

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
  @include table.resizable-columns;
}
```

### Components Using Table Mixins

- ✅ `@cyoda/tableau-react/src/components/HistoryTable`
- ✅ `@cyoda/tableau-react/src/pages/Reports`
- ✅ `@cyoda/tableau-react/src/components/ReportTableRows`
- ✅ `@cyoda/tableau-react/src/components/ReportTableGroup`
- ✅ `@cyoda/http-api-react/src/components/StreamGrid`
- ✅ `@cyoda/ui-lib-react/src/components/EntityDetailModal/EntityAudit`
- ✅ `@cyoda/ui-lib-react/src/components/EntityDetailModal/EntityDataLineage`
- ✅ `@cyoda/ui-lib-react/src/components/TransitionChangesTable`
- ✅ `@cyoda/ui-lib-react/src/components/ConfigEditorStreamGrid`
- ✅ `@cyoda/ui-lib-react/src/components/ErrorTable`
- ✅ `@cyoda/ui-lib-react/src/components/DataTable`

### Components That Don't Need Table Mixins

- `@cyoda/ui-lib-react/src/components/ConsistencyTable` (not using Ant Design Table)
- `@cyoda/ui-lib-react/src/components/ConsistencyDialogTable` (not using Ant Design Table)
- `@cyoda/ui-lib-react/src/components/TableComponent` (generic wrapper, mixins applied by consumers)

---

**Last Updated**: 2025-11-05
**Maintained By**: CYODA Development Team

