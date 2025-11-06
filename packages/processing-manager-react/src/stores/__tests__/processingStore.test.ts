/**
 * Processing Store Tests
 * Tests for the processing state management store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useProcessingStore } from '../processingStore';

describe('processingStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useProcessingStore.getState();
    store.reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useProcessingStore.getState();

      expect(state.nodesProcessing).toEqual([]);
      expect(state.selectedNode).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Nodes Processing Actions', () => {
    it('should set nodes processing', () => {
      const store = useProcessingStore.getState();
      const testNodes = [
        { hostname: 'node1', baseUrl: 'http://node1' },
        { hostname: 'node2', baseUrl: 'http://node2' },
      ];

      store.setNodesProcessing(testNodes);

      expect(useProcessingStore.getState().nodesProcessing).toEqual(testNodes);
    });

    it('should set empty nodes processing array', () => {
      const store = useProcessingStore.getState();

      // Set some nodes first
      store.setNodesProcessing([{ hostname: 'node1' }]);
      expect(useProcessingStore.getState().nodesProcessing).toHaveLength(1);

      // Set to empty
      store.setNodesProcessing([]);
      expect(useProcessingStore.getState().nodesProcessing).toEqual([]);
    });

    it('should update nodes processing', () => {
      const store = useProcessingStore.getState();

      // Set initial nodes
      store.setNodesProcessing([{ hostname: 'node1' }]);

      // Update with new nodes
      const newNodes = [
        { hostname: 'node2' },
        { hostname: 'node3' },
      ];
      store.setNodesProcessing(newNodes);

      expect(useProcessingStore.getState().nodesProcessing).toEqual(newNodes);
      expect(useProcessingStore.getState().nodesProcessing).toHaveLength(2);
    });
  });

  describe('Selected Node Actions', () => {
    it('should set selected node', () => {
      const store = useProcessingStore.getState();
      const testNode = { hostname: 'selected-node', baseUrl: 'http://selected' };
      
      store.setSelectedNode(testNode);
      
      expect(useProcessingStore.getState().selectedNode).toEqual(testNode);
    });

    it('should set selected node to null', () => {
      const store = useProcessingStore.getState();
      
      // Set a node first
      store.setSelectedNode({ hostname: 'node1' });
      expect(useProcessingStore.getState().selectedNode).toBeTruthy();
      
      // Set to null
      store.setSelectedNode(null);
      expect(useProcessingStore.getState().selectedNode).toBeNull();
    });
  });

  describe('Loading Actions', () => {
    it('should set loading to true', () => {
      const store = useProcessingStore.getState();

      store.setLoading(true);

      expect(useProcessingStore.getState().loading).toBe(true);
    });

    it('should set loading to false', () => {
      const store = useProcessingStore.getState();

      store.setLoading(false);

      expect(useProcessingStore.getState().loading).toBe(false);
    });
  });

  describe('Error Actions', () => {
    it('should set error message', () => {
      const store = useProcessingStore.getState();
      const errorMsg = 'Test error message';

      store.setError(errorMsg);

      expect(useProcessingStore.getState().error).toBe(errorMsg);
    });

    it('should clear error', () => {
      const store = useProcessingStore.getState();

      // Set error first
      store.setError('Error');
      expect(useProcessingStore.getState().error).toBe('Error');

      // Clear error
      store.setError(null);
      expect(useProcessingStore.getState().error).toBeNull();
    });
  });

  describe('Reset Action', () => {
    it('should reset store to initial state', () => {
      const store = useProcessingStore.getState();

      // Modify state
      store.setNodesProcessing([{ hostname: 'node1' }]);
      store.setSelectedNode({ hostname: 'selected' });
      store.setLoading(true);
      store.setError('Test error');

      // Verify state changed
      expect(useProcessingStore.getState().nodesProcessing).toHaveLength(1);
      expect(useProcessingStore.getState().selectedNode).toBeTruthy();
      expect(useProcessingStore.getState().loading).toBe(true);
      expect(useProcessingStore.getState().error).toBe('Test error');

      // Reset
      store.reset();

      // Verify reset to initial state
      const resetState = useProcessingStore.getState();
      expect(resetState.nodesProcessing).toEqual([]);
      expect(resetState.selectedNode).toBeNull();
      expect(resetState.loading).toBe(false);
      expect(resetState.error).toBeNull();
    });
  });



  describe('Complex Scenarios', () => {
    it('should handle setting nodes processing and selecting one', () => {
      const store = useProcessingStore.getState();

      const nodes = [
        { hostname: 'node1', baseUrl: 'http://node1' },
        { hostname: 'node2', baseUrl: 'http://node2' },
        { hostname: 'node3', baseUrl: 'http://node3' },
      ];

      store.setNodesProcessing(nodes);
      store.setSelectedNode(nodes[1]);

      const state = useProcessingStore.getState();
      expect(state.nodesProcessing).toHaveLength(3);
      expect(state.selectedNode).toEqual(nodes[1]);
      expect(state.selectedNode?.hostname).toBe('node2');
    });

    it('should handle multiple state changes', () => {
      const store = useProcessingStore.getState();

      // Perform multiple actions
      store.setNodesProcessing([{ hostname: 'node1' }, { hostname: 'node2' }]);
      store.setSelectedNode({ hostname: 'node1' });
      store.setLoading(true);
      store.setError(null);

      const state = useProcessingStore.getState();
      expect(state.nodesProcessing).toHaveLength(2);
      expect(state.selectedNode?.hostname).toBe('node1');
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle node selection from nodes processing list', () => {
      const store = useProcessingStore.getState();

      const nodes = [
        { hostname: 'node1', baseUrl: 'http://node1', port: 8080 },
        { hostname: 'node2', baseUrl: 'http://node2', port: 8081 },
      ];

      store.setNodesProcessing(nodes);

      // Select first node
      const selectedNode = nodes.find(n => n.hostname === 'node1');
      store.setSelectedNode(selectedNode || null);

      expect(useProcessingStore.getState().selectedNode?.hostname).toBe('node1');
      expect(useProcessingStore.getState().selectedNode?.port).toBe(8080);
    });
  });
});

