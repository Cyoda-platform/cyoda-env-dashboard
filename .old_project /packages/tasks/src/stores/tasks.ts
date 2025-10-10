import { defineStore } from 'pinia';
import axios from '@cyoda/ui-lib/src/plugins/axios';
import HelperStorage from '@cyoda/ui-lib/src/helpers/HelperStorage';
import type { TasksRequestParams } from '../views/tasks/types';

const helperStorage = new HelperStorage();

interface AuthState {
  readedIds: string[];
  tasks: any[]; // Replace with the actual type
  isApplyRealData: boolean;
}

const defaultState: AuthState = {
  readedIds: [],
  tasks: [],
  isApplyRealData: false,
};

export const useTasksStore = defineStore({
  id: 'tasks',
  state: (): AuthState => helperStorage.get('tasks', { ...defaultState }),
  getters: {},
  actions: {
    async getTasksPerPage(params: TasksRequestParams) {
      const { data } = await axios.get(`/alerts/tasks/paged`, {params});
      return data;
    },

    async getAllTasks(params: any) {
      const { data } = await axios.get('/alerts/tasks', { params });
      return data;
    },

    async getTask(id: string) {
      const { data } = await axios.get(`/alerts/tasks/${id}`);
      return data;
    },

    async updateTask({ transition, task }: { transition: string; task: any }) {
      const { data } = await axios.put(`/alerts/tasks/${task.id}?transition=${transition}`, task);
      return data;
    },

    async getStats({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
      const { data } = await axios.get(`/alerts/tasks/date-stats?from=${dateFrom}&to=${dateTo}`);
      return data;
    },

    async getStatsSummary({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
      const { data } = await axios.get(`/alerts/tasks/summary?from=${dateFrom}&to=${dateTo}`);
      return data;
    },
    setTasks(data: any) {
      this.tasks=data;
    },

    addReadedId(id: string) {
      this.readedIds.push(id);
      helperStorage.set('tasks', this.$state);
    },

    setIsApplyRealData(value: boolean) {
      this.isApplyRealData = value;
      helperStorage.set('tasks', this.$state);
    },
  },
});
