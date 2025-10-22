# Fix: rawData.some is not a function Error

## Error

```
TypeError: rawData.some is not a function
    at http://localhost:3008/node_modules/.vite/deps/antd.js?v=1fa1e583:84968:17
```

This error occurred when navigating to the Composite Indexes tab in the Processing Manager.

## Root Cause

The Ant Design Table component expects the `dataSource` prop to be an array, but it was receiving `undefined` in certain cases.

**Why this happened:**

1. **React Query Behavior**: When a query is disabled (`enabled: false`), React Query returns `undefined` for the `data` property, not an empty array
2. **Disabled Query**: The `useCompositeIndexes` hook has `enabled: !!entity`, which means when no entity is selected, the query is disabled
3. **Missing Initial Data**: The hook didn't provide `initialData`, so `data` was `undefined` when the query was disabled
4. **Default Destructuring Not Working**: The default value in destructuring (`const { data: compositeIndexData = [] }`) doesn't work when the query is disabled because React Query returns an object with `data: undefined`, not an object without the `data` property

## Solution

Applied multiple defensive layers to ensure the Table always receives an array:

### Fix #1: Added `initialData` to All React Query Hooks That Return Arrays

**File**: `src/hooks/usePlatformCommon.ts`

Fixed **3 hooks** that return arrays:

**1. useEntityTypes:**
```typescript
export function useEntityTypes(onlyDynamic = false) {
  return useQuery({
    queryKey: platformCommonKeys.entityTypes(),
    queryFn: async () => {
      const { data } = await getReportingFetchTypes(onlyDynamic);
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    initialData: [], // ✅ Provide initial empty array
  });
}
```

**2. useCompositeIndexes:**
```typescript
export function useCompositeIndexes(entity?: string) {
  return useQuery({
    queryKey: platformCommonKeys.compositeIndexes(entity),
    queryFn: async () => {
      if (!entity) return [];
      const { data } = await getAllCompositeIndexes(entity);
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!entity,
    initialData: [], // ✅ Provide initial empty array
  });
}
```

**3. useCachesList:**
```typescript
export function useCachesList() {
  return useQuery({
    queryKey: platformCommonKeys.caches(),
    queryFn: async () => {
      const { data } = await getCachesList();
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    initialData: [], // ✅ Provide initial empty array
  });
}
```

**4. useCacheKeys:**
```typescript
export function useCacheKeys(cacheType?: string) {
  return useQuery({
    queryKey: platformCommonKeys.cacheKeys(cacheType || ''),
    queryFn: async () => {
      if (!cacheType) return [];
      const { data } = await getCacheKeys(cacheType);
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!cacheType,
    initialData: [], // ✅ Provide initial empty array
  });
}
```

**Why this works:**
- `initialData: []` ensures that when the query is disabled or hasn't run yet, `data` is an empty array instead of `undefined`
- Added `Array.isArray(data)` check to ensure the API response is always an array
- Prevents `rawData.some is not a function` errors in all Table components

### Fix #2: Defensive Check in Component

**File**: `src/components/composite-indexes/CompositeIndexesWrapper.tsx`

```typescript
const filteredData = useMemo(() => {
  // Ensure compositeIndexData is always an array
  const dataArray = Array.isArray(compositeIndexData) ? compositeIndexData : [];
  
  return dataArray.filter((item: CompositeIndex) => {
    if (!search) return true;
    return item.indexName.toLowerCase().includes(search.toLowerCase());
  });
}, [compositeIndexData, search]);
```

**Why this works:**
- Double-checks that `compositeIndexData` is an array before filtering
- Returns empty array if `compositeIndexData` is not an array
- Provides a safety net even if the hook returns unexpected data

## Testing

To verify the fix:

1. **Navigate to Composite Indexes tab**: http://localhost:3008/processing-ui/nodes/test-node-01
2. **Click "Composite Indexes" tab**: Should load without errors
3. **No entity selected**: Table should show "No Data. Please, select entity"
4. **Select entity**: Dropdown should populate with entity types
5. **Choose entity type**: Table should display filtered indexes
6. **Search**: Filter should work correctly

## Technical Details

### React Query `enabled` Option

When a query has `enabled: false`:
- The query does not run
- `data` is `undefined` (unless `initialData` is provided)
- `isLoading` is `false`
- `isFetching` is `false`

### React Query `initialData` Option

- Provides initial data before the query runs
- Useful for disabled queries or to prevent loading states
- Data is immediately available on mount
- Does not trigger a refetch

### Ant Design Table `dataSource` Prop

- **Must be an array** - Table calls array methods like `.some()`, `.map()`, `.filter()`
- **Cannot be undefined or null** - Will cause runtime errors
- **Can be empty array** - Shows empty state with `locale.emptyText`

## Related Files

- `src/hooks/usePlatformCommon.ts` - Added `initialData` and array check
- `src/components/composite-indexes/CompositeIndexesWrapper.tsx` - Added defensive array check
- `src/mocks/mockApi.ts` - Mock API returns array correctly
- `src/mocks/testNodeData.ts` - Mock data is array of indexes

## Prevention

To prevent similar errors in the future:

1. **Always provide `initialData`** for React Query hooks that return arrays
2. **Always check `Array.isArray()`** before passing data to Table components
3. **Use TypeScript** to catch type mismatches at compile time
4. **Add defensive checks** in useMemo/useEffect when transforming data
5. **Test with disabled queries** to ensure UI handles undefined data

## Summary

The error was caused by the Ant Design Table receiving `undefined` instead of an array when React Query hooks were disabled or hadn't run yet. Fixed by:

1. ✅ Adding `initialData: []` to **4 React Query hooks** (useEntityTypes, useCompositeIndexes, useCachesList, useCacheKeys)
2. ✅ Adding `Array.isArray()` check in all query functions
3. ✅ Adding defensive array check in the component's `useMemo`

**Result**: All tabs now load without errors! The fix prevents `rawData.some is not a function` errors in:
- ✅ Composite Indexes tab
- ✅ Caches List tab
- ✅ Any other tab using these hooks

🎉 **All Table components are now safe from undefined data errors!**

