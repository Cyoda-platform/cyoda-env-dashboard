# Manual Testing Guide for Processing Manager

## Prerequisites
1. Dev server running on http://localhost:3008
2. Mock API enabled (toggle in Test Mode window)
3. Browser: Chrome/Firefox with DevTools open

## Test URL
```
http://localhost:3008/processing-ui/nodes/test-node-01
```

## Testing Checklist

### ✅ Tab 1: Processing Manager
- [ ] Tab loads without errors
- [ ] Summary section displays data
- [ ] Shards table shows rows
- [ ] Tasks section displays
- [ ] Resources section displays
- [ ] No console errors

### ✅ Tab 2: Processing Events
#### Subtab 1: Process Events Statistics
- [ ] Table loads with data
- [ ] Columns: Entity Class, Shard, Processor, Count
- [ ] No console errors

#### Subtab 2: Polling info
- [ ] Data displays (cards or table)
- [ ] Shows polling information
- [ ] No console errors

#### Subtab 3: Processing events view
- [ ] Table loads with events
- [ ] Columns visible
- [ ] Data rows present
- [ ] No console errors

#### Subtab 4: Processing events error view
- [ ] Table loads
- [ ] Error events displayed
- [ ] No console errors

#### Subtab 5: Entities error list view
- [ ] Filter dropdown works
- [ ] Can select entity type
- [ ] Table updates after filter selection
- [ ] No console errors

#### Subtab 6: Sift logger
- [ ] Configuration displays
- [ ] Shows logger settings
- [ ] No console errors

### ✅ Tab 3: Time Statistics
#### Subtab 1: Time stats
- [ ] Table loads with time statistics
- [ ] Data rows present
- [ ] No console errors

#### Subtab 2: Count stats
- [ ] Table loads with count statistics
- [ ] Data rows present
- [ ] No console errors

### ✅ Tab 4: Transactions
#### Main View
- [ ] Transactions table loads
- [ ] Multiple rows visible
- [ ] Columns display correctly
- [ ] No console errors

#### Subtab: Entities list view
- [ ] Filter dropdown works
- [ ] Can select entity class
- [ ] Table updates after selection
- [ ] No console errors

### ✅ Tab 5: PM Components
#### Subtab 1: Execution Queues Info
- [ ] Component loads
- [ ] No console errors

#### Subtab 2: Execution Monitors
- [ ] Table loads
- [ ] Data rows present
- [ ] No console errors

#### Subtab 3: Service Processes View
- [ ] Table loads
- [ ] Shows ready and not ready processes
- [ ] Data rows present
- [ ] No console errors

#### Subtab 4: Cyoda Runnable Components
- [ ] Table loads
- [ ] Component list displayed
- [ ] Data rows present (should show ~10 components)
- [ ] No console errors

### ✅ Tab 6: Composite Indexes
- [ ] Table loads
- [ ] Shows ~15 indexes
- [ ] Entity class filter dropdown works
- [ ] Can select entity class
- [ ] Table filters correctly
- [ ] No console errors

### ✅ Tab 7: Caches List
- [ ] Table loads
- [ ] Shows ~8 cache types
- [ ] Data rows present
- [ ] No console errors

### ✅ Tab 8: Network Info
- [ ] Server info displays
- [ ] Client info displays
- [ ] Data present in cards/descriptions
- [ ] No console errors

### ✅ Tab 9: ZooKeeper Info
#### Subtab 1: Current Node Info
- [ ] Node information displays
- [ ] Shows: Node ID, Hostname, IP, Port, Status, Uptime, JVM Version
- [ ] No console errors

#### Subtab 2: Loaded Online Nodes
- [ ] Three tables display: Default, Processing, Toolbox
- [ ] Default table has 3 nodes
- [ ] Processing table has 2 nodes
- [ ] Toolbox table is empty
- [ ] No console errors

#### Subtab 3: Loaded Shards Distribution
- [ ] Table loads
- [ ] Shows node IDs and their shards
- [ ] 3 nodes with shard mappings
- [ ] No console errors

## Console Checks

### Expected Console Messages (OK)
```
🧪 Mock API enabled for Processing Manager testing
🧪 Mock API Request: GET /platform-processing/...
🧪 Returning mock ...
🔧 Set node in appStore: test-node-01
```

### Warnings to Ignore
```
Warning: `Tabs.TabPane` is deprecated. Please use `items` instead.
Warning: [antd: Card] `bordered` is deprecated. Please use `variant` instead.
```

### Critical Errors (MUST FIX)
- Any `TypeError` or `ReferenceError`
- Any `Cannot read properties of undefined`
- Any `... is not a function`
- Any failed network requests (except favicon)

## Browser DevTools Network Tab

### Check for Mock API Interception
1. Open Network tab
2. Filter by "Fetch/XHR"
3. Navigate through tabs
4. Look for requests to `/platform-processing/` and `/platform-common/`
5. Check console for `🧪 Mock API Request` logs
6. Verify responses contain mock data

### Expected Requests
- `/platform-processing/summary-json.do` → Mock summary
- `/platform-processing/shards-json.do` → Mock shards
- `/platform-processing/stats/process-events` → Mock process events stats
- `/platform-processing/transactions/view` → Mock transactions
- `/platform-common/composite-indexes` → Mock composite indexes
- `/platform-common/cache-info/caches-list` → Mock caches
- `/platform-common/net-info/server` → Mock network info
- `/platform-common/zk-info/curr-node-info` → Mock ZK info

## Test Mode Window

### Toggle Test
- [ ] Window is visible (bottom-right corner)
- [ ] Can minimize/expand window
- [ ] Toggle switch works
- [ ] Enabling mock API shows console message
- [ ] Disabling mock API shows console message
- [ ] State persists on page reload

## Performance Checks
- [ ] Page loads in < 3 seconds
- [ ] Tab switching is smooth (< 500ms)
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] No excessive re-renders

## Accessibility Checks
- [ ] All tables have proper headers
- [ ] Buttons have accessible labels
- [ ] Form inputs have labels
- [ ] Color contrast is sufficient

## Issues Found

### Issue Template
```
**Tab**: [Tab Name]
**Subtab**: [Subtab Name if applicable]
**Issue**: [Description]
**Console Error**: [Error message]
**Expected**: [What should happen]
**Actual**: [What actually happens]
**Screenshot**: [If applicable]
```

## Testing Notes
- Test with mock API enabled
- Test with mock API disabled (should show "no data" or loading states)
- Test browser refresh (state should persist)
- Test different screen sizes (responsive design)

