/**
 * Authentication API endpoints
 */

import { axiosPublic } from '../config/axios';
import type { AuthResponse, User } from '../types';

/**
 * Login with username and password
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/stores/auth.ts
 */
export function login(username: string, password: string) {
  return axiosPublic.post<AuthResponse>('/auth/login', {
    username,
    password,
  });
}

/**
 * Refresh access token
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/stores/auth.ts
 */
export function refreshToken(refreshToken: string) {
  return axiosPublic.get<AuthResponse>('/auth/token', {
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
    },
  });
}

/**
 * Logout
 */
export function logout() {
  return axiosPublic.post('/auth/logout');
}

/**
 * Get current user info
 */
export function getCurrentUser() {
  return axiosPublic.get<User>('/auth/me');
}

/**
 * Verify token
 */
export function verifyToken(token: string) {
  return axiosPublic.post<{ valid: boolean }>('/auth/verify', {
    token,
  });
}

/**
 * Change password
 */
export function changePassword(oldPassword: string, newPassword: string) {
  return axiosPublic.post('/auth/change-password', {
    oldPassword,
    newPassword,
  });
}

/**
 * Request password reset
 */
export function requestPasswordReset(email: string) {
  return axiosPublic.post('/auth/reset-password-request', {
    email,
  });
}

/**
 * Reset password with token
 */
export function resetPassword(token: string, newPassword: string) {
  return axiosPublic.post('/auth/reset-password', {
    token,
    newPassword,
  });
}

/**
 * Get user permissions
 */
export function getUserPermissions() {
  return axiosPublic.get<string[]>('/auth/permissions');
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: string) {
  return axiosPublic.get<boolean>(`/auth/permissions/${permission}`);
}

