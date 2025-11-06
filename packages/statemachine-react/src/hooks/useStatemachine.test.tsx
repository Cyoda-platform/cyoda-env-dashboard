/**
 * Tests for useStatemachine hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useWorkflowsList,
  useWorkflow,
  useWorkflowEnabledTypes,
  useCreateWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
  useCopyWorkflow,
  useStatesList,
  useState,
  useCreateState,
  useUpdateState,
  useDeleteState,
  useTransitionsList,
  useProcessesList,
  useCriteriaList,
} from './useStatemachine';

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
      const mockResponse = {
        data: [
          {
            id: 'workflow-1',
            name: 'Test Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      mockGetAllWorkflowsList.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useWorkflowsList(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse.data);
    });

    it('should fetch workflows list with entity class filter', async () => {
      const mockResponse = {
        data: [
          {
            id: 'workflow-1',
            name: 'Test Workflow',
            entityClassName: 'com.example.Entity',
            active: true,
            persisted: true,
          },
        ],
      };

      mockGetAllWorkflowsList.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useWorkflowsList('com.example.Entity'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetAllWorkflowsList).toHaveBeenCalledWith('com.example.Entity');
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
      const mockWorkflow = {
        name: 'New Workflow',
        entityClassName: 'com.example.Entity',
        active: true,
        persisted: true,
      };

      const mockResponse = {
        data: {
          id: 'workflow-new',
          ...mockWorkflow,
        },
      };

      mockPostWorkflow.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateWorkflow(), { wrapper });

      result.current.mutate(mockWorkflow as any);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse.data);
    });
  });

  describe('useUpdateWorkflow', () => {
    it('should update a workflow', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Updated Workflow',
        entityClassName: 'com.example.Entity',
        active: true,
        persisted: true,
      };

      const mockResponse = {
        data: mockWorkflow,
      };

      mockPutWorkflow.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });

      result.current.mutate({
        persistedType: 'persisted',
        workflowId: 'workflow-1',
        form: mockWorkflow as any,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse.data);
    });
  });

  describe('useDeleteWorkflow', () => {
    it('should delete a workflow', async () => {
      const mockResponse = { data: null };

      mockDeleteWorkflow.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

      result.current.mutate({
        persistedType: 'persisted',
        workflowId: 'workflow-1',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useCopyWorkflow', () => {
    it('should copy a workflow', async () => {
      const mockResponse = {
        data: {
          id: 'workflow-copy',
          name: 'Test Workflow (Copy)',
          entityClassName: 'com.example.Entity',
          active: true,
          persisted: true,
        },
      };

      mockCopyWorkflow.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyWorkflow(), { wrapper });

      result.current.mutate({
        persistedType: 'persisted',
        workflowId: 'workflow-1',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse.data);
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
});

