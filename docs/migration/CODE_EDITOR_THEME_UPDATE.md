# Code Editor Theme Update - Vibrant Colors

## Summary

Updated all code editors (Monaco Editor and Prism.js) across the SaaS app with vibrant, modern colors inspired by popular code editors. The new theme features:

- **Better font**: Fira Code, JetBrains Mono, Cascadia Code with ligature support
- **Vibrant syntax highlighting**: Pink, green, yellow, purple, and blue colors
- **Improved readability**: Higher contrast and better color differentiation
- **Consistent theming**: Applied across all Monaco Editor and Prism.js instances

## Color Scheme

### Syntax Colors

| Token Type | Color | Hex Code |
|------------|-------|----------|
| **Properties/Tags** | Pink | `#F472B6` |
| **Strings** | Green | `#34D399` |
| **Numbers/Booleans** | Yellow/Gold | `#FBBF24` |
| **Keywords** | Orange | `#FB923C` |
| **Functions** | Purple | `#A78BFA` |
| **Operators/Types** | Blue | `#60A5FA` |
| **Comments** | Gray | `#6B7280` |
| **Delimiters** | Light Gray | `#A8B5C8` |

### Editor Colors

| Element | Color | Hex Code |
|---------|-------|----------|
| **Background** | Dark Navy | `#1E2A3A` |
| **Foreground** | Light Gray | `#E0E0E0` |
| **Line Numbers** | Gray | `#6B7280` |
| **Active Line Number** | Teal | `#00D4AA` |
| **Current Line** | Darker Navy | `#243142` |
| **Selection** | Teal (20% opacity) | `#00D4AA33` |
| **Cursor** | Teal | `#00D4AA` |

## Files Modified

### 1. New Theme Files Created

#### `react-project/packages/ui-lib-react/src/components/CodeEditor/monacoTheme.ts`
- Comprehensive Monaco Editor theme definition
- Reusable theme configuration
- Default editor options with font ligatures
- Theme registration function

#### `react-project/packages/statemachine-react/src/components/prism-cyoda-dark.css`
- Custom Prism.js theme for syntax highlighting
- Vibrant colors matching Monaco Editor theme
- Applied to workflow JSON configuration viewer

### 2. Monaco Editor Updates

#### `react-project/packages/ui-lib-react/src/components/CodeEditor/CodeEditor.tsx`
- Imported new theme configuration
- Applied Cyoda Dark theme to all editor instances
- Updated font family with modern monospace fonts
- Enabled font ligatures for better code readability

#### `react-project/packages/tableau-react/src/components/ReportEditorTabJson.tsx`
- Enhanced theme with syntax token rules
- Updated font to Fira Code/JetBrains Mono
- Added smooth cursor animations
- Improved editor options

#### `react-project/packages/cobi-react/src/pages/DataManagementDashboard/components/ExecuteDialog/DataSourceConfigDialogResultTabsRaw.tsx`
- Applied vibrant color scheme
- Updated font family
- Enhanced editor options

#### `react-project/packages/cobi-react/src/pages/DataManagementDashboard/components/ExecuteDialog/DataSourceConfigDialogResultTabsRawJSONResponse.tsx`
- Applied vibrant color scheme
- Updated font family
- Enhanced editor options

#### `react-project/packages/cobi-react/src/components/DataMapper/ScriptEditor/ScriptEditorDialog.tsx`
- Applied Cyoda Dark theme for JavaScript editor
- Added syntax highlighting rules for JS
- Updated font with ligature support
- Enhanced cursor and scrolling animations

### 3. Prism.js Updates

#### `react-project/packages/statemachine-react/src/components/ConfigWorkflow.tsx`
- Switched from `prism-tomorrow.css` to custom `prism-cyoda-dark.css`
- Updated font family to match Monaco Editor
- Consistent styling with Monaco Editor theme

### 4. Global Styles

#### `react-project/apps/saas-app/src/App.scss`
- Updated code font family globally
- Enhanced Monaco Editor global styles
- Added active line number styling
- Improved cursor visibility

## Features

### Font Ligatures
The new theme uses fonts that support ligatures (Fira Code, JetBrains Mono, Cascadia Code), which render:
- `=>` as a single arrow character
- `!=` as a not-equal symbol
- `>=` and `<=` as proper comparison operators
- And many more programming ligatures

### Smooth Animations
- Smooth cursor blinking
- Smooth caret animation
- Smooth scrolling
- Better visual feedback

### Enhanced Readability
- Higher contrast colors
- Better color differentiation between token types
- Improved line highlighting
- Clear selection highlighting

## Testing

To see the changes:

1. **Workflow JSON Viewer**:
   - Navigate to Workflows → Select a workflow → Config tab
   - See vibrant Prism.js syntax highlighting

2. **Tableau Report Editor**:
   - Navigate to Tableau Reports → Edit a report → JSON tab
   - See vibrant Monaco Editor with new colors

3. **COBI Data Mapper**:
   - Navigate to COBI → Data Mapper → Script Editor
   - See JavaScript syntax highlighting with vibrant colors

4. **Source Configuration**:
   - Navigate to Source Configuration → Execute → Raw JSON
   - See JSON response with vibrant colors

## Browser Compatibility

The theme works in all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Font ligatures require font support:
- Fira Code: Best support
- JetBrains Mono: Excellent alternative
- Cascadia Code: Windows-optimized
- Falls back to Monaco/Menlo on systems without these fonts

## Performance

- No performance impact
- Font ligatures are GPU-accelerated
- Smooth animations use CSS transforms
- No layout thrashing

## Future Enhancements

Potential improvements:
- [ ] Add theme switcher (light/dark)
- [ ] Add custom color picker for users
- [ ] Add more language-specific syntax rules
- [ ] Add bracket pair colorization
- [ ] Add semantic highlighting

## References

Color inspiration from:
- VS Code Dark+ theme
- Dracula theme
- One Dark Pro theme
- Material Theme

Font choices:
- [Fira Code](https://github.com/tonsky/FiraCode)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- [Cascadia Code](https://github.com/microsoft/cascadia-code)

