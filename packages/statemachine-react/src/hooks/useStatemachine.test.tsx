/**
 * Tests for useStatemachine hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  useWorkflowsList,
  useWorkflow,
  useWorkflowDoc,
  useWorkflowEnabledTypes,
  useCreateWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
  useCopyWorkflow,
  useRenameWorkflow,
  useStatesList,
  useState,
  useCreateState,
  useUpdateState,
  useDeleteState,
  useTransitionsList,
  useProcessesList,
  useCriteriaList,
  statemachineKeys,
} from './useStatemachine';
import { getWorkflowGateway } from '../gateways';

vi.mock('../gateways', async () => {
  const actual = await vi.importActual<any>('../gateways');
  return {
    ...actual,
    getWorkflowGateway: vi.fn(),
  };
});

// Create mock store methods
const mockGetWorkflowEnabledTypes = vi.fn();
const mockGetAllWorkflowsList = vi.fn();
const mockGetWorkflow = vi.fn();
const mockPostWorkflow = vi.fn();
const mockPutWorkflow = vi.fn();
const mockDeleteWorkflow = vi.fn();
const mockCopyWorkflow = vi.fn();
const mockGetStatesList = vi.fn();
const mockGetState = vi.fn();
const mockPostState = vi.fn();
const mockPutState = vi.fn();
const mockDeleteState = vi.fn();
const mockGetTransitionsList = vi.fn();
const mockGetProcessesList = vi.fn();
const mockGetCriteriaList = vi.fn();

// Mock the store
vi.mock('../stores/statemachineStore', () => ({
  useStatemachineStore: vi.fn(() => ({
    getWorkflowEnabledTypes: mockGetWorkflowEnabledTypes,
    getAllWorkflowsList: mockGetAllWorkflowsList,
    getWorkflow: mockGetWorkflow,
    postWorkflow: mockPostWorkflow,
    putWorkflow: mockPutWorkflow,
    deleteWorkflow: mockDeleteWorkflow,
    copyWorkflow: mockCopyWorkflow,
    getStatesList: mockGetStatesList,
    getState: mockGetState,
    postState: mockPostState,
    putState: mockPutState,
    deleteState: mockDeleteState,
    getTransitionsList: mockGetTransitionsList,
    getProcessesList: mockGetProcessesList,
    getCriteriaList: mockGetCriteriaList,
  })),
}));

describe('useStatemachine hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useWorkflowEnabledTypes', () => {
    it('should fetch workflow enabled types', async () => {
      const mockResponse = {
        data: [
          { value: 'com.example.Entity', label: 'Entity' },
          { value: 'com.example.Task', label: 'Task' },
        ],
      };

      mockGetWorkflowEnabledTypes.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useWorkflowEnabledTypes(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse.data);
    });
  });

  describe('useWorkflowsList', () => {
    it('should fetch workflows list', async () => {
      const summaries = [
        {
          name: 'Test Workflow',
          initialState: 's',
          active: true,
        },
      ];
      const listWorkflows = vi.fn().mockResolvedValue(summaries);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows,
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useWorkflowsList(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(summaries);
    });

    it('should fetch workflows list with model ref filter', async () => {
      const summaries = [
        {
          name: 'Test Workflow',
          initialState: 's',
          active: true,
        },
      ];
      const listWorkflows = vi.fn().mockResolvedValue(summaries);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows,
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      const { result } = renderHook(
        () => useWorkflowsList(modelRef),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(listWorkflows).toHaveBeenCalledWith(modelRef);
    });
  });

  describe('useWorkflowsList — gateway-backed', () => {
    it('calls gateway.listWorkflows with the provided modelRef and returns the result', async () => {
      const summaries = [{ name: 'A', initialState: 's', active: true }];
      const listWorkflows = vi.fn().mockResolvedValue(summaries);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows,
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      const { result } = renderHook(() => useWorkflowsList(modelRef), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listWorkflows).toHaveBeenCalledWith(modelRef);
      expect(result.current.data).toEqual(summaries);
    });

    it('passes null modelRef through to the gateway', async () => {
      const listWorkflows = vi.fn().mockResolvedValue([]);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows,
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useWorkflowsList(null), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listWorkflows).toHaveBeenCalledWith(null);
    });
  });

  describe('useWorkflow', () => {
    it('should fetch a single workflow', async () => {
      const mockResponse = {
        data: {
          id: 'workflow-1',
          name: 'Test Workflow',
          entityClassName: 'com.example.Entity',
          active: true,
          persisted: true,
        },
      };

      mockGetWorkflow.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useWorkflow('persisted', 'workflow-1'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse.data);
    });

    it('should not fetch when workflowId is empty', () => {
      const { result } = renderHook(
        () => useWorkflow('persisted', ''),
        { wrapper }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when enabled is false', () => {
      const { result } = renderHook(
        () => useWorkflow('persisted', 'workflow-1', false),
        { wrapper }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useCreateWorkflow', () => {
    it('should create a workflow', async () => {
      const saveWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow,
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useCreateWorkflow(), { wrapper });

      const doc = { version: '1.0', name: 'New Workflow', initialState: 's', states: {} };
      const modelRef = { entityName: 'Customer', modelVersion: 1 };

      result.current.mutate({ modelRef, doc });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(saveWorkflow).toHaveBeenCalledWith(modelRef, doc, 'MERGE');
    });
  });

  describe('useUpdateWorkflow', () => {
    it('should update a workflow', async () => {
      const saveWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow,
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });

      const doc = { version: '1.0', name: 'Updated Workflow', initialState: 's', states: {} };
      const modelRef = { entityName: 'Customer', modelVersion: 1 };

      result.current.mutate({ modelRef, doc });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(saveWorkflow).toHaveBeenCalledWith(modelRef, doc, 'MERGE');
    });
  });

  describe('useDeleteWorkflow', () => {
    it('should delete a workflow', async () => {
      const deleteWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow,
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      result.current.mutate({ modelRef, name: 'workflow-1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(deleteWorkflow).toHaveBeenCalledWith(modelRef, 'workflow-1');
    });
  });

  describe('useCopyWorkflow', () => {
    it('should copy a workflow', async () => {
      const copyWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow,
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useCopyWorkflow(), { wrapper });

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      result.current.mutate({ modelRef, sourceName: 'workflow-1', newName: 'workflow-1-copy' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(copyWorkflow).toHaveBeenCalledWith(modelRef, 'workflow-1', 'workflow-1-copy');
    });
  });

  describe('useStatesList', () => {
    it('should fetch states list', async () => {
      const mockResponse = {
        data: [
          {
            id: 'state-1',
            name: 'Initial',
            initial: true,
          },
          {
            id: 'state-2',
            name: 'Final',
            initial: false,
          },
        ],
      };

      mockGetStatesList.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useStatesList('persisted', 'workflow-1'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse.data);
    });
  });

  describe('useWorkflowDoc', () => {
    it('calls gateway.loadWorkflow with modelRef + name', async () => {
      const doc = { version: '1.0', name: 'X', initialState: 's', states: {} };
      const loadWorkflow = vi.fn().mockResolvedValue(doc);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow,
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      const { result } = renderHook(() => useWorkflowDoc(modelRef, 'X'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(loadWorkflow).toHaveBeenCalledWith(modelRef, 'X');
      expect(result.current.data).toEqual(doc);
    });

    it('does not run when name is empty', () => {
      const loadWorkflow = vi.fn();
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow,
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      renderHook(() => useWorkflowDoc({ entityName: 'X', modelVersion: 1 }, ''), { wrapper });

      expect(loadWorkflow).not.toHaveBeenCalled();
    });
  });

  describe('useCreateWorkflow / useUpdateWorkflow — gateway-backed', () => {
    it('useCreateWorkflow.mutateAsync calls gateway.saveWorkflow with MERGE and returns the gateway key', async () => {
      const saveWorkflow = vi.fn().mockResolvedValue({ key: 'X' });
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow,
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result: hookResult } = renderHook(() => useCreateWorkflow(), { wrapper });

      const doc = { version: '1.0', name: 'X', initialState: 's', states: {} };
      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      const mutResult = await hookResult.current.mutateAsync({ modelRef, doc });

      expect(saveWorkflow).toHaveBeenCalledWith(modelRef, doc, 'MERGE');
      expect(mutResult).toEqual({ key: 'X' });
    });

    it('useUpdateWorkflow.mutateAsync calls gateway.saveWorkflow with MERGE and returns the gateway key', async () => {
      const saveWorkflow = vi.fn().mockResolvedValue({ key: 'X' });
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow,
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result: hookResult } = renderHook(() => useUpdateWorkflow(), { wrapper });

      const doc = { version: '1.0', name: 'X', initialState: 's', states: {} };
      const mutResult = await hookResult.current.mutateAsync({ modelRef: null, doc });

      expect(saveWorkflow).toHaveBeenCalledWith(null, doc, 'MERGE');
      expect(mutResult).toEqual({ key: 'X' });
    });
  });

  describe('useDeleteWorkflow — gateway-backed', () => {
    it('mutateAsync calls gateway.deleteWorkflow with modelRef + name', async () => {
      const deleteWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow,
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      await result.current.mutateAsync({ modelRef, name: 'X' });

      expect(deleteWorkflow).toHaveBeenCalledWith(modelRef, 'X');
    });

    it('invalidates the workflows list on FAILURE as well as success (onSettled, not onSuccess)', async () => {
      const deleteWorkflow = vi.fn().mockRejectedValue(new Error('server rejected'));
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow,
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      // Spy on the QueryClient that the wrapper provides.
      // We capture it by rendering a probe component first.
      let capturedClient: any = null;
      const Probe = () => {
        capturedClient = useQueryClient();
        return null;
      };
      renderHook(() => Probe(), { wrapper });
      const invalidateSpy = vi.spyOn(capturedClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

      // The mutation rejects; we expect mutateAsync to throw, but invalidation should still fire.
      await expect(
        result.current.mutateAsync({ modelRef: null, name: 'X' })
      ).rejects.toThrow('server rejected');

      expect(deleteWorkflow).toHaveBeenCalledWith(null, 'X');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: statemachineKeys.workflows(),
      });
    });
  });

  describe('useCopyWorkflow — gateway-backed', () => {
    it('mutateAsync calls gateway.copyWorkflow with (modelRef, sourceName, newName) and returns the gateway key', async () => {
      const copyWorkflow = vi.fn().mockResolvedValue({ key: 'B' });
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow,
        renameWorkflow: vi.fn(),
      } as any);

      const { result: hookResult } = renderHook(() => useCopyWorkflow(), { wrapper });

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      const mutResult = await hookResult.current.mutateAsync({ modelRef, sourceName: 'A', newName: 'B' });

      expect(copyWorkflow).toHaveBeenCalledWith(modelRef, 'A', 'B');
      expect(mutResult).toEqual({ key: 'B' });
    });
  });

  describe('useRenameWorkflow', () => {
    it('mutateAsync calls gateway.renameWorkflow with (modelRef, oldName, newName)', async () => {
      const renameWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow,
      } as any);

      const { result } = renderHook(() => useRenameWorkflow(), { wrapper });

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      await result.current.mutateAsync({ modelRef, oldName: 'A', newName: 'B' });

      expect(renameWorkflow).toHaveBeenCalledWith(modelRef, 'A', 'B');
    });
  });
});

