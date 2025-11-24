/**
 * Tests for useTasks hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTasksPerPage, useTask, useUpdateTask, useTasksState } from './useTasks';
import { useTasksStore } from '../stores/tasksStore';

// Mock axios
vi.mock('@cyoda/http-api-react', () => ({
  axios: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('useTasks hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    localStorage.clear();
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useTasksPerPage', () => {
    it('should fetch paginated tasks', async () => {
      const mockResponse = {
        content: [
          {
            id: 'task-1',
            title: 'Test Task',
            state: 'OPEN',
            priority: 5,
            assignee: 'user@example.com',
            createdDatetime: '2025-10-10T10:00:00Z',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      };

      const { axios } = await import('@cyoda/http-api-react');
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(
        () =>
          useTasksPerPage({
            page: 0,
            size: 10,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useTask', () => {
    it('should fetch a single task', async () => {
      const mockResponse = {
        alertTask: {
          id: 'task-1',
          title: 'Test Task',
          state: 'OPEN',
        },
        transitions: ['COMPLETE', 'CANCEL'],
      };

      const { axios } = await import('@cyoda/http-api-react');
      vi.mocked(axios.get).mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useTask('task-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useTask(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useUpdateTask', () => {
    it('should update a task', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Updated Task',
        state: 'COMPLETE',
      };

      const { axios } = await import('@cyoda/http-api-react');
      vi.mocked(axios.put).mockResolvedValue({ data: mockTask });

      const { result } = renderHook(() => useUpdateTask(), { wrapper });

      result.current.mutate({
        transition: 'COMPLETE',
        task: mockTask as any,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
    });
  });

  describe('useTasksState', () => {
    it('should return store state', () => {
      const { result } = renderHook(() => useTasksState(), { wrapper });

      expect(result.current).toHaveProperty('readedIds');
      expect(result.current).toHaveProperty('tasks');
      expect(result.current).toHaveProperty('isApplyRealData');
      expect(result.current).toHaveProperty('setTasks');
      expect(result.current).toHaveProperty('addReadedId');
      expect(result.current).toHaveProperty('setIsApplyRealData');
    });

    it('should update isApplyRealData', async () => {
      const { result } = renderHook(() => useTasksState(), { wrapper });

      expect(result.current.isApplyRealData).toBe(false);

      result.current.setIsApplyRealData(true);

      await waitFor(() => {
        expect(result.current.isApplyRealData).toBe(true);
      });
    });

    it('should add readed id', async () => {
      const { result } = renderHook(() => useTasksState(), { wrapper });

      expect(result.current.readedIds).toEqual([]);

      result.current.addReadedId('task-1');

      await waitFor(() => {
        expect(result.current.readedIds).toContain('task-1');
      });
    });
  });
});

