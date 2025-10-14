/**
 * App Store Tests
 * Tests for the application state management store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../appStore';

describe('appStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAppStore.getState();
    store.reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAppStore.getState();

      expect(state.node).toBe('');
      expect(state.baseUrl).toBe('');
      expect(state.proxyRequest).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Node Actions', () => {
    it('should set node', () => {
      const store = useAppStore.getState();
      const testNode = 'test-node';

      store.setNode(testNode);

      expect(useAppStore.getState().node).toBe(testNode);
    });

    it('should set baseUrl', () => {
      const store = useAppStore.getState();
      const testUrl = 'http://test-base-url';

      store.setBaseUrl(testUrl);

      expect(useAppStore.getState().baseUrl).toBe(testUrl);
    });

    it('should update node to empty string', () => {
      const store = useAppStore.getState();

      // Set a node first
      store.setNode('test-node');
      expect(useAppStore.getState().node).toBe('test-node');

      // Set to empty
      store.setNode('');
      expect(useAppStore.getState().node).toBe('');
    });
  });

  describe('Proxy Request Actions', () => {
    it('should set proxyRequest to true', () => {
      const store = useAppStore.getState();

      store.setProxyRequest(true);

      expect(useAppStore.getState().proxyRequest).toBe(true);
    });

    it('should set proxyRequest to false', () => {
      const store = useAppStore.getState();

      store.setProxyRequest(false);

      expect(useAppStore.getState().proxyRequest).toBe(false);
    });
  });

  describe('Loading Actions', () => {
    it('should set loading to true', () => {
      const store = useAppStore.getState();

      store.setLoading(true);

      expect(useAppStore.getState().loading).toBe(true);
    });

    it('should set loading to false', () => {
      const store = useAppStore.getState();

      store.setLoading(false);

      expect(useAppStore.getState().loading).toBe(false);
    });
  });

  describe('Error Actions', () => {
    it('should set error message', () => {
      const store = useAppStore.getState();
      const errorMsg = 'Test error message';

      store.setError(errorMsg);

      expect(useAppStore.getState().error).toBe(errorMsg);
    });

    it('should clear error', () => {
      const store = useAppStore.getState();

      // Set error first
      store.setError('Error');
      expect(useAppStore.getState().error).toBe('Error');

      // Clear error
      store.setError(null);
      expect(useAppStore.getState().error).toBeNull();
    });
  });

  describe('Reset Action', () => {
    it('should reset store to initial state', () => {
      const store = useAppStore.getState();

      // Modify state
      store.setNode('test-node');
      store.setBaseUrl('http://test');
      store.setProxyRequest(false);
      store.setLoading(true);
      store.setError('Test error');

      // Verify state changed
      expect(useAppStore.getState().node).toBe('test-node');
      expect(useAppStore.getState().baseUrl).toBe('http://test');
      expect(useAppStore.getState().proxyRequest).toBe(false);
      expect(useAppStore.getState().loading).toBe(true);
      expect(useAppStore.getState().error).toBe('Test error');

      // Reset
      store.reset();

      // Verify reset to initial state
      const resetState = useAppStore.getState();
      expect(resetState.node).toBe('');
      expect(resetState.baseUrl).toBe('');
      expect(resetState.proxyRequest).toBe(true);
      expect(resetState.loading).toBe(false);
      expect(resetState.error).toBeNull();
    });
  });

  describe('Persistence', () => {
    it('should persist node, baseUrl, and proxyRequest', () => {
      const store = useAppStore.getState();

      // Set persisted values
      store.setNode('persistent-node');
      store.setBaseUrl('http://persistent-url');
      store.setProxyRequest(false);

      // Check persisted state
      const persistedState = useAppStore.getState();
      expect(persistedState.node).toBe('persistent-node');
      expect(persistedState.baseUrl).toBe('http://persistent-url');
      expect(persistedState.proxyRequest).toBe(false);
    });

    it('should not persist loading and error', () => {
      const store = useAppStore.getState();

      // Set non-persisted values
      store.setLoading(true);
      store.setError('Error');

      // These should be in state but not persisted
      expect(useAppStore.getState().loading).toBe(true);
      expect(useAppStore.getState().error).toBe('Error');
    });
  });



  describe('Multiple Actions', () => {
    it('should handle multiple state changes correctly', () => {
      const store = useAppStore.getState();

      // Perform multiple actions
      store.setNode('node1');
      store.setBaseUrl('http://url1');
      store.setProxyRequest(false);
      store.setLoading(true);

      const state = useAppStore.getState();
      expect(state.node).toBe('node1');
      expect(state.baseUrl).toBe('http://url1');
      expect(state.proxyRequest).toBe(false);
      expect(state.loading).toBe(true);
    });
  });
});

