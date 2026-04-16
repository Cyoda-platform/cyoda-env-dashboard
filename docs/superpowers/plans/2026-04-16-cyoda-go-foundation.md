# Cyoda-Go Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce the `VITE_FEATURE_FLAG_IS_CYODA_GO` build-time flag, the helpers that consume it, and the menu/route gating that hides Reporting / Tasks / Processing-Manager when running against a cyoda-go backend. No functional change to legacy mode; no workflow refactor yet.

**Architecture:** Adds three new boolean helpers (`isCyodaGo`, `isReportingAvailable`, `isProcessingManagerAvailable`) and one revised helper (`isCyodaCloud` — now auto-true when `IS_CYODA_GO=true`). The SaaS app's `LeftSideMenu` and `routes/index.tsx` consume the new "availability" helpers so unsupported features are removed from the menu and not registered as routes; the existing `<Route path="*">` catch-all redirects pasted URLs to `/workflows`. Env templates and `ENV_FILES_GUIDE.md` document the new flag and its implication.

**Tech Stack:** TypeScript 5, React 18, Vite 6, Vitest, React Testing Library, Ant Design 5, pnpm 9 workspaces.

**Spec:** `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md` (sections 2, 3, 6.1, 6.2, plus the Foundation entry in §9.2).

---

## File Structure

| Path | Action | Responsibility |
| --- | --- | --- |
| `packages/http-api-react/src/utils/HelperFeatureFlags.ts` | Modify | Add `isCyodaGo`, change `isCyodaCloud` to imply, add `isReportingAvailable`, `isTasksAvailable`, `isProcessingManagerAvailable`. |
| `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts` | Modify | Tests for all five behaviors above, including the auto-implication truth table. |
| `apps/saas-app/src/components/LeftSideMenu.tsx` | Modify | Replace `isTasksEnabled` with `isTasksAvailable`; gate Reporting and Processing menu items behind the new helpers. |
| `apps/saas-app/src/components/__tests__/LeftSideMenu.test.tsx` | Modify | Add a "cyoda-go menu shape" suite that asserts the visible items. |
| `apps/saas-app/src/routes/index.tsx` | Modify | Gate Reporting, Tasks, Processing-Manager routes behind the new helpers. |
| `apps/saas-app/.env.template` | Modify | Document `VITE_FEATURE_FLAG_IS_CYODA_GO`. |
| `.env.template` (root) | Modify | Document `VITE_FEATURE_FLAG_IS_CYODA_GO`. |
| `ENV_FILES_GUIDE.md` | Modify | Add a feature-flag section that explains the new flag and the implication on `IS_CYODA_CLOUD`. |

No new files. No type-definition file changes (the existing helpers read `import.meta.env` via index access, so no `vite-env.d.ts` update is required).

---

## Branching Setup

### Task 0: Create the long-running feature branch and the Foundation sub-branch

**Files:** none

- [ ] **Step 1: Verify a clean starting state**

```bash
cd /Users/paul/dev/cyoda-env-dashboard
git status
```

Expected: working tree may have unrelated unstaged changes under `docs/cyoda-cloud/api/*`; that is fine. **Do not stage or commit those files in any task in this plan.** If anything else is modified, stop and ask.

- [ ] **Step 2: Cut the long-running feature branch from main**

```bash
git checkout main
git pull --ff-only
git checkout -b feature/cyoda-go-support
git push -u origin feature/cyoda-go-support
```

Expected: branch created locally and pushed; tracking set.

- [ ] **Step 3: Cut the Foundation sub-branch from the feature branch**

```bash
git checkout -b feature/cyoda-go-support/foundation
```

Expected: now on `feature/cyoda-go-support/foundation`. Every subsequent commit in this plan lands on this branch.

---

## HelperFeatureFlags Changes

### Task 1: Test `isCyodaGo`

**Files:**
- Test: `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts`

- [ ] **Step 1: Write the failing test**

Append the following describe-block to `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts`, immediately **before** the file's final closing `});` of the outer `describe('HelperFeatureFlags', ...)` block:

```ts
  describe('isCyodaGo', () => {
    it('should return true when VITE_FEATURE_FLAG_IS_CYODA_GO is true', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      const result = HelperFeatureFlags.isCyodaGo();
      expect(result).toBe(true);
    });

    it('should return true when VITE_FEATURE_FLAG_IS_CYODA_GO is the string "true"', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = 'true' as any;

      const result = HelperFeatureFlags.isCyodaGo();
      expect(result).toBe(true);
    });

    it('should return false when VITE_FEATURE_FLAG_IS_CYODA_GO is false', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = false as any;

      const result = HelperFeatureFlags.isCyodaGo();
      expect(result).toBe(false);
    });

    it('should return false when VITE_FEATURE_FLAG_IS_CYODA_GO is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      const result = HelperFeatureFlags.isCyodaGo();
      expect(result).toBe(false);
    });
  });
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isCyodaGo"
```

Expected: tests fail with `TypeError: HelperFeatureFlags.isCyodaGo is not a function` (or compile error if running through tsc-equivalent paths).

### Task 2: Implement `isCyodaGo`

**Files:**
- Modify: `packages/http-api-react/src/utils/HelperFeatureFlags.ts`

- [ ] **Step 1: Add the helper**

In `packages/http-api-react/src/utils/HelperFeatureFlags.ts`, **after** `isCyodaCloud()` and **before** the closing `}` of the class, insert:

```ts
  /**
   * Check if the cyoda-go backend is in use.
   * Cyoda-go is a digital twin of Cyoda Cloud that does not expose any
   * /platform-* endpoints. Implies isCyodaCloud() === true.
   */
  static isCyodaGo(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_IS_CYODA_GO');
  }
```

- [ ] **Step 2: Run the test to verify it passes**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isCyodaGo"
```

Expected: all four `isCyodaGo` tests PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/http-api-react/src/utils/HelperFeatureFlags.ts \
        packages/http-api-react/src/utils/HelperFeatureFlags.test.ts
git commit -m "feat(http-api-react): add isCyodaGo feature-flag helper"
```

### Task 3: Test the auto-implication of `isCyodaCloud`

**Files:**
- Test: `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts`

- [ ] **Step 1: Write the failing test**

Append the following describe-block to `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts`, immediately **before** the outer-`describe`'s closing `});`:

```ts
  describe('isCyodaCloud auto-implication from isCyodaGo', () => {
    it('should return true when only IS_CYODA_CLOUD is set', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(true);
    });

    it('should return true when only IS_CYODA_GO is set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_CLOUD;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(true);
    });

    it('should return true when both flags are set', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(true);
    });

    it('should return false when neither flag is set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_CLOUD;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(false);
    });

    it('should return false when both flags are explicitly false', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = false as any;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = false as any;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(false);
    });
  });
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "auto-implication"
```

Expected: the "only IS_CYODA_GO is set" case FAILS (returns `false` because the current `isCyodaCloud` only reads its own raw flag).

### Task 4: Implement the auto-implication in `isCyodaCloud`

**Files:**
- Modify: `packages/http-api-react/src/utils/HelperFeatureFlags.ts`

- [ ] **Step 1: Update the helper**

Replace the body of `isCyodaCloud` in `packages/http-api-react/src/utils/HelperFeatureFlags.ts` so the whole method reads:

```ts
  /**
   * Check if Cyoda Cloud mode is enabled.
   *
   * Returns true when EITHER VITE_FEATURE_FLAG_IS_CYODA_CLOUD or
   * VITE_FEATURE_FLAG_IS_CYODA_GO is truthy. Cyoda-go is a digital twin
   * of Cyoda Cloud, so any cyoda-go installation is also a cloud-mode
   * installation; the auto-implication is enforced here so a misconfigured
   * .env file (only IS_CYODA_GO=true) still produces correct cloud behavior.
   *
   * When enabled, uses Cyoda Cloud API endpoints:
   * - /model/export/SIMPLE_VIEW/{entityName}/{modelVersion} for entity models
   * - /entity/{entityId} for entity data
   * - /model/{entityName}/{modelVersion}/workflow/{export,import} for workflows
   */
  static isCyodaCloud(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_IS_CYODA_CLOUD')
      || this.isCyodaGo();
  }
```

- [ ] **Step 2: Run the new and existing isCyodaCloud tests**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isCyodaCloud|auto-implication"
```

Expected: all `isCyodaCloud` tests pass (including the prior raw-flag tests).

- [ ] **Step 3: Commit**

```bash
git add packages/http-api-react/src/utils/HelperFeatureFlags.ts \
        packages/http-api-react/src/utils/HelperFeatureFlags.test.ts
git commit -m "feat(http-api-react): make isCyodaCloud imply when IS_CYODA_GO is set"
```

### Task 5: Test and implement `isReportingAvailable`

**Files:**
- Test: `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts`
- Modify: `packages/http-api-react/src/utils/HelperFeatureFlags.ts`

- [ ] **Step 1: Write the failing test**

Append to `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts` before the outer `});`:

```ts
  describe('isReportingAvailable', () => {
    it('should return true when IS_CYODA_GO is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isReportingAvailable()).toBe(true);
    });

    it('should return false when IS_CYODA_GO is true', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isReportingAvailable()).toBe(false);
    });
  });
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isReportingAvailable"
```

Expected: fails with `isReportingAvailable is not a function`.

- [ ] **Step 3: Implement the helper**

In `packages/http-api-react/src/utils/HelperFeatureFlags.ts`, add **after** `isCyodaGo` and before the closing `}` of the class:

```ts
  /**
   * Whether the Reporting feature is available in the current backend mode.
   * Reporting depends on /platform-* endpoints that do not exist on cyoda-go.
   */
  static isReportingAvailable(): boolean {
    return !this.isCyodaGo();
  }
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isReportingAvailable"
```

Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/http-api-react/src/utils/HelperFeatureFlags.ts \
        packages/http-api-react/src/utils/HelperFeatureFlags.test.ts
git commit -m "feat(http-api-react): add isReportingAvailable helper"
```

### Task 6: Test and implement `isTasksAvailable`

**Files:**
- Test: `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts`
- Modify: `packages/http-api-react/src/utils/HelperFeatureFlags.ts`

- [ ] **Step 1: Write the failing test**

Append to `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts` before the outer `});`:

```ts
  describe('isTasksAvailable', () => {
    it('should return true when TASKS flag is true and IS_CYODA_GO is not set', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = true as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isTasksAvailable()).toBe(true);
    });

    it('should return false when TASKS flag is true but IS_CYODA_GO is true', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = true as any;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isTasksAvailable()).toBe(false);
    });

    it('should return false when TASKS flag is false', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = false as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isTasksAvailable()).toBe(false);
    });

    it('should return false when neither flag is set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_TASKS;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isTasksAvailable()).toBe(false);
    });
  });
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isTasksAvailable"
```

Expected: fails with `isTasksAvailable is not a function`.

- [ ] **Step 3: Implement the helper**

In `packages/http-api-react/src/utils/HelperFeatureFlags.ts`, add **after** `isReportingAvailable`:

```ts
  /**
   * Whether the Tasks feature is available in the current backend mode.
   * Tasks depends on /platform-* endpoints that do not exist on cyoda-go,
   * AND the existing VITE_FEATURE_FLAG_TASKS opt-in must remain in effect.
   */
  static isTasksAvailable(): boolean {
    return !this.isCyodaGo() && this.isTasksEnabled();
  }
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isTasksAvailable"
```

Expected: all four tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/http-api-react/src/utils/HelperFeatureFlags.ts \
        packages/http-api-react/src/utils/HelperFeatureFlags.test.ts
git commit -m "feat(http-api-react): add isTasksAvailable helper"
```

### Task 7: Test and implement `isProcessingManagerAvailable`

**Files:**
- Test: `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts`
- Modify: `packages/http-api-react/src/utils/HelperFeatureFlags.ts`

- [ ] **Step 1: Write the failing test**

Append to `packages/http-api-react/src/utils/HelperFeatureFlags.test.ts` before the outer `});`:

```ts
  describe('isProcessingManagerAvailable', () => {
    it('should return true when IS_CYODA_GO is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isProcessingManagerAvailable()).toBe(true);
    });

    it('should return false when IS_CYODA_GO is true', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isProcessingManagerAvailable()).toBe(false);
    });
  });
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isProcessingManagerAvailable"
```

Expected: fails with `isProcessingManagerAvailable is not a function`.

- [ ] **Step 3: Implement the helper**

In `packages/http-api-react/src/utils/HelperFeatureFlags.ts`, add **after** `isTasksAvailable`:

```ts
  /**
   * Whether the Processing Manager feature is available in the current backend mode.
   * Processing Manager depends on /platform-processing endpoints that do not
   * exist on cyoda-go.
   */
  static isProcessingManagerAvailable(): boolean {
    return !this.isCyodaGo();
  }
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts -t "isProcessingManagerAvailable"
```

Expected: both tests PASS.

- [ ] **Step 5: Run the full HelperFeatureFlags test file to confirm no regressions**

```bash
pnpm --filter @cyoda/http-api-react exec vitest run src/utils/HelperFeatureFlags.test.ts
```

Expected: every test in the file passes.

- [ ] **Step 6: Commit**

```bash
git add packages/http-api-react/src/utils/HelperFeatureFlags.ts \
        packages/http-api-react/src/utils/HelperFeatureFlags.test.ts
git commit -m "feat(http-api-react): add isProcessingManagerAvailable helper"
```

---

## SaaS App — Menu Gating

### Task 8: Test the cyoda-go menu shape

**Files:**
- Test: `apps/saas-app/src/components/__tests__/LeftSideMenu.test.tsx`

- [ ] **Step 1: Write the failing test**

Append the following describe-block to `apps/saas-app/src/components/__tests__/LeftSideMenu.test.tsx`, immediately **before** the file's final closing `});` of the outer `describe('LeftSideMenu', ...)` block:

```ts
  describe('Cyoda-Go feature gating', () => {
    const setEnv = (key: string, value: unknown) => {
      (import.meta.env as any)[key] = value;
    };
    const clearEnv = (key: string) => {
      delete (import.meta.env as any)[key];
    };

    beforeEach(() => {
      // Default: all relevant flags off
      clearEnv('VITE_FEATURE_FLAG_IS_CYODA_GO');
      clearEnv('VITE_FEATURE_FLAG_IS_CYODA_CLOUD');
      clearEnv('VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA');
      clearEnv('VITE_FEATURE_FLAG_TASKS');
    });

    it('hides Reporting, Tasks, and Processing when IS_CYODA_GO is true', () => {
      setEnv('VITE_FEATURE_FLAG_IS_CYODA_GO', true);
      setEnv('VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA', true);
      // Even with TASKS explicitly enabled, the GO flag must take precedence:
      setEnv('VITE_FEATURE_FLAG_TASKS', true);

      renderWithRouter(
        <LeftSideMenu collapsed={false} onCollapse={mockOnCollapse} />
      );

      expect(screen.queryByText('Reporting')).not.toBeInTheDocument();
      expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
      expect(screen.queryByText('Processing')).not.toBeInTheDocument();

      // Surviving items
      expect(screen.getByText('Trino SQL schemas')).toBeInTheDocument();
      expect(screen.getByText('Lifecycle')).toBeInTheDocument();
      expect(screen.getByText('Entity Model Viewer')).toBeInTheDocument();
    });

    it('keeps Reporting and Processing visible when IS_CYODA_GO is not set', () => {
      // Same setup as the existing "should render all main menu items" test
      setEnv('VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA', true);
      setEnv('VITE_FEATURE_FLAG_TASKS', true);

      renderWithRouter(
        <LeftSideMenu collapsed={false} onCollapse={mockOnCollapse} />
      );

      expect(screen.getByText('Reporting')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });
  });
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter @cyoda/saas-app exec vitest run src/components/__tests__/LeftSideMenu.test.tsx -t "Cyoda-Go"
```

Expected: the "hides Reporting, Tasks, and Processing" test FAILS — Reporting and Processing are currently always rendered. The "keeps … visible" test should pass.

### Task 9: Apply the gates in `LeftSideMenu.tsx`

**Files:**
- Modify: `apps/saas-app/src/components/LeftSideMenu.tsx`

- [ ] **Step 1: Replace the `isTasksEnabled` line and add the new flag reads**

In `apps/saas-app/src/components/LeftSideMenu.tsx`, locate the two lines:

```tsx
  const isTrinoEnabled = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
  const isTasksEnabled = HelperFeatureFlags.isTasksEnabled();
```

Replace with:

```tsx
  const isTrinoEnabled = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
  const isTasksAvailable = HelperFeatureFlags.isTasksAvailable();
  const isReportingAvailable = HelperFeatureFlags.isReportingAvailable();
  const isProcessingManagerAvailable = HelperFeatureFlags.isProcessingManagerAvailable();
```

- [ ] **Step 2: Gate the Reporting menu entry**

In the same file, find the `{ key: 'reporting', icon: ... }` object inside the `menuItems` array. It is currently rendered unconditionally. Wrap it in a conditional spread the same way Trino is wrapped. Replace the unconditional Reporting object with:

```tsx
    // Reporting - hidden under cyoda-go (uses /platform-* endpoints)
    ...(isReportingAvailable ? [{
      key: 'reporting',
      icon: collapsed ? (
        <Tooltip title="Reporting" placement="right">
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <FileTextOutlined />
            {hasActiveChild('reporting') && !openKeys.includes('reporting') && (
              <span
                className="submenu-active-indicator"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: -12,
                  transform: 'translateY(-50%)',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00d4aa 0%, #4d9fff 100%)',
                  boxShadow: '0 0 4px rgba(0, 212, 170, 0.6)',
                }}
              />
            )}
          </span>
        </Tooltip>
      ) : (
        <FileTextOutlined />
      ),
      label: 'Reporting',
      onTitleClick: () => handleSubMenuClick('reporting'),
      children: [
        {
          key: '/reporting/reports',
          icon: <BarChartOutlined />,
          label: <span data-path="/reporting/reports">Report config editor</span>,
          title: 'Report config editor',
        },
        {
          key: '/reporting/reports/stream',
          icon: <LineChartOutlined />,
          label: <span data-path="/reporting/reports/stream">Stream Reports</span>,
          title: 'Stream Reports',
        },
        {
          key: '/reporting/catalogue-of-aliases',
          icon: <TagsOutlined />,
          label: <span data-path="/reporting/catalogue-of-aliases">Catalog of aliases</span>,
          title: 'Catalog of aliases',
        },
      ],
    }] : []),
```

- [ ] **Step 3: Update the Tasks gate**

In the same file find:

```tsx
    // Tasks - conditionally shown based on feature flag
    ...(isTasksEnabled ? [{
```

Replace `isTasksEnabled` with `isTasksAvailable` (the comment already accurately describes the new gate):

```tsx
    // Tasks - hidden under cyoda-go and gated by VITE_FEATURE_FLAG_TASKS
    ...(isTasksAvailable ? [{
```

- [ ] **Step 4: Gate the Processing menu entry**

In the same file find:

```tsx
    {
      key: '/processing-ui',
      icon: <ClusterOutlined />,
      label: <span data-path="/processing-ui">Processing</span>,
      title: 'Processing',
    },
```

Replace it with the conditional-spread form:

```tsx
    // Processing - hidden under cyoda-go (uses /platform-processing endpoints)
    ...(isProcessingManagerAvailable ? [{
      key: '/processing-ui',
      icon: <ClusterOutlined />,
      label: <span data-path="/processing-ui">Processing</span>,
      title: 'Processing',
    }] : []),
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
pnpm --filter @cyoda/saas-app exec vitest run src/components/__tests__/LeftSideMenu.test.tsx
```

Expected: every test in the file passes (both the new "Cyoda-Go feature gating" suite and all pre-existing tests).

- [ ] **Step 6: Commit**

```bash
git add apps/saas-app/src/components/LeftSideMenu.tsx \
        apps/saas-app/src/components/__tests__/LeftSideMenu.test.tsx
git commit -m "feat(saas-app): gate Reporting/Tasks/Processing menu items under cyoda-go"
```

---

## SaaS App — Route Gating

### Task 10: Apply the gates in `routes/index.tsx`

**Files:**
- Modify: `apps/saas-app/src/routes/index.tsx`

There is no existing route-level test in this app, so this task is structural and verified by `tsc --noEmit` plus a manual smoke test in the next task.

- [ ] **Step 1: Replace the flag reads**

In `apps/saas-app/src/routes/index.tsx`, locate:

```tsx
  const isTrinoEnabled = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
  const isTasksEnabled = HelperFeatureFlags.isTasksEnabled();
```

Replace with:

```tsx
  const isTrinoEnabled = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
  const isTasksAvailable = HelperFeatureFlags.isTasksAvailable();
  const isReportingAvailable = HelperFeatureFlags.isReportingAvailable();
  const isProcessingManagerAvailable = HelperFeatureFlags.isProcessingManagerAvailable();
```

- [ ] **Step 2: Gate the Reporting routes**

Locate the Reporting block (currently unconditional):

```tsx
        {/* Reporting */}
        <Route path="reporting/reports" element={<Reports />} />
        <Route path="reporting/report-editor/:id" element={<ReportEditor />} />
        <Route path="reporting/reports/stream" element={<ReportConfigsStream />} />
        <Route path="reporting/reports/stream/:id" element={<ReportEditorStream />} />
        <Route path="reporting/catalogue-of-aliases" element={<CatalogueOfAliases />} />
```

Wrap it in `{isReportingAvailable && ( ... )}`:

```tsx
        {/* Reporting - hidden under cyoda-go (uses /platform-* endpoints) */}
        {isReportingAvailable && (
          <>
            <Route path="reporting/reports" element={<Reports />} />
            <Route path="reporting/report-editor/:id" element={<ReportEditor />} />
            <Route path="reporting/reports/stream" element={<ReportConfigsStream />} />
            <Route path="reporting/reports/stream/:id" element={<ReportEditorStream />} />
            <Route path="reporting/catalogue-of-aliases" element={<CatalogueOfAliases />} />
          </>
        )}
```

- [ ] **Step 3: Update the Tasks gate**

Locate:

```tsx
        {/* Tasks - conditionally rendered based on feature flag */}
        {isTasksEnabled && (
```

Replace with:

```tsx
        {/* Tasks - hidden under cyoda-go and gated by VITE_FEATURE_FLAG_TASKS */}
        {isTasksAvailable && (
```

- [ ] **Step 4: Gate the Processing-Manager routes**

Locate the Processing block (currently unconditional):

```tsx
        {/* Processing Manager */}
        <Route path="processing" element={<Navigate to="/processing-ui" replace />} />
        <Route path="processing-ui" element={<ProcessingHome />} />
        <Route path="processing-ui/nodes" element={<ProcessingNodes />} />
        <Route path="processing-ui/nodes/:name" element={<ProcessingNodesDetail />} />
        <Route path="processing-ui/nodes/:name/transaction/:transactionId" element={<TransactionDetail />} />
        <Route path="processing-ui/nodes/:name/versions" element={<TransitionVersions />} />
        <Route path="processing-ui/nodes/:name/changes" element={<TransitionChanges />} />
        <Route path="processing-ui/nodes/:name/entity-state-machine" element={<TransitionEntityStateMachine />} />
        <Route path="processing-ui/nodes/:name/event-view" element={<EventView />} />
```

Wrap it in `{isProcessingManagerAvailable && ( ... )}`:

```tsx
        {/* Processing Manager - hidden under cyoda-go (uses /platform-processing endpoints) */}
        {isProcessingManagerAvailable && (
          <>
            <Route path="processing" element={<Navigate to="/processing-ui" replace />} />
            <Route path="processing-ui" element={<ProcessingHome />} />
            <Route path="processing-ui/nodes" element={<ProcessingNodes />} />
            <Route path="processing-ui/nodes/:name" element={<ProcessingNodesDetail />} />
            <Route path="processing-ui/nodes/:name/transaction/:transactionId" element={<TransactionDetail />} />
            <Route path="processing-ui/nodes/:name/versions" element={<TransitionVersions />} />
            <Route path="processing-ui/nodes/:name/changes" element={<TransitionChanges />} />
            <Route path="processing-ui/nodes/:name/entity-state-machine" element={<TransitionEntityStateMachine />} />
            <Route path="processing-ui/nodes/:name/event-view" element={<EventView />} />
          </>
        )}
```

- [ ] **Step 5: Type-check**

```bash
pnpm --filter @cyoda/saas-app type-check
```

Expected: no type errors.

- [ ] **Step 6: Commit**

```bash
git add apps/saas-app/src/routes/index.tsx
git commit -m "feat(saas-app): unregister Reporting/Tasks/Processing routes under cyoda-go"
```

---

## Documentation

### Task 11: Add `VITE_FEATURE_FLAG_IS_CYODA_GO` to `apps/saas-app/.env.template`

**Files:**
- Modify: `apps/saas-app/.env.template`

- [ ] **Step 1: Update the file**

In `apps/saas-app/.env.template`, locate the existing line:

```bash
VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true
```

Insert directly **after** it:

```bash

# Enable Cyoda-Go mode
# Cyoda-Go is a digital twin of Cyoda Cloud that does NOT expose any of the
# legacy /platform-* endpoints. When this flag is true:
#   - VITE_FEATURE_FLAG_IS_CYODA_CLOUD is implicitly true (enforced in code).
#   - Only the Trino, Lifecycle (Workflows + Instances), and Entity Viewer
#     menu items are visible. Reporting, Tasks, and Processing-Manager are
#     hidden because their endpoints do not exist on cyoda-go.
# Default: false
# VITE_FEATURE_FLAG_IS_CYODA_GO=false
```

- [ ] **Step 2: Commit**

```bash
git add apps/saas-app/.env.template
git commit -m "docs(saas-app): document VITE_FEATURE_FLAG_IS_CYODA_GO in env template"
```

### Task 12: Add `VITE_FEATURE_FLAG_IS_CYODA_GO` to root `.env.template`

**Files:**
- Modify: `.env.template`

- [ ] **Step 1: Update the file**

In `/Users/paul/dev/cyoda-env-dashboard/.env.template`, locate the existing block:

```bash
# Enable Cyoda Cloud mode
# When enabled, uses Cyoda Cloud API endpoints:
# - /model/export/SIMPLE_VIEW/{entityName}/{modelVersion} for entity models
# - /entity/{entityId} for entity data
VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true
```

Insert directly **after** it:

```bash

# Enable Cyoda-Go mode
# Cyoda-Go is a digital twin of Cyoda Cloud that does NOT expose any of the
# legacy /platform-* endpoints. Implies VITE_FEATURE_FLAG_IS_CYODA_CLOUD=true.
# Hides Reporting, Tasks, and Processing-Manager from the menu.
# VITE_FEATURE_FLAG_IS_CYODA_GO=false
```

- [ ] **Step 2: Commit**

```bash
git add .env.template
git commit -m "docs: document VITE_FEATURE_FLAG_IS_CYODA_GO in root env template"
```

### Task 13: Update `ENV_FILES_GUIDE.md`

**Files:**
- Modify: `ENV_FILES_GUIDE.md`

- [ ] **Step 1: Add a feature-flag reference section**

In `/Users/paul/dev/cyoda-env-dashboard/ENV_FILES_GUIDE.md`, locate the existing line that ends the "Scenario 4" example block (the `npm run dev -w packages/tableau-react` line). Find the line:

```markdown
npm run dev -w packages/tableau-react
```

…and the closing triple backticks two lines below it. After the closing fence and the blank line, **before** the `---` divider, insert:

```markdown

### Scenario 5: I'm running against a Cyoda-Go backend

Cyoda-Go is a digital twin of Cyoda Cloud that does **not** expose the legacy `/platform-*` endpoints. To enable cyoda-go mode in the SaaS app:

**Edit:** `apps/saas-app/.env.development.local`

```bash
VITE_FEATURE_FLAG_IS_CYODA_GO=true
```

When this flag is set:

- `VITE_FEATURE_FLAG_IS_CYODA_CLOUD` is implicitly `true` — you do **not** need to set both. The `HelperFeatureFlags.isCyodaCloud()` helper enforces the implication in code, so a misconfigured `.env` with only `IS_CYODA_GO=true` still produces correct cloud behavior.
- The menu shows only **Trino**, **Lifecycle** (Workflows + Instances), and **Entity Viewer**. Reporting, Tasks, and Processing-Manager are hidden because their endpoints do not exist on cyoda-go.
- `VITE_APP_BASE_URL` should point at your cyoda-go instance.
```

- [ ] **Step 2: Commit**

```bash
git add ENV_FILES_GUIDE.md
git commit -m "docs: explain VITE_FEATURE_FLAG_IS_CYODA_GO in ENV_FILES_GUIDE"
```

---

## Verification and Handoff

### Task 14: Full verification

**Files:** none modified

- [ ] **Step 1: Run the affected packages' tests**

```bash
pnpm --filter @cyoda/http-api-react test:run
pnpm --filter @cyoda/saas-app test:run
```

Expected: every test passes in both packages. If you observe a pre-existing failure that is unrelated to anything in this plan (i.e., the same failure reproduces on the unmodified `main` branch), do **not** silently fix it — record it in the PR description as a known pre-existing issue and continue.

- [ ] **Step 2: Run type-check across the workspaces**

```bash
pnpm type-check
```

Expected: no type errors anywhere.

- [ ] **Step 3: Run lint across the workspaces**

```bash
pnpm lint
```

Expected: no new lint errors. If the existing baseline has unrelated warnings, do not "fix" them — flag in the PR description.

- [ ] **Step 4: Manual smoke test — legacy mode (no flag set)**

```bash
pnpm --filter @cyoda/saas-app dev
```

Open the app at `http://localhost:5173` (or whichever port Vite reports). Expected sidebar: Trino SQL schemas, Reporting, Lifecycle, Entity Model Viewer, Processing (Tasks visible only if `VITE_FEATURE_FLAG_TASKS=true` is also set). Stop the dev server (`Ctrl-C`).

- [ ] **Step 5: Manual smoke test — cyoda-go mode**

Create or edit `apps/saas-app/.env.development.local` (file is gitignored — do not commit) and add:

```bash
VITE_FEATURE_FLAG_IS_CYODA_GO=true
VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA=true
```

Then:

```bash
pnpm --filter @cyoda/saas-app dev
```

Expected sidebar: Trino SQL schemas, Lifecycle, Entity Model Viewer (no Reporting, no Tasks, no Processing). Visit `http://localhost:5173/reporting/reports` directly in the browser; expected: redirected to `/workflows` by the catch-all. Stop the dev server. Revert your `.env.development.local` if you don't want to keep the flag locally.

- [ ] **Step 6: Confirm git status is clean other than untracked unrelated files**

```bash
git status
```

Expected: no modified or staged files from this plan; the unrelated `docs/cyoda-cloud/api/*` modifications from before this plan started may still appear and must be left alone.

### Task 15: Push and open the sub-branch PR

**Files:** none

- [ ] **Step 1: Push the sub-branch**

```bash
git push -u origin feature/cyoda-go-support/foundation
```

- [ ] **Step 2: Open the PR against the feature branch (not against main)**

```bash
gh pr create \
  --base feature/cyoda-go-support \
  --title "Foundation: VITE_FEATURE_FLAG_IS_CYODA_GO and feature gating" \
  --body "$(cat <<'EOF'
## Summary

- Adds `VITE_FEATURE_FLAG_IS_CYODA_GO` (build-time flag).
- Adds `HelperFeatureFlags.isCyodaGo()`, `isReportingAvailable()`, `isTasksAvailable()`, `isProcessingManagerAvailable()`.
- Changes `HelperFeatureFlags.isCyodaCloud()` so that `IS_CYODA_GO=true` implies `IS_CYODA_CLOUD=true` in code (cannot be broken by misconfigured `.env`).
- Hides Reporting, Tasks, and Processing-Manager from the menu and unregisters their routes when `IS_CYODA_GO=true`. The existing catch-all route redirects pasted URLs to `/workflows`.
- Documents the new flag in `apps/saas-app/.env.template`, root `.env.template`, and `ENV_FILES_GUIDE.md`.

No workflow / Instances / Vite-proxy changes here — those are separate sub-branches per the spec.

## Spec

- Design: `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md`
- Sections covered: §2 (scope), §3 (feature-flag mechanics), §6.1 (menu), §6.2 (routes), §9.2 sub-branch 1.

## Test plan

- [ ] `pnpm --filter @cyoda/http-api-react test:run` — green
- [ ] `pnpm --filter @cyoda/saas-app test:run` — green
- [ ] `pnpm type-check` — green
- [ ] `pnpm lint` — no new errors
- [ ] Manual smoke (legacy mode): all menu items visible as today
- [ ] Manual smoke (cyoda-go mode): only Trino, Lifecycle, Entity Viewer visible; pasted `/reporting/reports` URL redirects to `/workflows`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR created with base `feature/cyoda-go-support`. Returned URL is what you share for review.

---

## Done

When the PR is merged into `feature/cyoda-go-support`, this sub-branch is complete. The next sub-branch (`feature/cyoda-go-support/workflow-gateway`) gets its own plan written when ready.
