/**
 * Tests for Authentication API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authApi from './auth';
import { axiosPublic } from '../config/axios';

// Mock axios
vi.mock('../config/axios', () => ({
  axiosPublic: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Authentication API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call POST /platform-api/auth/login with credentials', async () => {
      const mockResponse = { data: { token: 'test-token', user: { id: '1', username: 'test' } } };
      vi.mocked(axiosPublic.post).mockResolvedValue(mockResponse);

      const result = await authApi.login('testuser', 'password123');

      expect(axiosPublic.post).toHaveBeenCalledWith('/platform-api/auth/login', {
        username: 'testuser',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      vi.mocked(axiosPublic.post).mockRejectedValue(mockError);

      await expect(authApi.login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('loginAuth0', () => {
    it('should call POST /platform-api/auth/auth0 with token', async () => {
      const mockResponse = { data: { token: 'test-token', user: { id: '1', username: 'test' } } };
      vi.mocked(axiosPublic.post).mockResolvedValue(mockResponse);

      const result = await authApi.loginAuth0('auth0-token');

      expect(axiosPublic.post).toHaveBeenCalledWith('/platform-api/auth/auth0', {
        token: 'auth0-token',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should call POST /platform-api/auth/refresh with refresh token', async () => {
      const mockResponse = { data: { token: 'new-token', refreshToken: 'new-refresh-token' } };
      vi.mocked(axiosPublic.post).mockResolvedValue(mockResponse);

      const result = await authApi.refreshToken('old-refresh-token');

      expect(axiosPublic.post).toHaveBeenCalledWith('/platform-api/auth/refresh', {
        refreshToken: 'old-refresh-token',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call POST /platform-api/auth/logout', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosPublic.post).mockResolvedValue(mockResponse);

      const result = await authApi.logout();

      expect(axiosPublic.post).toHaveBeenCalledWith('/platform-api/auth/logout');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /platform-api/auth/user', async () => {
      const mockResponse = { data: { id: '1', username: 'test', email: 'test@example.com' } };
      vi.mocked(axiosPublic.get).mockResolvedValue(mockResponse);

      const result = await authApi.getCurrentUser();

      expect(axiosPublic.get).toHaveBeenCalledWith('/platform-api/auth/user');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyToken', () => {
    it('should call POST /platform-api/auth/verify with token', async () => {
      const mockResponse = { data: { valid: true } };
      vi.mocked(axiosPublic.post).mockResolvedValue(mockResponse);

      const result = await authApi.verifyToken('test-token');

      expect(axiosPublic.post).toHaveBeenCalledWith('/platform-api/auth/verify', {
        token: 'test-token',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('should call POST /platform-api/auth/change-password with passwords', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosPublic.post).mockResolvedValue(mockResponse);

      const result = await authApi.changePassword('oldpass', 'newpass');

      expect(axiosPublic.post).toHaveBeenCalledWith('/platform-api/auth/change-password', {
        oldPassword: 'oldpass',
        newPassword: 'newpass',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('requestPasswordReset', () => {
    it('should call POST /platform-api/auth/request-reset with email', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosPublic.post).mockResolvedValue(mockResponse);

      const result = await authApi.requestPasswordReset('test@example.com');

      expect(axiosPublic.post).toHaveBeenCalledWith('/platform-api/auth/request-reset', {
        email: 'test@example.com',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should call POST /platform-api/auth/reset-password with token and new password', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosPublic.post).mockResolvedValue(mockResponse);

      const result = await authApi.resetPassword('reset-token', 'newpassword');

      expect(axiosPublic.post).toHaveBeenCalledWith('/platform-api/auth/reset-password', {
        token: 'reset-token',
        newPassword: 'newpassword',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserPermissions', () => {
    it('should call GET /platform-api/auth/permissions', async () => {
      const mockResponse = { data: ['read:users', 'write:users', 'admin'] };
      vi.mocked(axiosPublic.get).mockResolvedValue(mockResponse);

      const result = await authApi.getUserPermissions();

      expect(axiosPublic.get).toHaveBeenCalledWith('/platform-api/auth/permissions');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', async () => {
      const mockResponse = { data: ['read:users', 'write:users', 'admin'] };
      vi.mocked(axiosPublic.get).mockResolvedValue(mockResponse);

      const result = await authApi.hasPermission('read:users');

      expect(result).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      const mockResponse = { data: ['read:users'] };
      vi.mocked(axiosPublic.get).mockResolvedValue(mockResponse);

      const result = await authApi.hasPermission('admin');

      expect(result).toBe(false);
    });

    it('should handle errors and return false', async () => {
      vi.mocked(axiosPublic.get).mockRejectedValue(new Error('Network error'));

      const result = await authApi.hasPermission('admin');

      expect(result).toBe(false);
    });
  });
});

