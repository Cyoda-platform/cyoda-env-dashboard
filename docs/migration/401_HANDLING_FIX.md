# 401 Unauthorized Handling Fix

## Problem Summary

Users were experiencing **401 Unauthorized** errors from API endpoints but were **not being automatically logged out** or redirected to the login page. The application would show error messages in the console but remain on the current page, leaving users in a broken state.

### Root Cause

The application has multiple axios instances with **inconsistent 401 error handling**:

- ✅ **Main `instance`** - Had proper 401 handling with token refresh and automatic logout
- ❌ **`axiosPlatform`** - Missing 401 handling (only had error display)
- ❌ **`axiosProcessing`** - Missing 401 handling (only had error display)
- ❌ **`axiosGrafana`** - Missing 401 handling (only had error display)
- ❌ **`axiosAI`** - Missing 401 handling (only had error display)
- ❌ **`dataProvider` axios instance** - Missing 401 handling

When API calls using these instances received 401 errors, they would:
- ✅ Display error messages via `HelperErrors.handler()`
- ✅ Log errors to console
- ❌ **NOT attempt token refresh**
- ❌ **NOT redirect to login page**
- ❌ **NOT clear authentication data**

## Solution

Added comprehensive 401 error handling to all axios instances with the following behavior:

1. **Attempt Token Refresh**: When a 401 error occurs, try to refresh the access token using the refresh token
2. **Retry Original Request**: If refresh succeeds, retry the original request with the new token
3. **Automatic Logout**: If refresh fails (no refresh token or refresh endpoint returns error), clear auth data and redirect to `/login`
4. **Prevent Duplicate Refreshes**: Use a shared promise to prevent multiple simultaneous refresh attempts

## Files Modified

### 1. `react-project/packages/http-api-react/src/config/axios.ts`

Updated **four axios instances** to include 401 handling:

#### `axiosPlatform` (lines 149-185)
```typescript
axiosPlatform.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Don't show errors if muteErrors is set
    if (!(error.config && (error.config as any).muteErrors)) {
      HelperErrors.handler(error);
    }
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && error.config && !(error.config as any).__isRetryRequest) {
      if (!refreshAccessTokenPromise) {
        refreshAccessTokenPromise = refreshAccessToken();
      }
      
      try {
        await refreshAccessTokenPromise;
        refreshAccessTokenPromise = null;
        
        // Retry the original request
        (error.config as any).__isRetryRequest = true;
        const auth = helperStorage.get('auth');
        const token = auth?.token;
        
        if (error.config.headers && token) {
          error.config.headers.Authorization = `Bearer ${token}`;
        }
        
        return axios.request(error.config);
      } catch (refreshError) {
        refreshAccessTokenPromise = null;
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### `axiosProcessing` (lines 208-244)
- Same 401 handling logic as `axiosPlatform`

#### `axiosGrafana` (lines 260-296)
- Same 401 handling logic as `axiosPlatform`

#### `axiosAI` (lines 319-355)
- Same 401 handling logic as `axiosPlatform`

### 2. `react-project/apps/saas-app/src/providers/dataProvider.ts`

Updated the Refine DataProvider's axios instance:

1. **Changed auth storage** from `localStorage.getItem('auth_token')` to `helperStorage.get('auth')?.token`
2. **Added 401 response interceptor**:
```typescript
// Add response interceptor for 401 handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      helperStorage.remove('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Note**: This instance doesn't attempt token refresh because it's a simpler implementation. If the dataProvider is used in the future, it can be enhanced with the full refresh logic.

## How It Works

### Token Refresh Flow

```
API Request → 401 Error
    ↓
Check if retry already attempted?
    ↓ No
Attempt token refresh
    ↓
Refresh successful?
    ↓ Yes
Update auth storage with new token
    ↓
Retry original request with new token
    ↓
Return response to caller
```

### Logout Flow

```
API Request → 401 Error
    ↓
Attempt token refresh
    ↓
Refresh failed (no refresh token or API error)
    ↓
Clear auth data from storage
    ↓
Redirect to /login
    ↓
User must log in again
```

### Shared Refresh Promise

To prevent multiple simultaneous refresh attempts when multiple API calls fail at the same time:

```typescript
let refreshAccessTokenPromise: Promise<any> | null = null;

// In error handler:
if (!refreshAccessTokenPromise) {
  refreshAccessTokenPromise = refreshAccessToken();
}

try {
  await refreshAccessTokenPromise;
  refreshAccessTokenPromise = null;
  // ... retry request
} catch (refreshError) {
  refreshAccessTokenPromise = null;
  return Promise.reject(refreshError);
}
```

## Testing

### Manual Testing Steps

1. **Test Automatic Logout**:
   - Log in to the application
   - Wait for token to expire or manually invalidate it
   - Navigate to any page that makes API calls (e.g., Reports page)
   - **Expected**: Automatically redirected to `/login` page

2. **Test Token Refresh**:
   - Log in to the application
   - Make API calls while token is still valid but close to expiration
   - **Expected**: Token refreshes automatically, requests succeed

3. **Test Multiple Simultaneous 401s**:
   - Log in to the application
   - Navigate to a page that makes multiple API calls simultaneously
   - Invalidate the token
   - **Expected**: Only one refresh attempt, all requests retry with new token

### Verification

Run the saas-app and verify:
```bash
cd react-project/apps/saas-app
npm run dev
```

The app should:
- ✅ Start without errors
- ✅ Redirect to login when accessing protected routes without auth
- ✅ Automatically logout when receiving 401 errors
- ✅ Show proper error messages before redirecting

## Benefits

1. **Better User Experience**: Users are automatically logged out instead of being stuck in a broken state
2. **Consistent Behavior**: All axios instances now handle 401 errors the same way
3. **Automatic Token Refresh**: Extends user sessions without requiring re-login
4. **Security**: Ensures invalid tokens are immediately cleared from storage
5. **Reliability**: Prevents multiple simultaneous refresh attempts

## Related Files

- `react-project/packages/http-api-react/src/config/axios.ts` - Main axios configuration
- `react-project/apps/saas-app/src/providers/authProvider.ts` - Refine auth provider (has `onError` handler)
- `react-project/apps/saas-app/src/providers/dataProvider.ts` - Refine data provider
- `react-project/apps/saas-app/src/components/AppLayout.tsx` - Layout with auth check

## Future Enhancements

1. **Add retry logic** for network errors (not just 401)
2. **Add exponential backoff** for failed refresh attempts
3. **Add user notification** before automatic logout (e.g., "Session expired, redirecting to login...")
4. **Add refresh token rotation** for enhanced security
5. **Add token expiration check** to proactively refresh before 401 occurs

## Migration Notes

This fix is **backward compatible** and requires no changes to existing code that uses these axios instances. All API calls will automatically benefit from the improved 401 handling.

