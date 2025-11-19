/**
 * Statemachine Store Tests
 * Tests for the statemachine Zustand store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useStatemachineStore } from './statemachineStore';
import { axios, HelperFeatureFlags } from '@cyoda/http-api-react';

// Mock axios
vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual('@cyoda/http-api-react');
  return {
    ...actual,
    axios: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    HelperFeatureFlags: {
      isUseModelsInfo: vi.fn(),
    },
  };
});

describe('statemachineStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    const store = useStatemachineStore.getState();
    store.setSelectedWorkflow(null);
    store.setSelectedEntityClassName(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useStatemachineStore.getState();
      
      expect(state.selectedWorkflow).toBeNull();
      expect(state.selectedEntityClassName).toBeNull();
    });
  });

  describe('State Actions', () => {
    it('should set selected workflow', () => {
      const mockWorkflow = { id: 'workflow-1', name: 'Test Workflow' };

      useStatemachineStore.getState().setSelectedWorkflow(mockWorkflow as any);

      const state = useStatemachineStore.getState();
      expect(state.selectedWorkflow).toEqual(mockWorkflow);
    });

    it('should set selected entity class name', () => {
      const entityClassName = 'com.example.Entity';

      useStatemachineStore.getState().setSelectedEntityClassName(entityClassName);

      const state = useStatemachineStore.getState();
      expect(state.selectedEntityClassName).toBe(entityClassName);
    });
  });

  describe('getWorkflowEnabledTypes', () => {
    describe('When feature flag is enabled', () => {
      beforeEach(() => {
        vi.mocked(HelperFeatureFlags.isUseModelsInfo).mockReturnValue(true);
      });

      it('should call models-info endpoint with stateEnabled=true', async () => {
        const mockResponse = {
          data: [
            { name: 'com.example.Entity1', type: 'BUSINESS', stateEnabled: true },
            { name: 'com.example.Entity2', type: 'PERSISTENCE', stateEnabled: true },
          ],
        };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const store = useStatemachineStore.getState();
        const result = await store.getWorkflowEnabledTypes();

        expect(axios.get).toHaveBeenCalledWith(
          '/platform-api/entity-info/fetch/models-info',
          { params: { stateEnabled: true } }
        );
        expect(result).toEqual(mockResponse);
      });

      it('should return entity type information', async () => {
        const mockResponse = {
          data: [
            { 
              name: 'com.example.Entity1', 
              type: 'BUSINESS', 
              stateEnabled: true,
              dynamic: true 
            },
          ],
        };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const store = useStatemachineStore.getState();
        const result = await store.getWorkflowEnabledTypes();

        expect(result.data[0]).toHaveProperty('type');
        expect(result.data[0].type).toBe('BUSINESS');
      });
    });

    describe('When feature flag is disabled', () => {
      beforeEach(() => {
        vi.mocked(HelperFeatureFlags.isUseModelsInfo).mockReturnValue(false);
      });

      it('should call workflow-enabled-types endpoint', async () => {
        const mockResponse = {
          data: ['com.example.Entity1', 'com.example.Entity2'],
        };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const store = useStatemachineStore.getState();
        const result = await store.getWorkflowEnabledTypes();

        expect(axios.get).toHaveBeenCalledWith('/platform-api/statemachine/workflow-enabled-types');
        expect(result).toEqual(mockResponse);
      });

      it('should return array of strings', async () => {
        const mockResponse = {
          data: ['com.example.Entity1', 'com.example.Entity2'],
        };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const store = useStatemachineStore.getState();
        const result = await store.getWorkflowEnabledTypes();

        expect(Array.isArray(result.data)).toBe(true);
        expect(typeof result.data[0]).toBe('string');
      });
    });

    describe('Error handling', () => {
      it('should propagate errors from models-info endpoint', async () => {
        vi.mocked(HelperFeatureFlags.isUseModelsInfo).mockReturnValue(true);
        const mockError = new Error('Network error');
        vi.mocked(axios.get).mockRejectedValue(mockError);

        const store = useStatemachineStore.getState();

        await expect(store.getWorkflowEnabledTypes()).rejects.toThrow('Network error');
      });

      it('should propagate errors from workflow-enabled-types endpoint', async () => {
        vi.mocked(HelperFeatureFlags.isUseModelsInfo).mockReturnValue(false);
        const mockError = new Error('API error');
        vi.mocked(axios.get).mockRejectedValue(mockError);

        const store = useStatemachineStore.getState();

        await expect(store.getWorkflowEnabledTypes()).rejects.toThrow('API error');
      });
    });
  });

  describe('getAllWorkflowsList', () => {
    it('should call workflows endpoint without entityClassName', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const store = useStatemachineStore.getState();
      await store.getAllWorkflowsList();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/statemachine/workflows', {
        params: { entityClassName: undefined },
      });
    });

    it('should call workflows endpoint with entityClassName', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const store = useStatemachineStore.getState();
      await store.getAllWorkflowsList('com.example.Entity');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/statemachine/workflows', {
        params: { entityClassName: 'com.example.Entity' },
      });
    });
  });

  describe('postWorkflow', () => {
    it('should call POST endpoint with workflow form', async () => {
      const mockResponse = { data: { id: 'workflow-1' } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const workflowForm = {
        name: 'Test Workflow',
        entityClassName: 'com.example.Entity',
      };

      const store = useStatemachineStore.getState();
      const result = await store.postWorkflow(workflowForm as any);

      expect(axios.post).toHaveBeenCalledWith(
        '/platform-api/statemachine/persisted/workflows',
        workflowForm
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('putWorkflow', () => {
    it('should call PUT endpoint with workflow form', async () => {
      const mockResponse = { data: { id: 'workflow-1' } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const workflowForm = {
        id: 'workflow-1',
        name: 'Updated Workflow',
        entityClassName: 'com.example.Entity',
      };

      const store = useStatemachineStore.getState();
      const result = await store.putWorkflow(workflowForm as any);

      expect(axios.put).toHaveBeenCalledWith(
        '/platform-api/statemachine/persisted/workflows/workflow-1',
        workflowForm
      );
      expect(result).toEqual(mockResponse);
    });

    it('should encode workflow ID in URL', async () => {
      const mockResponse = { data: { id: 'workflow-1' } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const workflowForm = {
        id: 'workflow/with/slashes',
        name: 'Test Workflow',
      };

      const store = useStatemachineStore.getState();
      await store.putWorkflow(workflowForm as any);

      expect(axios.put).toHaveBeenCalledWith(
        '/platform-api/statemachine/persisted/workflows/workflow%2Fwith%2Fslashes',
        workflowForm
      );
    });
  });

  describe('deleteWorkflow', () => {
    it('should call DELETE endpoint with workflow ID', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const store = useStatemachineStore.getState();
      const result = await store.deleteWorkflow('workflow-1');

      expect(axios.delete).toHaveBeenCalledWith(
        '/platform-api/statemachine/persisted/workflows/workflow-1',
        { muteErrors: true }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should encode workflow ID in URL', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const store = useStatemachineStore.getState();
      await store.deleteWorkflow('workflow/with/slashes');

      expect(axios.delete).toHaveBeenCalledWith(
        '/platform-api/statemachine/persisted/workflows/workflow%2Fwith%2Fslashes',
        { muteErrors: true }
      );
    });
  });
});

