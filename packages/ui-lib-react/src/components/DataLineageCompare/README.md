# DataLineageCompare Component

## Critical Styling Notes

### Diff Highlighting in Light Theme

The diff highlighting in this component requires specific CSS overrides to work correctly in light theme.

**Problem:** Monaco Editor creates multiple layered background elements that obscure the diff highlighting colors in light theme.

**Solution:** All Monaco Editor background layers must be set to `transparent` in light theme to reveal the colored diff highlights underneath.

### Files Involved

1. **DataLineageCompare.scss** (lines 146-184)
   - Sets all Monaco Editor backgrounds to transparent in light theme
   - Critical selectors: `.view-lines`, `.view-line`, `.monaco-editor-background`, etc.
   - **DO NOT REMOVE** these transparent background styles!

2. **monacoTheme.ts** (lines 376-387)
   - Light theme uses same diff colors as dark theme
   - Colors: `#00D4AA` (teal) for insertions, `#EF4444` (red) for deletions
   - **DO NOT CHANGE** these colors without visual testing

### Testing

When making changes to this component or Monaco Editor themes:

1. **Visual Test in Both Themes:**
   - Open DataLineageCompare modal in light theme
   - Open DataLineageCompare modal in dark theme
   - Verify diff highlighting is visible in BOTH themes
   - Verify text is readable on top of highlights

2. **What to Check:**
   - ✅ Inserted lines show teal/cyan background
   - ✅ Deleted lines show red/pink background
   - ✅ Text is visible and readable
   - ✅ Line numbers are visible
   - ✅ No white/gray boxes covering the highlights

### Common Issues

**Issue:** Diff highlights not visible in light theme
- **Cause:** Monaco Editor backgrounds are not transparent
- **Fix:** Ensure all background styles in DataLineageCompare.scss are applied

**Issue:** Text not visible
- **Cause:** z-index issues or text color problems
- **Fix:** Check that `.view-lines` has higher z-index than `.view-overlays`

**Issue:** Different colors in light vs dark theme
- **Cause:** monacoTheme.ts has different colors for light theme
- **Fix:** Ensure light theme uses same diff colors as dark theme

