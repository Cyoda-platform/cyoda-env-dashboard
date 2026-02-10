/**
 * Tests for useAuth hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth, useIsAuthenticated } from './useAuth';
import { HelperStorage } from '../utils/storage';
import * as authApi from '../api/auth';

// Mock the API
vi.mock('../api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  getUserPermissions: vi.fn(),
  changePassword: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}));

describe('useAuth', () => {
  let queryClient: QueryClient;
  let helperStorage: HelperStorage;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    helperStorage = new HelperStorage();
    localStorage.clear();
  });

  afterEach(() => {
    queryClient.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('isAuthenticated', () => {
    it('should return false when no auth data in storage', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return true when auth data exists in storage', () => {
      helperStorage.set('auth', {
        token: 'test-token',
        refreshToken: 'refresh-token',
        username: 'test@example.com',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should call login API and update auth state', async () => {
      const mockAuthResponse = {
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
          username: 'user@example.com',
          userId: 'user-123',
          legalEntityId: 'entity-123',
        },
      };

      vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);

      result.current.login({ username: 'user@example.com', password: 'password' });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(authApi.login).toHaveBeenCalledWith('user@example.com', 'password');
      
      const storedAuth = helperStorage.get('auth');
      expect(storedAuth).toEqual(mockAuthResponse.data);
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      vi.mocked(authApi.login).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      result.current.login({ username: 'user@example.com', password: 'wrong' });

      await waitFor(() => {
        expect(result.current.loginError).toBeTruthy();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should call logout API and clear auth state', async () => {
      helperStorage.set('auth', {
        token: 'test-token',
        refreshToken: 'refresh-token',
        username: 'test@example.com',
      });

      vi.mocked(authApi.logout).mockResolvedValue({ data: {} } as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(true);

      result.current.logout();

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(authApi.logout).toHaveBeenCalled();
      expect(helperStorage.has('auth')).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return null when not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.getToken()).toBeNull();
    });

    it('should return token when authenticated', () => {
      helperStorage.set('auth', {
        token: 'test-token',
        refreshToken: 'refresh-token',
        username: 'test@example.com',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.getToken()).toBe('test-token');
    });
  });

  describe('hasPermission', () => {
    it('should return false when no permissions loaded', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.hasPermission('admin.users.write')).toBe(false);
    });

    it('should return true when user has permission', async () => {
      helperStorage.set('auth', {
        token: 'test-token',
        refreshToken: 'refresh-token',
        username: 'test@example.com',
      });

      vi.mocked(authApi.getUserPermissions).mockResolvedValue({
        data: ['admin.users.write', 'admin.users.read'],
      } as any);

      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        data: {
          username: 'test@example.com',
          userId: 'user-123',
          legalEntityId: 'entity-123',
        },
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.permissions).toBeTruthy();
      });

      expect(result.current.hasPermission('admin.users.write')).toBe(true);
      expect(result.current.hasPermission('admin.users.delete')).toBe(false);
    });
  });
});

describe('useIsAuthenticated', () => {
  let queryClient: QueryClient;
  let helperStorage: HelperStorage;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    helperStorage = new HelperStorage();
    localStorage.clear();
  });

  afterEach(() => {
    queryClient.clear();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should return authentication status', () => {
    const { result } = renderHook(() => useIsAuthenticated(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return true when authenticated', () => {
    helperStorage.set('auth', {
      token: 'test-token',
      refreshToken: 'refresh-token',
      username: 'test@example.com',
    });

    const { result } = renderHook(() => useIsAuthenticated(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
  });
});

