# Processing Manager - Fix Checklist

**Date:** 2025-11-19
**Status:** ✅ FIXES COMPLETE - READY FOR TESTING
**Estimated Time:** ~50 minutes for fixes + ~2 hours for testing

---

## 📋 Endpoint Fixes Required

### ✅ Fix #1: Processing Queue Events Error
**File:** `packages/processing-manager-react/src/hooks/useProcessing.ts`  
**Lines:** 618-631  
**Time:** 10 minutes  
**Priority:** HIGH

**Current (INCORRECT):**
```typescript
export function useProcessingQueueEventsError(params: ProcessingQueueEventsErrorParams) {
  return useQuery({
    queryKey: processingKeys.all.concat(['processing-queue-events-error', params]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(
          `/platform-processing/processing-queue/events/error.json?queue=${params.queue}&shard=${params.shard}&from=${params.from}&to=${params.to}&sort=${params.sort}&pageSize=9999999&pageNum=${params.pageNum}`
        )
      );
      return data;
    },
  });
}
```

**Should be (CORRECT):**
```typescript
export function useProcessingQueueEventsError(params: ProcessingQueueEventsErrorParams) {
  return useQuery({
    queryKey: processingKeys.all.concat(['processing-queue-events-error', params]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(
          `/platform-processing/processing-queue/events/error.json?queue=${params.queue}&shard=${
            params.shard
          }&from=${moment(params.from).format('x') * 1000}&to=${
            moment(params.to).format('x') * 1000
          }&sort=${params.sort}&pageSize=9999999&pageNum=${params.pageNum}`
        )
      );
      return data;
    },
  });
}
```

**Changes:**
- [x] Add `moment` import at the top of the file
- [x] Add timestamp conversion: `moment(params.from).format('x') * 1000`
- [x] Add timestamp conversion: `moment(params.to).format('x') * 1000`

**Status:** ✅ FIXED

---

### ✅ Fix #2: Start Runnable Component
**File:** `packages/processing-manager-react/src/hooks/useProcessing.ts`  
**Lines:** 996-1011  
**Time:** 7 minutes  
**Priority:** HIGH

**Current (INCORRECT):**
```typescript
export function useStartRunnableComponent() {
  return useMutation({
    mutationFn: async (params: { id: string }) => {
      const { data } = await axiosProcessing.post(
        HelperUrl.getLinkToServer('/platform-processing/runnable-components/start.do'),
        params
      );
      return data;
    },
  });
}
```

**Should be (CORRECT):**
```typescript
export function useStartRunnableComponent() {
  return useMutation({
    mutationFn: async (params: { id: string }) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/start-runnable-component.do'),
        { params }
      );
      return data;
    },
  });
}
```

**Changes:**
- [x] Change URL from `/platform-processing/runnable-components/start.do` to `/platform-processing/start-runnable-component.do`
- [x] Change method from `post` to `get`
- [x] Change params from body to query string: `{ params }`

**Status:** ✅ FIXED

---

### ✅ Fix #3: Stop Runnable Component
**File:** `packages/processing-manager-react/src/hooks/useProcessing.ts`  
**Lines:** 1016-1031  
**Time:** 7 minutes  
**Priority:** HIGH

**Current (INCORRECT):**
```typescript
export function useStopRunnableComponent() {
  return useMutation({
    mutationFn: async (params: { id: string }) => {
      const { data } = await axiosProcessing.post(
        HelperUrl.getLinkToServer('/platform-processing/runnable-components/stop.do'),
        params
      );
      return data;
    },
  });
}
```

**Should be (CORRECT):**
```typescript
export function useStopRunnableComponent() {
  return useMutation({
    mutationFn: async (params: { id: string }) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/stop-runnable-component.do'),
        { params }
      );
      return data;
    },
  });
}
```

**Changes:**
- [x] Change URL from `/platform-processing/runnable-components/stop.do` to `/platform-processing/stop-runnable-component.do`
- [x] Change method from `post` to `get`
- [x] Change params from body to query string: `{ params }`

**Status:** ✅ FIXED

---

### ✅ Fix #4: Clear Time Stats
**File:** `packages/processing-manager-react/src/hooks/useProcessing.ts`  
**Lines:** 799-814  
**Time:** 5 minutes  
**Priority:** HIGH

**Current (INCORRECT):**
```typescript
export function useClearTimeStats() {
  const { selectedNode } = useProcessingStore();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosProcessing.delete(
        HelperUrl.getLinkToServer(`/platform-api/stats/time/${selectedNode}`)
      );
      return data;
    },
  });
}
```

**Should be (CORRECT):**
```typescript
export function useClearTimeStats() {
  return useMutation({
    mutationFn: async (url?: string) => {
      const targetUrl = url
        ? `${url}/platform-processing/stats/clear-time-stats`
        : HelperUrl.getLinkToServer('/platform-processing/stats/clear-time-stats');
      const { data } = await axiosProcessing.put(targetUrl);
      return data;
    },
  });
}
```

**Changes:**
- [x] Change URL from `/platform-api/stats/time/${selectedNode}` to `/platform-processing/stats/clear-time-stats`
- [x] Change method from `delete` to `put`
- [x] Remove `selectedNode` from URL
- [x] Add optional `url` parameter for custom server URL

**Status:** ✅ FIXED

---

### ✅ Fix #5: Hard Reset Consistency Time
**File:** `packages/processing-manager-react/src/hooks/useProcessing.ts`  
**Lines:** 847-862  
**Time:** 5 minutes  
**Priority:** HIGH

**Current (INCORRECT):**
```typescript
export function useDoHardResetConsistencyTime() {
  const { selectedNode } = useProcessingStore();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosProcessing.post(
        HelperUrl.getLinkToServer(`/platform-api/consistency/hard-reset/${selectedNode}`)
      );
      return data;
    },
  });
}
```

**Should be (CORRECT):**
```typescript
export function useDoHardResetConsistencyTime() {
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/hard-reset-consistency-time.do'),
        { params }
      );
      return data;
    },
  });
}
```

**Changes:**
- [x] Change URL from `/platform-api/consistency/hard-reset/${selectedNode}` to `/platform-processing/transactions/hard-reset-consistency-time.do`
- [x] Change method from `post` to `get`
- [x] Remove `selectedNode` from URL
- [x] Add `params` parameter for query string

**Status:** ✅ FIXED

---

### ✅ Fix #6: Clear All Caches
**File:** `packages/processing-manager-react/src/hooks/useProcessing.ts`  
**Lines:** 823-838  
**Time:** 5 minutes  
**Priority:** HIGH

**Current (INCORRECT):**
```typescript
export function useDoClearAllCaches() {
  const { selectedNode } = useProcessingStore();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosProcessing.post(
        HelperUrl.getLinkToServer(`/platform-api/caches/clear/${selectedNode}`)
      );
      return data;
    },
  });
}
```

**Should be (CORRECT):**
```typescript
export function useDoClearAllCaches() {
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/clear-all-caches.do'),
        { params }
      );
      return data;
    },
  });
}
```

**Changes:**
- [x] Change URL from `/platform-api/caches/clear/${selectedNode}` to `/platform-processing/clear-all-caches.do`
- [x] Change method from `post` to `get`
- [x] Remove `selectedNode` from URL
- [x] Add `params` parameter for query string

**Status:** ✅ FIXED

---

### ✅ Fix #7: Load SIFT Logger
**File:** `packages/processing-manager-react/src/hooks/useProcessing.ts`  
**Lines:** 750-765  
**Time:** 5 minutes  
**Priority:** HIGH

**Current (INCORRECT):**
```typescript
export function useSiftLogger() {
  const { selectedNode } = useProcessingStore();
  return useQuery({
    queryKey: processingKeys.all.concat(['sift-logger', selectedNode]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-api/sift-logger/${selectedNode}`)
      );
      return data;
    },
  });
}
```

**Should be (CORRECT):**
```typescript
export function useSiftLogger(params: any) {
  return useQuery({
    queryKey: processingKeys.all.concat(['sift-logger', params]),
    queryFn: async () => {
      const { data } = await axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/sift-logger.do'),
        { params }
      );
      return data;
    },
  });
}
```

**Changes:**
- [x] Change URL from `/platform-api/sift-logger/${selectedNode}` to `/platform-processing/processing-queue/sift-logger.do`
- [x] Remove `selectedNode` from URL
- [x] Add `params` parameter for query string
- [x] Update queryKey to use `params` instead of `selectedNode`

**Status:** ✅ FIXED

---

### ✅ Fix #8: Update SIFT Logger
**File:** `packages/processing-manager-react/src/hooks/useProcessing.ts`  
**Lines:** 770-790  
**Time:** 5 minutes  
**Priority:** HIGH

**Current (INCORRECT):**
```typescript
export function useUpdateSiftLogger(options?: any) {
  return useMutation({
    mutationFn: async ({ node, data }: { node?: string; data: any }) => {
      const response = await axiosProcessing.put(
        HelperUrl.getLinkToServer(`/platform-api/sift-logger/${node}`),
        data
      );
      return response.data;
    },
  });
}
```

**Should be (CORRECT):**
```typescript
export function useUpdateSiftLogger(options?: any) {
  return useMutation({
    mutationFn: async (params: any) => {
      const response = await axiosProcessing.post(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/update-sift-logger.do'),
        params
      );
      return response.data;
    },
  });
}
```

**Changes:**
- [x] Change URL from `/platform-api/sift-logger/${node}` to `/platform-processing/processing-queue/update-sift-logger.do`
- [x] Change method from `put` to `post`
- [x] Remove `node` from URL
- [x] Simplify params to just `params: any`

**Status:** ✅ FIXED

---

## 🧪 Testing Checklist

After making all fixes, test the following:

### Unit Tests
- [ ] Run `npm test` in `packages/processing-manager-react`
- [ ] Verify all existing tests still pass
- [ ] Add new tests for fixed endpoints if needed

### Integration Tests
- [ ] Test Processing Queue Events Error with real data
- [ ] Test Start/Stop Runnable Components
- [ ] Test Clear Time Stats
- [ ] Test Hard Reset Consistency Time
- [ ] Test Clear All Caches
- [ ] Test SIFT Logger load and update

### Manual Testing
- [ ] Navigate to Processing Manager in SaaS App
- [ ] Test all 11 tabs in NodesDetail page
- [ ] Verify all API calls work correctly
- [ ] Check browser console for errors
- [ ] Verify data displays correctly

---

## 📝 Completion Tracking

**Total Fixes:** 8
**Completed:** 8
**Remaining:** 0
**Progress:** 100% ✅

**Estimated Time:**
- Fixes: ~50 minutes ✅ COMPLETE
- Testing: ~2 hours ⏳ PENDING
- Total: ~2.5 hours

**Status:** ✅ ALL FIXES COMPLETE - READY FOR TESTING

---

## ✅ Sign-off

- [x] All 8 endpoints fixed
- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Code reviewed
- [ ] Ready for deployment

**Developer:** Augment Agent
**Date:** 2025-11-19
**Reviewer:** _______________
**Date:** _______________

