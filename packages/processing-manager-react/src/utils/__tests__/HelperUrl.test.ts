/**
 * Tests for HelperUrl utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAppStore } from '../../stores/appStore';

// Mock HelperStorage
const mockHelperStorageGet = vi.fn();
vi.mock('@cyoda/http-api-react', () => ({
  HelperStorage: vi.fn().mockImplementation(() => ({
    get: mockHelperStorageGet,
    set: vi.fn(),
  })),
}));

// Import after mocking
const { HelperUrl } = await import('../HelperUrl');

describe('HelperUrl', () => {
  let originalGetState: any;

  beforeEach(() => {
    // Save original getState
    originalGetState = useAppStore.getState;

    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original getState
    useAppStore.getState = originalGetState;
  });

  describe('getLinkToServer', () => {
    it('should add node parameter when proxy is enabled and endpoint has no query params', () => {
      // Mock proxy enabled
      mockHelperStorageGet.mockReturnValue(true);

      // Mock app store state
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-1',
        baseUrl: 'http://localhost:8080',
      });

      const result = HelperUrl.getLinkToServer('/api/endpoint');

      expect(result).toBe('/api/endpoint?node=node-1');
      expect(mockHelperStorageGet).toHaveBeenCalledWith('proxyRequest', true);
    });

    it('should add node parameter when proxy is enabled and endpoint has existing query params', () => {
      // Mock proxy enabled
      mockHelperStorageGet.mockReturnValue(true);

      // Mock app store state
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-2',
        baseUrl: 'http://localhost:8080',
      });

      const result = HelperUrl.getLinkToServer('/api/endpoint?param1=value1');

      expect(result).toBe('/api/endpoint?param1=value1&node=node-2');
      expect(mockHelperStorageGet).toHaveBeenCalledWith('proxyRequest', true);
    });

    it('should prepend baseUrl when proxy is disabled and baseUrl is set', () => {
      // Mock proxy disabled
      mockHelperStorageGet.mockReturnValue(false);

      // Mock app store state
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-1',
        baseUrl: 'http://localhost:8080',
      });

      const result = HelperUrl.getLinkToServer('/api/endpoint');

      expect(result).toBe('http://localhost:8080/api/endpoint');
      expect(mockHelperStorageGet).toHaveBeenCalledWith('proxyRequest', true);
    });

    it('should return endpoint as-is when proxy is disabled and baseUrl is not set', () => {
      // Mock proxy disabled
      mockHelperStorageGet.mockReturnValue(false);

      // Mock app store state
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-1',
        baseUrl: '',
      });

      const result = HelperUrl.getLinkToServer('/api/endpoint');

      expect(result).toBe('/api/endpoint');
      expect(mockHelperStorageGet).toHaveBeenCalledWith('proxyRequest', true);
    });

    it('should handle complex query strings with proxy enabled', () => {
      // Mock proxy enabled
      mockHelperStorageGet.mockReturnValue(true);

      // Mock app store state
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-3',
        baseUrl: 'http://localhost:8080',
      });

      const result = HelperUrl.getLinkToServer('/api/endpoint?param1=value1&param2=value2');

      expect(result).toBe('/api/endpoint?param1=value1&param2=value2&node=node-3');
    });

    it('should handle endpoints with hash fragments', () => {
      // Mock proxy enabled
      mockHelperStorageGet.mockReturnValue(true);

      // Mock app store state
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-1',
        baseUrl: 'http://localhost:8080',
      });

      const result = HelperUrl.getLinkToServer('/api/endpoint#section');

      expect(result).toBe('/api/endpoint#section?node=node-1');
    });

    it('should handle different node values', () => {
      // Mock proxy enabled
      mockHelperStorageGet.mockReturnValue(true);

      // Mock app store state with different node
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'production-node-123',
        baseUrl: 'http://localhost:8080',
      });

      const result = HelperUrl.getLinkToServer('/api/data');

      expect(result).toBe('/api/data?node=production-node-123');
    });

    it('should handle different baseUrl values when proxy is disabled', () => {
      // Mock proxy disabled
      mockHelperStorageGet.mockReturnValue(false);

      // Mock app store state with different baseUrl
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-1',
        baseUrl: 'https://api.example.com',
      });

      const result = HelperUrl.getLinkToServer('/v1/users');

      expect(result).toBe('https://api.example.com/v1/users');
    });

    it('should handle empty endpoint', () => {
      // Mock proxy enabled
      mockHelperStorageGet.mockReturnValue(true);

      // Mock app store state
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-1',
        baseUrl: 'http://localhost:8080',
      });

      const result = HelperUrl.getLinkToServer('');

      expect(result).toBe('?node=node-1');
    });

    it('should handle root endpoint', () => {
      // Mock proxy enabled
      mockHelperStorageGet.mockReturnValue(true);

      // Mock app store state
      useAppStore.getState = vi.fn().mockReturnValue({
        node: 'node-1',
        baseUrl: 'http://localhost:8080',
      });

      const result = HelperUrl.getLinkToServer('/');

      expect(result).toBe('/?node=node-1');
    });
  });
});

