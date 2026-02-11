# Actionable Step: Audit Current Package Structure and Dependencies

**Objective:** Map the current package architecture, identify redundancies, duplications, and dependency relationships to establish a baseline for refactoring.

**Prerequisites:** None.

**Action Items:**

1. Generate a dependency graph showing how packages depend on each other:
   - `ui-lib-react` → no internal dependencies (foundation layer)
   - `http-api-react` → no internal dependencies (foundation layer)
   - `tableau-react` → depends on `ui-lib-react`, `http-api-react`
   - `statemachine-react` → depends on `ui-lib-react`, `http-api-react`
   - `processing-manager-react` → depends on `ui-lib-react`, `http-api-react`, `tableau-react`
   - `tasks-react` → no internal dependencies (standalone)
   - `source-configuration-react` → no internal dependencies (standalone)
   - `cobi-react` → no internal dependencies (standalone)
   - `cyoda-sass-react` → no internal dependencies (standalone)

2. Identify duplicated code patterns across packages:
   - `ResizableTitle` component exists in: `processing-manager-react`, `tasks-react`, `statemachine-react`
   - `ErrorBoundary` component exists in: `cobi-react`, `tasks-react`, `source-configuration-react`
   - `appStore` exists in: `cobi-react`, `cyoda-sass-react`, `processing-manager-react`
   - `globalUiSettingsStore` exists in: `http-api-react`, `statemachine-react`
   - `test-utils.tsx` exists in: `ui-lib-react`, `cobi-react`, `tableau-react`, `processing-manager-react`
   - Helper utilities duplicated across packages (formatters, storage helpers, etc.)

3. Analyze each package's scope and purpose:
   - `ui-lib-react`: Shared UI components (97+ components) - FOUNDATION
   - `http-api-react`: API layer, hooks, stores - FOUNDATION
   - `tableau-react`: Reporting/analytics feature
   - `statemachine-react`: Workflow/state machine feature
   - `processing-manager-react`: Processing/monitoring feature
   - `tasks-react`: Task management feature
   - `source-configuration-react`: Source config feature
   - `cobi-react`: Data mapping/chaining feature
   - `cyoda-sass-react`: SQL/Trino schema feature
   - `cli`: Command-line tooling

4. Document circular or unclear dependencies between packages.

5. List all exports from each package's `index.ts` to understand public API surface.

**Acceptance Criteria:**
- [ ] Dependency graph documented
- [ ] List of duplicated code identified with file paths
- [ ] Each package's scope clearly defined
- [ ] Problematic dependencies flagged
- [ ] Public API surface documented for each package

