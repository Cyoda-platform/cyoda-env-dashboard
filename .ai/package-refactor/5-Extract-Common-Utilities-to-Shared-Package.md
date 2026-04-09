# Actionable Step: Extract Common Utilities to Shared Package

**Objective:** Move duplicated code and misplaced components from feature packages into the common packages (`ui-lib-react` and `http-api-react`) to eliminate redundancy and fix dependency violations.

**Prerequisites:** Step 2 (Build Baseline) and Step 4 (Target Architecture) must be complete.

**Action Items:**

1. **CRITICAL: Move Modelling components from reporting-react to ui-lib-react**

   These components are general-purpose and should not be in a reporting-specific package:
   - `ModellingGroup`, `ModellingItem`, `ModellingGroupClass`, `ModellingItemClass`
   - `ModellingPopUp`, `ModellingPopUpToggles`, `ModellingPopUpSearch`
   - `ModellingColDefs`, `ModellingAliases`, `ModellingRangeDefs`
   - `ModellingPopUpAlias`, `ModellingPopUpAliasNew`
   - Associated types (`ColDef`, `ModellingPopUpRef`, etc.)

   Target location: `@cyoda/ui-lib-react/components/Modelling/`

2. Move duplicated components to `@cyoda/ui-lib-react`:
   - `ResizableTitle` from `processing-manager-react`, `tasks-react`, `statemachine-react`
   - `ErrorBoundary` from `cobi-react`, `tasks-react`, `source-configuration-react`
   - Any other duplicated UI components identified in audit

3. Move duplicated utilities to `@cyoda/ui-lib-react/utils`:
   - Storage helpers (compare implementations across packages)
   - Format helpers (date, number, string formatters)
   - Validation utilities

4. Move duplicated stores to `@cyoda/http-api-react/stores`:
   - Consolidate `globalUiSettingsStore` (exists in http-api-react and statemachine-react)
   - Consolidate `appStore` patterns if applicable

5. Consolidate test utilities:
   - Create single `test-utils.tsx` in `@cyoda/ui-lib-react`
   - Export common test helpers, mock providers, render utilities

6. Update exports in common packages:
   - Add Modelling exports to `ui-lib-react/src/index.ts`
   - Add new component exports to `ui-lib-react/src/index.ts`
   - Add new exports to `http-api-react/src/index.ts`
   - Ensure proper TypeScript types are exported

7. For each moved item:
   - Keep the original file temporarily (mark as deprecated)
   - Add re-export from original location pointing to new location
   - This allows gradual migration without breaking imports

**Acceptance Criteria:**
- [ ] Modelling components moved from reporting-react to ui-lib-react
- [ ] All duplicated components moved to ui-lib-react
- [ ] All duplicated utilities moved to appropriate common package
- [ ] All duplicated stores consolidated
- [ ] Test utilities consolidated
- [ ] Exports updated in common packages
- [ ] Build still passes after changes
- [ ] No functionality lost

