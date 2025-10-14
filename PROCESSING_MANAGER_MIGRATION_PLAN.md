# Processing Manager Migration Plan

**Package**: @cyoda/processing-manager-react
**Start Date**: 2025-10-13
**Status**: 🚀 Planning Complete - Ready to Start
**Estimated Time**: 5-7 days

---

## 📊 **Package Analysis**

### **Purpose**
Data processing and batch operations management system with:
- Node/shard monitoring
- Transaction tracking
- Performance metrics and charts
- Grafana integration
- SSH connectivity
- Processing statistics

### **Current Stack (Vue)**
- **Framework**: Vue 3.5.13
- **State**: Pinia stores
- **UI**: Element Plus
- **Charts**: Chart.js + vue-chartjs
- **Icons**: FontAwesome
- **Router**: Vue Router

### **Target Stack (React)**
- **Framework**: React 18.3.1
- **State**: Zustand + React Query
- **UI**: Ant Design
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Ant Design Icons + FontAwesome (if needed)
- **Router**: React Router v6

---

## 📦 **Package Structure**

### **Views/Pages** (11 pages)
1. ✅ Home.vue → Home.tsx
2. ✅ Login.vue → Login.tsx (use from ui-lib-react)
3. ✅ MenuPage.vue → MenuPage.tsx (use from ui-lib-react)
4. ✅ Page404.vue → Page404.tsx
5. ✅ Nodes.vue → Nodes.tsx
6. ✅ NodesDetail.vue → NodesDetail.tsx
7. ✅ TransactionDetail.vue → TransactionDetail.tsx
8. ✅ TransitionVersions.vue → TransitionVersions.tsx
9. ✅ TransitionChanges.vue → TransitionChanges.tsx
10. ✅ TransitionEntityStateMachine.vue → TransitionEntityStateMachine.tsx
11. ✅ EventView.vue → EventView.tsx

### **Components** (~40+ components)
**Charts**:
- PmTimeCpuUsage
- PmTimeDiskIO
- PmBarChartStacked

**Node Management**:
- PmNode
- PmSidebar
- PmHeader
- PmFooter

**Transaction Details**:
- TransitionDetailStatistics
- TransitionDetailStatisticsTransactionEvents
- TransitionDetailStatisticsTransactionMembers
- MembersFilter
- MembersTable
- EventsFilter
- EventsTable

**State Machine**:
- TransitionStateMachineTable
- TransitionStateMachineTimeLine
- TransitionStateMachineForm

**Versions**:
- TransitionVersionsAggregated
- TransitionVersionsFilter
- TransitionVersionsSorted

**Shards Detail**:
- PmShardsDetailTabPmComponents (multiple sub-components)
- PmShardsDetailTabPmComponentsClear
- PmShardsDetailTabPmComponentsExecutionQueuesInfo
- PmShardsDetailTabPmComponentsServiceProcessesView
- PmShardsDetailTabPmComponentsExecutionMonitors

**Grafana**:
- PmGrafanaChart
- PmGrafanaChartResetButton

**Other**:
- Pagination
- ViewWrapper
- ErrorViewActions
- PmBlogMainPage

### **Stores** (5 Pinia stores)
1. app.ts → useAppStore (Zustand)
2. processing.ts → useProcessingStore (Zustand)
3. ssh.ts → useSshStore (Zustand)
4. common.ts → useCommonStore (Zustand)
5. grafana.ts → useGrafanaStore (Zustand)

### **Routes** (11 routes)
1. / → /processing-ui (redirect)
2. /login
3. /processing-ui (Home)
4. /processing-ui/nodes (Nodes list)
5. /processing-ui/nodes/:name (Node detail)
6. /processing-ui/nodes/:name/transaction/:transactionId
7. /processing-ui/nodes/:name/versions
8. /processing-ui/nodes/:name/changes
9. /processing-ui/nodes/:name/entity-state-machine
10. /processing-ui/nodes/:name/event-view
11. /404

---

## 🎯 **Migration Strategy**

### **Phase 1: Setup & Foundation** (Day 1)
1. Create package structure
2. Setup package.json with dependencies
3. Configure TypeScript and Vite
4. Create basic App.tsx and routing
5. Setup layouts (use from ui-lib-react)

### **Phase 2: Stores Migration** (Day 1-2)
1. Convert Pinia stores to Zustand
2. Create React Query hooks for API calls
3. Setup store persistence (if needed)

### **Phase 3: Core Pages** (Day 2-3)
1. Home page
2. Nodes list page
3. Node detail page
4. Login (reuse from ui-lib-react)

### **Phase 4: Transaction Pages** (Day 3-4)
1. Transaction detail page
2. Transition versions page
3. Transition changes page
4. Entity state machine page
5. Event view page

### **Phase 5: Components Migration** (Day 4-6)
1. Chart components (Chart.js integration)
2. Node management components
3. Transaction detail components
4. Shards detail components
5. Grafana components
6. Utility components

### **Phase 6: Testing** (Day 6-7)
1. Unit tests for stores
2. Component tests
3. Integration tests
4. E2E tests (optional)

### **Phase 7: Polish & Documentation** (Day 7)
1. Fix any remaining issues
2. Add documentation
3. Create demo/examples
4. Final testing

---

## 📋 **Dependencies**

### **Required Packages**
```json
{
  "dependencies": {
    "@cyoda/ui-lib-react": "workspace:*",
    "@cyoda/http-api-react": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.1",
    "@tanstack/react-query": "^5.62.11",
    "zustand": "^5.0.2",
    "antd": "^5.22.6",
    "@ant-design/icons": "^5.5.2",
    "chart.js": "^4.4.7",
    "react-chartjs-2": "^5.3.0",
    "axios": "^1.7.9"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.0.11",
    "vitest": "^3.2.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1"
  }
}
```

---

## 🔄 **Key Migrations**

### **Pinia → Zustand**
```typescript
// Before (Pinia)
export const useProcessingStore = defineStore('processing', {
  state: () => ({
    nodes: [],
    loading: false
  }),
  actions: {
    async fetchNodes() {
      this.loading = true;
      // ...
    }
  }
});

// After (Zustand)
export const useProcessingStore = create<ProcessingState>((set) => ({
  nodes: [],
  loading: false,
  fetchNodes: async () => {
    set({ loading: true });
    // ...
  }
}));
```

### **Vue Router → React Router**
```typescript
// Before (Vue)
{
  path: '/processing-ui/nodes/:name',
  component: NodesDetail
}

// After (React)
{
  path: '/processing-ui/nodes/:name',
  element: <NodesDetail />
}
```

### **Chart.js Integration**
```typescript
// Before (vue-chartjs)
import { Line } from 'vue-chartjs';

// After (react-chartjs-2)
import { Line } from 'react-chartjs-2';
```

---

## ✅ **Success Criteria**

1. ✅ All 11 pages migrated and functional
2. ✅ All ~40 components migrated
3. ✅ All 5 stores converted to Zustand
4. ✅ All routes working
5. ✅ Charts rendering correctly
6. ✅ Grafana integration working
7. ✅ SSH connectivity working
8. ✅ 80%+ test coverage
9. ✅ No TypeScript errors
10. ✅ Performance comparable to Vue version

---

## 🚀 **Next Steps**

1. Create package structure
2. Setup dependencies
3. Start with Phase 1 (Setup & Foundation)
4. Migrate stores (Phase 2)
5. Migrate pages incrementally (Phases 3-4)
6. Migrate components (Phase 5)
7. Add tests (Phase 6)
8. Polish and document (Phase 7)

---

**Ready to start migration!** 🎉

