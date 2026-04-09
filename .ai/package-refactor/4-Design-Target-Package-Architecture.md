# Actionable Step: Design Target Package Architecture

**Objective:** Define the target package structure with clear boundaries, unidirectional dependencies, and distinct feature scopes.

**Prerequisites:** Step 1 (Audit) and Step 3 (Documentation Audit) should be complete.

## Decision: Rename `tableau-react` to `@cyoda/reporting-react` — COMPLETED

The former `@cyoda/tableau-react` package has been renamed to `@cyoda/reporting-react`.
All Tableau Web Data Connector (WDC) code has been removed since the saas-app has no
Tableau integration. The package now contains only core reporting UI that talks to the
Cyoda reporting API.

## Action Items

### 1. Define the package layer hierarchy

```
Layer 0 (Foundation):
├── @cyoda/ui-lib-react      # Shared UI components, styles, utilities
└── @cyoda/http-api-react    # API clients, hooks, stores, types

Layer 1 (Features - depend only on Layer 0):
├── @cyoda/reporting-react          # Core reporting UI (NEW)
├── @cyoda/statemachine-react       # Workflow management
├── @cyoda/tasks-react              # Task management
├── @cyoda/processing-manager-react # Processing & monitoring
├── @cyoda/source-configuration-react  # Source config
├── @cyoda/cobi-react               # Data mapping
└── @cyoda/cyoda-sass-react         # SQL schema management

Apps (consume Layer 0 + Layer 1 packages):
├── @cyoda/saas-app                 # Uses reporting-react directly
```

### 2. What belongs in `@cyoda/reporting-react`

**Pages:**
- `Reports` (main reports page with History + Config tabs)
- `ReportConfigs` (report configuration list)
- `ReportEditor` (report definition editor)
- `ReportConfigsStream` (stream report configs)
- `ReportEditorStream` (stream report editor)
- `CatalogueOfAliases` (alias catalog)

**Components:**
- `HistoryTable` — report history list with expandable groups
- `HistoryFilter` — filter controls for report history
- `HistorySetting` — display settings (lazy loading, hide unknown)
- `ReportTableRows` — fetches and displays report data rows in a table
- `ReportTableGroup` — group-level report display
- `ReportResultDialog` — modal for group results
- `ReportDetailsDialog` — report details info dialog
- `QuickRunReport` — quick-run dropdown
- `ReportUISettings` — UI settings per report
- `ReportScheduling` — report scheduling
- `CreateReportDialog` — new report creation
- `CloneReportDialog` — clone report
- `ImportDialog` — import report definitions
- `ConfigEditorReportsFilter` — filter for report configs
- `ReportEditorTab*` — all report editor tab components (Columns, FilterBuilder, Grouping, Json, Sorting, Summary)
- `FilterBuilderQueryPlan`, `QueryPlanButton`, `QueryPlanDetail` — query plan UI
- `EntityDetailModal`, `EntityDetailTree`, `EntityDetailTreeItem` — entity detail views
- `EntityAudit`, `EntityDataLineage`, `EntityTransitions` — entity inspection
- `ColumnCollectionsDialog` — column detail viewer
- `ReportsNavigation` — reports navigation
- `StreamReportEditorTabRange` — stream report range tab
- `CatalogueAliasChangeStateDialog`, `CatalogueOfAliasesFilter` — alias catalog components

**Stores:**
- `reportsStore` — report state management

**Utils:**
- `HelperReportTable` — report table formatting utilities

**Types:**
- All reporting types (`ReportHistoryData`, `ConfigDefinition`, `TableDataRow`, `ReportingReportRows`, `TableColumn`, etc.)

### 3. What belongs in `@cyoda/ui-lib-react` (Layer 0 — already done)

- All shared UI components (buttons, forms, modals, tables, etc.)
- **Modelling components** (ModellingColDefs, ModellingRangeDefs, etc.) — already moved
- Shared styles and SCSS mixins
- Common utilities: formatters, validators, storage helpers
- Common hooks: useDebounce, etc.
- Common contexts: ErrorHandlerContext
- Test utilities: test-utils.tsx
- ResizableTitle, ErrorBoundary

### 5. What belongs in `@cyoda/http-api-react` (Layer 0)

- Axios configuration and interceptors
- API client functions (entities, auth, config, reports, audit)
- React Query hooks for data fetching
- Global stores (globalUiSettingsStore)
- API types and error handling utilities

### 6. Dependency rules

- Layer 0 packages have **no** internal `@cyoda` dependencies
- Layer 1 packages depend **only** on Layer 0
- **No cross-imports between Layer 1 packages**
- Apps (`saas-app`) depend on Layer 0 + Layer 1 only
- `processing-manager-react` must NOT depend on `reporting-react`
  (Modelling components are in `ui-lib-react`)

### 7. Migration path for `saas-app` — COMPLETED

1. ~~Renamed `tableau-react` to `reporting-react`~~
2. ~~Removed all Tableau WDC code from the package~~
3. ~~Updated `saas-app` to import from `@cyoda/reporting-react`~~
4. ~~Updated all routes from `/tableau/...` to `/reporting/...`~~
5. ~~Removed all references to `@cyoda/tableau-react`~~

## Acceptance Criteria

- [x] `@cyoda/reporting-react` package exists with all core reporting components
- [x] No Tableau WDC code exists anywhere in the codebase
- [x] `saas-app` imports from `@cyoda/reporting-react`
- [x] `saas-app` has no dependency on `@cyoda/tableau-react`
- [x] No cross-imports between Layer 1 packages
- [ ] All existing tests pass after migration
- [x] Layer hierarchy documented and enforced

