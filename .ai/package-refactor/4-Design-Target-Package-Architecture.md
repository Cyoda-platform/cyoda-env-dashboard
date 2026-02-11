# Actionable Step: Design Target Package Architecture

**Objective:** Define the target package structure with clear boundaries, unidirectional dependencies, and distinct feature scopes.

**Prerequisites:** Step 1 (Audit) and Step 3 (Documentation Audit) should be complete.

**Action Items:**

1. Define the package layer hierarchy:
   ```
   Layer 0 (Foundation):
   ├── @cyoda/ui-lib-react      # Shared UI components, styles, utilities
   └── @cyoda/http-api-react    # API clients, hooks, stores, types

   Layer 1 (Features - depend only on Layer 0):
   ├── @cyoda/tableau-react           # Tableau WDC integration ONLY
   ├── @cyoda/statemachine-react      # Workflow management
   ├── @cyoda/tasks-react             # Task management
   ├── @cyoda/processing-manager-react # Processing & monitoring
   ├── @cyoda/source-configuration-react  # Source config
   ├── @cyoda/cobi-react              # Data mapping
   └── @cyoda/cyoda-sass-react        # SQL schema management

   Apps (consume packages):
   └── @cyoda/saas-app
   ```

2. **CRITICAL: Fix tableau-react scope creep**

   The `tableau-react` package has drifted from its stated purpose:
   > "Tableau Web Data Connector integration for displaying Cyoda reports in Tableau dashboards"

   Currently it contains general-purpose components being misused by other packages:
   - `ModellingRangeDefs`, `ModellingColDefs` - used by `processing-manager-react`
   - `ModellingGroup`, `ModellingItem`, `ModellingPopUp` - general modelling UI
   - Report configuration components that are not Tableau-specific

   **Resolution options (choose one):**

   **Option A: Move general components to ui-lib-react**
   - Move `Modelling*` components to `@cyoda/ui-lib-react/components/Modelling`
   - Move report configuration components to `@cyoda/ui-lib-react`
   - Keep only Tableau WDC-specific code in `tableau-react`
   - `tableau-react` becomes a thin integration layer

   **Option B: Rename and repurpose tableau-react**
   - Rename to `@cyoda/reports-react` to reflect actual usage
   - Accept it as the reporting/analytics feature package
   - Remove `processing-manager-react` dependency on it by moving shared components to ui-lib-react

3. Define what belongs in `@cyoda/ui-lib-react` (common package):
   - All shared UI components (buttons, forms, modals, tables, etc.)
   - **Modelling components** (ModellingColDefs, ModellingRangeDefs, etc.)
   - Shared styles and SCSS mixins
   - Common utilities: formatters, validators, storage helpers
   - Common hooks: useDebounce, etc.
   - Common contexts: ErrorHandlerContext
   - Test utilities: test-utils.tsx
   - Components to move here: ResizableTitle, ErrorBoundary

4. Define what belongs in `@cyoda/http-api-react`:
   - Axios configuration and interceptors
   - API client functions (entities, auth, config, reports, audit)
   - React Query hooks for data fetching
   - Global stores (globalUiSettingsStore)
   - API types and error handling utilities

5. Define clear boundaries for each feature package:
   - Each feature package exports: pages, routes, feature-specific components
   - Each feature package imports **only from Layer 0**
   - **No cross-feature imports between Layer 1 packages**
   - `processing-manager-react` must NOT depend on `tableau-react`

6. Document the public API contract for each package.

**Acceptance Criteria:**
- [ ] Layer hierarchy documented and agreed
- [ ] Decision made on tableau-react scope (Option A or B)
- [ ] Modelling components moved to appropriate location
- [ ] `processing-manager-react` no longer depends on `tableau-react`
- [ ] Contents of common packages defined
- [ ] Each feature package scope clearly bounded
- [ ] Dependency rules documented (what can import what)
- [ ] Public API contracts defined for each package

