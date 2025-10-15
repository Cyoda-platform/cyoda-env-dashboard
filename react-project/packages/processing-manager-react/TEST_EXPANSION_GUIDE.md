# Test Expansion Guide

**Date**: 2025-10-14  
**Goal**: Expand test coverage from 17.6% (16/91 components) to 80%+ (73+/91 components)  
**Current Progress**: 26 test files, 304 passing tests (with 34 failing tests in 3 new files)

---

## 📊 Current Status

### ✅ Completed
- **TimeStatisticsClear.test.tsx** - 11/11 tests passing ✅
- **PmComponentsServiceProcessesViewNoneReady.test.tsx** - 22/22 tests passing ✅
- All 21 original test files still passing

### ⚠️ In Progress (Need Fixes)
- **PmComponentsExecutionMonitorsFilter.test.tsx** - 3/14 tests passing (11 failing)
- **PmComponentsExecutionMonitorsTable.test.tsx** - 12/22 tests passing (10 failing)
- **PmComponentsServiceProcessesViewReady.test.tsx** - 13/23 tests passing (10 failing)

### 📝 Common Test Issues & Solutions

#### Issue 1: `getByLabelText` not finding Ant Design Form.Item labels
**Problem**: Ant Design Form.Item doesn't automatically associate labels with inputs.

**Solution**: Use `getByPlaceholderText` instead:
```typescript
// ❌ Wrong
const nameInput = screen.getByLabelText('Filter by name');

// ✅ Correct
const nameInput = screen.getByPlaceholderText('Filter by name');
```

#### Issue 2: Multiple elements with same text (table headers + cells)
**Problem**: Tables have headers and cells with the same text.

**Solution**: Use `getAllByText` and select the appropriate element:
```typescript
// ❌ Wrong
expect(screen.getByText('Name')).toBeInTheDocument();

// ✅ Correct
const nameElements = screen.getAllByText('Name');
expect(nameElements.length).toBeGreaterThan(0);

// Or use getAllByRole for headers specifically
const headers = screen.getAllByRole('columnheader');
expect(headers.some(h => h.textContent === 'Name')).toBe(true);
```

#### Issue 3: Ant Design table structure differences
**Problem**: Ant Design adds extra rows for sorting/filtering.

**Solution**: Account for extra rows or use more specific selectors:
```typescript
// ❌ Wrong
const rows = container.querySelectorAll('.ant-table-tbody tr');
expect(rows.length).toBe(2);

// ✅ Correct
const rows = container.querySelectorAll('.ant-table-tbody tr.ant-table-row');
expect(rows.length).toBe(2);
```

#### Issue 4: Scrollable content selector
**Problem**: `.ant-table-body` might not exist in test environment.

**Solution**: Use more flexible selectors:
```typescript
// ❌ Wrong
const scrollContainer = container.querySelector('.ant-table-body');
expect(scrollContainer).toBeInTheDocument();

// ✅ Correct
const table = container.querySelector('.ant-table');
expect(table).toBeInTheDocument();
// Or check for scroll attribute
expect(table).toHaveAttribute('scroll');
```

---

## 🎯 Phase-by-Phase Implementation Plan

### Phase 1: Fix Current Failing Tests (Priority: IMMEDIATE)
**Status**: IN_PROGRESS  
**Files**: 3 test files with 34 failing tests

1. Fix PmComponentsExecutionMonitorsFilter.test.tsx (11 failures)
   - Replace `getByLabelText` with `getByPlaceholderText`
   - Update input selection logic

2. Fix PmComponentsExecutionMonitorsTable.test.tsx (10 failures)
   - Use `getAllByText` for duplicate text
   - Fix row count expectations
   - Update scroll container selector

3. Fix PmComponentsServiceProcessesViewReady.test.tsx (10 failures)
   - Use `getAllByText` for duplicate text
   - Fix row count expectations
   - Update scroll container selector

**Expected Outcome**: 26 test files, 338 passing tests, 0 failing

---

### Phase 2: Priority Components (Remaining 8 components)
**Target**: Add tests for remaining priority components

#### 2.1 Processing Events Components (3 files)
- ProcessingEventsEntitiesErrorListView.tsx
- ProcessingEventsEntitiesErrorListViewFilter.tsx
- ProcessingEventsEntitiesErrorListViewTable.tsx

**Test Pattern**: Similar to TransactionsClear and TransactionsView tests

#### 2.2 Network Info Components (2 files)
- NetworkInfoServer.tsx (wrapper component)
- NetworkClients.tsx (wrapper component)

**Test Pattern**: Simple wrapper tests, mock the imported components

#### 2.3 ZooKeeper Info Components (3 files)
- CurrNodeInfo.tsx
- LoadedOnlineNodes.tsx
- LoadedShardsDistribution.tsx

**Test Pattern**: Similar to Network Info components

**Expected Outcome**: 34 test files, ~450 passing tests

---

### Phase 3: Complete PM Components (5 remaining)
**Target**: Test remaining PM Components

- PmComponentsClear.tsx
- PmComponentsCyodaRunnableComponents.tsx
- PmComponentsExecutionQueuesInfo.tsx
- PmComponentsExecutionMonitors.tsx
- PmComponentsServiceProcessesView.tsx

**Test Pattern**: Similar to existing PM Components tests

**Expected Outcome**: 39 test files, ~550 passing tests

---

### Phase 4: Complete Transactions (6 components)
**Target**: Increase Transactions coverage from 40% to 100%

- TransactionsView.tsx
- TransactionsViewFilter.tsx
- TransactionsViewTable.tsx
- TransactionsEntities.tsx
- TransactionsEntitiesFilter.tsx
- TransactionsEntitiesTable.tsx
- TransactionsExecuting.tsx

**Test Pattern**: Follow TransactionsClear and existing transaction tests

**Expected Outcome**: 46 test files, ~700 passing tests

---

### Phase 5: Complete Shards (11 components)
**Target**: Increase Shards coverage from 21% to 100%

- ShardsDetailTabProcessingManager.tsx
- ShardsDetailTabTransactions.tsx
- ShardsDetailTabCompositeIndexes.tsx
- ShardsDetailTabZKInfo.tsx
- ShardsDetailTabTimeStatistics.tsx
- ShardsDetailTabProcessingEvents.tsx
- ShardsDetailTabNetworkInfo.tsx
- ShardsDetailTabCachesList.tsx
- ActualShards.tsx (in shards/)
- Tasks.tsx (in shards/)
- Resources.tsx (in shards/)
- PendingTasksCount.tsx (in shards/)

**Test Pattern**: Follow ShardsDetailTabSummary and ShardsDetailTabCassandra tests

**Expected Outcome**: 57 test files, ~900 passing tests

---

### Phase 6: Time Statistics (2 remaining)
**Target**: Complete Time Statistics coverage

- TimeStatisticsCountStat.tsx
- TimeStatisticsTimeStat.tsx

**Test Pattern**: Similar to TimeStatisticsClear

**Expected Outcome**: 59 test files, ~950 passing tests

---

### Phase 7: Processing Manager Components (4 components)
**Target**: Test Processing Manager components

- ActualShards.tsx (in processing-manager/)
- Tasks.tsx (in processing-manager/)
- Resources.tsx (in processing-manager/)
- PendingTasksCount.tsx (in processing-manager/)

**Test Pattern**: Simple component rendering tests

**Expected Outcome**: 63 test files, ~1000 passing tests

---

### Phase 8: Transition & State Machine (9 components)
**Target**: Test complex state machine components

- TransitionStateMachineTable.tsx (in transition/)
- TransitionStateMachineTimeLine.tsx (in transition/)
- TransitionStateMachineForm.tsx (in transition/)
- TransitionStateMachineTable.tsx (in state-machine/)
- TransitionStateMachineTimeLine.tsx (in state-machine/)
- TransitionStateMachineForm.tsx (in state-machine/)

**Test Pattern**: Complex form and table tests

**Expected Outcome**: 69 test files, ~1150 passing tests

---

### Phase 9: Transition Detail (7 components)
**Target**: Test transition detail components

- EventsFilter.tsx
- EventsTable.tsx
- MembersFilter.tsx
- MembersTable.tsx
- TransitionDetailStatistics.tsx
- TransitionDetailStatisticsTransactionEvents.tsx
- TransitionDetailStatisticsTransactionMembers.tsx

**Test Pattern**: Similar to transaction tests

**Expected Outcome**: 76 test files, ~1300 passing tests

---

### Phase 10: Remaining Components (15 components)
**Target**: Test all remaining components

#### Versions (3 files)
- TransitionVersionsAggregated.tsx
- TransitionVersionsFilter.tsx
- TransitionVersionsSorted.tsx

#### Common (3 files)
- ErrorViewActions.tsx
- Pagination.tsx

#### Other (9 files)
- BlogMainPage.tsx
- CachesListWrapper.tsx
- CassandraService.tsx
- CompositeIndexesWrapper.tsx
- ProcessingEventsView.tsx
- ProcessingEventsErrorView.tsx
- ProcessingEventsErrorViewFilter.tsx
- ProcessingEventsErrorViewTable.tsx
- PollingInfo.tsx
- ProcessEventsStatistics.tsx
- SiftLoggerConfView.tsx

**Expected Outcome**: 91 test files, ~1500+ passing tests, 80%+ component coverage

---

## 🛠️ Test Template

### Basic Component Test Template
```typescript
/**
 * [ComponentName] Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  const renderComponent = (props = {}) => {
    return render(<ComponentName {...props} />);
  };

  it('should render component', () => {
    renderComponent();
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  // Add more tests...
});
```

### Table Component Test Template
```typescript
/**
 * [TableName] Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TableName from '../TableName';

describe('TableName', () => {
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  it('should render table with data', () => {
    render(<TableName tableData={mockData} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should render column headers', () => {
    render(<TableName tableData={mockData} />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers.some(h => h.textContent?.includes('Name'))).toBe(true);
  });

  // Add more tests...
});
```

---

## 📈 Success Metrics

- **Target Coverage**: 80%+ component coverage (73+/91 components)
- **Target Tests**: 1500+ passing tests
- **Target Test Files**: 91 test files
- **Pass Rate**: 100%

---

## 🚀 Next Steps

1. **Fix failing tests** in Phase 1 (3 files, 34 failures)
2. **Complete priority components** in Phase 2 (8 files)
3. **Continue through phases** 3-10 systematically
4. **Run full test suite** after each phase
5. **Update COMPONENT_TEST_COVERAGE.md** after each phase
6. **Celebrate** when reaching 80%+ coverage! 🎉

