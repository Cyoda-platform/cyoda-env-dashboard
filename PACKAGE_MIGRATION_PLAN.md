# Individual Package Migration Plan

**Date**: 2025-10-10  
**Status**: 🟡 In Progress  
**Current Phase**: Phase 3 - Individual Package Migration

---

## Package Dependency Analysis

Based on the package.json analysis, here's the dependency tree:

```
cli (independent - CLI tools only)
  └─ No Vue dependencies

http-api (foundational)
  ├─ @cyoda/cobi
  ├─ @cyoda/ui-lib
  └─ Vue 3, Element Plus, Vue Router

tasks
  ├─ @cyoda/http-api
  ├─ @cyoda/ui-lib
  └─ Vue 3, Element Plus, Vue Router

statemachine (similar to tasks)
  ├─ @cyoda/http-api
  ├─ @cyoda/ui-lib
  └─ Vue 3, Element Plus, Vue Router

source-configuration
  ├─ @cyoda/http-api
  ├─ @cyoda/ui-lib
  └─ Vue 3, Element Plus, Vue Router

processing-manager
  ├─ @cyoda/http-api
  ├─ @cyoda/ui-lib
  └─ Vue 3, Element Plus, Vue Router

tableau
  ├─ @cyoda/http-api
  ├─ @cyoda/ui-lib
  └─ Vue 3, Element Plus, Vue Router

cobi (main app)
  ├─ @cyoda/http-api
  ├─ @cyoda/ui-lib
  └─ Vue 3, Element Plus, Vue Router

cyoda-sass (main SaaS app)
  ├─ @cyoda/http-api
  ├─ @cyoda/ui-lib
  └─ Vue 3, Element Plus, Vue Router
```

---

## Migration Order (Revised)

### Phase 3.1: Foundation Layer (Week 1-2)
**Priority**: 🔴 Critical

1. **@cyoda/http-api-react** (NEW)
   - Migrate HTTP API utilities
   - Create React hooks for API calls
   - Implement React Query for data fetching
   - No Vue components (pure TypeScript/API layer)
   - **Estimated Time**: 3-5 days

### Phase 3.2: CLI Package (Week 2)
**Priority**: 🟢 Low (Independent)

2. **@cyoda/cli** 
   - Already framework-agnostic (Node.js CLI)
   - No migration needed (works with both Vue and React)
   - May need minor updates to support React project structure
   - **Estimated Time**: 1-2 days

### Phase 3.3: Feature Packages (Week 3-6)
**Priority**: 🟠 High

3. **@cyoda/tasks-react**
   - Migrate Tasks module
   - Convert Vue components to React
   - Migrate Pinia stores to Zustand/Redux
   - Update routing to React Router
   - **Estimated Time**: 5-7 days

4. **@cyoda/statemachine-react**
   - Migrate State Machine module
   - Complex state management migration
   - Graphical components migration
   - **Estimated Time**: 5-7 days

5. **@cyoda/tableau-react**
   - Migrate Tableau integration
   - Chart components migration
   - **Estimated Time**: 3-5 days

6. **@cyoda/source-configuration-react**
   - Migrate Source Configuration module
   - Form-heavy components
   - **Estimated Time**: 5-7 days

7. **@cyoda/processing-manager-react**
   - Migrate Processing Manager
   - Complex workflows
   - **Estimated Time**: 5-7 days

### Phase 3.4: Main Applications (Week 7-8)
**Priority**: 🔴 Critical

8. **@cyoda/cobi-react**
   - Main application migration
   - Integrate all migrated packages
   - **Estimated Time**: 7-10 days

9. **@cyoda/cyoda-sass-react**
   - SaaS application migration
   - Final integration
   - **Estimated Time**: 7-10 days

---

## Package Migration Template

For each package, follow this checklist:

### 1. Setup Phase
- [ ] Create new React package directory
- [ ] Setup package.json with React dependencies
- [ ] Configure Vite for React
- [ ] Setup TypeScript configuration
- [ ] Configure testing (Vitest + React Testing Library)
- [ ] Setup routing (React Router v6)
- [ ] Setup state management (Zustand/Redux Toolkit)

### 2. Migration Phase
- [ ] Analyze package structure
- [ ] Identify all Vue components
- [ ] Create migration mapping document
- [ ] Migrate utilities and helpers (framework-agnostic)
- [ ] Migrate API calls to React hooks
- [ ] Convert Vue components to React components
- [ ] Migrate Pinia stores to Zustand/Redux
- [ ] Migrate Vue Router to React Router
- [ ] Update all imports and dependencies

### 3. Testing Phase
- [ ] Write unit tests for components
- [ ] Write integration tests
- [ ] Test API integrations
- [ ] Test routing
- [ ] Test state management
- [ ] E2E testing (Cypress/Playwright)

### 4. Integration Phase
- [ ] Update dependencies in other packages
- [ ] Test package in isolation
- [ ] Test package with dependent packages
- [ ] Update documentation
- [ ] Update build scripts

---

## Next Immediate Steps

### Step 1: Migrate @cyoda/http-api-react (CURRENT)

This is the foundational package that all other packages depend on. It contains:
- HTTP client configuration (Axios)
- API endpoints and services
- Request/Response interceptors
- Authentication utilities
- Error handling
- Type definitions

**Migration Strategy**:
1. Create `@cyoda/http-api-react` package
2. Copy framework-agnostic utilities (Axios config, types, etc.)
3. Create React hooks for API calls
4. Implement React Query for data fetching and caching
5. Create custom hooks for common API patterns
6. Write comprehensive tests

**Key Changes**:
- Vue plugins → React hooks
- Pinia stores → React Query cache
- Vue composables → Custom React hooks
- Element Plus utilities → Ant Design utilities (where needed)

---

## Technology Stack for React Packages

### Core
- **React**: 18.3.1
- **TypeScript**: 5.7.3
- **Vite**: 6.0.11

### Routing
- **React Router**: 7.9.4

### State Management
- **Zustand**: 5.0.2 (recommended - similar to Pinia)
- **Redux Toolkit**: 2.5.0 (for complex state)
- **React Query**: 5.62.11 (for server state)

### UI Components
- **Ant Design**: 5.20.0 (already using in ui-lib-react)

### HTTP Client
- **Axios**: 1.7.9 (keep existing)
- **React Query**: For data fetching

### Testing
- **Vitest**: 3.2.4
- **React Testing Library**: 16.0.0
- **Cypress**: 14.0.0 (E2E)

### Build Tools
- **Vite**: 6.0.11
- **TypeScript**: 5.7.3

---

## Success Criteria

For each package migration to be considered complete:

1. ✅ All components migrated and functional
2. ✅ All tests passing (unit + integration)
3. ✅ No Vue dependencies remaining
4. ✅ TypeScript compilation successful
5. ✅ Build process working
6. ✅ Documentation updated
7. ✅ Peer review completed
8. ✅ Integration tests with dependent packages passing

---

**Last Updated**: 2025-10-10  
**Next Review**: After http-api-react migration

