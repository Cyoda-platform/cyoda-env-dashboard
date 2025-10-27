import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HelperStorage } from '../utils/storage';
import { HelperErrors } from '../utils/errors';
import { serializeParams } from '../utils/serializeParams';

// Configure default params serializer
axios.defaults.paramsSerializer = { serialize: serializeParams };

let refreshAccessTokenPromise: Promise<any> | null = null;

const helperStorage = new HelperStorage();

/**
 * Main axios instance for API calls
 */
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/**
 * Request interceptor - adds authentication token
 */
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = helperStorage.get('auth');
  const token = auth?.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Handle processing API base URL
  if (config.url && import.meta.env.VITE_APP_API_BASE_PROCESSING && config.url.indexOf('platform-processing') > -1) {
    config.baseURL = import.meta.env.VITE_APP_API_BASE_PROCESSING;
  }
  
  return config;
});

/**
 * Response interceptor - handles errors and token refresh
 */
instance.interceptors.response.use(
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

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<void> {
  try {
    const auth = helperStorage.get('auth');
    const refreshToken = auth?.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Use /auth/refresh endpoint (baseURL already includes /api)
    const response = await axiosPublic.post('/auth/refresh', {
      refreshToken,
    });

    const newAuth = {
      ...auth,
      token: response.data.token,
      refreshToken: response.data.refreshToken,
    };

    helperStorage.set('auth', newAuth);
  } catch (error) {
    // Clear auth and redirect to login
    helperStorage.remove('auth');
    window.location.href = '/login';
    throw error;
  }
}

/**
 * Public axios instance (no auth required)
 */
export const axiosPublic: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/**
 * Processing API axios instance
 */
export const axiosProcessing: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_PROCESSING,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosProcessing.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = helperStorage.get('auth');
  const token = auth?.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

axiosProcessing.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    HelperErrors.handler(error);
    return Promise.reject(error);
  }
);

/**
 * Grafana API axios instance
 */
export const axiosGrafana: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_GRAFANA_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: import.meta.env.VITE_APP_GRAFANA_USERNAME || '',
    password: import.meta.env.VITE_APP_GRAFANA_PASSWORD || '',
  },
});

axiosGrafana.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    HelperErrors.handler(error);
    return Promise.reject(error);
  }
);

/**
 * AI API axios instance
 */
export const axiosAI: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_AI_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosAI.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = helperStorage.get('auth');
  const token = auth?.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

axiosAI.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    HelperErrors.handler(error);
    return Promise.reject(error);
  }
);

export default instance;

