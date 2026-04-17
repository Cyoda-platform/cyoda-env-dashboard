# saas-app test script wiring

**Date:** 2026-04-17
**Related:** GitHub issue #7 (item 1 of 3)

## Problem

`apps/saas-app/package.json` has no `test` or `test:run` script and does not declare `vitest` as a devDependency. Any plan instruction of the form

```
pnpm --filter @cyoda/saas-app test:run
pnpm --filter @cyoda/saas-app exec vitest run <path>
```

therefore fails. The repo's actual Vitest setup is at the root (`vitest.config.ts` + `vitest.setup.ts`), and most workspace packages delegate to it via a `cd ../.. && vitest run ...` script. `apps/saas-app` is the only place where this delegation was never added.

One test file currently exists under `apps/saas-app`: `src/components/__tests__/LeftSideMenu.test.tsx`.

## Non-goals

- Changing root vitest config.
- Adding a local `apps/saas-app/vitest.config.ts` or local `vitest` devDep. A second config drifts from the root one; the root config is the single source of truth for jsdom env, package aliases, and monaco mocks.
- Fixing bare-`vitest` usage in `cobi-react` / `cyoda-sass-react` (legacy, slated for deletion).
- `source-configuration-react` — self-contained, not broken.
- Issue #7 items 2 (660 pre-existing TS errors) and 3 (ESLint v9 flat-config migration). Separate branches.

## Design

Add two scripts to `apps/saas-app/package.json`:

```json
"test": "cd ../.. && vitest apps/saas-app",
"test:run": "cd ../.. && vitest run apps/saas-app"
```

### Why this shape

- `cd ../..` runs vitest from the repo root so the root `vitest.config.ts` is picked up (jsdom, package aliases, monaco mocks).
- Path-scoping to `apps/saas-app` means `pnpm --filter @cyoda/saas-app test:run` runs only saas-app tests, not the whole monorepo.
- Extra arguments appended by pnpm work naturally for targeting a specific file, e.g. `pnpm --filter @cyoda/saas-app test:run apps/saas-app/src/components/__tests__/LeftSideMenu.test.tsx`.
- Matches the pattern already used by `ui-lib-react`, `tasks-react`, `statemachine-react`, `reporting-react`, `http-api-react`.

### Why not add a local vitest devDep

Consistency with the delegating packages above, and avoids maintaining a second set of aliases/mocks that can drift from the root.

## Verification

From the repo root:

1. `pnpm --filter @cyoda/saas-app test:run` exits 0 and reports `LeftSideMenu.test.tsx` among the files run.
2. `pnpm --filter @cyoda/saas-app test:run apps/saas-app/src/components/__tests__/LeftSideMenu.test.tsx` runs only that file.
3. `pnpm test:run` from the root still runs the full suite and still exits 0 (no regression).

## Rollout

Single commit on a fix branch, PR against `main`, no migration.
