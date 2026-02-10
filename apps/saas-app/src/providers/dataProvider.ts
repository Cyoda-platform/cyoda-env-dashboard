import type { DataProvider } from '@refinedev/core';
import axios from 'axios';
import { HelperStorage } from '@cyoda/http-api-react/utils/storage';
import { isAuth0Session, refreshAuth0Token } from '../utils/auth0TokenManager';

const API_URL = '/platform-api';
const helperStorage = new HelperStorage();

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const auth = helperStorage.get('auth');
    const token = auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track ongoing token refresh to prevent multiple simultaneous refreshes
let refreshPromise: Promise<string> | null = null;

// Add response interceptor for 401 handling with Auth0 token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If Auth0 session, try to refresh the token
      if (isAuth0Session()) {
        try {
          // Prevent multiple simultaneous refresh attempts
          if (!refreshPromise) {
            refreshPromise = refreshAuth0Token();
          }
          const newToken = await refreshPromise;
          refreshPromise = null;

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          refreshPromise = null;
          // Refresh failed, redirect to login
          helperStorage.remove('auth');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Not Auth0 session, redirect to login
      helperStorage.remove('auth');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${API_URL}/${resource}`;

    const { current = 1, pageSize = 10, mode = 'server' } = pagination ?? {};

    const query: Record<string, any> = {
      page: current,
      limit: pageSize,
    };

    if (sorters && sorters.length > 0) {
      query.sort = sorters.map((sorter) => {
        return `${sorter.field}:${sorter.order}`;
      }).join(',');
    }

    if (filters) {
      filters.forEach((filter) => {
        if ('field' in filter) {
          query[filter.field] = filter.value;
        }
      });
    }

    const { data } = await axiosInstance.get(url, { params: query });

    return {
      data: data.data || data,
      total: data.total || data.length || 0,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const { data } = await axiosInstance.get(url);

    return {
      data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${API_URL}/${resource}`;
    const { data } = await axiosInstance.post(url, variables);

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const { data } = await axiosInstance.patch(url, variables);

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, meta }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const { data } = await axiosInstance.delete(url);

    return {
      data,
    };
  },

  getApiUrl: () => API_URL,

  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = `${url}`;

    if (headers) {
      axiosInstance.defaults.headers.common = {
        ...axiosInstance.defaults.headers.common,
        ...headers,
      };
    }

    let axiosResponse;
    switch (method) {
      case 'put':
      case 'post':
      case 'patch':
        axiosResponse = await axiosInstance[method](url, payload);
        break;
      case 'delete':
        axiosResponse = await axiosInstance.delete(url, {
          data: payload,
        });
        break;
      default:
        axiosResponse = await axiosInstance.get(requestUrl, {
          params: query,
        });
        break;
    }

    const { data } = axiosResponse;

    return Promise.resolve({ data });
  },
};

export default dataProvider;

