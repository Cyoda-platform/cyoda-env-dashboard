# Testing Plan for Newly Migrated Components

**Package**: @cyoda/processing-manager-react  
**Date**: 2025-10-14  
**Status**: 🔄 Ready to Test

---

## 📊 Current Test Status

**Test Results**: ✅ 219 passing | ❌ 1 failing  
**Test Files**: 18 passed | 1 failed (19 total)  
**Coverage**: To be measured

---

## 🎯 Testing Strategy for New Components

### Priority Levels
- **P0 (Critical)**: Components with user interactions, data mutations, complex logic
- **P1 (High)**: Components with data display, filtering, tables
- **P2 (Medium)**: Wrapper components, simple display components
- **P3 (Low)**: Static components, simple wrappers

---

## 📋 New Components to Test (91 Total)

### 1. Layout Components (Priority: P0)

#### ✅ Already Tested
- [x] Header.test.tsx (1 failing test - needs fix)
- [x] Footer.test.tsx (passing)
- [x] Sidebar.test.tsx (passing)

#### 🆕 New Components to Test
- [ ] **HeaderProxyRequest.tsx** (P0)
  - Test proxy toggle switch
  - Test localStorage persistence
  - Test window reload on change
  - Test popover info display

---

### 2. Processing Events Components (Priority: P1)

#### ✅ Already Tested
- [x] ProcessingEventsView.test.tsx
- [x] ProcessingEventsErrorView.test.tsx

#### 🆕 New Components to Test
- [ ] **ProcessingEventsEntitiesErrorListView.tsx** (P1)
  - Test filter integration
  - Test table data loading
  - Test loading states
  - Test error handling

- [ ] **ProcessingEventsEntitiesErrorListViewFilter.tsx** (P1)
  - Test entity class dropdown
  - Test initial filter emission
  - Test Load button functionality
  - Test entity options loading

- [ ] **ProcessingEventsEntitiesErrorListViewTable.tsx** (P1)
  - Test table rendering with data
  - Test action links (Versions, Changes, State Machine, Error Event)
  - Test sorting functionality
  - Test pagination
  - Test empty state

---

### 3. Transactions Components (Priority: P0)

#### ✅ Already Tested
- [x] TransactionsExecuting.test.tsx
- [x] TransactionsView.test.tsx
- [x] TransactionsEntities.test.tsx

#### 🆕 New Components to Test
- [ ] **TransactionsClear.tsx** (P0)
  - Test dropdown menu rendering
  - Test confirmation modal
  - Test hard reset consistency time mutation
  - Test success/cancel messages
  - Test loading states

---

### 4. Time Statistics Components (Priority: P1)

#### ✅ Already Tested
- [x] TimeStatisticsTimeStat.test.tsx
- [x] TimeStatisticsCountStat.test.tsx

#### 🆕 New Components to Test
- [ ] **TimeStatisticsClear.tsx** (P1)
  - Test dropdown with two options
  - Test "Clear time stats" confirmation
  - Test "Clear time stats (ALL nodes)" confirmation
  - Test mutation calls
  - Test onReload callback
  - Test success/cancel messages

---

### 5. PM Components (Priority: P1)

#### ✅ Already Tested
- [x] PmComponentsCyodaRunnableComponents.test.tsx
- [x] PmComponentsExecutionMonitors.test.tsx
- [x] PmComponentsServiceProcessesView.test.tsx

#### 🆕 New Components to Test
- [ ] **PmComponentsExecutionMonitorsFilter.tsx** (P1)
  - Test name input field
  - Test update interval input
  - Test default values
  - Test onChange emission on mount
  - Test Update button

- [ ] **PmComponentsExecutionMonitorsTable.tsx** (P1)
  - Test 9 columns rendering
  - Test boolean value rendering
  - Test data display
  - Test empty state

- [ ] **PmComponentsServiceProcessesViewReady.tsx** (P1)
  - Test 8 columns rendering
  - Test boolean rendering (Yes/No)
  - Test data display

- [ ] **PmComponentsServiceProcessesViewNoneReady.tsx** (P2)
  - Test 2 columns rendering
  - Test data display

---

### 6. Network Info Components (Priority: P2)

#### 🆕 New Components to Test
- [ ] **NetworkInfoServer.tsx** (P2)
  - Test wrapper component rendering
  - Test hook integration
  - Test props passing

- [ ] **NetworkClients.tsx** (P2)
  - Test wrapper component rendering
  - Test hook integration
  - Test props passing

---

### 7. ZooKeeper Info Components (Priority: P2)

#### 🆕 New Components to Test
- [ ] **CurrNodeInfo.tsx** (P2)
  - Test wrapper component rendering
  - Test default props
  - Test hook integration

- [ ] **LoadedOnlineNodes.tsx** (P2)
  - Test wrapper component rendering
  - Test default props
  - Test hook integration

- [ ] **LoadedShardsDistribution.tsx** (P2)
  - Test wrapper component rendering
  - Test default props
  - Test hook integration

---

### 8. Processing Manager Components (Priority: P1)

#### ✅ Already Tested
- [x] Tasks.test.tsx
- [x] ActualShards.test.tsx
- [x] PendingTasksCount.test.tsx
- [x] Resources.test.tsx

---

### 9. Chart Components (Priority: P1)

#### ✅ Already Tested
- [x] TimeCpuUsage.test.tsx
- [x] TimeDiskIO.test.tsx
- [x] BarChartStacked.test.tsx

---

### 10. Grafana Components (Priority: P1)

#### ✅ Already Tested
- [x] GrafanaChart.test.tsx
- [x] GrafanaChartResetButton.test.tsx

---

## 🧪 Test Implementation Checklist

### Phase 1: Fix Failing Tests (Day 1 - Morning)
- [ ] Fix Header.test.tsx failing test
- [ ] Verify all existing tests pass
- [ ] Run coverage report for baseline

### Phase 2: Critical Components (Day 1 - Afternoon)
- [ ] Test HeaderProxyRequest.tsx
- [ ] Test TransactionsClear.tsx
- [ ] Run tests and verify passing

### Phase 3: High Priority Components (Day 2)
- [ ] Test ProcessingEventsEntitiesErrorListView components (3 files)
- [ ] Test TimeStatisticsClear.tsx
- [ ] Test PmComponentsExecutionMonitors components (2 files)
- [ ] Test PmComponentsServiceProcessesView components (2 files)
- [ ] Run tests and verify passing

### Phase 4: Medium Priority Components (Day 3)
- [ ] Test Network Info components (2 files)
- [ ] Test ZooKeeper Info components (3 files)
- [ ] Run tests and verify passing

### Phase 5: Coverage Analysis (Day 3 - Afternoon)
- [ ] Run full coverage report
- [ ] Identify gaps in coverage
- [ ] Add missing tests for edge cases
- [ ] Achieve 80%+ overall coverage

### Phase 6: Integration Testing (Day 4)
- [ ] Test component interactions
- [ ] Test data flow between components
- [ ] Test error scenarios
- [ ] Test loading states

---

## 📊 Success Criteria

- ✅ All tests passing (100% pass rate)
- ✅ 80%+ overall code coverage
- ✅ All new components have tests
- ✅ All critical paths tested
- ✅ All user interactions tested
- ✅ All edge cases covered
- ✅ No console errors or warnings

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Coverage Report
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- HeaderProxyRequest.test.tsx
```

---

## 📝 Test Template

Here's a template for testing new components:

```typescript
/**
 * ComponentName Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  it('should render component', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();
    
    render(<ComponentName onClick={mockFn} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(mockFn).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    render(<ComponentName isLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ComponentName error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

---

## 🎯 Next Steps

1. **Fix the failing Header test** - Update test to match current implementation
2. **Create tests for P0 components** - HeaderProxyRequest, TransactionsClear
3. **Create tests for P1 components** - Processing Events, Time Statistics, PM Components
4. **Create tests for P2 components** - Network Info, ZooKeeper Info
5. **Run coverage analysis** - Identify gaps and add missing tests
6. **Document test results** - Update this file with results

---

## 📈 Progress Tracking

- **Total Components**: 91
- **Components with Tests**: 18
- **Components Needing Tests**: 15 (high priority)
- **Estimated Time**: 3-4 days
- **Target Completion**: 2025-10-17

**Status**: Ready to begin testing new components! 🚀

