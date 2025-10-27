# Quick Start - Cyoda Backend Connection

## Prerequisites

- Node.js installed
- npm installed
- Access to Cyoda backend at `https://cyoda-develop.kube.cyoda.org`
- Valid Cyoda credentials or Auth0 account

## Quick Start (3 Steps)

### Step 1: Verify Configuration

```bash
cd react-project/apps/saas-app
./test-backend-connection.sh
```

Expected output:
```
✓ Backend is reachable
✓ API endpoint responded
✓ Platform API endpoint responded
✓ Processing API endpoint responded
✓ Environment variables configured
```

### Step 2: Install Dependencies (if needed)

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will start at: **http://localhost:3000**

## Testing Login

### Option 1: Standard Login

1. Navigate to http://localhost:3000
2. Enter your Cyoda username and password
3. Click "Log in"
4. You should be redirected to `/trino` on success

### Option 2: Auth0 Login

1. Navigate to http://localhost:3000
2. Click "Login with Auth0"
3. Complete Auth0 authentication
4. You should be redirected to `/trino` on success

## Verify Connection

### Check Browser Console

Open DevTools (F12) → Console tab:
- Look for successful API calls
- Check for authentication token
- Verify no CORS errors

### Check Network Tab

Open DevTools (F12) → Network tab:
- Filter by "platform-api"
- Look for POST request to `/platform-api/auth/login` or `/platform-api/auth/auth0`
- Check response status is 200
- Verify response contains token

### Check localStorage

Open DevTools (F12) → Application tab → Local Storage:
- Look for 'auth' key
- Should contain:
  ```json
  {
    "token": "...",
    "refreshToken": "...",
    "user": "username",
    "userId": "...",
    "legalEntityId": "...",
    "type": "standard" or "auth0"
  }
  ```

## Troubleshooting

### Backend Not Reachable

```bash
# Test backend directly
curl https://cyoda-develop.kube.cyoda.org/platform-api

# Should return HTTP 200
```

### Login Fails

1. Check credentials are correct
2. Check browser console for errors
3. Check Network tab for failed requests
4. Verify backend is accessible

### CORS Errors

- Should not happen in development (proxy handles it)
- If you see CORS errors, check Vite proxy configuration
- Restart dev server: `npm run dev`

### Proxy Not Working

1. Check Vite console for proxy errors
2. Verify `vite.config.ts` proxy settings
3. Restart dev server

## Environment Variables

Current configuration (`.env`):

```bash
# Backend URLs
VITE_APP_API_BASE=https://cyoda-develop.kube.cyoda.org/api
VITE_APP_API_BASE_PROCESSING=https://cyoda-develop.kube.cyoda.org/api/processing
VITE_APP_BASE_URL=https://cyoda-develop.kube.cyoda.org/

# Auth0
VITE_APP_AUTH0_DOMAIN=dev-ex6r-yqc.us.auth0.com
VITE_APP_AUTH0_CLIENT_ID=2kuC9TpwD2lxTYbzFO3GLpx4EHO6362A
VITE_APP_AUTH0_AUDIENCE=https://cobi.cyoda.com/api

# Debug
VITE_APP_DEBUG=true
```

## What Happens When You Login

### Standard Login Flow

```
1. User enters credentials
   ↓
2. POST /platform-api/auth/login
   ↓
3. Vite proxy forwards to Cyoda backend
   ↓
4. Backend validates credentials
   ↓
5. Backend returns token + user data
   ↓
6. Token stored in localStorage
   ↓
7. User redirected to /trino
```

### Auth0 Login Flow

```
1. User clicks "Login with Auth0"
   ↓
2. Auth0 SDK handles authentication
   ↓
3. Auth0 returns access token
   ↓
4. POST /platform-api/auth/auth0 with Auth0 token
   ↓
5. Vite proxy forwards to Cyoda backend
   ↓
6. Backend validates Auth0 token
   ↓
7. Backend returns Cyoda session token
   ↓
8. Token stored in localStorage
   ↓
9. User redirected to /trino
```

## API Calls After Login

All subsequent API calls automatically include the authentication token:

```javascript
// Axios interceptor adds this header automatically
Authorization: Bearer <token>
```

Example API call:
```
GET /platform-api/some-endpoint
Headers:
  Authorization: Bearer eyJhbGc...
  X-Requested-With: XMLHttpRequest
```

## Switching to Local Backend

To use a local backend instead:

1. Edit `.env`:
   ```bash
   VITE_APP_API_BASE=http://localhost:8082/api
   VITE_APP_API_BASE_PROCESSING=http://localhost:8081/processing
   ```

2. Edit `vite.config.ts`:
   ```typescript
   proxy: {
     '/platform-api': {
       target: 'http://localhost:8080',
       changeOrigin: true,
     },
     // ... other proxies
   }
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

## Next Steps

After successful login:

1. Test navigation to different pages
2. Test API calls to backend
3. Test Processing Manager features
4. Test data loading and display
5. Test CRUD operations

## Support

For issues or questions:

1. Check browser console for errors
2. Check Network tab for failed requests
3. Check Vite console for proxy errors
4. Review `CYODA_BACKEND_CONNECTION.md` for detailed information
5. Test backend connectivity with `./test-backend-connection.sh`

## Summary

✅ Backend configured: `https://cyoda-develop.kube.cyoda.org`
✅ Proxy configured: Vite dev server
✅ Authentication: Standard + Auth0
✅ Token management: Automatic via axios interceptors
✅ Environment: Development mode with debug enabled

**You're ready to go! Start the dev server and login.** 🚀

