/**
 * Auth0 Token Manager
 * 
 * Manages Auth0 token refresh for use in axios interceptors.
 * The getAccessTokenSilently function is set from the Auth0Provider context.
 */

import { HelperStorage } from '@cyoda/http-api-react/utils/storage';

const helperStorage = new HelperStorage();

type GetAccessTokenSilently = () => Promise<string>;

let getAccessTokenSilentlyFn: GetAccessTokenSilently | null = null;

/**
 * Set the getAccessTokenSilently function from Auth0 context
 * This should be called once when the app initializes with Auth0
 */
export function setAuth0TokenGetter(fn: GetAccessTokenSilently): void {
  getAccessTokenSilentlyFn = fn;
}

/**
 * Clear the token getter (e.g., on logout)
 */
export function clearAuth0TokenGetter(): void {
  getAccessTokenSilentlyFn = null;
}

/**
 * Check if the current auth session is Auth0
 */
export function isAuth0Session(): boolean {
  const auth = helperStorage.get('auth');
  return auth?.type === 'auth0';
}

/**
 * Refresh the Auth0 token and update storage
 * Returns the new token, or throws if refresh fails
 */
export async function refreshAuth0Token(): Promise<string> {
  if (!getAccessTokenSilentlyFn) {
    throw new Error('Auth0 token getter not initialized');
  }

  if (!isAuth0Session()) {
    throw new Error('Not an Auth0 session');
  }

  // Get fresh token from Auth0 SDK (handles refresh automatically)
  const newToken = await getAccessTokenSilentlyFn();

  // Update stored token
  const auth = helperStorage.get('auth');
  if (auth) {
    helperStorage.set('auth', {
      ...auth,
      token: newToken,
    });
  }

  return newToken;
}

