# Actionable Step: Update saas-app to Use Refactored Packages

**Objective:** Adjust the saas-app to work with the refactored package structure, ensuring no regression in functionality.

**Prerequisites:** Step 6 (Refactor Feature Packages) must be complete.

**Action Items:**

1. Review current saas-app imports:
   - `apps/saas-app/src/App.tsx`
   - `apps/saas-app/src/routes/index.tsx`
   - `apps/saas-app/src/components/*`
   - `apps/saas-app/src/pages/*`

2. Update imports to use new package exports:
   - If saas-app was importing internal paths, update to public API
   - Example: `@cyoda/ui-lib-react/src/components/X` → `@cyoda/ui-lib-react`

3. Verify all package dependencies in `apps/saas-app/package.json`:
   - Ensure workspace references are correct
   - Remove any unnecessary direct dependencies that packages provide

4. Update any local components that should use shared versions:
   - Check `apps/saas-app/src/components/ErrorBoundary.tsx`
   - Replace with import from `@cyoda/ui-lib-react` if appropriate

5. Run the saas-app development server:
   ```bash
   yarn dev:saas
   ```
   - Verify all routes load correctly
   - Check browser console for errors
   - Test navigation between features

6. Run saas-app build:
   ```bash
   yarn build:saas
   ```

7. Test each integrated feature in saas-app:
   - Tableau/Reports functionality
   - State Machine/Workflows functionality
   - Processing Manager functionality
   - Tasks functionality
   - Source Configuration functionality

**Acceptance Criteria:**
- [ ] All imports updated to use public package APIs
- [ ] `yarn dev:saas` runs without errors
- [ ] `yarn build:saas` completes successfully
- [ ] All features accessible and functional in the app
- [ ] No console errors related to missing imports
- [ ] No regression in existing functionality

