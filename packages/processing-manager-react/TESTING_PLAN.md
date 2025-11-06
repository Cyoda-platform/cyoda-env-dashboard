# Processing Manager - Testing Plan (Phase 6)

**Package**: @cyoda/processing-manager-react  
**Date**: 2025-10-14  
**Status**: 🔄 In Progress

---

## 🎯 Testing Strategy

### Testing Pyramid
1. **Unit Tests** (70%) - Individual functions, hooks, utilities
2. **Component Tests** (20%) - React components with React Testing Library
3. **Integration Tests** (10%) - API integration, store integration

### Tools
- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **MSW** (Mock Service Worker) - API mocking
- **@testing-library/user-event** - User interaction simulation

---

## 📋 Test Coverage Goals

| Category | Target Coverage | Priority |
|----------|----------------|----------|
| Stores | 90% | High |
| Hooks | 85% | High |
| Components | 80% | Medium |
| Pages | 75% | Medium |
| Utils | 95% | High |

**Overall Target**: 80% coverage

---

## 🧪 Test Categories

### 1. Store Tests (5 stores)

#### appStore.test.ts
- ✅ Initial state
- ✅ sideBarToggle action
- ✅ sideBarMinimizeToggle action
- ✅ setNode action
- ✅ setBaseUrl action
- ✅ Persistence (localStorage)

#### processingStore.test.ts
- ✅ Initial state
- ✅ setNodes action
- ✅ setSelectedNode action
- ✅ setNodesProcessing action
- ✅ Computed nodes getter

#### sshStore.test.ts
- ✅ Initial state
- ✅ setSshConfig action
- ✅ setConnected action
- ✅ Persistence

#### grafanaStore.test.ts
- ✅ Initial state
- ✅ setCharts action
- ✅ addChart action
- ✅ removeChart action
- ✅ setSelectedChart action

---

### 2. Hook Tests (22+ hooks)

#### useProcessing.test.ts
**Query Hooks**:
- ✅ useClusterStats
- ✅ useSummary
- ✅ useProcessEventsStats
- ✅ useTransactions
- ✅ useTransaction
- ✅ useTransactionMembers
- ✅ useTransactionEvents
- ✅ useEntityVersions
- ✅ useEntityChanges
- ✅ useGrafanaDashboardByName
- ✅ useGrafanaPanelsByUid

**Mutation Hooks**:
- ✅ useForceMarkProcessed
- ✅ useManualTransition

---

### 3. Component Tests (17 components)

#### Transaction Components
**TransactionMembersTable.test.tsx**:
- ✅ Renders table with data
- ✅ Filters by entity type
- ✅ Filters by operation
- ✅ Search functionality
- ✅ Pagination works
- ✅ Empty state

**TransactionEventsTable.test.tsx**:
- ✅ Renders events table
- ✅ Filters by event type
- ✅ Search functionality
- ✅ Opens modal on row click
- ✅ Displays JSON data
- ✅ Pagination

**TransactionStatistics.test.tsx**:
- ✅ Renders statistics cards
- ✅ Displays correct values
- ✅ Formats dates correctly
- ✅ Shows duration

#### Chart Components
**TimeCpuUsage.test.tsx**:
- ✅ Renders chart
- ✅ Accepts data prop
- ✅ Configures Chart.js correctly
- ✅ Time-based x-axis

**TimeDiskIO.test.tsx**:
- ✅ Renders dual-line chart
- ✅ Formats tick values (>= 1000)
- ✅ Two datasets rendered

**BarChartStacked.test.tsx**:
- ✅ Renders stacked bar chart
- ✅ Accepts resources prop
- ✅ Stacked configuration

#### Grafana Components
**GrafanaChart.test.tsx**:
- ✅ Renders iframe when data available
- ✅ Shows empty state when no node
- ✅ Builds correct Grafana URL
- ✅ Handles reset event
- ✅ Fetches dashboard and panels

**GrafanaChartResetButton.test.tsx**:
- ✅ Renders button
- ✅ Dispatches reset event
- ✅ Shows loading state

#### Node Components
**Node.test.tsx**:
- ✅ Renders node card
- ✅ Shows status indicator
- ✅ Displays node info
- ✅ Navigates on click
- ✅ Shows Grafana message

#### Shards Components
**ShardsDetailTabSummary.test.tsx**:
- ✅ Renders Grafana charts
- ✅ Extracts node/port/job from store
- ✅ Renders reset button

**ShardsDetailTabCassandra.test.tsx**:
- ✅ Renders 4 Grafana charts
- ✅ Shows service status
- ✅ Correct port (7070)

**ShardsDetailTabPmComponents.test.tsx**:
- ✅ Renders tabs
- ✅ Switches between tabs
- ✅ Shows placeholder content

#### Layout Components
**Sidebar.test.tsx**:
- ✅ Renders menu items
- ✅ Highlights active route
- ✅ Toggles minimize
- ✅ Shows logo

**Header.test.tsx**:
- ✅ Renders user email
- ✅ Logout button works
- ✅ Sidebar toggle works
- ✅ Shows breadcrumbs portal

**Footer.test.tsx**:
- ✅ Renders copyright
- ✅ Shows current year
- ✅ Renders links

**Layout.test.tsx**:
- ✅ Renders children
- ✅ Includes Sidebar, Header, Footer
- ✅ Updates baseUrl on node change

#### Utility Components
**ViewWrapper.test.tsx**:
- ✅ Renders children
- ✅ Applies correct className

---

### 4. Page Tests (9 pages)

**Home.test.tsx**:
- ✅ Renders nodes list
- ✅ Shows node count
- ✅ Uses ViewWrapper

**Nodes.test.tsx**:
- ✅ Renders page
- ✅ Fetches cluster stats

**NodesDetail.test.tsx**:
- ✅ Renders node details
- ✅ Shows tabs
- ✅ Fetches node data

**TransactionDetail.test.tsx**:
- ✅ Renders transaction info
- ✅ Shows tabs (Members, Events, Statistics)
- ✅ Fetches transaction data

**TransitionVersions.test.tsx**:
- ✅ Renders versions table
- ✅ Fetches entity versions
- ✅ Pagination works

**TransitionChanges.test.tsx**:
- ✅ Renders changes table
- ✅ Shows diff visualization
- ✅ Fetches entity changes

**TransitionEntityStateMachine.test.tsx**:
- ✅ Renders state machine
- ✅ Fetches state machine data

**EventView.test.tsx**:
- ✅ Renders events
- ✅ Fetches processing events

**Page404.test.tsx**:
- ✅ Renders 404 message
- ✅ Shows navigation link

---

## 🎯 Test Implementation Plan

### Phase 6.1: Store Tests (Day 1)
- [ ] Create test setup file
- [ ] Test appStore
- [ ] Test processingStore
- [ ] Test sshStore
- [ ] Test grafanaStore
- **Target**: 90% store coverage

### Phase 6.2: Hook Tests (Day 1-2)
- [ ] Setup MSW for API mocking
- [ ] Test query hooks
- [ ] Test mutation hooks
- **Target**: 85% hook coverage

### Phase 6.3: Component Tests - Part 1 (Day 2-3)
- [ ] Test Transaction components
- [ ] Test Chart components
- [ ] Test Grafana components
- **Target**: 80% component coverage

### Phase 6.4: Component Tests - Part 2 (Day 3-4)
- [ ] Test Node components
- [ ] Test Shards components
- [ ] Test Layout components
- [ ] Test Utility components
- **Target**: 80% component coverage

### Phase 6.5: Page Tests (Day 4-5)
- [ ] Test all 9 pages
- [ ] Integration scenarios
- **Target**: 75% page coverage

### Phase 6.6: Coverage Analysis (Day 5)
- [ ] Run coverage report
- [ ] Identify gaps
- [ ] Add missing tests
- **Target**: 80% overall coverage

---

## 📊 Success Criteria

- ✅ All tests passing (100% pass rate)
- ✅ 80%+ overall code coverage
- ✅ 90%+ store coverage
- ✅ 85%+ hook coverage
- ✅ 80%+ component coverage
- ✅ No critical bugs
- ✅ All edge cases covered

---

## 🚀 Next Steps

1. Start with Phase 6.1 (Store Tests)
2. Setup test infrastructure
3. Implement tests incrementally
4. Monitor coverage continuously
5. Fix any bugs discovered during testing

**Estimated Time**: 5 days  
**Start Date**: 2025-10-14  
**Target Completion**: 2025-10-18

