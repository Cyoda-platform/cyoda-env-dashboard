# ESLint v9 flat-config baseline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a single root ESLint v9 flat-config baseline so `pnpm lint` is a usable structural gate across 8 non-legacy React/TS packages.

**Architecture:** One root `eslint.config.js` (flat config). All eslint + plugin devDeps hoisted to the root `package.json`. Per-package `lint` scripts and per-package eslint devDeps removed. Minimal rule surface (no type-aware rules — those defer to a later project).

**Tech Stack:** ESLint 9.x, `@eslint/js`, `typescript-eslint` (unified v8 package), `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`.

**Spec:** `docs/superpowers/specs/2026-04-17-eslint-flat-config-baseline-design.md`

---

## Notes for the executor

- Working directory is the repo root: `/Users/paul/dev/cyoda-env-dashboard`.
- Branch `fix/eslint-flat-config-baseline` is already created from `main`; the spec commit is already on it.
- The repo uses `pnpm@9.15.4` (set in `packageManager`). Use `pnpm`, not `npm` or `yarn`.
- HTTPS `git push` fails in the sandboxed shell (keychain is blocked). Use:
  ```
  TOKEN=$(gh auth token) && git push "https://x-access-token:${TOKEN}@github.com/Cyoda-platform/cyoda-env-dashboard.git" fix/eslint-flat-config-baseline:fix/eslint-flat-config-baseline
  ```
- The `--ext` CLI flag was removed in ESLint v9 — do not re-add it anywhere.

---

## Task 1: Add root ESLint devDependencies

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: Add devDeps with exact versions**

Use pnpm to add as devDeps so the lockfile updates atomically:

```bash
pnpm add -w -D \
  eslint@^9.39.4 \
  @eslint/js@^9.39.4 \
  typescript-eslint@^8.46.0 \
  eslint-plugin-react-hooks@^5.2.0 \
  eslint-plugin-react-refresh@^0.4.23 \
  globals@^15.15.0
```

Expected: `package.json` and `pnpm-lock.yaml` updated. No compilation. Version floors are minimum-supported; pnpm will pick the highest satisfying version.

- [ ] **Step 2: Verify versions landed**

Run: `node -e "const p=require('./package.json'); console.log(Object.entries(p.devDependencies).filter(([k])=>k.includes('eslint')||k==='globals'||k==='typescript-eslint').map(([k,v])=>k+': '+v).join('\n'))"`

Expected output contains all six packages with `^` ranges.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): hoist ESLint + plugins to root for flat-config baseline"
```

---

## Task 2: Create root `eslint.config.js`

**Files:**
- Create: `eslint.config.js`

- [ ] **Step 1: Write the config file**

Create `eslint.config.js` at the repo root with exactly this content:

```js
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

- [ ] **Step 2: Verify ESLint resolves the config (no lint run yet)**

Run: `pnpm exec eslint --print-config apps/saas-app/src/main.tsx 2>&1 | head -20`

Expected: JSON output beginning with `{`. If instead you see `Could not find config file` or an import error, fix the config before continuing.

- [ ] **Step 3: Verify an ignored path is actually ignored**

Run: `pnpm exec eslint .old_project 2>&1 | tail -5`

Expected: either empty output with exit code 0, or a message indicating all files were ignored. Should NOT attempt to lint files under `.old_project`.

- [ ] **Step 4: Verify an in-scope file is resolved**

Run: `pnpm exec eslint apps/saas-app/src/main.tsx --no-error-on-unmatched-pattern 2>&1 | tail -10`

Expected: either no output (clean file) or lint findings from `main.tsx`. Should NOT say the file was ignored.

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js
git commit -m "feat(lint): add root ESLint v9 flat config"
```

---

## Task 3: Add root lint scripts and remove old recursive `lint` script

**Files:**
- Modify: `package.json` (root) — `scripts` block only

- [ ] **Step 1: Update scripts in root `package.json`**

Find the `"lint": "pnpm -r --if-present run lint"` line and replace it, plus add `lint:fix`:

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix",
```

- [ ] **Step 2: Run `pnpm lint` to see the first-pass findings**

Run: `pnpm lint 2>&1 | tee /tmp/eslint-first-pass.log | tail -40`

Expected: eslint runs over the 8 in-scope packages and either prints findings or reports 0 problems. The critical check is that it **runs to completion** — no `couldn't find eslint.config.js`, no plugin resolution errors.

If it errors out about config or plugins, stop and fix the config. Do not attempt to triage findings until the run is clean.

- [ ] **Step 3: Count findings**

Run: `grep -E '^[[:space:]]+[0-9]+:[0-9]+' /tmp/eslint-first-pass.log | wc -l`

Expected: a number (possibly large). Record it. This is the baseline findings count going into triage.

- [ ] **Step 4: Commit (even if lint isn't green yet)**

```bash
git add package.json
git commit -m "feat(lint): wire root 'lint' script to flat config"
```

This commit establishes the gate — the triage work in Task 5 gets commits of its own.

---

## Task 4: Remove per-package `lint` scripts and ESLint devDeps

**Files:**
- Modify: `packages/http-api-react/package.json`
- Modify: `packages/ui-lib-react/package.json`
- Modify: `packages/tasks-react/package.json`
- Modify: `packages/statemachine-react/package.json`
- Modify: `packages/source-configuration-react/package.json`
- Modify: `packages/reporting-react/package.json`
- Modify: `packages/cobi-react/package.json`
- Modify: `packages/cyoda-sass-react/package.json`

- [ ] **Step 1: Remove the `lint` script from all eight packages**

For each package.json above, delete the line:

```json
"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
```

Tip: because every package has the exact same script, a single Edit per file is sufficient. The surrounding commas will be the only thing to clean up.

- [ ] **Step 2: Remove ESLint devDeps from the five packages that declare them**

Remove these entries from the `devDependencies` block of each of: `http-api-react`, `ui-lib-react`, `tasks-react`, `statemachine-react`, `source-configuration-react`:

- `eslint`
- `@typescript-eslint/eslint-plugin` (present in http-api-react, tasks-react, ui-lib-react, source-configuration-react)
- `@typescript-eslint/parser` (same four)
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

`statemachine-react` only declares `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` — remove just those three.

- [ ] **Step 3: Run `pnpm install` to sync the lockfile**

Run: `pnpm install 2>&1 | tail -10`

Expected: "Progress" lines and then a summary. Should succeed cleanly. No "unmet peer dependency" new warnings that weren't already present.

- [ ] **Step 4: Verify `pnpm lint` still behaves identically**

Run: `pnpm lint 2>&1 | grep -E '^[[:space:]]+[0-9]+:[0-9]+' | wc -l`

Expected: the same findings count as the baseline recorded in Task 3 Step 3. If the count changes, a resolution issue has been introduced — stop and investigate before proceeding.

- [ ] **Step 5: Verify no package-level `pnpm --filter X lint` still exists**

Run: `pnpm -r --if-present run lint 2>&1 | head -5`

Expected: "No projects matched the filters" or no-op output. If a package still has a `lint` script, you missed it.

- [ ] **Step 6: Verify `pnpm test:run` still passes**

Run: `pnpm test:run 2>&1 | tail -5`

Expected: the existing test suite runs and passes (same as before).

- [ ] **Step 7: Commit**

```bash
git add packages/*/package.json pnpm-lock.yaml
git commit -m "chore(lint): remove per-package ESLint scripts and devDeps

Consolidated at root. Per-package lint scripts used the removed v8
'--ext' flag; nothing was working. Includes cobi-react and
cyoda-sass-react (legacy, ignored by root config but scripts removed
for consistency)."
```

---

## Task 5: Triage first-pass findings until `pnpm lint` is green

**Files:** varies — wherever findings surface. Not knowable in advance.

This task cannot be scripted line-by-line in advance because the findings list is whatever the first clean run produces. Follow this procedure:

- [ ] **Step 1: Produce a fresh findings report**

Run: `pnpm lint 2>&1 | tee /tmp/eslint-findings.log; echo "exit=$?"`

If `exit=0`, skip to Step 7 (already green, no triage needed).

- [ ] **Step 2: Group findings by rule**

Run: `grep -oE '@?[a-z-]+/[a-z-]+$|[a-z-]+-[a-z-]+$' /tmp/eslint-findings.log | sort | uniq -c | sort -rn | head -30`

This surfaces the most common rule violations first. Triage the biggest buckets first.

- [ ] **Step 3: For each bucket, decide the disposition**

Three valid dispositions:

1. **Fix the code** — if the rule is right and the violation is a real defect or sloppiness, fix it. Prefer small, obvious fixes (unused imports, missing hook deps on memoized callbacks).
2. **Scope or disable the rule at the config level** — if the rule is wrong for this codebase (e.g., `no-unused-vars` flagging every `_prefix` parameter when the codebase convention is to keep them), add a rule override in `eslint.config.js` under the React files block:
   ```js
   rules: {
     // ...existing
     'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
   }
   ```
3. **Per-line `eslint-disable-next-line` with a reason comment** — if a specific site is intentionally violating a generally-sensible rule. Always include a reason, e.g.:
   ```ts
   // eslint-disable-next-line react-hooks/exhaustive-deps -- ref callbacks intentionally stable
   ```

**Red flags that should make you stop and ask for guidance instead of mass-disabling:**
- A rule with hundreds of violations where each looks like a real bug (don't mass-disable — that defeats the gate's purpose).
- Violations that imply structural issues (e.g., `react-hooks/rules-of-hooks` means hooks are being called conditionally — actual defect).

- [ ] **Step 4: Commit in small, coherent chunks**

After each rule bucket is resolved, commit with a descriptive message:

```bash
git add -u
git commit -m "fix(lint): <what changed>

<rule name>: <short description of disposition — fixed / disabled with reason / per-line>"
```

Small commits make review and bisection easier. Don't bundle unrelated rules in one commit.

- [ ] **Step 5: Re-run lint after each commit**

Run: `pnpm lint 2>&1 | tail -3`

Track progress: the problem count should monotonically decrease.

- [ ] **Step 6: Iterate until `pnpm lint` exits 0**

Loop back to Step 1 until the run is green.

- [ ] **Step 7: When the tree is clean, run one final sanity sweep**

Run:
```bash
pnpm lint && \
pnpm test:run && \
pnpm --filter @cyoda/saas-app test:run
```

Expected: all three exit 0.

- [ ] **Step 8: If any rule was disabled or narrowed in Step 3, amend the spec**

If the triage required disabling or overriding rules beyond the minimal recommended set documented in the spec, edit `docs/superpowers/specs/2026-04-17-eslint-flat-config-baseline-design.md` to record what was changed and why, then commit:

```bash
git add docs/superpowers/specs/2026-04-17-eslint-flat-config-baseline-design.md
git commit -m "docs(spec): record lint rule overrides applied during triage"
```

This keeps the spec honest about the final state.

---

## Task 6: Final verification and push

**Files:** none (verification + push only).

- [ ] **Step 1: Confirm working tree is clean**

Run: `git status --short | grep -v '^??' | head -20`

Expected: no unstaged or uncommitted tracked-file changes. (Untracked files like existing screenshots are fine.)

- [ ] **Step 2: Full gate sweep**

Run:
```bash
pnpm lint && echo "LINT: green" && \
pnpm type-check 2>&1 | tail -3; echo "---type-check exit=$?" && \
pnpm test:run 2>&1 | tail -3; echo "---test:run exit=$?" && \
pnpm build 2>&1 | tail -3; echo "---build exit=$?"
```

Expected: `LINT: green` prints. Document the type-check and test:run and build exit codes in the PR body — type-check is expected to fail (item 2 of #7, 660 pre-existing errors); test:run and build should both pass.

- [ ] **Step 3: Push branch**

```bash
TOKEN=$(gh auth token) && git push "https://x-access-token:${TOKEN}@github.com/Cyoda-platform/cyoda-env-dashboard.git" fix/eslint-flat-config-baseline:fix/eslint-flat-config-baseline
```

- [ ] **Step 4: Open PR**

```bash
gh pr create --base main --head fix/eslint-flat-config-baseline \
  --title "feat(lint): establish ESLint v9 flat-config baseline" \
  --body "$(cat <<'EOF'
## Summary
- Adds a root `eslint.config.js` (flat config) covering the 8 non-legacy React/TS packages: `http-api-react`, `ui-lib-react`, `tasks-react`, `statemachine-react`, `reporting-react`, `source-configuration-react`, `processing-manager-react`, and `apps/saas-app`.
- Hoists ESLint 9.x + plugins to root devDependencies. Removes per-package `lint` scripts (which used the removed-in-v9 `--ext` flag and had no config to read) and removes per-package ESLint devDeps.
- Ignores legacy (`cobi-react`, `cyoda-sass-react`, `.old_project`), non-TS packages (`cli`), build artifacts, and generated files.
- No type-aware lint rules — those are explicitly deferred to the type-health project (item 2 of #7), where they fit naturally alongside the `tsc --noEmit` cleanup.
- Correction of premise: issue #7 item 3 claimed the repo needed a migration from legacy `.eslintrc.*`. It didn't — no ESLint config of any kind existed in the active workspace. This establishes one from scratch.

Spec: `docs/superpowers/specs/2026-04-17-eslint-flat-config-baseline-design.md`.
Plan: `docs/superpowers/plans/2026-04-17-eslint-flat-config-baseline.md`.

Addresses item 3 of #7. Items 1 (PR #14) and 2 are tracked separately.

## Test plan
- [x] `pnpm lint` exits 0 on a clean tree
- [x] `pnpm test:run` continues to pass (no regression from devDep consolidation)
- [x] `pnpm build` continues to pass
- [ ] `pnpm type-check` is still expected to FAIL pending item 2 of #7 (660 pre-existing TS errors) — not a regression

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed.

- [ ] **Step 5: Post the URL and stop**

Report the PR URL to the user. Do NOT merge. Stop.

---

## Self-review notes

- **Spec coverage:** Every scope item in the spec (root config creation, devDep hoist, per-package cleanup, ignore list, rule set, scripts, verification) is covered by a task.
- **First-pass findings are deliberately not pre-planned:** Task 5 is an iterative triage task. The spec explicitly calls out that findings count isn't predictable; the plan respects that and gives the executor the procedure + decision framework rather than pretending to know fixes in advance.
- **Dependency ordering:** Task 1 (install deps) → Task 2 (config) → Task 3 (wire script) → Task 4 (remove duplicates) → Task 5 (triage) → Task 6 (push). You could argue Task 4 goes before Task 3, but keeping Task 3 early means `pnpm lint` becomes runnable sooner as a verification tool for subsequent tasks.
- **Version floors in Task 1:** chosen to match what's currently hoisted (ESLint 9.39.x) and reasonably current plugins. `typescript-eslint` unified v8 is the replacement for the separate `@typescript-eslint/*` packages declared today.
