/**
 * Auth0 Token Initializer
 *
 * This component:
 * 1. Handles Auth0 callback flow - when Auth0 redirects back with ?code=...&state=...
 * 2. Saves the Auth0 token to storage when authenticated
 * 3. Sets up the token getter for axios interceptors to refresh tokens
 *
 * Following the Vue pattern: handle auth at the top level, before routing.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Spin } from 'antd';
import { setAuth0TokenGetter, clearAuth0TokenGetter } from '../utils/auth0TokenManager';
import { HelperStorage } from '@cyoda/http-api-react/utils/storage';

const helperStorage = new HelperStorage();

// Check if URL has Auth0 callback parameters
const hasAuth0CallbackParams = () => {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') && params.has('state');
};

export const Auth0TokenInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const [tokenSaved, setTokenSaved] = useState(() => {
    // Check if we already have a valid Auth0 token on mount
    const existingAuth = helperStorage.get('auth');
    return !!(existingAuth?.token && existingAuth?.type === 'auth0');
  });

  // Check once on mount if this is a callback
  const isCallback = useMemo(() => hasAuth0CallbackParams(), []);

  // Handle Auth0 authentication - save token when authenticated
  useEffect(() => {
    // Skip if Auth0 is still loading
    if (isLoading) {
      return;
    }

    // Skip if not authenticated
    if (!isAuthenticated) {
      return;
    }

    // Check if we already have a token saved
    if (tokenSaved) {
      // Just set up the token getter
      setAuth0TokenGetter(getAccessTokenSilently);
      return;
    }

    // Authenticated but no token saved yet - save it now
    const saveToken = async () => {
      try {
        const token = await getAccessTokenSilently();

        // Save auth data
        helperStorage.set('auth', {
          token: token,
          refreshToken: '',
          userId: user?.sub || '',
          user: user?.name || user?.email || 'auth0-user',
          type: 'auth0' as const
        });

        // Set up token getter for axios interceptors
        setAuth0TokenGetter(getAccessTokenSilently);
        setTokenSaved(true);
      } catch (error) {
        console.error('[Auth0TokenInitializer] Failed to get token:', error);
        setTokenSaved(true); // Mark as done even on error to avoid infinite loop
      }
    };

    saveToken();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, tokenSaved]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAuth0TokenGetter();
    };
  }, []);

  // Block rendering until auth is fully processed:
  // 1. Auth0 is still loading during a callback
  // 2. User is authenticated but we haven't saved the token yet
  const needsToSaveToken = isAuthenticated && !tokenSaved;
  if ((isCallback && isLoading) || needsToSaveToken) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0A0E27',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

