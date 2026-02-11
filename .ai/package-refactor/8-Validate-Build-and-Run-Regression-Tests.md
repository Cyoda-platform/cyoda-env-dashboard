# Actionable Step: Validate Build and Run Regression Tests

**Objective:** Ensure the refactored codebase maintains the same functionality as the baseline established in Step 2.

**Prerequisites:** Step 7 (Update saas-app) must be complete.

**Action Items:**

1. Run full monorepo build:
   ```bash
   yarn build
   ```
   - Compare build output with baseline
   - Ensure all packages build successfully

2. Run all unit tests:
   ```bash
   yarn test:run
   ```
   - Compare test results with baseline from Step 2
   - Investigate any new failures
   - Ensure test count is same or higher (no tests lost)

3. Run type checking:
   ```bash
   yarn type-check
   ```
   - Ensure no new type errors introduced

4. Run e2e tests for saas-app:
   ```bash
   yarn test:e2e
   ```
   - Compare with baseline e2e results
   - Investigate any new failures

5. Run package-specific tests:
   ```bash
   yarn workspace @cyoda/tableau-react test
   yarn workspace @cyoda/statemachine-react test
   yarn workspace @cyoda/processing-manager-react test
   yarn workspace @cyoda/tasks-react test
   ```

6. Manual smoke test of saas-app:
   - Login flow
   - Navigate to each major feature
   - Perform basic CRUD operations
   - Check for visual regressions

7. Document any differences from baseline:
   - New passing tests (improvements)
   - New failing tests (regressions to fix)
   - Build time changes

**Acceptance Criteria:**
- [ ] `yarn build` passes for all packages
- [ ] Unit test pass rate >= baseline
- [ ] No new type errors
- [ ] E2E tests pass rate >= baseline
- [ ] Manual smoke test passes
- [ ] Any regressions identified and fixed

