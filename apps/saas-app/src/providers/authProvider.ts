import type { AuthProvider } from '@refinedev/core';
import { HelperStorage } from '@cyoda/http-api-react/utils/storage';

// Use HelperStorage to match Login.tsx (stores with 'cyoda_' prefix)
const helperStorage = new HelperStorage();

interface AuthData {
  token: string;
  refreshToken?: string;
  user: string;
  type?: 'standard' | 'auth0';
  userId?: string;
  legalEntityId?: string;
}

const authProvider: AuthProvider = {
  login: async ({ username, email, password, providerName }) => {
    // Handle Auth0 login (already handled in Login component)
    if (providerName === 'auth0') {
      const authData = helperStorage.get<AuthData>('auth');
      if (authData?.type === 'auth0') {
        return {
          success: true,
          redirectTo: '/',
        };
      }
      return {
        success: false,
        error: {
          name: 'Auth0Error',
          message: 'Auth0 authentication failed',
        },
      };
    }

    // Handle standard username/password login
    if ((username || email) && password) {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        username: username || email,
        email: email || username,
        name: username || email,
      }));
      return {
        success: true,
        redirectTo: '/',
      };
    }

    return {
      success: false,
      error: {
        name: 'LoginError',
        message: 'Invalid username or password',
      },
    };
  },

  logout: async () => {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    helperStorage.remove('auth');

    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    // Check for auth data using HelperStorage (both standard and Auth0)
    const authData = helperStorage.get<AuthData>('auth');

    if (authData?.token) {
      return {
        authenticated: true,
      };
    }

    // Fallback: check for old auth_token format
    const token = localStorage.getItem('auth_token');
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: '/login',
      logout: true,
    };
  },

  getPermissions: async () => {
    const authData = helperStorage.get<AuthData>('auth');
    if (authData?.user) {
      return ['user'];
    }
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.roles || ['user'];
    }
    return null;
  },

  getIdentity: async () => {
    const authData = helperStorage.get<AuthData>('auth');
    if (authData) {
      return {
        id: authData.userId,
        name: authData.user,
        email: authData.user,
      };
    }
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },

  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return {
        logout: true,
        redirectTo: '/login',
        error,
      };
    }

    return { error };
  },
};

export default authProvider;

