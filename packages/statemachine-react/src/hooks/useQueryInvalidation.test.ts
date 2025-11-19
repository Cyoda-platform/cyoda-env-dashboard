/**
 * Tests for useQueryInvalidation hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useQueryInvalidation } from './useQueryInvalidation';

describe('useQueryInvalidation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  it('should provide invalidation functions', () => {
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    expect(result.current.invalidateWorkflow).toBeDefined();
    expect(result.current.invalidateWorkflowsList).toBeDefined();
    expect(result.current.invalidateTransitions).toBeDefined();
    expect(result.current.invalidateProcesses).toBeDefined();
    expect(result.current.invalidateCriteria).toBeDefined();
    expect(result.current.invalidateInstances).toBeDefined();
    expect(result.current.invalidateGraphicalData).toBeDefined();
    expect(result.current.invalidateAll).toBeDefined();
  });

  it('should invalidate workflow queries', () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    result.current.invalidateWorkflow('workflow-1');

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['workflow', 'workflow-1'],
    });
  });

  it('should invalidate workflows list', () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    result.current.invalidateWorkflowsList();

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['workflows'],
    });
  });

  it('should invalidate transitions', () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    result.current.invalidateTransitions('workflow-1');

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['transitions', 'workflow-1'],
    });
  });

  it('should invalidate processes', () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    result.current.invalidateProcesses('workflow-1');

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['processes', 'workflow-1'],
    });
  });

  it('should invalidate criteria', () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    result.current.invalidateCriteria('entity-class');

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['criteria', 'entity-class'],
    });
  });

  it('should invalidate instances', () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    result.current.invalidateInstances();

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['instances'],
    });
  });

  it('should invalidate graphical data', () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    result.current.invalidateGraphicalData('workflow-1');

    // invalidateGraphicalData calls multiple invalidation functions
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['workflow', 'workflow-1'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['transitions', 'workflow-1'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['processes', 'workflow-1'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['criteria', 'workflow-1'],
    });
  });

  it('should invalidate all queries', () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useQueryInvalidation(), { wrapper });

    result.current.invalidateAll();

    expect(invalidateQueriesSpy).toHaveBeenCalled();
  });
});

