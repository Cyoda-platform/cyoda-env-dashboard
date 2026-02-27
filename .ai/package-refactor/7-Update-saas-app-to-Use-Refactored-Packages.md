# Actionable Step: Update saas-app to Use Refactored Packages

**Objective:** Adjust the saas-app to work with the refactored package structure, ensuring no regression in functionality.

**Prerequisites:** Steps 5–6 (Extract Common Utilities / Refactor Feature Packages) are complete. The deduplication of `ResizableTitle`, `ErrorBoundary`, `globalUiSettingsStore`, and test utilities into Layer 0 is done.

## Current State

The saas-app already uses workspace package references correctly in `apps/saas-app/package.json`. Most imports use the public API (`@cyoda/ui-lib-react`, `@cyoda/http-api-react`), but there are two categories of issues to address.

## Action Items

### 1. Replace local ErrorBoundary with shared version

`apps/saas-app/src/components/ErrorBoundary.tsx` is a local copy. The canonical `ErrorBoundary` now lives in `@cyoda/ui-lib-react`.

- Delete `apps/saas-app/src/components/ErrorBoundary.tsx`
- Update `apps/saas-app/src/App.tsx` to import from `@cyoda/ui-lib-react`:
  ```ts
  import { ErrorBoundary } from '@cyoda/ui-lib-react';
  ```

### 2. Replace deep sub-path imports with public API imports

Several files import from internal sub-paths of `@cyoda/http-api-react`. These should use the public barrel export instead:

| File | Current Import | Replacement |
|------|---------------|-------------|
| `src/providers/authProvider.ts` | `@cyoda/http-api-react/utils/storage` | `@cyoda/http-api-react` |
| `src/providers/dataProvider.ts` | `@cyoda/http-api-react/utils/storage` | `@cyoda/http-api-react` |
| `src/utils/auth0TokenManager.ts` | `@cyoda/http-api-react/utils/storage` | `@cyoda/http-api-react` |
| `src/components/Auth0TokenInitializer.tsx` | `@cyoda/http-api-react/utils/storage` | `@cyoda/http-api-react` |
| `src/components/AppLayout.tsx` | `@cyoda/http-api-react/utils/storage` | `@cyoda/http-api-react` |
| `src/components/LeftSideMenu.tsx` | `@cyoda/http-api-react/utils/storage` | `@cyoda/http-api-react` |
| `src/pages/Login.tsx` | `@cyoda/http-api-react/utils/storage` and `@cyoda/http-api-react/api/auth` | `@cyoda/http-api-react` |

All of these symbols (`HelperStorage`, auth API functions) are already exported from `@cyoda/http-api-react`'s public barrel.

For `Login.tsx`, the namespace import `import * as authApi from '@cyoda/http-api-react/api/auth'` needs to be converted to named imports (e.g., `import { login, logout, ... } from '@cyoda/http-api-react'`), or a namespace re-export needs to be added to `http-api-react`.

### 3. Verify package.json dependencies

`apps/saas-app/package.json` workspace references are already correct:
- `@cyoda/http-api-react: workspace:*`
- `@cyoda/ui-lib-react: workspace:*`
- `@cyoda/statemachine-react: workspace:*`
- `@cyoda/processing-manager-react: workspace:*`
- `@cyoda/tasks-react: workspace:*`
- `@cyoda/tableau-react: workspace:*`
- `@cyoda/cyoda-sass-react: workspace:*`

No changes needed here.

### 4. Build and verify

```bash
# Type-check
cd apps/saas-app && npx tsc --noEmit

# Dev server
yarn dev:saas

# Production build
yarn build:saas
```

### 5. Smoke-test each integrated feature

- Tableau/Reports functionality
- State Machine/Workflows functionality
- Processing Manager functionality
- Tasks functionality
- Source Configuration functionality

## Acceptance Criteria

- [ ] Local `ErrorBoundary.tsx` deleted, import switched to `@cyoda/ui-lib-react`
- [ ] All deep sub-path imports (`@cyoda/http-api-react/utils/storage`, `@cyoda/http-api-react/api/auth`) replaced with public API imports
- [ ] `npx tsc --noEmit` passes with no new errors
- [ ] `yarn dev:saas` runs without errors
- [ ] `yarn build:saas` completes successfully
- [ ] All features accessible and functional in the app

