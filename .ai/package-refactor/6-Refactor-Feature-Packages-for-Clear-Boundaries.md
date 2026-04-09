# Actionable Step: Refactor Feature Packages for Clear Boundaries

**Objective:** Update feature packages to import from common packages instead of duplicating code, eliminate cross-feature dependencies, and ensure clear unidirectional dependencies.

**Prerequisites:** Step 5 (Extract Common Utilities) must be complete.

**Action Items:**

1. **COMPLETED: Renamed `tableau-react` to `reporting-react` and removed all Tableau WDC code**
   - `@cyoda/tableau-react` has been renamed to `@cyoda/reporting-react`
   - All Tableau WDC code (`window.tableau.submit()`, `chartsDataStore`, Tableau types) removed
   - `reporting-react` depends only on Layer 0: `@cyoda/ui-lib-react`, `@cyoda/http-api-react`

2. **Update `@cyoda/processing-manager-react` to use `@cyoda/ui-lib-react`**
   - Change imports from `@cyoda/reporting-react` to `@cyoda/ui-lib-react` for Modelling components:
     ```typescript
     // After (CORRECT - imports from foundation layer)
     import { ModellingRangeDefs, ModellingColDefs } from '@cyoda/ui-lib-react';
     import type { ColDef } from '@cyoda/ui-lib-react';
     ```
   - Remove `@cyoda/reporting-react` from package.json dependencies
   - Import `ResizableTitle` from `@cyoda/ui-lib-react`
   - Remove local duplicates

3. Update `@cyoda/statemachine-react`:
   - Import `ResizableTitle` from `@cyoda/ui-lib-react`
   - Import `globalUiSettingsStore` from `@cyoda/http-api-react`
   - Remove local duplicates
   - Verify dependency direction (only Layer 0)

4. Update `@cyoda/tasks-react`:
   - Import `ResizableTitle` from `@cyoda/ui-lib-react`
   - Import `ErrorBoundary` from `@cyoda/ui-lib-react`
   - Remove local duplicates

5. Update `@cyoda/source-configuration-react`:
   - Import `ErrorBoundary` from `@cyoda/ui-lib-react`
   - Remove local duplicate

6. Update `@cyoda/cobi-react`:
   - Import `ErrorBoundary` from `@cyoda/ui-lib-react`
   - Remove local duplicate

7. Update `@cyoda/cyoda-sass-react`:
   - Verify dependencies align with Layer 1 rules

8. Clean up deprecated re-exports from Step 5 once all imports updated.

9. Run tests for each package after updating to catch regressions.

10. Validate no cross-feature dependencies remain:
    ```bash
    # Check for any remaining cross-feature imports
    grep -r "@cyoda/reporting-react" packages/processing-manager-react/src
    grep -r "@cyoda/statemachine-react" packages/reporting-react/src
    # etc. - no Layer 1 package should import another Layer 1 package
    ```

**Acceptance Criteria:**
- [ ] `processing-manager-react` no longer depends on `reporting-react`
- [ ] Each feature package imports shared code from common packages only
- [ ] No duplicated code remains in feature packages
- [ ] No cross-feature dependencies (Layer 1 packages don't import each other)
- [ ] Dependency direction is unidirectional (features only import from Layer 0)
- [ ] All package tests pass
- [ ] No circular dependencies

