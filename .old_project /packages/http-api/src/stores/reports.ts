import {defineStore} from 'pinia';
import {ElMessageBox, ElNotification} from 'element-plus';
import * as api from '@cyoda/ui-lib/src/api';
import HelperReportDefinition from '../helpers/HelperReportDefinition';
import HelperStorage from '@cyoda/ui-lib/src/helpers/HelperStorage';
import type {RunningReport, ItemHistory, StateReports, StateReportsSettings} from '@cyoda/ui-lib/src/types/types';
import type {StoreParamsReport} from '../views/History/History.d.ts';
import eventBus from '@cyoda/ui-lib/src/plugins/eventBus';
import {toRaw} from 'vue';

const helperStorage = new HelperStorage();

const defaultState: StateReports = {
  runningReports: [],
  reportsSettings: [],
};

export const useReportsStore = defineStore({
  id: 'reports',
  state: () => ({
    ...helperStorage.get('reports', {...defaultState}),
  }),
  actions: {
    updateStore() {
      helperStorage.set('reports', {
        runningReports: toRaw(this.runningReports),
        reportsSettings: toRaw(this.reportsSettings),
      });
    },
    createReportToRun(params: StoreParamsReport) {
      this.runningReports.push(params);
      this.updateStore();
      // @ts-ignore
      this.checkStatus(params);
    },
    deleteReportToRun(params: StoreParamsReport) {
      const report = this.runningReports.find((el) => el.configName === params.configName);
      const index = this.runningReports.indexOf(report);
      if (index !== -1) {
        this.runningReports.splice(index, 1);
        this.updateStore();
        eventBus.$emit('updateHistory');
        if(params.showResult) {
          eventBus.$emit('lastReport', params);
        }
      }
    },
    updateReportToRun(params: StoreParamsReport) {
      const report = this.runningReports.find((el) => el.configName === params.configName);
      const index = this.runningReports.indexOf(report);
      if (index !== -1) {
        this.runningReports.splice(index, 1, params);
        this.updateStore();
      }
    },
    clearReportsToRun() {
      this.runningReports = [];
      this.updateStore();
    },
    setReportsSettings(params: StateReportsSettings) {
      if (!this.reportsSettings) {
        this.reportsSettings = [];
      }
      const reportsSettingIndex = this.reportsSettings.findIndex((el) => el.id === params.id);
      if (reportsSettingIndex > -1) {
        this.reportsSettings.splice(reportsSettingIndex, 1, params);
      } else {
        this.reportsSettings.push(params);
      }
      this.updateStore();
    },
    // @ts-ignore
    async runReport(definitionId: string, showResult = false) {
      const path: api.IGetDefinitionPathParams = {
        definition: definitionId,
      };
      const {data: dataReportDefinition} = await api.getDefinition({path});
      if (dataReportDefinition.content.columns.length === 0) {
        ElNotification.error({
          title: 'Error',
          message: 'Please set up and select columns before running the report',
        });
        return false;
      }

      let message = 'Do you really want to run the Report?';
      const time = await HelperReportDefinition.getAvgReportsTime(definitionId);
      if (time) {
        message += ` Average time is: ${time}`;
      }
      ElMessageBox.confirm(message, 'Confirm', {
        callback: async (action) => {
          if (action === 'confirm') {
            const params: api.IRunReportPreConfigQueryParams = {
              gridConfig: definitionId,
            };
            const {data} = await api.RunReportPreConfig({params});
            const paramsReport = {
              reportId: data.content.reportId,
              groupingVersion: data.content.groupingVersion,
              configName: definitionId,
              reportExecutionTime: 0,
              linkStatus: data._links['/report/{id}/{grouping_version}/status'].href,
              linkStats: `/platform-api/reporting/report/${data.content.reportId}/${data.content.groupingVersion}/stats?full=false`,
              status: 'RUNNING',
              showResult
            };
            this.createReportToRun(paramsReport);
            return true;
          }
          return false;
        },
      });
    },
    // @ts-ignore
    async cancelReport(runningReport: RunningReport) {
      const message = 'Do you really want to cancel the Report?';
      ElMessageBox.confirm(message, 'Confirm', {
        callback: async (action) => {
          if (action === 'confirm') {
            await api.cancelProcessingReport(runningReport.reportId, runningReport.groupingVersion);
          }
        },
      });
    },
    // @ts-ignore
    checkStatus(params: StoreParamsReport) {
      const intervalId = setInterval(async () => {
        const {data: status} = await api.checkStatus(params.linkStatus);
        params.reportExecutionTime += 1;
        this.updateReportToRun(params);
        if (status.content.status !== 'RUNNING') {
          clearInterval(intervalId);
          params.status = status.content.status;
          this.deleteReportToRun(params);
        }
        if (status.content.status === 'FAILED') {
          ElNotification({
            title: 'Error',
            message: `Report ${params.configName} has failed`,
            type: 'error',
          });
        }
        if (status.content.status === 'SUCCESSFUL') {
          ElNotification({
            title: 'Success',
            message: `Report ${params.configName} has completed`,
            type: 'success',
          });
        }
      }, 1000);
    },
    // @ts-ignore
    async init() {
      const params: api.IGetHistoryQueryParams = {
        fields: [
          'id',
          'configName',
          'reportFailed',
          'createTime',
          'finishTime',
          'type',
          'status',
          'description',
          'userId',
          'totalRowsCount',
        ],
        size: 500,
      };

      const {data} = await api.getReportHistory({params});
      this.clearReportsToRun();
      if (data._embedded && data._embedded.reportHistoryFieldsViews) {
        data._embedded.reportHistoryFieldsViews.forEach((el: ItemHistory) => {
          const paramsReport = {
            reportId: el.reportHistoryFields.id,
            groupingVersion: el.reportHistoryFields.groupingVersion,
            configName: el.reportHistoryFields.configName,
            reportExecutionTime: 2,
            linkStatus: `platform-api/reporting/report/${el.reportHistoryFields.id}/${el.reportHistoryFields.groupingVersion}/status`,
            linkStats: `platform-api/reporting/report/${el.reportHistoryFields.id}/${el.reportHistoryFields.groupingVersion}/stats?full=false`,
            status: el.reportHistoryFields.status,
          };
          if (paramsReport.status === 'RUNNING') {
            this.createReportToRun(paramsReport);
          }
        });
      }
    },
  },
  getters: {
    getStoredSettings: (state) => {
      return (id) => (state.reportsSettings && state.reportsSettings.find((el) => el.id === id)) || undefined;
    },
  },
});
