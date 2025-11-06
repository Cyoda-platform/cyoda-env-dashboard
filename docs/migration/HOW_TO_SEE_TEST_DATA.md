# How to See Test Data in Processing Manager

## Quick Start Guide

Follow these steps to see test data in all tabs:

### Step 1: Enable Test Mode

1. **Open the application**: http://localhost:3008/processing-ui
2. **Look for the Test Mode window**: Bottom-right corner of the screen
3. **Toggle the switch to ON**: The switch should turn green
4. **Verify**: You should see a green success alert saying "Mock API Enabled"

### Step 2: Navigate to Test Node

1. **Click "Nodes" in the menu**: Left sidebar or top navigation
2. **Find the test node**: Look for `test-node-01` in the nodes list
3. **Click on the test node**: This will open the node detail page

### Step 3: View Test Data in All Tabs

Once you're on the test node detail page, you'll see 11 tabs with test data:

1. **Processing Manager** - Cluster stats and summary
2. **Shards** - 10 test shards with activity data
3. **Transactions** - Transaction processing data
4. **Events** - Processing events and errors
5. **Cassandra** - Database statistics
6. **Components** - PM components and monitors
7. **Composite Indexes** - 5 test indexes (select entity type from dropdown)
8. **Caches** - Cache list with sizes
9. **Network Info** - Server and client connections
10. **ZooKeeper Info** - ZK node information
11. **Server Summary** - Server polling information

## Troubleshooting

### Problem: "No test node in the list"

**Solution**: Make sure Test Mode is enabled BEFORE navigating to the Nodes page.

1. Enable Test Mode (toggle in bottom-right)
2. Refresh the page or navigate to Nodes
3. The test node should appear

### Problem: "Empty tables on all tabs"

**Possible causes:**

1. **Test Mode is OFF**
   - Check the toggle in bottom-right corner
   - Make sure it's green and says "ON"

2. **Not on the test node**
   - Check the URL: should be `/processing-ui/nodes/test-node-01`
   - If you're on a different node, navigate to `test-node-01`

3. **Mock API not intercepting**
   - Open browser console (F12)
   - Look for messages starting with 🧪
   - You should see: "🧪 Mock API enabled for Processing Manager testing"
   - You should see: "🧪 Returning mock cluster stats" when loading data

4. **Browser cache issue**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear browser cache and reload

### Problem: "Composite Indexes tab is empty"

**Solution**: You need to select an entity type from the dropdown.

1. Click the "Composite Indexes" tab
2. Find the "Entity Class" dropdown at the top
3. Select an entity type (e.g., "Transaction", "Event", etc.)
4. The table will populate with indexes for that entity type

## Test Data Details

### Available Test Data

**Cluster Stats:**
- 1 test node: `test-node-01`
- Status: Running
- Uptime: 1 day

**Shards:**
- 10 shards (shard-0 to shard-9)
- 9 active, 1 idle
- Random events processed and queue sizes

**Transactions:**
- 20 test transactions
- Various statuses: COMPLETED, PENDING, FAILED
- Different types: PAYMENT, TRANSFER, UPDATE

**Events:**
- 50 processing events
- Mix of successful and error events
- Various event types

**Composite Indexes:**
- 5 indexes across different entity types
- Transaction: 2 indexes
- Event: 1 index
- ProcessingTask: 1 index
- CassandraEntity: 1 index

**Caches:**
- 8 different caches
- Various sizes and types
- Expandable to see cache keys

**Components:**
- Execution monitors
- Service processes
- Cyoda runnable components

**Network Info:**
- Server information
- Client connections

**ZooKeeper:**
- Current node info
- Online nodes
- Shards distribution
- Cluster state

## Verifying Test Mode is Working

### Check 1: Console Messages

Open browser console (F12) and look for:

```
🧪 Mock API enabled for Processing Manager testing
🧪 Returning mock cluster stats
🧪 Returning mock shards
🧪 Returning mock transactions
... etc
```

### Check 2: Test Mode Window

The Test Mode window should show:
- ✅ Green toggle switch (ON)
- ✅ Green success alert
- ✅ Tags showing available features
- ✅ Navigation instructions

### Check 3: Nodes List

The Nodes page should show:
- At least 1 node: `test-node-01`
- Status: Running
- Base URL: http://localhost:3008

### Check 4: Tab Content

Each tab should show:
- ✅ Data in tables (not empty)
- ✅ No loading spinners (data loaded)
- ✅ No error messages

## Manual Enable (If Auto-Enable Fails)

If test mode doesn't auto-enable, you can manually enable it:

### Option 1: Use the Toggle

1. Find the Test Mode window (bottom-right)
2. Click the toggle switch
3. Wait for the success message

### Option 2: Use Browser Console

1. Open browser console (F12)
2. Type: `enableMockApi()`
3. Press Enter
4. Refresh the page

### Option 3: Clear localStorage and Re-enable

1. Open browser console (F12)
2. Type: `localStorage.clear()`
3. Press Enter
4. Refresh the page
5. Enable Test Mode using the toggle

## Direct Links

For quick access:

- **Home**: http://localhost:3008/processing-ui
- **Nodes List**: http://localhost:3008/processing-ui/nodes
- **Test Node Detail**: http://localhost:3008/processing-ui/nodes/test-node-01
- **Composite Indexes**: http://localhost:3008/processing-ui/nodes/test-node-01 (then click "Composite Indexes" tab)

## Expected Behavior

### When Test Mode is ON:

1. **Nodes page**: Shows `test-node-01` in the list
2. **Node detail page**: All tabs have data
3. **Console**: Shows 🧪 messages for each API call
4. **No network errors**: All API calls are intercepted
5. **Fast loading**: No waiting for real backend

### When Test Mode is OFF:

1. **Nodes page**: May be empty or show real nodes
2. **Node detail page**: May show loading or errors
3. **Console**: No 🧪 messages
4. **Network errors**: Real API calls may fail
5. **Slow loading**: Waiting for real backend

## Summary

**To see test data:**
1. ✅ Enable Test Mode (toggle in bottom-right)
2. ✅ Navigate to Nodes
3. ✅ Click on `test-node-01`
4. ✅ Click through all 11 tabs
5. ✅ For Composite Indexes, select an entity type

**If you don't see data:**
- Check Test Mode is ON
- Check you're on `test-node-01`
- Check browser console for 🧪 messages
- Try hard refresh (Ctrl+Shift+R)

🎉 **Enjoy testing with comprehensive mock data!**

