/**
 * Auth0 Configuration
 * 
 * Configuration for Auth0 authentication provider
 */

export const auth0Config = {
  domain: import.meta.env.VITE_APP_AUTH0_DOMAIN || 'dev-ex6r-yqc.us.auth0.com',
  clientId: import.meta.env.VITE_APP_AUTH0_CLIENT_ID || '2kuC9TpwD2lxTYbzFO3GLpx4EHO6362A',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE || 'https://cobi.cyoda.com/api',
    ...(import.meta.env.VITE_APP_AUTH0_ORGANIZATION && {
      organization: import.meta.env.VITE_APP_AUTH0_ORGANIZATION
    })
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
};

