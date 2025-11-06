# Vue to React Migration Plan for .old_project

## Executive Summary

This document outlines a comprehensive plan to migrate the existing Vue 3 monorepo application (`.old_project`) to React. The current project is a complex enterprise application with multiple packages using Vue 3, Vite, TypeScript, Pinia, and Element Plus.

---

## Current State Analysis

### Technology Stack (Vue)
- **Framework**: Vue 3.5.13
- **Build Tool**: Vite 6.0.11
- **Language**: TypeScript 5.7.3
- **State Management**: Pinia 2.3.1
- **Routing**: Vue Router 4.5.0
- **UI Library**: Element Plus 2.9.3
- **Testing**: Vitest 3.0.3, Cypress 14.0.0
- **Package Manager**: Yarn 4.6.0 (workspaces)

### Project Structure
```
.old_project/
├── packages/
│   ├── cobi/                    # Main application package
│   ├── cyoda-sass/              # SaaS package
│   ├── cyoda-ui-lib/            # Shared UI library
│   ├── http-api/                # HTTP API package
│   ├── processing-manager/      # Processing manager
│   ├── source-configuration/    # Source configuration
│   ├── statemachine/            # State machine
│   ├── tasks/                   # Tasks module
│   ├── tableau/                 # Tableau integration
│   └── cli/                     # CLI tools
├── package.json                 # Root workspace config
└── yarn.lock
```

### Key Dependencies to Migrate
- **Vue 3** → **React 18**
- **Pinia** → **Redux Toolkit / Zustand / React Context**
- **Vue Router** → **React Router v6**
- **Element Plus** → **Ant Design / Material-UI / Chakra UI**
- **@vueuse/core** → **react-use / usehooks-ts**
- **Portal Vue** → **React Portals (built-in)**

---

## Migration Strategy

### Approach: Incremental Migration (Recommended)

We recommend an **incremental, package-by-package migration** rather than a big-bang rewrite:

1. **Phase 1**: Setup & Infrastructure (Weeks 1-2)
2. **Phase 2**: Shared Libraries Migration (Weeks 3-4)
3. **Phase 3**: Individual Package Migration (Weeks 5-12)
4. **Phase 4**: Testing & Quality Assurance (Weeks 13-14)
5. **Phase 5**: Deployment & Cutover (Week 15)

---

## Phase 1: Setup & Infrastructure (Weeks 1-2)

### 1.1 Create New React Monorepo Structure

```bash
# Create new directory structure
mkdir react-project
cd react-project

# Initialize with modern monorepo tool
npm create vite@latest
# or use Turborepo/Nx for better monorepo support
npx create-turbo@latest
```

### 1.2 Setup Package Manager & Workspaces

**Option A: Keep Yarn Workspaces**
```json
// package.json
{
  "name": "cyoda-ui-react",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "packageManager": "yarn@4.6.0"
}
```

**Option B: Use pnpm (Recommended for React)**
```bash
pnpm init
# Configure pnpm-workspace.yaml
```

### 1.3 Setup Build Tools

- **Vite** (keep existing, works great with React)
- **TypeScript** (keep existing configuration)
- **ESLint** (update for React rules)
- **Prettier** (keep existing)

### 1.4 Target Technology Stack (React)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "@reduxjs/toolkit": "^2.2.7",
    "react-redux": "^9.1.2",
    "antd": "^5.20.0",
    "axios": "^1.7.9",
    "@tanstack/react-query": "^5.51.0",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "vitest": "^2.0.5",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.8",
    "typescript": "^5.5.4"
  }
}
```

---

## Phase 2: Shared Libraries Migration (Weeks 3-4)

### 2.1 Migrate `cyoda-ui-lib` Package

**Priority**: HIGH (used by all other packages)

#### Steps:
1. **Create React UI Library Package**
   ```bash
   cd packages
   npm create vite@latest ui-lib-react -- --template react-ts
   ```

2. **Component Migration Mapping**
   - Identify all shared Vue components
   - Create React equivalents
   - Maintain same props interface where possible

3. **Utility Functions**
   - Most utilities can be copied as-is (pure JS/TS)
   - Update any Vue-specific helpers

4. **Styling**
   - Keep SCSS files (Vite supports them)
   - Consider CSS Modules or styled-components
   - Migrate from Vue scoped styles to React patterns

#### Example Component Migration:

**Vue Component (Before)**
```vue
<template>
  <div class="cyoda-button" @click="handleClick">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary'
}>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>
```

**React Component (After)**
```tsx
import React from 'react'
import './CyodaButton.scss'

interface CyodaButtonProps {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children: React.ReactNode
}

export const CyodaButton: React.FC<CyodaButtonProps> = ({
  variant = 'primary',
  onClick,
  children
}) => {
  return (
    <div className="cyoda-button" onClick={onClick}>
      {children}
    </div>
  )
}
```

### 2.2 Migrate HTTP API Package

1. **Keep Axios** (framework-agnostic)
2. **Replace Vue plugins** with React hooks
3. **Implement React Query** for data fetching
4. **Create custom hooks** for API calls

---

## Phase 3: Individual Package Migration (Weeks 5-12)

### Migration Order (by dependency):

1. **Week 5-6**: `cli` package (least dependent)
2. **Week 7**: `tableau` package
3. **Week 8**: `tasks` package
4. **Week 9**: `statemachine` package
5. **Week 10**: `source-configuration` package
6. **Week 11**: `processing-manager` package
7. **Week 12**: `cobi` & `cyoda-sass` (main applications)

### 3.1 Per-Package Migration Checklist

For each package:

- [ ] Create new React package structure
- [ ] Setup Vite config for React
- [ ] Migrate routing (Vue Router → React Router)
- [ ] Migrate state management (Pinia → Redux/Zustand)
- [ ] Convert all `.vue` files to `.tsx` files
- [ ] Migrate layouts and templates
- [ ] Update imports and dependencies
- [ ] Migrate tests (Vitest works with React)
- [ ] Update build scripts
- [ ] Test package independently

### 3.2 State Management Migration

**Option A: Redux Toolkit (Recommended for complex state)**
```tsx
// store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  name: string
  email: string
}

const userSlice = createSlice({
  name: 'user',
  initialState: { name: '', email: '' } as UserState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.name = action.payload.name
      state.email = action.payload.email
    }
  }
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
```

**Option B: Zustand (Simpler, similar to Pinia)**
```tsx
import { create } from 'zustand'

interface UserStore {
  name: string
  email: string
  setUser: (name: string, email: string) => void
}

export const useUserStore = create<UserStore>((set) => ({
  name: '',
  email: '',
  setUser: (name, email) => set({ name, email })
}))
```

### 3.3 Router Migration

**Vue Router (Before)**
```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/tasks', component: Tasks }
  ]
})
```

**React Router (After)**
```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/tasks', element: <Tasks /> }
])

function App() {
  return <RouterProvider router={router} />
}
```

---

## Phase 4: Testing & Quality Assurance (Weeks 13-14)

### 4.1 Testing Strategy

1. **Unit Tests**: Migrate Vitest tests
   ```tsx
   import { render, screen } from '@testing-library/react'
   import { CyodaButton } from './CyodaButton'
   
   test('renders button', () => {
     render(<CyodaButton>Click me</CyodaButton>)
     expect(screen.getByText('Click me')).toBeInTheDocument()
   })
   ```

2. **Integration Tests**: Update Cypress tests for React
3. **E2E Tests**: Minimal changes needed (Cypress works with both)

### 4.2 Quality Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Code coverage > 80%
- [ ] No console errors/warnings
- [ ] Bundle size analysis

---

## Phase 5: Deployment & Cutover (Week 15)

### 5.1 Deployment Strategy

1. **Parallel Deployment**: Run Vue and React versions side-by-side
2. **Feature Flags**: Gradually route users to React version
3. **Monitoring**: Track errors, performance metrics
4. **Rollback Plan**: Keep Vue version ready

### 5.2 Post-Migration Tasks

- [ ] Update documentation
- [ ] Train team on React patterns
- [ ] Archive Vue codebase
- [ ] Update CI/CD pipelines
- [ ] Monitor production metrics

---

## Key Considerations & Risks

### Technical Challenges

1. **Element Plus → Ant Design/MUI**: UI library migration requires careful component mapping
2. **Pinia → Redux/Zustand**: State management patterns differ significantly
3. **Vue Directives**: No direct React equivalent (v-if, v-for, v-model)
4. **Scoped Styles**: Need to adopt CSS Modules or styled-components
5. **Portal Vue**: React Portals work differently

### Risk Mitigation

- **Incremental Migration**: Reduces risk of big-bang failure
- **Automated Testing**: Catch regressions early
- **Code Reviews**: Ensure React best practices
- **Parallel Running**: Allows quick rollback
- **Documentation**: Keep migration notes for team

---

## Resource Requirements

### Team
- 2-3 Senior React Developers
- 1 DevOps Engineer
- 1 QA Engineer
- 1 Project Manager

### Timeline
- **Total Duration**: 15 weeks (3.5 months)
- **Effort**: ~800-1000 developer hours

### Tools & Services
- Vite (existing)
- React DevTools
- Redux DevTools
- Storybook (for component library)
- Chromatic (visual regression testing)

---

## Success Metrics

1. **Functionality**: 100% feature parity with Vue version
2. **Performance**: Load time ≤ Vue version
3. **Bundle Size**: ≤ 10% increase from Vue version
4. **Test Coverage**: ≥ 80%
5. **Zero Critical Bugs**: In first month post-launch

---

## Next Steps

1. **Week 0**: Review and approve this plan
2. **Week 1**: Setup development environment
3. **Week 2**: Create proof-of-concept for one small package
4. **Week 3**: Begin shared library migration
5. **Weekly**: Status meetings and progress reviews

---

## Appendix

### A. Useful Migration Tools

- **vue-to-react**: Automated component converter (use with caution)
- **codemod**: For automated code transformations
- **Storybook**: For component development and testing

### B. Learning Resources

- React Official Docs: https://react.dev
- React Router: https://reactrouter.com
- Redux Toolkit: https://redux-toolkit.js.org
- Ant Design: https://ant.design

### C. Alternative Approaches

**Option: Micro-Frontend Architecture**
- Keep some packages in Vue
- Use Module Federation to combine Vue + React
- Gradual migration over longer timeline

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-08  
**Author**: Migration Planning Team

