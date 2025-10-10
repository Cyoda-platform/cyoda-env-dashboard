/**
 * Authentication hooks
 * Provides React hooks for authentication operations
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { HelperStorage } from '../utils/storage';
import type { AuthResponse, User } from '../types';

const helperStorage = new HelperStorage();

/**
 * Hook for authentication state and operations
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return helperStorage.has('auth');
  });

  // Get current user query
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await authApi.login(username, password);
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      helperStorage.set('auth', data);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Login with Auth0 mutation
  const loginAuth0Mutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await authApi.loginAuth0(token);
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      helperStorage.set('auth', data);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      helperStorage.remove('auth');
      setIsAuthenticated(false);
      queryClient.clear();
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
      const response = await authApi.changePassword(oldPassword, newPassword);
      return response.data;
    },
  });

  // Request password reset mutation
  const requestPasswordResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await authApi.requestPasswordReset(email);
      return response.data;
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await authApi.resetPassword(token, newPassword);
      return response.data;
    },
  });

  // Get user permissions query
  const {
    data: permissions,
    isLoading: isLoadingPermissions,
  } = useQuery({
    queryKey: ['auth', 'permissions'],
    queryFn: async () => {
      const response = await authApi.getUserPermissions();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Helper function to check permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permissions) return false;
      return permissions.includes(permission);
    },
    [permissions]
  );

  // Get auth token
  const getToken = useCallback((): string | null => {
    const auth = helperStorage.get<AuthResponse>('auth');
    return auth?.token || null;
  }, []);

  // Get auth data
  const getAuthData = useCallback((): AuthResponse | null => {
    return helperStorage.get<AuthResponse>('auth');
  }, []);

  return {
    // State
    isAuthenticated,
    user,
    permissions,
    isLoadingUser,
    isLoadingPermissions,
    userError,

    // Actions
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    loginAuth0: loginAuth0Mutation.mutate,
    loginAuth0Async: loginAuth0Mutation.mutateAsync,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    requestPasswordReset: requestPasswordResetMutation.mutate,
    requestPasswordResetAsync: requestPasswordResetMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutate,
    resetPasswordAsync: resetPasswordMutation.mutateAsync,
    refetchUser,

    // Helpers
    hasPermission,
    getToken,
    getAuthData,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    changePasswordError: changePasswordMutation.error,
  };
}

/**
 * Hook to check if user has specific permission
 */
export function usePermission(permission: string) {
  const { hasPermission, isLoadingPermissions } = useAuth();

  return {
    hasPermission: hasPermission(permission),
    isLoading: isLoadingPermissions,
  };
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user, isLoadingUser, userError, refetchUser } = useAuth();

  return {
    user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  };
}

/**
 * Hook to verify if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated, isLoadingUser } = useAuth();

  return {
    isAuthenticated,
    isLoading: isLoadingUser,
  };
}

