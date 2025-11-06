# Duplicate Files Analysis

## Summary
Found 2 pairs of duplicate files that are NOT being used in the application routes.

## Duplicate Files to Remove

### 1. StreamReports.tsx (DUPLICATE - NOT USED)
- **File:** `src/pages/StreamReports.tsx`
- **Status:** ❌ NOT used in routes
- **Duplicate of:** `ReportConfigsStream.tsx` (which IS used)
- **Both migrated from:** `.old_project/packages/http-api/src/views/ConfigEditor/ConfigEditorReportsStream.vue`
- **Action:** DELETE `StreamReports.tsx`

### 2. StreamReportEditor.tsx (DUPLICATE - NOT USED)
- **File:** `src/pages/StreamReportEditor.tsx`
- **Status:** ❌ NOT used in routes
- **Duplicate of:** `ReportEditorStream.tsx` (which IS used)
- **Both migrated from:** `.old_project/packages/http-api/src/views/ConfigEditorStream.vue`
- **Action:** DELETE `StreamReportEditor.tsx`

## Files Currently Used in Routes

### Active Pages (Keep These)
1. ✅ `Reports.tsx` - Reports history page
2. ✅ `ReportConfigs.tsx` - Distributed reports list (NOT VISIBLE IN CURRENT ROUTES - need to add)
3. ✅ `ReportConfigsStream.tsx` - Stream reports list
4. ✅ `ReportEditor.tsx` - Distributed report editor
5. ✅ `ReportEditorStream.tsx` - Stream report editor
6. ✅ `CatalogueOfAliases.tsx` - Catalogue of aliases

### Unused Pages (Remove These)
1. ❌ `StreamReports.tsx` - Duplicate of ReportConfigsStream.tsx
2. ❌ `StreamReportEditor.tsx` - Duplicate of ReportEditorStream.tsx

## Current Routes (from src/routes/index.tsx)
```typescript
/                                    → Reports
/login                               → Login
/tableau/login                       → Login
/tableau/reports                     → Reports (Main page with tabs)
/tableau/reports/stream              → ReportConfigsStream (Stream reports list)
/tableau/report-editor/:id           → ReportEditor (Distributed report editor)
/tableau/reports/stream/:id          → ReportEditorStream (Stream report editor)
/tableau/catalogue-of-aliases        → CatalogueOfAliases
```

## Missing Route
The `ReportConfigs.tsx` page exists but is NOT in the routes. This page should show the list of distributed reports.

**Recommended action:** Add route for ReportConfigs.tsx or verify if it's accessed via tabs in Reports.tsx

## Verification Steps

1. Check if `StreamReports.tsx` is imported anywhere:
   ```bash
   grep -r "StreamReports" react-project/packages/tableau-react/src --include="*.tsx" --include="*.ts"
   ```

2. Check if `StreamReportEditor.tsx` is imported anywhere:
   ```bash
   grep -r "StreamReportEditor" react-project/packages/tableau-react/src --include="*.tsx" --include="*.ts"
   ```

3. If only found in their own files, safe to delete.

## Recommended Actions

1. **DELETE** `src/pages/StreamReports.tsx` and `src/pages/StreamReports.scss`
2. **DELETE** `src/pages/StreamReportEditor.tsx` and `src/pages/StreamReportEditor.scss`
3. **VERIFY** that `ReportConfigs.tsx` is accessible (either via route or tabs)
4. **UPDATE** `src/pages/index.ts` to remove exports of deleted files

## Extra Components to Verify

These components exist in React but need verification if they're actually used:

1. **EntityAudit.tsx** - Entity audit trail viewer
2. **EntityDataLineage.tsx** - Data lineage visualization  
3. **EntityDetailModal.tsx** - Entity details modal

**Action needed:** Search codebase to see if these are imported/used anywhere. If not, consider removing.

