/**
 * Tasks Hooks
 * React Query hooks for tasks operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { useTasksStore } from '../stores/tasksStore';
import type { Task, TasksRequestParams, TasksPagedResponse, TaskDetailResponse, TaskStats, TaskSummary } from '../types';

/**
 * Hook to get paginated tasks
 */
export function useTasksPerPage(
  params: TasksRequestParams,
  options?: Omit<UseQueryOptions<TasksPagedResponse>, 'queryKey' | 'queryFn'>
) {
  const getTasksPerPage = useTasksStore((state) => state.getTasksPerPage);

  return useQuery({
    queryKey: ['tasks', 'paged', params],
    queryFn: () => getTasksPerPage(params),
    ...options,
  });
}

/**
 * Hook to get all tasks
 */
export function useAllTasks(
  params: any = {},
  options?: Omit<UseQueryOptions<Task[]>, 'queryKey' | 'queryFn'>
) {
  const getAllTasks = useTasksStore((state) => state.getAllTasks);

  return useQuery({
    queryKey: ['tasks', 'all', params],
    queryFn: () => getAllTasks(params),
    ...options,
  });
}

/**
 * Hook to get a single task by ID
 */
export function useTask(
  id: string,
  options?: Omit<UseQueryOptions<TaskDetailResponse>, 'queryKey' | 'queryFn'>
) {
  const getTask = useTasksStore((state) => state.getTask);

  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => getTask(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to get task statistics
 */
export function useTaskStats(
  params: { dateFrom: string; dateTo: string },
  options?: Omit<UseQueryOptions<TaskStats[]>, 'queryKey' | 'queryFn'>
) {
  const getStats = useTasksStore((state) => state.getStats);

  return useQuery({
    queryKey: ['tasks', 'stats', params],
    queryFn: () => getStats(params),
    enabled: !!params.dateFrom && !!params.dateTo,
    ...options,
  });
}

/**
 * Hook to get task summary statistics
 */
export function useTaskSummary(
  params: { dateFrom: string; dateTo: string },
  options?: Omit<UseQueryOptions<TaskSummary>, 'queryKey' | 'queryFn'>
) {
  const getStatsSummary = useTasksStore((state) => state.getStatsSummary);

  return useQuery({
    queryKey: ['tasks', 'summary', params],
    queryFn: () => getStatsSummary(params),
    enabled: !!params.dateFrom && !!params.dateTo,
    ...options,
  });
}

/**
 * Hook to update a task
 */
export function useUpdateTask(
  options?: UseMutationOptions<Task, Error, { transition: string; task: Task }>
) {
  const queryClient = useQueryClient();
  const updateTask = useTasksStore((state) => state.updateTask);

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.task.id] });
    },
    ...options,
  });
}

/**
 * Hook to access tasks store state
 */
export function useTasksState() {
  const readedIds = useTasksStore((state) => state.readedIds);
  const tasks = useTasksStore((state) => state.tasks);
  const isApplyRealData = useTasksStore((state) => state.isApplyRealData);
  const setTasks = useTasksStore((state) => state.setTasks);
  const addReadedId = useTasksStore((state) => state.addReadedId);
  const setIsApplyRealData = useTasksStore((state) => state.setIsApplyRealData);

  return {
    readedIds,
    tasks,
    isApplyRealData,
    setTasks,
    addReadedId,
    setIsApplyRealData,
  };
}

/**
 * Hook to check if a task has been read
 */
export function useIsTaskRead(taskId: string) {
  const readedIds = useTasksStore((state) => state.readedIds);
  return readedIds.includes(taskId);
}

