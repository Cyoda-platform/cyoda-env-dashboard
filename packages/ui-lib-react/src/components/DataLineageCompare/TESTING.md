# DataLineageCompare Testing Checklist

## Manual Visual Testing

Before merging any changes to DataLineageCompare, CodeEditor, or Monaco themes, complete this checklist:

### Setup
1. Start the dev server: `npm run dev`
2. Navigate to a page with DataLineageCompare (e.g., Entity Data Lineage)
3. Select two transactions to compare
4. Open the Compare modal

### Light Theme Testing
1. Switch to light theme (if not already)
2. Open Compare modal
3. Verify:
   - [ ] Inserted lines have **teal/cyan background** (`#00D4AA`)
   - [ ] Deleted lines have **red/pink background** (`#EF4444`)
   - [ ] Text is **clearly visible** on top of highlights
   - [ ] Line numbers are visible
   - [ ] No white or gray boxes covering the highlights
   - [ ] Background is white, not gray
   - [ ] Diff highlights are visible immediately (not only when resizing)

### Dark Theme Testing
1. Switch to dark theme
2. Open Compare modal
3. Verify:
   - [ ] Inserted lines have **teal/cyan background** (`#00D4AA`)
   - [ ] Deleted lines have **red/pink background** (`#EF4444`)
   - [ ] Text is **clearly visible** on top of highlights
   - [ ] Line numbers are visible
   - [ ] Background is dark (`#1A2332`)
   - [ ] Diff highlights are visible

### Cross-Theme Consistency
1. Compare light and dark theme side by side
2. Verify:
   - [ ] Diff highlight colors are **identical** in both themes
   - [ ] Text readability is good in both themes
   - [ ] No visual regressions in either theme

### Edge Cases
1. Test with large diffs (many changes)
2. Test with small diffs (1-2 changes)
3. Test with no changes (identical content)
4. Resize the modal window
5. Verify:
   - [ ] Highlights remain visible during resize
   - [ ] No layout issues
   - [ ] Scrolling works correctly

## Automated Testing (Future)

Consider adding:
- Visual regression tests with Playwright or Chromatic
- Screenshot comparison tests
- E2E tests that verify diff highlighting is present

## Files to Watch

If any of these files are modified, run the full checklist:
- `packages/ui-lib-react/src/components/DataLineageCompare/DataLineageCompare.scss`
- `packages/ui-lib-react/src/components/DataLineageCompare/DataLineageCompare.tsx`
- `packages/ui-lib-react/src/components/CodeEditor/monacoTheme.ts`
- `packages/ui-lib-react/src/components/CodeEditor/CodeEditor.tsx`
- `packages/ui-lib-react/src/components/CodeEditor/CodeEditor.scss`

## Known Issues

None currently. If you discover an issue, document it here.

