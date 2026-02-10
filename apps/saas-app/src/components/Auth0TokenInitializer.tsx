/**
 * Auth0 Token Initializer
 *
 * This component initializes the Auth0 token manager with the getAccessTokenSilently
 * function from the Auth0 context. This allows axios interceptors to refresh tokens.
 */

import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuth0TokenGetter, clearAuth0TokenGetter } from '../utils/auth0TokenManager';

export const Auth0TokenInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      // Set the token getter so axios interceptors can refresh tokens
      setAuth0TokenGetter(getAccessTokenSilently);
    }

    return () => {
      // Clean up on unmount
      clearAuth0TokenGetter();
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return <>{children}</>;
};

