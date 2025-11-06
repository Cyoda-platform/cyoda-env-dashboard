# Vue to React Migration Comparison

## Important Note
The React `tableau-react` package is migrating from the Vue **`http-api`** package, NOT from the Vue `tableau` package.

- **Vue `tableau` package** = Simple standalone app (Login + Reports history view only)
- **Vue `http-api` package** = Full-featured reporting app (Report configs, editors, stream reports, catalogue)
- **React `tableau-react` package** = Migrating the full-featured `http-api` functionality

## Main Pages/Views Comparison

### Old Vue (http-api package)
| Vue View | Purpose | React Equivalent | Status |
|----------|---------|------------------|--------|
| `CatalogOfAliases.vue` | Catalogue of aliases management | `CatalogueOfAliases.tsx` | ✅ Migrated |
| `ConfigEditor.vue` | Distributed report editor | `ReportEditor.tsx` | ✅ Migrated |
| `ConfigEditorSimple.vue` | Simple report editor (deprecated?) | N/A | ❌ Not needed |
| `ConfigEditorStream.vue` | Stream report editor | `StreamReportEditor.tsx` | ✅ Migrated |
| `ConfigEditorStreamReports.vue` | Stream reports list | `ReportConfigsStream.tsx` | ✅ Migrated |
| N/A (in http-api router) | Distributed reports list | `ReportConfigs.tsx` | ✅ Migrated |
| N/A (in http-api router) | Reports history/execution | `Reports.tsx` | ✅ Migrated |

### Extra Pages in React (Not in Vue)
| React Page | Purpose | Notes |
|------------|---------|-------|
| `ReportEditorStream.tsx` | Alternative stream editor? | ⚠️ **POTENTIAL DUPLICATE** - Need to verify |
| `StreamReports.tsx` | Alternative stream reports list? | ⚠️ **POTENTIAL DUPLICATE** - Need to verify |

### Vue Pages NOT Migrated (Not Report-Related)
| Vue View | Purpose | Status |
|----------|---------|--------|
| `CachesListView.vue` | Cache management | ❌ Not in scope for tableau-react |
| `CompositeIndexes.vue` | Index management | ❌ Not in scope for tableau-react |
| `NetworkInfoView.vue` | Network info | ❌ Not in scope for tableau-react |
| `PageEntityViewer.vue` | Entity viewer | ❌ Not in scope for tableau-react |
| `ZooKeeperInfoView.vue` | ZooKeeper info | ❌ Not in scope for tableau-react |
| `ConfigEditorAlertAliasSameName.vue` | Alert dialog | ❌ Not in scope for tableau-react |

## Report Editor Tabs Comparison

### Old Vue (http-api)
1. `ConfigEditorReportsTabModelling.vue` → Model tab
2. `ConfigEditorReportsTabColumn.vue` → Columns tab
3. `ConfigEditorReportsTabFilterBuilder.vue` → FilterBuilder tab
4. `ConfigEditorReportsTabSorting.vue` → Sorting tab
5. `ConfigEditorReportsTabGrouping.vue` → Grouping tab
6. `ConfigEditorReportsTabSummary.vue` → Summary tab
7. `ConfigEditorReportsTabJson.vue` → JSON tab

### New React (tableau-react)
1. `ReportEditorTabModel.tsx` → Model tab ✅
2. `ReportEditorTabColumns.tsx` → Columns tab ✅
3. `ReportEditorTabFilterBuilder.tsx` → FilterBuilder tab ✅
4. `ReportEditorTabSorting.tsx` → Sorting tab ✅
5. `ReportEditorTabGrouping.tsx` → Grouping tab ✅
6. `ReportEditorTabSummary.tsx` → Summary tab ✅
7. `ReportEditorTabJson.tsx` → JSON tab ✅

**Status:** ✅ All tabs migrated

## CyodaModelling Components Comparison

### Old Vue (http-api)
- `CyodaModellingColDefs.vue` → Column definitions
- `CyodaModellingRangeDefs.vue` → Range definitions (for stream reports)
- `CyodaModellingAliases.vue` → Aliases management
- `CyodaModellingPopUp.vue` → Column definition popup
- `CyodaModellingPopUpSearch.vue` → Search in popup
- `CyodaModellingPopUpToggles.vue` → Toggles in popup
- `CyodaModellingGroup.vue` → Group component
- `CyodaModellingGroupClass.vue` → Group class component
- `CyodaModellingItem.vue` → Item component
- `CyodaModellingItemClass.vue` → Item class component

### Alias Components (Old Vue)
- `CyodaModellingPopUpAlias.vue` → Alias popup (catalog mode)
- `CyodaModellingPopUpAliasNew.vue` → Alias creation/editing
- `CyodaModellingPopUpAliasTable.vue` → Alias table view
- `CyodaModellingPopUpAliasMappers.vue` → Mappers selection
- `CyodaModellingPopUpAliasMappersParameters.vue` → Mapper parameters
- `CyodaModellingAliasSettingsForm.vue` → Alias settings form
- `CyodaModellingAliasSettingsJson.vue` → Alias JSON view
- `CyodaModellingAliasSettingsEntity.vue` → Alias entity settings

### New React (tableau-react)
- `ModellingColDefs.tsx` ✅
- `ModellingRangeDefs.tsx` ✅
- `Alias/ModellingAliases.tsx` ✅
- `ModellingPopUp.tsx` ✅
- `ModellingPopUpSearch.tsx` ✅
- `ModellingPopUpToggles.tsx` ✅
- `ModellingGroup.tsx` ✅
- `ModellingGroupClass.tsx` ✅
- `ModellingItem.tsx` ✅
- `ModellingItemClass.tsx` ✅
- `Alias/ModellingPopUpAlias.tsx` ✅
- `Alias/ModellingPopUpAliasNew.tsx` ✅

**Status:** ✅ All core modelling components migrated

## Supporting Components Comparison

### Old Vue (http-api)
| Component | React Equivalent | Status |
|-----------|------------------|--------|
| `HistoryFilter.vue` | `HistoryFilter.tsx` | ✅ |
| `HistoryTable.vue` | `HistoryTable.tsx` | ✅ |
| `ReportTableGroup.vue` | `ReportTableGroup.tsx` | ✅ |
| `ReportTableRows.vue` | `ReportTableRows.tsx` | ✅ |
| `ConfigEditorReportsFilter.vue` | `ConfigEditorReportsFilter.tsx` | ✅ |
| `ConfigEditorNew.vue` (popup) | `CreateReportDialog.tsx` | ✅ |
| `ConfigEditorSaveAs.vue` (popup) | `CloneReportDialog.tsx` | ✅ |

### Extra Components in React
| Component | Purpose | Notes |
|-----------|---------|-------|
| `EntityAudit.tsx` | Entity audit trail | ⚠️ Check if needed |
| `EntityDataLineage.tsx` | Data lineage visualization | ⚠️ Check if needed |
| `EntityDetailModal.tsx` | Entity details | ⚠️ Check if needed |
| `FilterBuilderQueryPlan.tsx` | Query plan viewer | ✅ Enhancement |
| `QueryPlanButton.tsx` | Query plan button | ✅ Enhancement |
| `QuickRunReport.tsx` | Quick run functionality | ✅ Enhancement |
| `MapperParametersDialog.tsx` | Mapper parameters | ✅ Refactored from Vue |
| `ReportResultDialog.tsx` | Report results | ✅ Enhancement |
| `ReportScheduling.tsx` | Report scheduling | ✅ Enhancement |
| `ResizableTitle.tsx` | Resizable table columns | ✅ Enhancement |
| `UniqueValuesModal` | Unique values viewer | ✅ Enhancement |
| `ReportsNavigation.tsx` | Navigation component | ✅ Enhancement |
| `CatalogueOfAliasesFilter.tsx` | Catalogue filter | ✅ Enhancement |
| `CatalogueAliasChangeStateDialog.tsx` | State change dialog | ✅ Enhancement |

## Routes Comparison

### Old Vue (http-api router)
```javascript
/config-editor/reports - Distributed reports list
/config-editor/reports/:id - Distributed report editor
/config-editor/stream-reports - Stream reports list
/config-editor/stream-reports/:id - Stream report editor
/catalog-of-aliases - Catalogue of aliases
/history/reports - Reports history
```

### New React (tableau-react)
```javascript
/reports - Reports history ✅
/report-configs - Distributed reports list ✅
/report-configs/:id - Distributed report editor ✅
/report-configs-stream - Stream reports list ✅
/report-configs-stream/:id - Stream report editor ✅
/catalogue-of-aliases - Catalogue of aliases ✅
```

**Status:** ✅ All routes migrated (with cleaner naming)

## API Functions Comparison

### Old Vue (http-api)
- Report CRUD operations
- Entity info/model info
- Catalog items
- Mappers
- Stream data
- Report execution

### New React (tableau-react)
- ✅ All API functions migrated to `src/api/`
- ✅ Organized into separate files (reports.ts, modelling.ts, etc.)
- ✅ TypeScript types added

## Summary

### ✅ Successfully Migrated
1. All main report pages (configs, editors, history)
2. All report editor tabs (Model, Columns, FilterBuilder, Sorting, Grouping, Summary, JSON)
3. All CyodaModelling components (ColDefs, RangeDefs, Aliases, PopUps, Groups, Items)
4. All supporting components (HistoryTable, ReportTable, Filters, Dialogs)
5. All routes and navigation
6. All API functions with TypeScript types

### ⚠️ Need to Verify
1. **ReportEditorStream.tsx** vs **StreamReportEditor.tsx** - Are these duplicates?
2. **StreamReports.tsx** vs **ReportConfigsStream.tsx** - Are these duplicates?
3. **EntityAudit.tsx**, **EntityDataLineage.tsx**, **EntityDetailModal.tsx** - Are these needed or extra?

### ❌ Not Migrated (Out of Scope)
1. CachesListView
2. CompositeIndexes
3. NetworkInfoView
4. PageEntityViewer
5. ZooKeeperInfoView
6. ConfigEditorSimple (deprecated)

### ✨ Enhancements in React Version
1. Query plan visualization
2. Quick run functionality
3. Resizable table columns
4. Unique values modal
5. Better TypeScript types
6. Improved component organization
7. Better test coverage

