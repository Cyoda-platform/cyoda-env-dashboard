/**
 * Authentication API endpoints
 */

import { axiosPublic } from '../config/axios';
import type { AuthResponse, User } from '../types';

/**
 * Login with username and password
 */
export function login(username: string, password: string) {
  return axiosPublic.post<AuthResponse>('/platform-api/auth/login', {
    username,
    password,
  });
}

/**
 * Login with Auth0
 */
export function loginAuth0(token: string) {
  return axiosPublic.post<AuthResponse>('/platform-api/auth/auth0', {
    token,
  });
}

/**
 * Refresh access token
 */
export function refreshToken(refreshToken: string) {
  return axiosPublic.post<AuthResponse>('/platform-api/auth/refresh', {
    refreshToken,
  });
}

/**
 * Logout
 */
export function logout() {
  return axiosPublic.post('/platform-api/auth/logout');
}

/**
 * Get current user info
 */
export function getCurrentUser() {
  return axiosPublic.get<User>('/platform-api/auth/me');
}

/**
 * Verify token
 */
export function verifyToken(token: string) {
  return axiosPublic.post<{ valid: boolean }>('/platform-api/auth/verify', {
    token,
  });
}

/**
 * Change password
 */
export function changePassword(oldPassword: string, newPassword: string) {
  return axiosPublic.post('/platform-api/auth/change-password', {
    oldPassword,
    newPassword,
  });
}

/**
 * Request password reset
 */
export function requestPasswordReset(email: string) {
  return axiosPublic.post('/platform-api/auth/reset-password-request', {
    email,
  });
}

/**
 * Reset password with token
 */
export function resetPassword(token: string, newPassword: string) {
  return axiosPublic.post('/platform-api/auth/reset-password', {
    token,
    newPassword,
  });
}

/**
 * Get user permissions
 */
export function getUserPermissions() {
  return axiosPublic.get<string[]>('/platform-api/auth/permissions');
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: string) {
  return axiosPublic.get<boolean>(`/platform-api/auth/permissions/${permission}`);
}

