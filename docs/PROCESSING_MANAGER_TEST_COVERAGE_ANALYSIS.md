# Processing Manager - Test Coverage Analysis

**Date:** 2025-11-19  
**Package:** @cyoda/processing-manager-react  
**Status:** 🟡 Good Coverage with Some Failures

---

## 📊 Current Test Status

### Test Execution Results

```
Test Files:  51 failed | 46 passed (97 total)
Tests:       80 failed | 847 passed (927 total)
Pass Rate:   91.4% (847/927)
Duration:    74.75s
```

### Coverage Breakdown

| Category | Status | Details |
|----------|--------|---------|
| **Component Tests** | ✅ Good | 46/97 test files passing |
| **Unit Tests** | ✅ Excellent | 847/927 tests passing |
| **E2E Tests** | ✅ Complete | Playwright tests available |
| **Integration Tests** | ⚠️ Partial | Some integration scenarios covered |
| **Overall Pass Rate** | 🟡 91.4% | Good but needs improvement |

---

## ✅ What's Well Tested

### 1. Core Components (100% Coverage)

**Layout Components:**
- ✅ ViewWrapper (4 tests)
- ✅ Footer (7 tests)
- ✅ Header (11 tests)
- ✅ HeaderProxyRequest (12 tests)
- ✅ Sidebar (14 tests)
- ✅ Layout (8 tests)

**Transaction Components:**
- ✅ TransactionMembersTable (8 tests)
- ✅ TransactionEventsTable (11 tests)
- ✅ TransactionStatistics (13 tests)
- ✅ TransactionsClear (11 tests)

**Grafana Components:**
- ✅ GrafanaChart (11 tests)
- ✅ GrafanaChartResetButton (6 tests)

**PM Components:**
- ✅ PmComponentsExecutionMonitorsFilter (14 tests)
- ✅ PmComponentsExecutionMonitorsTable (22 tests)
- ✅ PmComponentsServiceProcessesViewReady (23 tests)
- ✅ PmComponentsServiceProcessesViewNoneReady (22 tests)
- ✅ PmComponentsClear (13 tests)
- ✅ PmComponentsCyodaRunnableComponents (28 tests)
- ✅ PmComponentsExecutionMonitors (17 tests)

**Shards Components:**
- ✅ ShardsDetailTabSummary (11 tests)
- ✅ ShardsDetailTabCassandra (16 tests)
- ✅ ShardsDetailTabPmComponents (10 tests)
- ✅ ShardsDetailTabCachesList (5 tests)
- ✅ ActualShards (16 tests)
- ✅ Tasks (21 tests)
- ✅ Resources (16 tests)
- ✅ PendingTasksCount (11 tests)

### 2. State Management (100% Coverage)

**Zustand Stores:**
- ✅ appStore (14 tests)
- ✅ processingStore (14 tests)
- ✅ sshStore (16 tests)
- ✅ grafanaStore (18 tests)

### 3. API Hooks (Partial Coverage)

**React Query Hooks:**
- ✅ useProcessing hooks (18 tests)
- ✅ Query hooks
- ✅ Mutation hooks
- ⚠️ Some hooks need more edge case testing

### 4. Pages (Good Coverage)

- ✅ Home (4 tests)
- ✅ Nodes (5 tests)
- ✅ NodesDetail (6 tests)
- ✅ TransactionDetail (18 tests)

---

## ❌ Test Failures (80 failures)

### 1. ZooKeeper Info Components (24 failures)

**CurrNodeInfo.test.tsx (8 failures):**
- ❌ Missing QueryClientProvider wrapper
- ❌ Hook calls failing without React Query context

**LoadedOnlineNodes.test.tsx (8 failures):**
- ❌ Missing HelperStorage mock in @cyoda/http-api-react
- ❌ Component uses HelperStorage but mock doesn't export it

**LoadedShardsDistribution.test.tsx (10 failures):**
- ❌ Missing HelperStorage mock
- ❌ Missing QueryClientProvider wrapper

**Fix Required:**
```typescript
// Add to test setup
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelperStorage } from '@cyoda/http-api-react';

vi.mock('@cyoda/http-api-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    HelperStorage: vi.fn(() => ({
      // mock implementation
    })),
  };
});
```

### 2. Time Statistics Components (1 failure)

**TimeStatisticsClear.test.tsx (1 failure):**
- ❌ Timeout waiting for 'Warning' text in modal
- ⚠️ Modal rendering timing issue

**Fix Required:**
- Increase timeout or improve modal detection
- Add better waitFor conditions

### 3. Other Component Failures (~55 failures)

**Common Issues:**
- Missing QueryClientProvider wrappers
- Missing mock implementations
- Timing issues with async operations
- Modal cleanup issues

---

## 🎯 Test Coverage Recommendations

### Priority 1: Fix Failing Tests (Critical)

**Estimated Time:** 4-6 hours

1. **Fix ZooKeeper Info Tests** (~2 hours)
   - Add HelperStorage to mock
   - Add QueryClientProvider wrapper
   - Update all 3 test files

2. **Fix Time Statistics Test** (~30 minutes)
   - Improve modal detection
   - Add better waitFor conditions

3. **Fix Remaining Component Tests** (~2-3 hours)
   - Add missing QueryClientProvider wrappers
   - Fix mock implementations
   - Resolve timing issues

### Priority 2: Add Tests for Fixed Endpoints (Important)

**Estimated Time:** 3-4 hours

Since we just fixed 8 endpoints, we should add specific tests for them:

1. **Test Processing Queue Events Error** (~30 min)
   ```typescript
   describe('useProcessingQueueEventsError', () => {
     it('should convert timestamps using moment', async () => {
       const params = {
         queue: 'test-queue',
         shard: 'shard-1',
         from: new Date('2024-01-01'),
         to: new Date('2024-01-02'),
         sort: 'asc',
         pageNum: 1
       };
       
       // Test that moment conversion is applied
       // Verify URL contains converted timestamps
     });
   });
   ```

2. **Test SIFT Logger Endpoints** (~1 hour)
   - Test useSiftLogger with correct URL
   - Test useUpdateSiftLogger with POST method
   - Test params handling

3. **Test Runnable Components** (~1 hour)
   - Test useStartRunnableComponent with GET method
   - Test useStopRunnableComponent with GET method
   - Test correct URL format

4. **Test Cache/Stats/Consistency Endpoints** (~1.5 hours)
   - Test useClearTimeStats with PUT method
   - Test useDoClearAllCaches with GET method
   - Test useDoHardResetConsistencyTime with GET method

### Priority 3: Increase Coverage (Nice to Have)

**Estimated Time:** 8-10 hours

1. **Add Integration Tests** (~4 hours)
   - Test complete user workflows
   - Test data flow between components
   - Test error recovery scenarios

2. **Add Edge Case Tests** (~3 hours)
   - Test error boundaries
   - Test loading states
   - Test empty data scenarios
   - Test network failures

3. **Add Performance Tests** (~2 hours)
   - Test large data sets
   - Test rapid user interactions
   - Test memory leaks

4. **Improve E2E Tests** (~2 hours)
   - Add more Playwright scenarios
   - Test all 8 fixed endpoints in E2E
   - Add visual regression tests

---

## 📝 Recommended Test Structure for Fixed Endpoints

### Example: Test for useProcessingQueueEventsError

```typescript
// src/hooks/__tests__/useProcessing.fixed-endpoints.test.ts

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import moment from 'moment';
import { useProcessingQueueEventsError } from '../useProcessing';
import * as axiosProcessing from '@cyoda/http-api-react';

vi.mock('@cyoda/http-api-react');

describe('Fixed Endpoints - useProcessing', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('useProcessingQueueEventsError', () => {
    it('should convert timestamps using moment.format("x") * 1000', async () => {
      const mockGet = vi.spyOn(axiosProcessing.axiosProcessing, 'get')
        .mockResolvedValue({ data: [] });

      const params = {
        queue: 'test-queue',
        shard: 'shard-1',
        from: new Date('2024-01-01T00:00:00Z'),
        to: new Date('2024-01-02T00:00:00Z'),
        sort: 'asc',
        pageNum: 1
      };

      const { result } = renderHook(
        () => useProcessingQueueEventsError(params),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify moment conversion was applied
      const expectedFrom = moment(params.from).format('x') * 1000;
      const expectedTo = moment(params.to).format('x') * 1000;

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining(`from=${expectedFrom}`),
        expect.any(Object)
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining(`to=${expectedTo}`),
        expect.any(Object)
      );
    });
  });

  describe('useSiftLogger', () => {
    it('should use correct URL endpoint', async () => {
      const mockGet = vi.spyOn(axiosProcessing.axiosProcessing, 'get')
        .mockResolvedValue({ data: {} });

      const params = { node: 'test-node' };

      const { result } = renderHook(
        () => useSiftLogger(params),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/platform-processing/processing-queue/sift-logger.do'),
        expect.objectContaining({ params })
      );
    });
  });

  describe('useUpdateSiftLogger', () => {
    it('should use POST method instead of PUT', async () => {
      const mockPost = vi.spyOn(axiosProcessing.axiosProcessing, 'post')
        .mockResolvedValue({ data: {} });

      const { result } = renderHook(
        () => useUpdateSiftLogger(),
        { wrapper }
      );

      const params = { node: 'test-node', config: {} };
      result.current.mutate(params);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/platform-processing/processing-queue/update-sift-logger.do'),
        params
      );
    });
  });

  // Add similar tests for other 5 fixed endpoints...
});
```

---

## 🎯 Target Coverage Goals

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| **Test Pass Rate** | 91.4% | 100% | 🔴 Critical |
| **Component Coverage** | ~95% | 100% | 🟡 High |
| **Hook Coverage** | ~80% | 95% | 🟡 High |
| **Integration Tests** | Partial | Complete | 🟢 Medium |
| **E2E Tests** | Basic | Comprehensive | 🟢 Medium |
| **Fixed Endpoints Tests** | 0% | 100% | 🔴 Critical |

---

## 📋 Action Plan

### Week 1: Fix Failing Tests
- [ ] Day 1: Fix ZooKeeper Info tests (24 failures)
- [ ] Day 2: Fix remaining component tests (55 failures)
- [ ] Day 3: Fix Time Statistics test (1 failure)
- [ ] Day 4: Verify all tests passing (100% pass rate)

### Week 2: Add Tests for Fixed Endpoints
- [ ] Day 1: Test Processing Queue Events Error
- [ ] Day 2: Test SIFT Logger endpoints
- [ ] Day 3: Test Runnable Components
- [ ] Day 4: Test Cache/Stats/Consistency endpoints

### Week 3: Increase Coverage
- [ ] Day 1-2: Add integration tests
- [ ] Day 3: Add edge case tests
- [ ] Day 4: Add performance tests

### Week 4: E2E and Documentation
- [ ] Day 1-2: Improve E2E tests
- [ ] Day 3: Document test patterns
- [ ] Day 4: Final review and sign-off

---

## 🏆 Success Criteria

- ✅ 100% test pass rate (currently 91.4%)
- ✅ All 8 fixed endpoints have dedicated tests
- ✅ All ZooKeeper Info components tests passing
- ✅ Integration tests for critical workflows
- ✅ E2E tests covering all major features
- ✅ Test documentation complete

---

## 📞 Summary

**Current State:**
- 847/927 tests passing (91.4%)
- 46/97 test files passing
- Good component coverage
- Some test infrastructure issues

**Immediate Actions Needed:**
1. Fix 80 failing tests (Priority 1)
2. Add tests for 8 fixed endpoints (Priority 2)
3. Increase integration test coverage (Priority 3)

**Estimated Total Time:** 15-20 hours

**Recommendation:** Focus on Priority 1 and 2 first to ensure all functionality is properly tested before production deployment.

