# Cyoda Backend Connection Guide

## Overview

This guide explains how the SaaS app is configured to connect to the Cyoda backend at `https://cyoda-develop.kube3.cyoda.org`.

## Configuration Changes

### 1. Environment Variables (.env)

The `.env` file has been updated with the following Cyoda backend configuration:

```bash
# ============================================================================
# API Configuration
# ============================================================================

# Main API Base URL - Points to Cyoda backend
VITE_APP_API_BASE=/api

# Processing API Base URL
VITE_APP_API_BASE_PROCESSING=

# Base URL for the application
VITE_APP_BASE_URL=https://cyoda-develop.kube3.cyoda.org/

# ============================================================================
# Grafana Configuration
# ============================================================================

VITE_APP_GRAFANA_API_URL=https://grafana.cyoda.com/api
VITE_APP_GRAFANA_API_KEY=<some-key>
VITE_APP_GRAFANA_SERVER_SOURCE_ID=1

# ============================================================================
# Auth0 Configuration
# ============================================================================

VITE_APP_AUTH0_DOMAIN=dev-ex6r-yqc.us.auth0.com
VITE_APP_AUTH0_CLIENT_ID=2kuC9TpwD2lxTYbzFO3GLpx4EHO6362A
VITE_APP_AUTH0_AUDIENCE=https://cobi.cyoda.com/api
VITE_APP_AUTH0_REDIRECT_URI=https://cobi.cyoda.com

# ============================================================================
# Debug
# ============================================================================

VITE_APP_DEBUG=true
```

### 2. Vite Proxy Configuration (vite.config.ts)

The Vite development server is configured to proxy API requests to the Cyoda backend:

```typescript
server: {
  port: 3000,
  proxy: {
    // Proxy to Cyoda backend
    '/platform-api': {
      target: 'https://cyoda-develop.kube3.cyoda.org',
      changeOrigin: true,
      secure: false,
    },
    '/platform-processing': {
      target: 'https://cyoda-develop.kube3.cyoda.org/api',
      changeOrigin: true,
      secure: false,
    },
    '/api': {
      target: 'https://cyoda-develop.kube3.cyoda.org',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### 3. Authentication Integration (Login.tsx)

The Login component has been updated to use the actual Cyoda backend authentication API:

#### Standard Login (Username/Password)
- Calls `/platform-api/auth/login` endpoint
- Receives authentication token and user data from backend
- Stores token in localStorage for subsequent API calls

#### Auth0 Login
- Uses Auth0 SDK to authenticate user
- Sends Auth0 token to `/platform-api/auth/auth0` endpoint
- Backend validates Auth0 token and returns Cyoda session token
- Stores Cyoda token in localStorage

## How It Works

### Authentication Flow

1. **Standard Login:**
   ```
   User enters credentials
   → POST /platform-api/auth/login
   → Backend validates credentials
   → Returns { token, refreshToken, username, userId, legalEntityId }
   → Token stored in localStorage
   → User redirected to /trino
   ```

2. **Auth0 Login:**
   ```
   User clicks "Login with Auth0"
   → Auth0 SDK handles authentication
   → Receives Auth0 access token
   → POST /platform-api/auth/auth0 with Auth0 token
   → Backend validates Auth0 token
   → Returns { token, refreshToken, username, userId, legalEntityId }
   → Token stored in localStorage
   → User redirected to /trino
   ```

### API Request Flow

All API requests automatically include the authentication token:

```
API Request
→ Axios interceptor adds Authorization header
→ Request proxied to Cyoda backend (in dev mode)
→ Backend validates token
→ Returns response
```

## API Endpoints

The app uses the following API base URLs:

- **Main API:** `https://cyoda-develop.kube3.cyoda.org/api`
- **Processing API:** `https://cyoda-develop.kube3.cyoda.org/api/processing`

### Key Endpoints

- `POST /platform-api/auth/login` - Standard login
- `POST /platform-api/auth/auth0` - Auth0 login
- `POST /platform-api/auth/refresh` - Refresh token
- `POST /platform-api/auth/logout` - Logout
- `/platform-processing/*` - Processing manager endpoints

## Development vs Production

### Development Mode (npm run dev)
- Runs on `http://localhost:3000`
- Vite proxy forwards API requests to Cyoda backend
- CORS handled by proxy
- Hot module replacement enabled

### Production Build (npm run build)
- Static files served from CDN/web server
- Direct API calls to `https://cyoda-develop.kube.cyoda.org`
- CORS must be configured on backend
- Environment variables baked into build

## Testing the Connection

### 1. Start the Development Server

```bash
cd react-project/apps/saas-app
npm run dev
```

### 2. Test Standard Login

1. Navigate to `http://localhost:3000`
2. Enter valid Cyoda credentials
3. Click "Log in"
4. Check browser console for API calls
5. Verify successful authentication and redirect

### 3. Test Auth0 Login

1. Navigate to `http://localhost:3000`
2. Click "Login with Auth0"
3. Complete Auth0 authentication
4. Verify backend token exchange
5. Check successful redirect

### 4. Verify API Calls

Open browser DevTools → Network tab:
- Look for requests to `/platform-api/*`
- Verify they're proxied to Cyoda backend
- Check Authorization headers include token
- Verify successful responses

## Troubleshooting

### CORS Errors
- In development, proxy should handle CORS
- If issues persist, check Vite proxy configuration
- Verify `changeOrigin: true` is set

### Authentication Failures
- Check credentials are valid for Cyoda backend
- Verify Auth0 configuration matches backend
- Check browser console for detailed error messages
- Verify backend is accessible at `https://cyoda-develop.kube3.cyoda.org`

### Proxy Issues
- Check Vite dev server console for proxy errors
- Verify backend URL is correct
- Test backend accessibility directly (curl/Postman)
- Check network connectivity

### Token Issues
- Clear localStorage and try again
- Check token format in localStorage
- Verify token is included in API request headers
- Check token expiration

## Environment Switching

To switch between different environments, update the `.env` file:

### Local Backend
```bash
VITE_APP_API_BASE=http://localhost:8082/api
VITE_APP_API_BASE_PROCESSING=http://localhost:8081/processing
VITE_APP_BASE_URL=http://localhost:8081/
```

### Cyoda Development
```bash
VITE_APP_API_BASE=/api
VITE_APP_API_BASE_PROCESSING=
VITE_APP_BASE_URL=https://cyoda-develop.kube3.cyoda.org/
```

### Production
```bash
VITE_APP_API_BASE=https://your-production-domain.com/api
VITE_APP_API_BASE_PROCESSING=https://your-production-domain.com/api/processing
VITE_APP_BASE_URL=https://your-production-domain.com/
```

## Security Considerations

1. **Token Storage:** Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **HTTPS:** Always use HTTPS in production
3. **Token Refresh:** Implement automatic token refresh before expiration
4. **Logout:** Clear all auth data from localStorage on logout
5. **CORS:** Configure backend CORS policies appropriately

## Next Steps

1. Test authentication with real Cyoda credentials
2. Verify all API endpoints work correctly
3. Test token refresh mechanism
4. Implement proper error handling for network failures
5. Add loading states for API calls
6. Consider implementing token refresh interceptor
7. Add comprehensive logging for debugging

