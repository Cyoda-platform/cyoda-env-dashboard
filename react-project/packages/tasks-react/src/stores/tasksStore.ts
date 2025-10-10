/**
 * Tasks Store
 * Zustand store for tasks state management
 * Migrated from: .old_project/packages/tasks/src/stores/tasks.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '@cyoda/http-api-react';
import type { Task, TasksRequestParams, TasksPagedResponse, TaskDetailResponse, TaskStats, TaskSummary } from '../types';

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
        const { data } = await axios.get<TasksPagedResponse>('/alerts/tasks/paged', { params });
        return data;
      },

      getAllTasks: async (params: any) => {
        const { data } = await axios.get<Task[]>('/alerts/tasks', { params });
        return data;
      },

      getTask: async (id: string) => {
        const { data } = await axios.get<TaskDetailResponse>(`/alerts/tasks/${id}`);
        return data;
      },

      updateTask: async ({ transition, task }: { transition: string; task: Task }) => {
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

