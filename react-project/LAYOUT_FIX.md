# Layout Fix - "Processing Manager" Title Visibility

## Issue

The "Processing Manager" title on the home page was half visible, being cut off by the fixed header.

## Root Cause

The `.c-body` element had insufficient top margin (`5.5rem`) to account for the fixed header and subheader, causing content to be partially hidden behind the header.

## Solution

Increased the top margin of `.c-body` from `5.5rem` to `7rem` to provide adequate spacing for the fixed header.

### Changes Made

**File**: `src/components/layout/Layout.scss`

**Before**:
```scss
.c-body {
  flex: 1 1 auto;
  margin-top: 5.5rem; // Account for fixed header + subheader (reduced from 7rem)
}

.c-main {
  padding: 0.5rem 1rem 1rem; // Reduced top padding
}
```

**After**:
```scss
.c-body {
  flex: 1 1 auto;
  margin-top: 7rem; // Account for fixed header + subheader
}

.c-main {
  padding: 1rem; // Consistent padding
}
```

## Technical Details

### Layout Structure

The Processing Manager uses a fixed header layout:

```
┌─────────────────────────────────────┐
│  Fixed Header (c-header)            │ ← position: fixed, top: 0
│  - Main header bar                  │
│  - Subheader (breadcrumbs)          │
├─────────────────────────────────────┤
│  Body (c-body)                      │ ← margin-top: 7rem
│  ┌─────────────────────────────────┐│
│  │ Main Content (c-main)           ││
│  │ - Processing Manager title      ││
│  │ - Page content                  ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Header Components

1. **Main Header** (`c-header`):
   - Position: `fixed`
   - Top: `0`
   - Left: `256px` (sidebar width)
   - Contains: Menu toggle, navigation links, user info

2. **Subheader** (`c-subheader`):
   - Min-height: `3rem`
   - Contains: Breadcrumbs portal
   - Background: `#f0f3f5`

3. **Total Header Height**: ~7rem
   - Main header: ~4rem
   - Subheader: ~3rem

## Verification

✅ **Title fully visible**: "Processing Manager" h1 title is now completely visible  
✅ **Proper spacing**: Content has adequate top margin  
✅ **No overlap**: Fixed header doesn't overlap with page content  
✅ **Consistent padding**: Main content area has uniform padding  

## Testing

To verify the fix:

1. **Open the application**: http://localhost:3008/processing-ui
2. **Check home page**: The "Processing Manager" title should be fully visible
3. **Scroll test**: Scroll down and up to ensure header stays fixed and content flows properly
4. **Different pages**: Navigate to Nodes, Node Detail pages to ensure consistent layout

## Related Files

- `src/components/layout/Layout.tsx` - Main layout component
- `src/components/layout/Layout.scss` - Layout styles (modified)
- `src/components/layout/Header.tsx` - Header component
- `src/components/layout/Header.scss` - Header styles
- `src/pages/Home.tsx` - Home page with "Processing Manager" title

## Impact

This fix affects all pages in the Processing Manager application:
- ✅ Home page
- ✅ Nodes list page
- ✅ Node detail page
- ✅ Transaction detail page
- ✅ All other pages using the Layout component

All pages now have proper spacing between the fixed header and content.

