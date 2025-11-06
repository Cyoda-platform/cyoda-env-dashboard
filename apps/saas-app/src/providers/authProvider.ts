import type { AuthProvider } from '@refinedev/core';

interface AuthData {
  token: string;
  user: string;
  type?: 'standard' | 'auth0';
  userId?: string;
}

const authProvider: AuthProvider = {
  login: async ({ username, email, password, providerName }) => {
    // Handle Auth0 login (already handled in Login component)
    if (providerName === 'auth0') {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed: AuthData = JSON.parse(authData);
        if (parsed.type === 'auth0') {
          return {
            success: true,
            redirectTo: '/',
          };
        }
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
    // Check if it's an Auth0 session
    const authData = localStorage.getItem('auth');
    let isAuth0 = false;

    if (authData) {
      try {
        const parsed: AuthData = JSON.parse(authData);
        isAuth0 = parsed.type === 'auth0';
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth');

    // If Auth0, the Auth0Provider will handle the logout redirect
    // Otherwise, redirect to login
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    // Check for auth data (both standard and Auth0)
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const parsed: AuthData = JSON.parse(authData);
        // Check if we have a valid token
        if (parsed.token) {
          return {
            authenticated: true,
          };
        }
      } catch (e) {
        // Ignore parse errors
        console.error('Failed to parse auth data:', e);
      }
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
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.roles || ['user'];
    }
    return null;
  },

  getIdentity: async () => {
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

