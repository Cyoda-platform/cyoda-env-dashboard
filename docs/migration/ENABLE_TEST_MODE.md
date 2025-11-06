# Enable Test Mode - Quick Instructions

## 🚀 Quick Start (3 Steps)

### Step 1: Enable Test Mode
Look at the **bottom-right corner** of the screen. You should see a small window that says "Test Mode".

**Click the toggle switch to turn it ON** (it should turn green).

### Step 2: Go to Nodes
Click **"Nodes"** in the left sidebar menu.

### Step 3: Click Test Node
Click on **"test-node-01"** in the nodes list.

**That's it!** You should now see test data in all 11 tabs.

---

## 📋 Detailed Instructions

### What You Should See

#### 1. Test Mode Window (Bottom-Right Corner)

When **OFF** (default):
```
┌──────────────────────────────┐
│ 🧪 Test Mode        [−]      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Enable test mode to use mock │
│ data for testing...          │
└──────────────────────────────┘
```

When **ON** (after clicking toggle):
```
┌──────────────────────────────┐
│ 🧪 Test Mode        [−]      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✓ Mock API Enabled           │
│ All API calls will return    │
│ mock data for testing.       │
│ Test node: test-node-01      │
│                              │
│ [Cluster Stats] [Shards]     │
│ [Transactions] [Events]      │
│ ... more tags ...            │
└──────────────────────────────┘
```

#### 2. Nodes List

After enabling Test Mode, the Nodes page should show:

| Hostname      | Base URL              | Status  | Version |
|---------------|----------------------|---------|---------|
| test-node-01  | http://localhost:3008| Running | 1.0.0   |

**Click on "test-node-01"** to open the node detail page.

#### 3. Node Detail Page (11 Tabs with Data)

You should see these tabs, all with test data:

1. **Processing Manager** ✅
   - Cluster stats
   - Summary information

2. **Shards** ✅
   - 10 shards (shard-0 to shard-9)
   - Status, events processed, queue sizes

3. **Transactions** ✅
   - 20 test transactions
   - Various statuses and types

4. **Events** ✅
   - 50 processing events
   - Success and error events

5. **Cassandra** ✅
   - Database statistics
   - Table information

6. **Components** ✅
   - Execution monitors
   - Service processes
   - Runnable components

7. **Composite Indexes** ✅
   - **IMPORTANT**: Select an entity type from dropdown first!
   - Then you'll see 5 test indexes

8. **Caches** ✅
   - 8 different caches
   - Click to expand and see cache keys

9. **Network Info** ✅
   - Server information
   - Client connections

10. **ZooKeeper Info** ✅
    - Current node info
    - Online nodes
    - Shards distribution

11. **Server Summary** ✅
    - Server polling information

---

## ❌ Troubleshooting: "I don't see test data"

### Problem 1: Empty Tables on All Tabs

**Check 1: Is Test Mode ON?**
- Look at bottom-right corner
- Toggle should be green and say "ON"
- Should see green success alert

**Check 2: Are you on the test node?**
- Check URL: should end with `/nodes/test-node-01`
- If not, go to Nodes and click "test-node-01"

**Check 3: Check browser console**
- Press F12 to open developer tools
- Click "Console" tab
- Look for messages starting with 🧪
- You should see: "🧪 Mock API enabled for Processing Manager testing"

**Fix: Hard Refresh**
- Windows/Linux: Press `Ctrl + Shift + R`
- Mac: Press `Cmd + Shift + R`

### Problem 2: Test Node Not in Nodes List

**Solution:**
1. Make sure Test Mode is ON first
2. Then navigate to Nodes page
3. The test node should appear

**If still not showing:**
1. Hard refresh the page (Ctrl+Shift+R)
2. Or try: localStorage.clear() in console, then refresh

### Problem 3: Composite Indexes Tab is Empty

**This is normal!** You need to select an entity type first.

**Solution:**
1. Click "Composite Indexes" tab
2. Look for "Entity Class" dropdown at the top
3. Click the dropdown
4. Select any entity type (e.g., "Transaction")
5. Table will populate with indexes

**Available entity types:**
- Transaction (2 indexes)
- Event (1 index)
- ProcessingTask (1 index)
- CassandraEntity (1 index)
- ZooKeeperNode (0 indexes)
- CacheEntry (0 indexes)

### Problem 4: Test Mode Window Not Visible

**The window might be minimized!**

Look for a small window in the bottom-right corner. If you see just:
```
┌──────────────────┐
│ 🧪 Test Mode [⤢] │
│ ━━━━━━━━━━━━━━━━ │
└──────────────────┘
```

**Click the expand button [⤢]** to see the full window.

---

## 🔍 Verification Checklist

Use this checklist to verify everything is working:

- [ ] Test Mode window is visible (bottom-right corner)
- [ ] Toggle switch is ON (green)
- [ ] Success alert shows "Mock API Enabled"
- [ ] Browser console shows 🧪 messages
- [ ] Nodes page shows "test-node-01"
- [ ] Clicking test node opens detail page
- [ ] URL ends with `/nodes/test-node-01`
- [ ] Processing Manager tab shows cluster stats
- [ ] Shards tab shows 10 shards
- [ ] Transactions tab shows 20 transactions
- [ ] Events tab shows 50 events
- [ ] Composite Indexes tab has entity dropdown
- [ ] Selecting entity type shows indexes
- [ ] Caches tab shows 8 caches
- [ ] All tabs load without errors

---

## 🎯 Expected Console Messages

When Test Mode is working correctly, you should see these messages in the browser console:

```
🧪 Mock API enabled for Processing Manager testing
🧪 Returning mock cluster stats
🧪 Returning mock entity types
🧪 Returning mock shards
🧪 Returning mock transactions
🧪 Returning mock processing events
🧪 Returning mock composite indexes
🧪 Filtered 2 indexes for entity: Transaction
🧪 Returning mock caches
🧪 Returning mock ZK current node info
... etc
```

If you **don't** see these messages, Test Mode is not working.

---

## 🛠️ Manual Enable (Advanced)

If the toggle doesn't work, you can manually enable Test Mode:

### Option 1: Browser Console
```javascript
// Open console (F12), then type:
enableMockApi()
// Press Enter, then refresh page
```

### Option 2: localStorage
```javascript
// Open console (F12), then type:
localStorage.setItem('processing-manager-mock-api-enabled', 'true')
// Press Enter, then refresh page
```

### Option 3: Clear and Restart
```javascript
// Open console (F12), then type:
localStorage.clear()
// Press Enter, refresh page, then enable Test Mode using toggle
```

---

## 📊 Test Data Summary

Here's what test data is available:

| Feature | Count | Details |
|---------|-------|---------|
| Nodes | 1 | test-node-01 |
| Shards | 10 | shard-0 to shard-9 |
| Transactions | 20 | Various statuses |
| Events | 50 | Success and errors |
| Composite Indexes | 5 | Across 4 entity types |
| Caches | 8 | Different cache types |
| Components | Multiple | Monitors, processes |
| Network Clients | 5 | Test connections |
| ZK Nodes | 3 | Online nodes |

---

## ✅ Success Indicators

You'll know Test Mode is working when:

1. ✅ Toggle is green and says "ON"
2. ✅ Console shows 🧪 messages
3. ✅ Nodes list shows test-node-01
4. ✅ All tabs have data (not empty)
5. ✅ No loading spinners (data loads instantly)
6. ✅ No error messages
7. ✅ No network errors in console

---

## 🎉 You're All Set!

Once Test Mode is enabled and you're on the test node, you can:

- ✅ Test all 11 tabs with realistic data
- ✅ Click through tabs without waiting
- ✅ Filter and search data
- ✅ Expand/collapse sections
- ✅ Test UI interactions
- ✅ Develop new features
- ✅ Run E2E tests

**Enjoy testing!** 🚀

