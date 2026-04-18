# ESLint v9 flat-config baseline

**Date:** 2026-04-17
**Related:** GitHub issue #7 (item 3 of 3). Item 1 shipped in PR #14. Item 2 (660 `tsc --noEmit` errors) is a separate follow-up, and type-aware lint rules are slated to be layered on as part of that item, not here.

## Problem

`pnpm lint` fails on every package. ESLint 9.39.x is hoisted at the root, but no `eslint.config.*` exists anywhere in the active workspace. (The issue originally claimed the repo "still uses legacy `.eslintrc.*` files." It does not — there is no ESLint config of any kind outside `.old_project/`.) Seven packages carry a `lint` script that invokes `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`; the `--ext` flag is removed in ESLint v9 (flat config uses `files` globs), and there is no config for ESLint to read.

Five packages declare eslint + plugin devDeps (`http-api-react`, `source-configuration-react`, `statemachine-react`, `tasks-react`, `ui-lib-react`). Two packages have the `lint` script but no eslint devDeps (`cobi-react`, `cyoda-sass-react` — both legacy). Three packages have neither (`cli`, `processing-manager-react`, `apps/saas-app`). Net: ESLint was never actually wired up in this monorepo.

## Goal

Establish a single root ESLint v9 flat-config baseline so that `pnpm lint` can serve as a cheap structural gate across all non-legacy React/TS packages. Minimal rule surface only — no type-aware rules.

## Scope

In-scope packages (to be linted):

- `packages/http-api-react`
- `packages/ui-lib-react`
- `packages/tasks-react`
- `packages/statemachine-react`
- `packages/reporting-react`
- `packages/source-configuration-react`
- `packages/processing-manager-react` (actively consumed by `apps/saas-app`)
- `apps/saas-app`

Out of scope (ignored):

- `.old_project/**` — pre-React rewrite legacy dump.
- `packages/cobi-react`, `packages/cyoda-sass-react` — legacy React packages, slated for deletion.
- `packages/cli` — Node ESM CLI with no TS source; different tooling shape, not worth a separate rule block in the first pass.
- Build artifacts and generated files (see Ignores section).

## Design

### Architecture

Single root `eslint.config.js`. All ESLint and plugin devDeps consolidated at the root. Per-package `lint` scripts and per-package eslint devDeps removed. Root `pnpm lint` invokes `eslint .` once over the whole tree; flat-config `files` globs target the in-scope packages.

### File layout changes

```
eslint.config.js                # new, root
package.json                    # +devDeps, +lint scripts
packages/http-api-react/package.json           # remove lint script + eslint devDeps
packages/ui-lib-react/package.json             # ditto
packages/tasks-react/package.json              # ditto
packages/statemachine-react/package.json       # ditto
packages/source-configuration-react/package.json # ditto
packages/reporting-react/package.json          # remove lint script (no eslint devDeps to remove)
packages/cobi-react/package.json               # remove lint script (no eslint devDeps to remove)
packages/cyoda-sass-react/package.json         # ditto
```

Note: `cobi-react` and `cyoda-sass-react` have their lint scripts removed for consistency (they currently fail with the same flat-config error), even though the packages themselves are excluded from linting.

### Root devDeps to add

- `eslint@^9` (pin the 9.x line at the root; currently hoisted transitively)
- `@eslint/js`
- `typescript-eslint` (the v8 unified package; replaces the separate `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`)
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`

Root devDeps to remove: none (nothing eslint-related currently declared at root).

Per-package devDeps to remove: `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` — wherever declared.

### Config shape

```js
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      '.old_project/**',
      'packages/cobi-react/**',
      'packages/cyoda-sass-react/**',
      'packages/cli/**',
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/.playwright-mcp/**',
      '**/.vite/**',
      '**/vite-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [
      'packages/http-api-react/**/*.{ts,tsx}',
      'packages/ui-lib-react/**/*.{ts,tsx}',
      'packages/tasks-react/**/*.{ts,tsx}',
      'packages/statemachine-react/**/*.{ts,tsx}',
      'packages/reporting-react/**/*.{ts,tsx}',
      'packages/source-configuration-react/**/*.{ts,tsx}',
      'packages/processing-manager-react/**/*.{ts,tsx}',
      'apps/saas-app/**/*.{ts,tsx}',
    ],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

Rationale: no type-aware rules (no `parserOptions.project` wiring) — those are deferred to item 2 because they require clean types to be usable. The rule surface matches what the per-package devDeps were clearly intended for (`typescript-eslint` + `react-hooks` + `react-refresh`), just never wired up.

### Rule overrides applied during first-pass triage

The first `pnpm lint` run surfaced 3725 findings. Four rules dominated (>95% of findings) and were adjusted at the config level because they were either mismatched to a TypeScript codebase or belong with a separate cleanup project:

- `no-undef` → `off`. ESLint's `no-undef` doesn't understand TypeScript types and flags globals that the TS compiler already validates correctly. Industry-standard fix for TS projects.
- `@typescript-eslint/no-explicit-any` → `warn`. 2163 occurrences. Each one is a type-quality issue, which is the scope of issue #7 item 2 (type-check cleanup). Surfacing as warnings keeps the signal without blocking this gate.
- `@typescript-eslint/no-unused-vars` → `warn` with `argsIgnorePattern: '^_'` and `varsIgnorePattern: '^_'`. Industry-standard intentionally-unused convention. Downgraded to warn because 457 occurrences make an immediate fix-all outsized for this PR.
- `react-hooks/exhaustive-deps` → `warn`. Frequent false positives around stable refs and initialization effects; warning is standard React practice.

Additional ignore entries added to keep ESLint focused on TypeScript product code:
- `**/*.{js,mjs,cjs,jsx}` — non-TS files (vendor scripts like `public/tableau.js`, Node helpers like `test-data/mock-server.mjs`) are not in scope for this lint pass.
- Root-level test/build infra: `playwright.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `vitest.monaco-mock.ts`, `vitest.worker-mock.ts`.

### Root scripts

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

Replaces the current `"lint": "pnpm -r --if-present run lint"` at the root.

## Verification / acceptance

1. `pnpm lint` from the repo root resolves the flat config and processes only the in-scope file globs (no findings from `.old_project`, legacy packages, `dist/`, etc.).
2. Any findings surfaced on the first run are triaged into one of:
   - Small obvious fixes applied directly in-scope.
   - Rules disabled globally or narrowed in scope when the rule is genuinely wrong for this codebase.
   - Per-file or per-line `eslint-disable-next-line` with a justification comment when the violation is intentional.
3. `pnpm lint` exits 0 on a clean tree.
4. `pnpm test:run`, `pnpm type-check`, and the existing build scripts still behave the same (no regressions from the devDep consolidation).

**Caveat on (2):** the size of the first-run findings list is not predictable upfront. This spec commits to "green after the first pass" but that pass may itself be substantive work. If the findings turn out to represent genuine structural issues rather than tooling noise, the triage pass may move some items to a follow-up issue rather than blocking this baseline. That decision point is called out explicitly so we don't pretend the line-count is knowable before we run the tool.

## Non-goals

- Type-aware lint rules (`recommended-type-checked`, `no-floating-promises`, etc.). Belongs with item 2, after `tsc --noEmit` is green.
- Linting `packages/cli` (Node ESM CLI).
- Linting or deleting legacy packages (`cobi-react`, `cyoda-sass-react`).
- CI enforcement. The gate becomes available; whether CI enforces it is a separate decision.
- Prettier integration. Separate concern.

## Rollout

Single branch off `main`, one PR. No migration because there's nothing to migrate from.
