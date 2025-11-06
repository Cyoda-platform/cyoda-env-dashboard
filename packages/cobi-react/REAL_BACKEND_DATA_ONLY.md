# Real Backend Data Only - COBI React Package

## Summary

The COBI React package now **only uses real Cyoda backend data** and **never falls back to mock data**. When API calls fail or return empty data, the app will handle the actual response instead of substituting fake mock data.

## Changes Made

### 1. **useEntityTypes Hook** - Entity Types/Classes

**File**: `src/hooks/useEntityTypes.ts`

**Before:**
- Fell back to `MOCK_ENTITY_TYPES` array when API failed
- Returned hardcoded entity class names on error

**After:**
```typescript
export function useEntityTypes(onlyDynamic = false, options?) {
  return useQuery({
    queryKey: ['entityTypes', onlyDynamic],
    queryFn: async () => {
      const response = await getReportingFetchTypes(onlyDynamic);
      // Always return real backend data (even if empty)
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 10 * 60 * 1000,
    initialData: [], // Provide empty array as initial data
    ...options,
  });
}
```

**Changes:**
- ❌ Removed `MOCK_ENTITY_TYPES` constant
- ❌ Removed try-catch fallback to mock data
- ✅ Added `initialData: []` to prevent undefined data
- ✅ Added `Array.isArray()` check for safety
- ✅ Always returns real backend data or empty array

---

### 2. **useDataMappings Hook** - Data Mapping List

**File**: `src/hooks/useDataMapping.ts`

**Before:**
- Fell back to `inMemoryMappings` array when API failed
- Used in-memory storage for development mode

**After:**
```typescript
export function useDataMappings(withSampleContent = true, options?) {
  return useQuery({
    queryKey: ['dataMapping', 'list', withSampleContent],
    queryFn: async () => {
      const response = await dataMappingApi.getListAllDataMappings(withSampleContent);
      // Always return real backend data (even if empty)
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 2 * 60 * 1000,
    initialData: [], // Provide empty array as initial data
    ...options,
  });
}
```

**Changes:**
- ❌ Removed `MOCK_DATA_MAPPINGS` constant
- ❌ Removed `inMemoryMappings` variable
- ❌ Removed try-catch fallback to in-memory data
- ✅ Added `initialData: []` to prevent undefined data
- ✅ Added `Array.isArray()` check for safety
- ✅ Always returns real backend data or empty array

---

### 3. **useDataMapping Hook** - Single Data Mapping

**File**: `src/hooks/useDataMapping.ts`

**Before:**
- Fell back to searching `inMemoryMappings` when API failed
- Returned mock data on error

**After:**
```typescript
export function useDataMapping(id: string | null, options?) {
  return useQuery({
    queryKey: ['dataMapping', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await dataMappingApi.getDataMapping(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
```

**Changes:**
- ❌ Removed try-catch fallback to in-memory data
- ✅ Lets errors propagate to React Query error handling
- ✅ Always returns real backend data or null

---

### 4. **useSaveDataMapping Hook** - Save Data Mapping

**File**: `src/hooks/useDataMapping.ts`

**Before:**
- Fell back to saving in `inMemoryMappings` when API failed
- Generated fake IDs for in-memory storage

**After:**
```typescript
export function useSaveDataMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MappingConfigDto) => {
      const response = await dataMappingApi.postSave(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataMapping', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dataMapping', 'detail'] });
    },
  });
}
```

**Changes:**
- ❌ Removed try-catch fallback to in-memory storage
- ❌ Removed in-memory mapping creation/update logic
- ✅ Lets errors propagate to React Query error handling
- ✅ Always uses real backend API

---

### 5. **useDeleteDataMapping Hook** - Delete Data Mapping

**File**: `src/hooks/useDataMapping.ts`

**Before:**
- Fell back to deleting from `inMemoryMappings` when API failed
- Returned fake success response

**After:**
```typescript
export function useDeleteDataMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await dataMappingApi.deleteDataMapping(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataMapping', 'list'] });
    },
  });
}
```

**Changes:**
- ❌ Removed try-catch fallback to in-memory storage
- ❌ Removed in-memory mapping deletion logic
- ✅ Lets errors propagate to React Query error handling
- ✅ Always uses real backend API

---

## Benefits

### 1. **Data Integrity**
- No more confusion between mock and real data
- What you see is what's actually in the backend
- Easier to debug data issues

### 2. **Error Visibility**
- API failures are now visible to users
- Developers can see real backend errors
- Better error handling and user feedback

### 3. **Consistency**
- Matches the behavior of other packages (http-api-react, tableau-react)
- Consistent error handling across the app
- No special cases for "development mode"

### 4. **Simplified Code**
- Removed ~100 lines of mock data fallback code
- Easier to understand and maintain
- No in-memory state to manage

---

## Error Handling

When API calls fail, React Query will:

1. **Retry** - Automatically retry failed requests (default: 1 retry)
2. **Error State** - Set `isError: true` and provide error details
3. **Empty Data** - Return `initialData` (empty array) for list queries
4. **Null Data** - Return `null` for single item queries

Components should handle these states:

```typescript
const { data, isLoading, isError, error } = useDataMappings();

if (isLoading) return <Spin />;
if (isError) return <Alert message="Failed to load data" description={error.message} />;
if (!data || data.length === 0) return <Empty description="No data mappings found" />;

return <Table dataSource={data} />;
```

---

## Migration Guide

If you were relying on mock data fallbacks:

### Before:
```typescript
// API fails → returns mock data → UI shows fake data
const { data } = useDataMappings();
// data = [mock mapping 1, mock mapping 2, ...]
```

### After:
```typescript
// API fails → returns empty array → UI shows empty state
const { data, isError } = useDataMappings();
// data = []
// isError = true
```

### What to do:
1. **Handle errors** - Add error handling UI
2. **Show empty states** - Display helpful messages when no data
3. **Fix backend** - Ensure backend APIs are working
4. **Test with real data** - Use actual Cyoda backend for testing

---

## Files Modified

1. ✅ `src/hooks/useEntityTypes.ts` - Removed mock entity types fallback
2. ✅ `src/hooks/useDataMapping.ts` - Removed all in-memory storage fallbacks

---

## Testing

To verify the changes work correctly:

1. **With working backend:**
   ```bash
   # Start the app
   npm run dev
   
   # Navigate to data mapping pages
   # Should see real backend data
   ```

2. **With backend down:**
   ```bash
   # Stop backend or disconnect network
   # Navigate to data mapping pages
   # Should see error states, not mock data
   ```

3. **With empty backend:**
   ```bash
   # Clear all data mappings in backend
   # Navigate to data mapping pages
   # Should see empty states, not mock data
   ```

---

## Related Documentation

- [http-api-react REAL_BACKEND_DATA_ONLY.md](../../http-api-react/REAL_BACKEND_DATA_ONLY.md)
- [React Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/query-functions#handling-and-throwing-errors)
- [Ant Design Empty Component](https://ant.design/components/empty)

---

**Date**: 2025-10-31  
**Status**: ✅ Complete  
**Impact**: All COBI React hooks now use real backend data only

