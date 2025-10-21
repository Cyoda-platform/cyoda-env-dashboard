# 🚀 Quick Start: Test Node

## 3-Step Setup

### Step 1: Enable Test Mode

Look for the **Test Mode** toggle in the **bottom-right corner** of the page:

```
┌─────────────────────────────────┐
│ 🧪 Test Mode          [ON/OFF] │
│                                 │
│ ✅ Mock API Enabled             │
│ All API calls will return mock │
│ data for testing.               │
│ Test node: test-node-01         │
│                                 │
│ [Cluster Stats] [Shards]        │
│ [Transactions] [Events]         │
│ [ZooKeeper] [Network]           │
│ [Caches] [Components]           │
│                                 │
│ Navigate to:                    │
│ /processing-ui/nodes/           │
│ test-node-01                    │
└─────────────────────────────────┘
```

**Click the switch to ON** ✅

### Step 2: Navigate to Test Node

**Option A**: Direct URL
```
http://localhost:3008/processing-ui/nodes/test-node-01
```

**Option B**: Via Nodes Page
1. Go to: `http://localhost:3008/processing-ui/nodes`
2. Click on `test-node-01` row

### Step 3: Test All Tabs

Click through all 11 tabs to see mock data:

```
┌────────────────────────────────────────────────────────────┐
│ Node: test-node-01                                         │
├────────────────────────────────────────────────────────────┤
│ [Processing Manager] [Server Summary] [Cassandra]          │
│ [PM Components] [Processing Events] [Time Statistics]      │
│ [Transactions] [Composite Indexes] [Caches List]           │
│ [Network Info] [ZooKeeper Info]                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📊 Processing Manager Tab                                 │
│                                                            │
│  Shards: 10 active                                         │
│  ┌──────────────────────────────────────┐                 │
│  │ shard-0  │ ACTIVE  │ 542 events      │                 │
│  │ shard-1  │ ACTIVE  │ 789 events      │                 │
│  │ shard-2  │ ACTIVE  │ 321 events      │                 │
│  │ ...                                   │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## What You'll See

### 1. Processing Manager Tab
- ✅ 10 shards (shard-0 to shard-9)
- ✅ Shard status (ACTIVE/IDLE)
- ✅ Events processed per shard
- ✅ Processing times

### 2. Server Summary Tab
- ✅ JVM statistics (heap, GC)
- ✅ System info (OS, CPU, RAM)
- ✅ Thread counts
- ✅ Uptime: 1 day

### 3. Cassandra Tab
- ✅ Connection status: Connected
- ✅ 3 tables (events, transactions, entities)
- ✅ Read/write latency
- ✅ Throughput metrics

### 4. PM Components Tab
- ✅ EventProcessor (8/10 threads)
- ✅ TransactionManager (4/5 threads)
- ✅ CacheManager (2/3 threads)

### 5. Processing Events Tab
- ✅ 50 events (various types)
- ✅ Status: PENDING, PROCESSING, COMPLETED, FAILED
- ✅ Entity types: Order, Customer, Product
- ✅ Retry counts

### 6. Time Statistics Tab
- ✅ Avg processing time: 125.5ms
- ✅ P50: 100ms, P95: 350ms, P99: 650ms
- ✅ Time range distribution
- ✅ Hourly statistics

### 7. Transactions Tab
- ✅ 30 transactions
- ✅ Types: SYNC, ASYNC, BATCH
- ✅ Statuses: PENDING, IN_PROGRESS, COMPLETED, FAILED
- ✅ Duration and entity counts

### 8. Composite Indexes Tab
- ✅ 3 indexes
- ✅ Tables: entities, events, transactions
- ✅ Cardinality and size info

### 9. Caches List Tab
- ✅ EntityCache (85% hit rate)
- ✅ TransactionCache (78% hit rate)
- ✅ ConfigCache (95% hit rate)

### 10. Network Info Tab
- ✅ Hostname: test-node-01
- ✅ IP: 192.168.1.100
- ✅ 60 connections (45 active, 15 idle)
- ✅ 3 connected clients

### 11. ZooKeeper Info Tab
- ✅ Connected to 3 ZK servers
- ✅ Cluster state (leader + followers)
- ✅ Current node path and data
- ✅ Shards distribution

## Console Output

Open **DevTools Console** (F12) to see mock API logs:

```
🧪 Mock API enabled for Processing Manager testing
🧪 Mock API Request: GET /platform-processing/pm-cluster-stats-full.do
🧪 Returning mock cluster stats
🧪 Mock API Request: GET /platform-processing/summary
🧪 Returning mock summary
🧪 Mock API Request: GET /platform-processing/shards
🧪 Returning mock shards
```

## Testing Features

### Test Lazy Loading

1. Enable test mode
2. Go to test node
3. Open **DevTools → Network tab**
4. Click "Processing Manager" tab → See 1 API call
5. Click "Transactions" tab → See 1 API call
6. **Verify**: Only active tab makes API calls ✅

### Test Tab Persistence

1. Enable test mode
2. Go to test node
3. Click "Transactions" tab
4. **Reload page** (Cmd+R / Ctrl+R)
5. **Verify**: "Transactions" tab is still active ✅

### Test Navigation

1. Enable test mode
2. Click "Dashboard" in header → Goes to home ✅
3. Click "Nodes" in sidebar → Goes to nodes list ✅
4. Click on `test-node-01` → Goes to node detail ✅

## Troubleshooting

### ❌ Toggle Not Visible

**Check**:
- Are you on a Processing Manager page?
- Look in the **bottom-right corner**
- Try refreshing the page

### ❌ No Mock Data

**Check**:
1. Is test mode **ON** (green)?
2. Are you on `test-node-01`?
3. Check console for "🧪 Mock API enabled"
4. Try refreshing after enabling test mode

### ❌ API Errors

**Check**:
1. Disable test mode
2. Re-enable test mode
3. Refresh the page
4. Check console for errors

## Advanced Usage

### Programmatic Control

```typescript
// In browser console
window.enableMockApi();   // Enable
window.disableMockApi();  // Disable
window.isMockApiEnabled(); // Check status
```

### Custom Mock Data

Edit: `src/mocks/testNodeData.ts`

```typescript
// Add more shards
export const mockShards = Array.from({ length: 20 }, ...);

// Change test node name
export const TEST_NODE_NAME = 'my-test-node';

// Modify event counts
export const mockSummary = {
  totalEvents: 5000,
  processedEvents: 4500,
  // ...
};
```

## E2E Testing

```typescript
test('test node displays data', async ({ page }) => {
  await page.goto('http://localhost:3008/processing-ui');
  
  // Enable test mode
  await page.click('[role="switch"]');
  
  // Go to test node
  await page.goto('http://localhost:3008/processing-ui/nodes/test-node-01');
  
  // Verify data
  await expect(page.locator('text=shard-0')).toBeVisible();
  await expect(page.locator('text=test-node-01')).toBeVisible();
});
```

## Summary

✅ **Enable test mode** - Toggle in bottom-right  
✅ **Navigate to test node** - `/processing-ui/nodes/test-node-01`  
✅ **Test all tabs** - 11 tabs with mock data  
✅ **Check console** - See "🧪 Mock API" logs  
✅ **Test features** - Lazy loading, tab persistence  

---

**That's it!** You now have a fully functional test node for comprehensive Processing Manager testing. 🎉

**Need help?** See `TEST_NODE_SETUP.md` for detailed documentation.

