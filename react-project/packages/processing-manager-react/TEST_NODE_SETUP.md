# Test Node Setup for Processing Manager

## Overview

This document describes how to use the **Test Node** feature for comprehensive testing of all Processing Manager functionality without requiring a real backend server.

## Features

The test node provides mock data for:

✅ **Cluster Statistics** - Node status, uptime, version info  
✅ **Processing Manager Tab** - Summary, shards, resources  
✅ **Server Summary** - JVM stats, system info, threads  
✅ **Cassandra** - Database stats, tables, latency  
✅ **PM Components** - Runnable components, execution monitors  
✅ **Processing Events** - Event queue, processing stats  
✅ **Time Statistics** - Processing time metrics, percentiles  
✅ **Transactions** - Transaction list, statuses, entities  
✅ **Composite Indexes** - Database indexes info  
✅ **Caches List** - Cache statistics, hit rates  
✅ **Network Info** - Network connections, clients  
✅ **ZooKeeper Info** - Cluster state, node distribution  

## Quick Start

### 1. Start the Development Server

```bash
cd react-project
npm run dev
```

The app will be available at `http://localhost:3008`

### 2. Enable Test Mode

Once the app loads, you'll see a **Test Mode** toggle in the bottom-right corner:

![Test Mode Toggle](docs/test-mode-toggle.png)

Click the switch to **ON** to enable mock API responses.

### 3. Navigate to Test Node

With test mode enabled, navigate to:

```
http://localhost:3008/processing-ui/nodes/test-node-01
```

Or:
1. Go to the Nodes page: `http://localhost:3008/processing-ui/nodes`
2. Click on the `test-node-01` row

### 4. Test All Tabs

The test node has mock data for all 11 tabs:

1. **Processing Manager** - View shards, resources, tasks
2. **Server Summary** - JVM and system statistics
3. **Cassandra** - Database connection and stats
4. **PM Components** - Running components and monitors
5. **Processing Events** - Event queue and processing
6. **Time Statistics** - Processing time metrics
7. **Transactions** - Transaction management
8. **Composite Indexes** - Database indexes
9. **Caches List** - Cache performance
10. **Network Info** - Network connections
11. **ZooKeeper Info** - Cluster coordination

## Mock Data Details

### Test Node Configuration

- **Node Name**: `test-node-01`
- **Base URL**: `http://localhost:3008`
- **Status**: Running
- **Shards**: 10 (shard-0 through shard-9)
- **Uptime**: 1 day

### Sample Data Volumes

- **Events**: 1,250 total (1,000 completed, 50 failed, 200 pending)
- **Transactions**: 30 transactions (various statuses)
- **Shards**: 10 active shards
- **Components**: 3 runnable components
- **Caches**: 3 caches (Entity, Transaction, Config)
- **Network Clients**: 3 connected clients

### Mock API Endpoints

All Processing Manager API endpoints are mocked:

```typescript
// Cluster & Nodes
GET /platform-processing/pm-cluster-stats-full.do

// Processing Manager
GET /platform-processing/summary
GET /platform-processing/shards
GET /platform-processing/polling-info-json.do

// Cassandra
GET /platform-processing/cassandra/stats

// Events & Transactions
GET /platform-processing/stats/process-events
GET /platform-processing/processing-queue/events
GET /platform-processing/stats/time
GET /platform-processing/stats/count
GET /platform-processing/transactions/view
GET /platform-processing/transactions/statuses

// Components
GET /platform-processing/runnable-components.do
GET /platform-processing/exec-monitors-info-json.do
GET /platform-processing/service-processes/service-processes-stats.do

// Infrastructure
GET /platform-common/composite-indexes
GET /platform-common/caches-list
GET /platform-common/net-info
GET /platform-common/zk-info/curr-node-info
GET /platform-common/zk-info/loaded-online-nodes
GET /platform-common/zk-info/loaded-shards-distribution
GET /platform-common/zk-info/cluster-state
```

## Programmatic Usage

### Enable/Disable Mock API in Code

```typescript
import { enableMockApi, disableMockApi, isMockApiEnabled } from '@cyoda/processing-manager-react/mocks';

// Enable mock API
enableMockApi();

// Disable mock API
disableMockApi();

// Check if enabled
const isEnabled = isMockApiEnabled();
```

### Access Mock Data Directly

```typescript
import {
  mockClusterStats,
  mockSummary,
  mockShards,
  mockTransactions,
  TEST_NODE_NAME,
} from '@cyoda/processing-manager-react/mocks';

console.log('Test node name:', TEST_NODE_NAME);
console.log('Mock shards:', mockShards);
```

### Custom Mock Data

You can modify the mock data in:

```
react-project/packages/processing-manager-react/src/mocks/testNodeData.ts
```

Example - Add more shards:

```typescript
export const mockShards = Array.from({ length: 20 }, (_, i) => ({
  shardId: i,
  name: `shard-${i}`,
  status: i < 18 ? 'ACTIVE' : 'IDLE',
  // ... other properties
}));
```

## Testing Scenarios

### 1. Test Lazy Loading

1. Enable test mode
2. Navigate to test node
3. Open browser DevTools → Network tab
4. Click through different tabs
5. Verify: Only active tab makes API calls

### 2. Test Tab Persistence

1. Enable test mode
2. Navigate to test node
3. Switch to "Transactions" tab
4. Reload the page (Cmd+R / Ctrl+R)
5. Verify: "Transactions" tab is still active

### 3. Test Error Handling

1. Enable test mode
2. Navigate to test node
3. Disable test mode while on a tab
4. Verify: Graceful error handling

### 4. Test Performance

1. Enable test mode
2. Navigate to test node
3. Open DevTools → Performance tab
4. Record page load
5. Verify: Fast initial render (only 1 tab loaded)

## E2E Testing with Playwright

The test node is perfect for E2E tests:

```typescript
import { test, expect } from '@playwright/test';

test('test node displays all tabs', async ({ page }) => {
  // Enable mock API
  await page.goto('http://localhost:3008/processing-ui');
  await page.evaluate(() => {
    (window as any).enableMockApi();
  });

  // Navigate to test node
  await page.goto('http://localhost:3008/processing-ui/nodes/test-node-01');

  // Test all tabs
  const tabs = [
    'Processing Manager',
    'Server Summary',
    'Cassandra',
    'PM Components',
    'Processing Events',
    'Time Statistics',
    'Transactions',
    'Composite Indexes',
    'Caches List',
    'Network Info',
    'ZooKeeper Info',
  ];

  for (const tab of tabs) {
    await page.click(`text=${tab}`);
    await expect(page.locator('.ant-tabs-tabpane-active')).toBeVisible();
  }
});
```

## Troubleshooting

### Mock API Not Working

**Problem**: Test mode is ON but still getting real API errors

**Solution**:
1. Check browser console for "🧪 Mock API enabled" message
2. Verify you're navigating to `test-node-01`
3. Try refreshing the page after enabling test mode
4. Check that axios interceptors are set up correctly

### No Data Showing

**Problem**: Tabs are empty even with test mode enabled

**Solution**:
1. Open browser console
2. Look for "🧪 Returning mock..." messages
3. If missing, the URL pattern might not match
4. Check `mockApi.ts` for the correct URL pattern

### Test Mode Toggle Not Visible

**Problem**: Can't find the test mode toggle

**Solution**:
1. Check that you're on a Processing Manager page
2. Look in the bottom-right corner
3. Verify `MockApiToggle` is imported in `Layout.tsx`
4. Check browser console for errors

## Development

### File Structure

```
src/
├── mocks/
│   ├── index.ts              # Exports
│   ├── testNodeData.ts       # Mock data definitions
│   └── mockApi.ts            # Axios interceptors
└── components/
    └── MockApiToggle.tsx     # UI toggle component
```

### Adding New Mock Endpoints

1. Add mock data to `testNodeData.ts`:

```typescript
export const mockNewFeature = {
  // ... your mock data
};
```

2. Add interceptor in `mockApi.ts`:

```typescript
if (url.includes('/platform-processing/new-feature')) {
  console.log('🧪 Returning mock new feature');
  return { ...response, data: mockNewFeature };
}
```

3. Test the new endpoint with test mode enabled

## Best Practices

1. **Always use test mode for development** - Faster iteration, no backend needed
2. **Test with real backend before deployment** - Ensure mock data matches reality
3. **Keep mock data realistic** - Use representative volumes and values
4. **Update mock data when APIs change** - Keep mocks in sync with backend
5. **Use test node for E2E tests** - Reliable, fast, no external dependencies

## Benefits

✅ **No Backend Required** - Develop and test without running backend services  
✅ **Fast Development** - Instant responses, no network latency  
✅ **Reliable Testing** - Consistent data, no flaky tests  
✅ **Easy Debugging** - Console logs show all mock API calls  
✅ **Complete Coverage** - All 11 tabs have mock data  
✅ **Realistic Data** - Mock data mimics real production scenarios  

## Next Steps

1. Enable test mode and explore all tabs
2. Try the lazy loading feature (switch between tabs)
3. Test tab persistence (reload the page)
4. Run E2E tests with the test node
5. Customize mock data for your specific testing needs

---

**Happy Testing!** 🧪🚀

