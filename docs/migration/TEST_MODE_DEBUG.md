# Test Mode Debugging Guide

## Current Issue: Empty Tables After Enabling Test Mode

### Step-by-Step Debugging

#### 1. Open Browser Console
Press **F12** and click on the **Console** tab.

#### 2. Check if Test Mode is Enabled
Type this in the console:
```javascript
localStorage.getItem('processing-manager-mock-api-enabled')
```

**Expected result**: Should return `"true"`

If it returns `null`, test mode is not enabled.

#### 3. Manually Enable Test Mode
Type this in the console:
```javascript
enableMockApi()
```

**Expected result**: You should see:
```
🧪 Mock API enabled for Processing Manager testing
```

#### 4. Hard Refresh the Page
- Windows/Linux: **Ctrl + Shift + R**
- Mac: **Cmd + Shift + R**

This clears the cache and reloads everything.

#### 5. Navigate to Test Node
After the page reloads:
1. Click **"Nodes"** in the menu
2. Look for **"test-node-01"** in the list
3. Click on it

#### 6. Check Console for Mock API Messages
You should see messages like:
```
🧪 Mock API Request: GET /pm-cluster-stats-full.do
🧪 Returning mock cluster stats
🧪 Mock API Request: GET /platform-processing/shards
🧪 Returning mock shards
... etc
```

If you **don't** see these messages, the mock API is not intercepting requests.

#### 7. Check Network Tab
1. Click the **Network** tab in developer tools
2. Look for requests to `/pm-cluster-stats-full.do`, `/platform-processing/shards`, etc.
3. Check if they're returning **200 OK** or **404/500 errors**

If you see errors, the mock API is not working.

### Common Problems and Solutions

#### Problem 1: "localStorage returns 'true' but no mock messages"

**Solution**: The interceptors might not be set up. Try:
```javascript
// In console:
disableMockApi()
enableMockApi()
// Then hard refresh
```

#### Problem 2: "I see 404 errors in Network tab"

**Solution**: The mock API is not intercepting. The old version of mockApi.ts only intercepts `axiosProcessing`, not the default `axios` instance.

**Fix**: We need to update mockApi.ts to intercept both instances (which we did earlier but it got reverted).

#### Problem 3: "Test node not in nodes list"

**Solution**: The cluster stats endpoint might not be mocked properly.

**Check**: In console, type:
```javascript
// Check if mock data is available
import('./mocks/testNodeData').then(m => console.log(m.mockClusterStats))
```

#### Problem 4: "Everything looks right but tables are still empty"

**Possible causes**:
1. React Query cache is stale
2. Components are not refetching after mock API is enabled
3. The hooks have `enabled: false` and never run

**Solution**: After enabling test mode, navigate away and back:
1. Enable test mode
2. Go to Home page
3. Go to Nodes
4. Click test node

This forces React Query to refetch.

### Manual Test

Try this complete sequence:

```javascript
// 1. Clear everything
localStorage.clear()
location.reload()

// 2. After page reloads, enable mock API
enableMockApi()

// 3. Hard refresh
location.reload()

// 4. After reload, check if enabled
localStorage.getItem('processing-manager-mock-api-enabled') // Should be "true"

// 5. Navigate to nodes
// Click "Nodes" in menu

// 6. Check console for mock messages
// You should see: 🧪 Mock API Request: GET /pm-cluster-stats-full.do
```

### Expected Console Output

When everything is working, you should see:

```
🧪 Mock API enabled for Processing Manager testing
🧪 Mock API auto-enabled from previous session
🧪 Mock API Request: GET /pm-cluster-stats-full.do
🧪 Returning mock cluster stats
🧪 Mock API Request: GET /platform-processing/shards
🧪 Returning mock shards
🧪 Mock API Request: GET /platform-processing/transactions/view
🧪 Returning mock transactions
... etc
```

### If Nothing Works

The issue might be that the current mockApi.ts file doesn't intercept both axios instances. We updated it earlier to support both `axios` and `axiosProcessing`, but the file might have been reverted.

**Check the file**:
Look at `src/mocks/mockApi.ts` line 7:
- If it says: `import { axiosProcessing } from '@cyoda/http-api-react';`
  - This is the OLD version (only intercepts axiosProcessing)
- If it says: `import { axios, axiosProcessing } from '@cyoda/http-api-react';`
  - This is the NEW version (intercepts both)

**The problem**: Some endpoints use the default `axios` instance (like entity types), so if we're only intercepting `axiosProcessing`, those requests will fail.

### Quick Fix

If the file is the old version, we need to update it to intercept both axios instances. The changes we made earlier should be applied.

### Alternative: Check if Backend is Running

If test mode is OFF, the app tries to connect to a real backend. If there's no backend running, you'll see empty tables.

**Check**: Look for network errors in the Network tab. If you see lots of 404s or connection errors, that's expected when test mode is OFF.

**Solution**: Make sure test mode is ON before navigating to any pages.

### Summary

**Most likely cause**: Test mode is enabled, but you need to hard refresh the page for the interceptors to be set up properly.

**Quick fix**:
1. Enable test mode (toggle ON)
2. Hard refresh (Ctrl+Shift+R)
3. Navigate to Nodes
4. Click test-node-01
5. Check console for 🧪 messages

If you still don't see data, the mockApi.ts file might need to be updated to intercept both axios instances.

