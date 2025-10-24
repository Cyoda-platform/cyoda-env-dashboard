/**
 * Tasks Store
 * Zustand store for tasks state management
 * Migrated from: .old_project/packages/tasks/src/stores/tasks.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { axios } from '@cyoda/http-api-react';
import type { Task, TasksRequestParams, TasksPagedResponse, TaskDetailResponse, TaskStats, TaskSummary } from '../types';
import { getMockTasksPage, getMockTask, updateMockTask } from '../mocks/mockData';

// Development mode flag
const DEV_MODE = import.meta.env.DEV;

interface TasksState {
  // State
  readedIds: string[];
  tasks: Task[];
  isApplyRealData: boolean;

  // Actions
  getTasksPerPage: (params: TasksRequestParams) => Promise<TasksPagedResponse>;
  getAllTasks: (params: any) => Promise<Task[]>;
  getTask: (id: string) => Promise<TaskDetailResponse>;
  updateTask: (params: { transition: string; task: Task }) => Promise<Task>;
  getStats: (params: { dateFrom: string; dateTo: string }) => Promise<TaskStats[]>;
  getStatsSummary: (params: { dateFrom: string; dateTo: string }) => Promise<TaskSummary>;
  setTasks: (tasks: Task[]) => void;
  addReadedId: (id: string) => void;
  setIsApplyRealData: (value: boolean) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      // Initial state
      readedIds: [],
      tasks: [],
      isApplyRealData: false,

      // Actions
      getTasksPerPage: async (params: TasksRequestParams) => {
        // Use mock data in development mode
        if (DEV_MODE) {
          console.log('📋 Using mock tasks data with filters:', {
            page: params.page,
            size: params.size,
            state: params.state,
            assignee: params.assignee,
            priority: params.priority,
          });
          return new Promise((resolve) => {
            setTimeout(() => {
              const result = getMockTasksPage(
                params.page,
                params.size,
                params.state,
                params.assignee,
                params.priority
              );
              console.log('📋 Filtered results:', {
                totalElements: result.totalElements,
                returnedElements: result.content.length,
                filters: { state: params.state, assignee: params.assignee, priority: params.priority }
              });
              resolve(result);
            }, 300); // Simulate network delay
          });
        }
        const { data } = await axios.get<TasksPagedResponse>('/alerts/tasks/paged', { params });
        return data;
      },

      getAllTasks: async (params: any) => {
        // Use mock data in development mode
        if (DEV_MODE) {
          console.log('📋 Using mock tasks data (all)');
          return new Promise((resolve) => {
            setTimeout(() => {
              const mockResponse = getMockTasksPage(0, 100);
              resolve(mockResponse.content);
            }, 300);
          });
        }
        const { data } = await axios.get<Task[]>('/alerts/tasks', { params });
        return data;
      },

      getTask: async (id: string) => {
        // Use mock data in development mode
        if (DEV_MODE) {
          console.log('📋 Using mock task data for ID:', id);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const task = getMockTask(id);
              if (task) {
                resolve({ alertTask: task, transitions: ['COMPLETE', 'CANCEL', 'REOPEN'] });
              } else {
                reject(new Error('Task not found'));
              }
            }, 300);
          });
        }
        const { data } = await axios.get<TaskDetailResponse>(`/alerts/tasks/${id}`);
        return data;
      },

      updateTask: async ({ transition, task }: { transition: string; task: Task }) => {
        // Use mock data in development mode
        if (DEV_MODE) {
          console.log('📝 Mock updating task:', { id: task.id, transition, task });
          return new Promise((resolve) => {
            setTimeout(() => {
              // Update the mock data
              const updatedTask = updateMockTask(task.id, task);
              resolve(updatedTask);
            }, 300);
          });
        }
        const { data } = await axios.put<Task>(`/alerts/tasks/${task.id}?transition=${transition}`, task);
        return data;
      },

      getStats: async ({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) => {
        const { data } = await axios.get<TaskStats[]>(`/alerts/tasks/date-stats?from=${dateFrom}&to=${dateTo}`);
        return data;
      },

      getStatsSummary: async ({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) => {
        const { data } = await axios.get<TaskSummary>(`/alerts/tasks/summary?from=${dateFrom}&to=${dateTo}`);
        return data;
      },

      setTasks: (tasks: Task[]) => {
        set({ tasks });
      },

      addReadedId: (id: string) => {
        set((state) => ({
          readedIds: [...state.readedIds, id],
        }));
      },

      setIsApplyRealData: (value: boolean) => {
        console.log(`🔔 ${value ? 'SUBSCRIBING' : 'UNSUBSCRIBING'} to live data updates`);
        set({ isApplyRealData: value });
      },
    }),
    {
      name: 'cyoda_tasks', // localStorage key
      partialize: (state) => ({
        readedIds: state.readedIds,
        isApplyRealData: state.isApplyRealData,
      }),
    }
  )
);

