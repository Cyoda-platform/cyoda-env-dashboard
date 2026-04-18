# TypeScript Error Cleanup Implementation Plan

> **For agentic workers:** This plan is designed to survive context clears. Each package is an independent, resumable unit. Check the checkboxes as you go — a fresh Claude should open this file, read "Resume Protocol" below, find the next unchecked package, and continue.
>
> **REQUIRED SUB-SKILL:** Use `superpowers:executing-plans` to work through tasks. Do NOT use subagent-driven-development for this plan — the work is exploratory per-package and benefits from direct context.

**Goal:** Get `pnpm -r --no-bail --if-present run type-check` to exit 0 across all in-scope packages, so future plans can use `pnpm type-check` as a green CI gate.

**Architecture:** One PR per package, smallest-first. Each package's PR stands alone: branch from `main`, fix errors, open PR, merge, delete branch. No cross-package refactors unless an error is caused by a type re-exported from another package — in that case, fix at the source and note it in the PR description. Tests must remain green after each package (`pnpm exec vitest run packages/<pkg>`).

**Tech Stack:** TypeScript 5.x (`tsc --noEmit`), Vitest 3, pnpm 9 workspace.

---

## Scope & Baseline

**Recorded on 2026-04-18 from `main` at HEAD** (post-PR #15 merge):

| Package | Errors | Order |
|---|---:|---:|
| `packages/http-api-react` | 8 | 1 |
| `packages/source-configuration-react` | 36 | 2 |
| `packages/ui-lib-react` | 36 | 3 |
| `packages/tasks-react` | 38 | 4 |
| `packages/reporting-react` | 57 | 5 |
| `packages/statemachine-react` | 124 | 6 |
| `packages/processing-manager-react` | 152 | 7 |
| `apps/saas-app` | 164 | 8 |
| **Total** | **615** | |

**Out of scope (deprecated, will be deleted):**
- `packages/cobi-react` (62 errors)
- `packages/cyoda-sass-react` (1 error)

See `~/.claude/projects/-Users-paul-dev-cyoda-env-dashboard/memory/feedback_deprecated_modules.md`.

**Why smallest-first:** quick wins prove the approach, reveal common patterns (e.g. the `refetchInterval → query.refetchInterval` structural change in React Query v5), and let us pause without stranding a large half-finished package.

---

## Resume Protocol (read this on every fresh context)

1. Run `git status` — if dirty with non-test/non-source files (e.g. openapi yml drift, rogue screenshots), ignore them.
2. Run `git branch --show-current`. If on a `fix/ts-<pkg>` branch, you are mid-task; look at uncommitted diff to see what's in progress.
3. If on `main`, read the checkboxes below — find the first unchecked package, that is the next task.
4. Before starting a package, run its baseline check (command under each task) and confirm the error count matches this plan. If numbers drifted, re-run the full baseline (bottom of plan) and update this doc in the same PR as the first fix.
5. Read the memory files listed under **Pitfalls** before acting — they encode feedback from prior sessions.

---

## Pitfalls (read before any task)

Relevant memory files (absolute paths):
- `~/.claude/projects/-Users-paul-dev-cyoda-env-dashboard/memory/feedback_avoid_routine_full_test_run.md` — do NOT run `pnpm test:run` as a verification step; it saturates the workstation. Use per-package `pnpm exec vitest run packages/<pkg>` instead.
- `~/.claude/projects/-Users-paul-dev-cyoda-env-dashboard/memory/feedback_vitest_orphans_root_cause.md` — `pool: 'threads'` prevents orphan workers; never revert. Unstable `vi.fn(() => ({...}))` mock returns cause sync render loops.
- `~/.claude/projects/-Users-paul-dev-cyoda-env-dashboard/memory/feedback_git_push_in_sandbox.md` — `git push` through osxkeychain is blocked. Use `TOKEN=$(gh auth token) && git push "https://x-access-token:${TOKEN}@github.com/Cyoda-platform/cyoda-env-dashboard.git" HEAD:<branch>`.
- `~/.claude/projects/-Users-paul-dev-cyoda-env-dashboard/memory/feedback_skip_plan_for_trivial_fixes.md` — within a package, trivial 2-line fixes don't need their own mini-plans.

**Fix-forward rule:** Most errors are in test fixtures, not production code. Fix them in place. Don't add `@ts-ignore` unless the underlying API is genuinely wrong (note why in a comment and cite the issue in the PR).

**Never silence errors with type assertions to hide bugs.** Prefer constructing correct fixtures (e.g. full `AxiosResponse` shapes) over `as any`.

**Don't refactor beyond the error.** If you're fixing a type error on line 149, don't also "clean up" unrelated lines 100–145.

---

## Common Error Patterns (learned during scoping)

These appear across multiple packages. When you hit one, apply the pattern without re-diagnosing.

### Pattern A: React Query v5 — `refetchInterval` not on `QueryOptions`

`QueryOptions` in RQ v5 does not expose `refetchInterval` (it's in `QueryObserverOptions`). This breaks tests that reach into the cache to pull a function-valued `refetchInterval` out for direct invocation:

```ts
// before (TS2339 — property doesn't exist on QueryOptions)
const refetchInterval = query?.options?.refetchInterval as (...) => number

// after — narrow cast at the options access point
const refetchInterval = (query?.options as any)?.refetchInterval as (...) => number
```

Scope: tests that introspect `queryClient.getQueryCache().findAll(...)[0].options`.
This is a test-only concession — production code is unaffected.

### Pattern B: AxiosResponse fixtures are partial

```ts
// before (TS2345: missing status/statusText/headers/config)
const response = { data: { token: '...' } }

// after — use a helper or spread a base
const response: AxiosResponse<AuthResponse> = {
  data: { token: '...' },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
}
```

If the package has >3 of these, extract a `makeAxiosResponse<T>(data: T): AxiosResponse<T>` helper in a `test-utils.ts`.

### Pattern C: Duplicate re-export ambiguity (TS2308)

```ts
// before — two barrels both export `User`
export * from './api'
export * from './types'

// after — either rename or be explicit
export { type User } from './types' // pick authoritative source
export * from './api'
```

### Pattern D: `vi.fn(() => ({...}))` return refs

Already fixed in prior sessions but may resurface if new tests are added. See `feedback_vitest_orphans_root_cause.md` for the diagnostic signature.

### Pattern E: Missing request-object fields in test fixtures (TS2345)

```ts
// before
postEntity({ entityClass: 'X', values: { name: 'Y' } })

// after — match current EntityRequest shape
postEntity({
  entityClass: 'X',
  values: { name: 'Y' },
  entityId: 'test-id',
  transition: '',
  transactional: false,
  async: false,
})
```

If `EntityRequest` has many required fields used only in production, consider widening test-only helpers or making the prod type `Partial` only where semantically correct — but do not weaken the prod type for test convenience.

---

## Per-Package Tasks

Each package follows the same 8-step recipe. Code blocks below are concrete for the first package; later packages reference these commands with `<pkg>` substituted.

### Task 1: `packages/http-api-react` (8 errors)

- [ ] Package complete and merged

**Baseline errors** (recorded 2026-04-18):

```
src/api/entities.test.ts(149,55): TS2345 — EntityRequest missing fields
src/hooks/useAuth.test.tsx(79,50): TS2345 — AxiosResponse partial
src/hooks/useReports.test.tsx:101,124,144,164,184 (5x): TS2339 — refetchInterval not on QueryOptions (Pattern A)
src/index.ts(10,1): TS2308 — duplicate `User` export (Pattern C)
```

- [x] **Step 1: Branch from main**

```bash
git switch main && git pull --ff-only
git switch -c fix/ts-http-api-react
```

- [x] **Step 2: Verify baseline**

```bash
pnpm --filter '@cyoda/http-api-react' exec tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: `8`. If different, re-run the baseline script (end of plan) and update this doc in the same PR.

- [x] **Step 3: Fix `src/index.ts` TS2308 (duplicate `User` export)**

_Actual fix:_ `User` lived in two files. The `api/entities.ts` one was only used locally for `usersList`'s return type; made it non-exported so the barrel only re-exports the auth `User` from `types/index.ts`.

Read `src/index.ts` lines 1–20. Identify which barrel (`./api` vs another) re-exports `User`. Pick the authoritative source and make the other export explicit (exclude `User`) or remove the duplicate. Example fix:

```ts
// src/index.ts
export * from './api'
export { type AuthResponse, type Something } from './types' // no `User` — ./api wins
```

- [x] **Step 4: Fix `src/api/entities.test.ts` TS2345**

Read the failing call at line 149. Populate the missing `EntityRequest` fields (`entityId`, `transition`, `transactional`, `async`) with test-appropriate defaults. See Pattern E above.

- [x] **Step 5: Fix `src/hooks/useAuth.test.tsx` TS2345**

Read line 79. Expand the response fixture to a full `AxiosResponse<AuthResponse>` per Pattern B. If this pattern recurs in this file or repo, introduce `src/test-utils/makeAxiosResponse.ts` and use it here.

- [x] **Step 6: Fix `src/hooks/useReports.test.tsx` TS2339 (5 occurrences)**

_Correction to Pattern A:_ the error is not about passing `refetchInterval` as a query option; it's about reading `query.options.refetchInterval` at runtime on a cache entry. React Query v5's `QueryOptions` type excludes it. Fix: cast to `any` on the options access only — `(query?.options as any)?.refetchInterval`. Pattern A in this plan has been updated below. See the new Pattern A text.

- [x] **Step 7: Verify green + tests still pass** (256/256 tests pass)

```bash
pnpm --filter '@cyoda/http-api-react' exec tsc --noEmit
pnpm exec vitest run packages/http-api-react
```

Both must exit 0. If vitest surfaces new failures, fix forward — don't revert the type fix.

- [ ] **Step 8: Commit, push, PR, merge**

```bash
git add packages/http-api-react
git commit -m "$(cat <<'EOF'
fix(types): clean up http-api-react TypeScript errors

Close 8 pre-existing errors across test fixtures and a barrel ambiguity:
- entities.test.ts: fill in EntityRequest required fields
- useAuth.test.tsx: construct full AxiosResponse shape
- useReports.test.tsx: move refetchInterval under query options (React Query v5)
- index.ts: disambiguate duplicate User export

Part of issue #7 Item 2. See docs/superpowers/plans/2026-04-18-typescript-error-cleanup.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

TOKEN=$(gh auth token) && git push "https://x-access-token:${TOKEN}@github.com/Cyoda-platform/cyoda-env-dashboard.git" HEAD:fix/ts-http-api-react

gh pr create --title "fix(types): clean up http-api-react TypeScript errors" --body "$(cat <<'EOF'
## Summary
- Close all 8 TypeScript errors in \`packages/http-api-react\`.
- Part of issue #7 Item 2.

## Plan
Per \`docs/superpowers/plans/2026-04-18-typescript-error-cleanup.md\`.

## Test plan
- [x] \`pnpm --filter '@cyoda/http-api-react' exec tsc --noEmit\` exits 0
- [x] \`pnpm exec vitest run packages/http-api-react\` exits 0

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

After the PR is green, confirm with the user before merging. On merge:

```bash
gh pr merge <pr-number> --squash --delete-branch
git switch main && git pull --ff-only
```

Then check the box at the top of this task and move to Task 2.

---

### Task 2: `packages/source-configuration-react` (36 errors)

- [ ] Package complete and merged

**Baseline errors** (not yet enumerated — record on first pass):

- [ ] **Step 1: Branch**

```bash
git switch main && git pull --ff-only
git switch -c fix/ts-source-configuration-react
```

- [ ] **Step 2: Enumerate errors into this file**

```bash
pnpm --filter '@cyoda/source-configuration-react' exec tsc --noEmit 2>&1 | tee /tmp/ts-scr-errors.txt | grep -c "error TS"
```

Paste a condensed summary (grouped by TS code and file) into the "Baseline errors" section above. Update error count if it has drifted from 36.

- [ ] **Step 3: Group errors by pattern**

Skim the list. Tag each against Patterns A–E above. Note any NEW patterns seen and add them to the "Common Error Patterns" section so later packages benefit. If a new pattern appears in ≥2 places here or is likely to recur, add it.

- [ ] **Step 4: Fix errors file-by-file**

Work one file at a time. For each file:
1. Read the full file (or the section around the error).
2. Apply the relevant pattern.
3. Re-run `pnpm --filter '@cyoda/source-configuration-react' exec tsc --noEmit 2>&1 | grep "<filename>" | wc -l` to confirm the count dropped.

Avoid the temptation to refactor. The goal is zero errors, not pretty code.

- [ ] **Step 5: Verify green**

```bash
pnpm --filter '@cyoda/source-configuration-react' exec tsc --noEmit
pnpm exec vitest run packages/source-configuration-react
```

Both exit 0.

- [ ] **Step 6: Commit, push, PR, merge**

Use the Task 1 template, substituting package name and the actual fix summary in the commit body.

---

### Task 3: `packages/ui-lib-react` (36 errors)

- [ ] Package complete and merged

**Baseline errors:** (enumerate on first pass)

Follow the Task 2 recipe, substituting `ui-lib-react` throughout. Watch for ui-lib-specific patterns (Ant Design types, `HelperStorage`/`HelperDictionary` class shapes) — document any new pattern you discover.

Branch: `fix/ts-ui-lib-react`.

- [ ] Step 1: Branch
- [ ] Step 2: Enumerate errors
- [ ] Step 3: Group by pattern
- [ ] Step 4: Fix file-by-file
- [ ] Step 5: Verify green (`tsc --noEmit` + `vitest run`)
- [ ] Step 6: Commit, push, PR, merge

---

### Task 4: `packages/tasks-react` (38 errors)

- [ ] Package complete and merged

**Baseline errors:** (enumerate on first pass)

Branch: `fix/ts-tasks-react`.

- [ ] Step 1: Branch
- [ ] Step 2: Enumerate errors
- [ ] Step 3: Group by pattern
- [ ] Step 4: Fix file-by-file
- [ ] Step 5: Verify green
- [ ] Step 6: Commit, push, PR, merge

---

### Task 5: `packages/reporting-react` (57 errors)

- [ ] Package complete and merged

**Baseline errors:** (enumerate on first pass)

Branch: `fix/ts-reporting-react`.

- [ ] Step 1: Branch
- [ ] Step 2: Enumerate errors
- [ ] Step 3: Group by pattern
- [ ] Step 4: Fix file-by-file
- [ ] Step 5: Verify green
- [ ] Step 6: Commit, push, PR, merge

---

### Task 6: `packages/statemachine-react` (124 errors)

- [ ] Package complete and merged

**Baseline errors:** (enumerate on first pass)

Branch: `fix/ts-statemachine-react`.

**Heads-up:** This package has cytoscape layouts with custom type shims and workflow gateway code with rich generics. Expect Patterns A, B, E plus likely cytoscape-specific TS1xxx errors. Budget more time for investigation on step 3.

- [ ] Step 1: Branch
- [ ] Step 2: Enumerate errors
- [ ] Step 3: Group by pattern
- [ ] Step 4: Fix file-by-file
- [ ] Step 5: Verify green
- [ ] Step 6: Commit, push, PR, merge

---

### Task 7: `packages/processing-manager-react` (152 errors)

- [ ] Package complete and merged

**Baseline errors:** (enumerate on first pass)

Branch: `fix/ts-processing-manager-react`.

**Heads-up:** Many errors here historically come from `@/hooks` alias drift vs. the root vitest config's `@ → ui-lib-react/src` alias. Test files that `import from '@/hooks'` may resolve to the wrong module. See the prior session's fix in `fix(tests): align test suites with current component behavior` — the same path substitution (`@/hooks` → `../../../hooks`) is the correct pattern.

- [ ] Step 1: Branch
- [ ] Step 2: Enumerate errors
- [ ] Step 3: Group by pattern
- [ ] Step 4: Fix file-by-file
- [ ] Step 5: Verify green
- [ ] Step 6: Commit, push, PR, merge

---

### Task 8: `apps/saas-app` (164 errors)

- [ ] Package complete and merged

**Baseline errors:** (enumerate on first pass)

Branch: `fix/ts-saas-app`.

**Heads-up:** This is the app shell — it composes every other package. Many errors here will disappear automatically as upstream packages tighten their types. Run the baseline AFTER all seven packages above are merged; only the true app-level errors should remain.

- [ ] Step 1: Re-run full baseline (see bottom) — confirm only `apps/saas-app` has errors
- [ ] Step 2: Branch
- [ ] Step 3: Enumerate errors
- [ ] Step 4: Group by pattern
- [ ] Step 5: Fix file-by-file
- [ ] Step 6: Verify green: `pnpm --filter '@cyoda/saas-app' exec tsc --noEmit` and `pnpm exec vitest run apps/saas-app`
- [ ] Step 7: Commit, push, PR, merge

---

### Task 9: Final verification and issue close-out

- [ ] All packages merged to main
- [ ] `pnpm -r --no-bail --if-present run type-check` exits 0 across all in-scope packages
- [ ] Update issue #7 — check off Item 2 (keep Items 1 and 3 already closed)
- [ ] Consider closing issue #7 entirely; leave a summary comment linking the PRs

```bash
# Final verification
git switch main && git pull --ff-only
pnpm -r --no-bail --if-present run type-check 2>&1 | grep -cE "error TS"
# Expected: 0 errors in in-scope packages (deprecated packages still error — acceptable)
```

- [ ] Update `docs/superpowers/plans/2026-04-18-typescript-error-cleanup.md` header with "Status: Complete" and commit on main (or in the last PR).

---

## Baseline script (re-run any time)

```bash
#!/bin/bash
# Get per-package TS error counts. Deprecated packages are included for reference
# but are out of scope. Run from repo root.
pnpm -r --no-bail --if-present run type-check 2>&1 \
  | grep -E "error TS" \
  | cut -d: -f1 \
  | sort \
  | uniq -c
```

Expected output format (example, 2026-04-18 snapshot):

```
 164 apps/saas-app type-check
  62 packages/cobi-react type-check             # DEPRECATED — skip
   1 packages/cyoda-sass-react type-check       # DEPRECATED — skip
   8 packages/http-api-react type-check
 152 packages/processing-manager-react type-check
  57 packages/reporting-react type-check
  36 packages/source-configuration-react type-check
 124 packages/statemachine-react type-check
  38 packages/tasks-react type-check
  36 packages/ui-lib-react type-check
```

---

## Progress log

Update after each merged PR. Keeps the plan self-describing for any future reader.

| Date | Package | PR | Errors closed | Patterns seen |
|---|---|---|---:|---|
| _(first entry goes here)_ | | | | |
