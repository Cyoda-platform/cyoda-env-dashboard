# Composite Indexes Tab - Error Fix ✅

## Issue

When navigating to the Composite Indexes tab, the application showed an error:

```
Error: entityTypes.map is not a function
TypeError: entityTypes.map is not a function
```

## Root Cause

The error occurred because:

1. **Missing Mock Endpoint**: The mock API didn't have an endpoint for `/platform-api/entity-info/fetch/types`
2. **Wrong Axios Instance**: The `getReportingFetchTypes` function uses the default `axios` instance from `@cyoda/http-api-react`, but the mock API was only intercepting the `axiosProcessing` instance
3. **Wrong Mock Data Structure**: The initial mock data for composite indexes didn't match the expected `IndexConfiguration` interface
4. **Wrong Import Statement**: Tried to import `axios` as default export when it's a named export

## Solution

### Fix #1: Added Entity Types Mock Endpoint

Added mock endpoint that returns an array of entity type strings:

```typescript
// Entity types (for composite indexes dropdown)
if (url.includes('/platform-api/entity-info/fetch/types')) {
  console.log('🧪 Returning mock entity types');
  return { 
    ...response, 
    data: [
      'Transaction',
      'Event',
      'ProcessingTask',
      'CassandraEntity',
      'ZooKeeperNode',
      'CacheEntry',
    ] 
  };
}
```

### Fix #2: Intercept Both Axios Instances

Updated `mockApi.ts` to intercept both axios instances:

**Before**: Only intercepted `axiosProcessing`
```typescript
import { axiosProcessing } from '@cyoda/http-api-react';
setupMockInterceptors(axiosProcessing);
```

**After**: Intercepts both `axios` and `axiosProcessing` (both as named exports)
```typescript
import { axios, axiosProcessing } from '@cyoda/http-api-react';

setupMockInterceptors(axiosProcessing, 'processing');
setupMockInterceptors(axios, 'default');
```

**Key Changes**:
- Added import for default `axios` instance as named export
- Added separate interceptor IDs for both instances (4 total: request/response for each)
- Updated `setupMockInterceptors` to accept instance name parameter
- Updated `enableMockApi()` to setup interceptors for both instances
- Updated `disableMockApi()` to remove interceptors from both instances
- Updated auto-enable logic to setup both instances

**Import Fix**: Initially tried `import axios from '@cyoda/http-api-react'` (default import) which failed because the package exports `axios` as a named export. Fixed by using `import { axios, axiosProcessing }`.

### Fix #3: Fixed Mock Data Structure

Updated `mockCompositeIndexes` in `testNodeData.ts` to match the `IndexConfiguration` interface:

**Before**: Wrong structure
```typescript
{
  name: 'entity_type_status_idx',
  table: 'entities',
  columns: ['entity_type', 'status'],
  ...
}
```

**After**: Correct structure
```typescript
{
  indexId: 'idx-001',
  indexName: 'transaction_status_time_idx',
  entityClass: 'Transaction',
  rangeField: {
    columnName: 'startTime',
    columnPath: 'startTime',
    type: 'TIMESTAMP',
    clazzType: 'java.time.Instant',
    decision: null,
  },
  noneRangeFields: [
    {
      columnName: 'status',
      columnPath: 'status',
      type: 'STRING',
      clazzType: 'java.lang.String',
      decision: null,
    },
  ],
  createDate: '2025-10-14T...',
  readyForQuerying: true,
  returnsList: true,
  persisted: true,
  decision: 'CUSTOM',
}
```

### Fix #4: Added Entity Class Filtering

Updated the composite indexes endpoint to filter by entity class:

```typescript
// Extract entityClass from URL query params
const urlObj = new URL(url, 'http://localhost');
const entityClass = urlObj.searchParams.get('entityClass');

// Filter indexes by entity class if specified
const filteredIndexes = entityClass
  ? mockCompositeIndexes.filter(idx => idx.entityClass === entityClass)
  : mockCompositeIndexes;
```

## Test Data

The mock API now provides 5 composite indexes across different entity types:

| Index ID | Index Name | Entity Class | Range Field | Persisted | Decision |
|----------|-----------|--------------|-------------|-----------|----------|
| idx-001 | transaction_status_time_idx | Transaction | startTime | ✅ | CUSTOM |
| idx-002 | event_shard_timestamp_idx | Event | timestamp | ❌ | SYSTEM |
| idx-003 | processing_task_priority_idx | ProcessingTask | priority | ✅ | CUSTOM |
| idx-004 | cassandra_entity_type_idx | CassandraEntity | entityType | ❌ | SYSTEM |
| idx-005 | cache_entry_expiry_idx | CacheEntry | expiryTime | ✅ | CUSTOM |

## How to Test

1. **Open the app**: http://localhost:3008/processing-ui
2. **Enable test mode**: Click the toggle in the bottom-right corner
3. **Navigate to test node**: 
   - Click "Nodes" → Click "test-node-01", OR
   - Go to: http://localhost:3008/processing-ui/nodes/test-node-01
4. **Click "Composite Indexes" tab**
5. **Select an entity type** from the dropdown (e.g., "Transaction")
6. **Verify**: You should see the composite indexes for that entity type

## Files Modified

1. **`src/mocks/mockApi.ts`**
   - Added import for default axios instance
   - Added separate interceptor IDs for both instances
   - Updated `setupMockInterceptors` to handle both instances
   - Updated `enableMockApi()` to setup both instances
   - Updated `disableMockApi()` to cleanup both instances
   - Added entity types mock endpoint
   - Added entity class filtering for composite indexes

2. **`src/mocks/testNodeData.ts`**
   - Completely rewrote `mockCompositeIndexes` with correct structure
   - Added 5 realistic composite indexes
   - Added proper field structures (rangeField, noneRangeFields)
   - Added timestamps, decisions, and persisted flags

## Verification ✅

✅ **Error fixed**: No more `entityTypes.map is not a function` error
✅ **Import error fixed**: No more "does not provide an export named 'default'" error
✅ **Entity types dropdown**: Shows 6 entity types
✅ **Composite indexes**: Shows filtered indexes based on selected entity
✅ **Mock API**: Intercepts both axios instances
✅ **localStorage persistence**: Mock API state persists across pages
✅ **All tests passing**: **12/12 E2E tests pass (100% success rate)**

### Test Results

```
Running 12 tests using 1 worker

✅ should display Mock API toggle component
✅ should enable mock API and show success message
✅ should display test node in nodes list when mock enabled
✅ should navigate to test node detail page
✅ should display mock data in Processing Manager tab
✅ should display mock data in Transactions tab
✅ should lazy load tabs - only active tab makes API calls
✅ should persist tab selection on page reload
✅ should test all 11 tabs are clickable and display content
   ✅ Tab "Processing Manager" is clickable and displays content
   ✅ Tab "Server Summary" is clickable and displays content
   ✅ Tab "Cassandra" is clickable and displays content
   ✅ Tab "PM Components" is clickable and displays content
   ✅ Tab "Processing Events" is clickable and displays content
   ✅ Tab "Time Statistics" is clickable and displays content
   ✅ Tab "Transactions" is clickable and displays content
   ✅ Tab "Composite Indexes" is clickable and displays content
   ✅ Tab "Caches List" is clickable and displays content
   ✅ Tab "Network Info" is clickable and displays content
   ✅ Tab "ZooKeeper Info" is clickable and displays content
✅ should show mock API is working by verifying data
✅ should toggle mock API on and off
✅ should navigate from nodes list to test node

12 passed (1.0m)
```

## Technical Details

### Why Two Axios Instances?

The codebase uses different axios instances for different purposes:

1. **Default axios** (`@cyoda/http-api-react/src/config/axios`):
   - Used for general platform API calls
   - Used by `getReportingFetchTypes`, `getEntity`, etc.
   - Base URL: `VITE_APP_API_BASE`

2. **axiosProcessing** (`@cyoda/http-api-react`):
   - Used specifically for Processing Manager API calls
   - Used by `getPmClusterStats`, `getPmShards`, etc.
   - Base URL: `VITE_APP_API_BASE_PROCESSING`

The mock API must intercept **both** instances to properly mock all API calls.

### Interceptor Management

Each axios instance has its own set of interceptors:
- Request interceptor: Logs API calls
- Response interceptor: Returns mock data

The mock API tracks 4 interceptor IDs:
- `requestInterceptorId` - for axiosProcessing requests
- `responseInterceptorId` - for axiosProcessing responses
- `defaultRequestInterceptorId` - for default axios requests
- `defaultResponseInterceptorId` - for default axios responses

When enabling/disabling mock API, all 4 interceptors are added/removed.

## Next Steps

The Composite Indexes tab is now fully functional with:
- ✅ Entity types dropdown working
- ✅ Composite indexes displaying correctly
- ✅ Entity class filtering working
- ✅ Mock data matching expected structure
- ✅ Both axios instances intercepted

You can now:
1. Select different entity types to see different indexes
2. Test the reindex and delete actions (they will show success messages)
3. Test the search functionality
4. Test the create new dialog (shows "To be implemented" message)

