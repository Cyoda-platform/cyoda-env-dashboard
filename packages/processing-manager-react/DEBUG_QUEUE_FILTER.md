# Debug: Queue Filter Error

## Issue
Error when using Queue filter in "Processing events view" tab:
```
Error: Objects are not valid as a React child (found: object with keys {timeUUID, createTime, doneTime, errorTime, queueName, shardId, status, entityClassName, entityId, entityHasErrors, errorEventTimeUUID, coreDataClassName, clientDataClassName})
```

## Root Cause
The mock API was returning event objects instead of queue strings due to URL matching order.

## Fix Applied
Reordered URL checks in `src/mocks/mockApi.ts` so `/processing-queue/queues.do` is checked BEFORE `/processing-queue/events`.

## ⚠️ IMPORTANT: Clear Browser Cache

The fix requires a **hard refresh** to clear the browser cache:

### How to Hard Refresh:
1. **Chrome/Edge**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Firefox**: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. **Or**: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

## Debugging Steps

### 1. Check Browser Console
After hard refresh, open the browser console (F12) and look for these messages:

**When page loads:**
```
🧪 Mock API Request: GET /platform-processing/processing-queue/queues.do
🧪 Returning mock processing queues: ['queue-0', 'queue-1', 'queue-2', 'queue-3', 'queue-4']
```

**If you see this instead (BAD):**
```
🧪 Mock API Request: GET /platform-processing/processing-queue/queues.do
🧪 Returning mock processing queue events
```
This means the browser is still using cached code.

### 2. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "queues"
4. Look for request to `/platform-processing/processing-queue/queues.do`
5. Check the Response - it should be:
   ```json
   ["queue-0", "queue-1", "queue-2", "queue-3", "queue-4"]
   ```

### 3. Check Console Warnings
After the fix, you should see in console:
```
⚠️ queuesData is not an array: [...]
```
Only if there's still an issue.

### 4. Test Queue Filter
1. Navigate to: `http://localhost:3008/processing-ui/nodes/test-node-01`
2. Enable Test Mode (toggle in bottom-right)
3. Go to "Processing Events" tab
4. Click "Processing events view" sub-tab
5. Click the "Queue" dropdown
6. You should see: queue-0, queue-1, queue-2, queue-3, queue-4
7. Select any queue
8. No error should occur

## If Error Still Occurs

### Check 1: Verify Mock API is Enabled
Look for the "Test Mode" window in the bottom-right corner. Make sure it says "Mock API: Enabled".

### Check 2: Check Console for Errors
Look for any errors in the console that might indicate:
- Mock API not loading
- Interceptors not being set up
- Wrong data being returned

### Check 3: Check the Actual Data
Add this to the browser console:
```javascript
// Check what queuesData contains
window.queuesData = null;
// Then in the component, add: window.queuesData = queuesData;
```

### Check 4: Verify File Changes
Make sure these files have the correct changes:

**src/mocks/mockApi.ts (lines 168-190):**
```typescript
// Processing queues list (MUST come before /processing-queue/events)
if (url.includes('/platform-processing/processing-queue/queues.do')) {
  console.log('🧪 Returning mock processing queues:', mockProcessingQueues);
  return { ...response, data: mockProcessingQueues };
}

// Processing queue events error
if (url.includes('/platform-processing/processing-queue/events/error.json')) {
  console.log('🧪 Returning mock processing queue events error');
  return { ...response, data: mockProcessingQueueEventsError };
}

// Processing queue entities error list
if (url.includes('/platform-processing/processing-queue/entities-error-list.json')) {
  console.log('🧪 Returning mock processing queue entities error list');
  return { ...response, data: mockProcessingQueueEntitiesErrorList };
}

// Processing queue events
if (url.includes('/platform-processing/processing-queue/events')) {
  console.log('🧪 Returning mock processing queue events');
  return { ...response, data: mockProcessingEvents };
}
```

**src/components/processing-events/ProcessingEventsView.tsx (lines 74-85):**
```typescript
const queueOptions = useMemo(() => {
  if (!queuesData || !Array.isArray(queuesData)) {
    console.warn('⚠️ queuesData is not an array:', queuesData);
    return [];
  }
  // Ensure all items are strings
  const validQueues = queuesData.filter(q => typeof q === 'string');
  if (validQueues.length !== queuesData.length) {
    console.error('❌ Some queue items are not strings:', queuesData);
  }
  return validQueues;
}, [queuesData]);
```

## Expected Behavior After Fix

1. ✅ Queue dropdown loads without errors
2. ✅ Queue dropdown shows string values: "queue-0", "queue-1", etc.
3. ✅ Selecting a queue filters the events table
4. ✅ No React errors in console
5. ✅ Console shows: `🧪 Returning mock processing queues: ['queue-0', 'queue-1', 'queue-2', 'queue-3', 'queue-4']`

## Alternative: Restart Dev Server

If hard refresh doesn't work, try restarting the dev server:

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
cd react-project
npm run dev
```

Then navigate to `http://localhost:3008/processing-ui/nodes/test-node-01` and try again.

## Contact

If the issue persists after:
1. Hard refresh
2. Checking console logs
3. Verifying file changes
4. Restarting dev server

Please provide:
1. Screenshot of browser console
2. Screenshot of Network tab showing the `/queues.do` request/response
3. Any error messages

