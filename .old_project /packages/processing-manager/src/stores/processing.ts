import { defineStore } from 'pinia';
import { axiosProcessing } from '../plugins/axios';
import moment from 'moment';
import HelperUrl from '../helpers/HelperUrl';
import {useGrafanaStore} from "../stores/grafana";
import axios from "@cyoda/ui-lib/src/plugins/axios";

const defaultState = {
  nodesProcessing: [],
};

export const useProcessingStore = defineStore('processing', {
  state: () => defaultState,

  getters: {
    nodes(state) {
      const grafanaStore= useGrafanaStore();
      const grafanaNodes = grafanaStore.nodes;
      if(!state.nodesProcessing) return  [];
      return state.nodesProcessing.map((processingNode) => {
        const grafanaInst = grafanaNodes.find(
          (grafanaNode) => grafanaNode.instance.indexOf(processingNode.hostname) > -1
        );

        return {
          hostname: processingNode.hostname,
          baseUrl: processingNode.baseUrl,
          grafana: grafanaInst,
        };
      });
    },
  },

  actions: {
    async loadNodes() {
      const { data } = await this.pmClusterStatsFull();
      this.nodesProcessing = data.pmNodes;
    },

    loadSummary(params) {
      return axiosProcessing.get(HelperUrl.getLinkToServer('/platform-processing/summary'), {
        params,
      });
    },

    loadStatsProcessEvents(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/stats/process-events'),
        { params }
      );
    },

    loadPollingInfo(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/polling-info-json.do'),
        { params }
      );
    },

    loadProcessingQueueEvents(params) {
      if (!params.queue) {
        params.queue = 'ALL';
      }
      if (!params.shard) {
        params.shard = 'ALL';
      }
      if (!params.eventStatus) {
        params.eventStatus = 'ALL';
      }
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/events'),
        { params }
      );
    },

    loadStatsTime(params) {
      return axiosProcessing.get(HelperUrl.getLinkToServer('/platform-processing/stats/time'), {
        params,
      });
    },

    loadStatsCount(params) {
      return axiosProcessing.get(HelperUrl.getLinkToServer('/platform-processing/stats/count'), {
        params,
      });
    },

    loadExecTransactionsInfo(params = { limit: 100 }) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/exec-transactions-info-json.do'),
        { params }
      );
    },

    loadTransactions(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/view'),
        { params }
      );
    },

    loadTransactionsStatuses() {
      return axiosProcessing.get(HelperUrl.getLinkToServer('/platform-processing/transactions/statuses'));
    },

    loadTransactionsEntitiesList(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/entities-list'),
        { params }
      );
    },

    loadServiceProcessesStats(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/service-processes/service-processes-stats.do'),
        { params }
      );
    },

    loadRunnableComponents(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/runnable-components.do'),
        { params }
      );
    },

    loadSiftLogger(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/sift-logger.do'),
        { params }
      );
    },

    updateSiftLogger(params) {
      return axiosProcessing.post(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/update-sift-logger.do'),
        params
      );
    },

    clearTimeStats(url) {
      const targetUrl = url
        ? `${url}/platform-processing/stats/clear-time-stats`
        : HelperUrl.getLinkToServer('/platform-processing/stats/clear-time-stats');
      return axiosProcessing.put(targetUrl);
    },

    transactionsView({ id }) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-processing/transactions/view/${id}`)
      );
    },

    transactionsViewMembers(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-processing/transactions/view/${params.id}/members`),
        { params }
      );
    },

    transactionsViewEvents(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-processing/transactions/view/${params.id}/exec-events`),
        { params }
      );
    },

    entitiesListPossible(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/entities-list/possible'),
        { params }
      );
    },

    transactionsViewEntityVersions(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/view/entity-versions'),
        { params }
      );
    },

    transactionsViewEntityChanges(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/view/entity-changes'),
        { params }
      );
    },

    transactionsEntityStateMachine(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/view/entity-state-machine'),
        { params }
      );
    },

    doManualTransition(params) {
      return axios.put(
        HelperUrl.getLinkToServer('/platform-api/entity'),
        params
      );
    },

    doHardResetConsistencyTime(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/hard-reset-consistency-time.do'),
        { params }
      );
    },

    doClearAllCaches(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/clear-all-caches.do'),
        { params }
      );
    },

    stopRunnableComponent(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/stop-runnable-component.do'),
        { params }
      );
    },

    startRunnableComponent(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/start-runnable-component.do'),
        { params }
      );
    },

    execMonitorsInfo(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/exec-monitors-info-json.do'),
        { params }
      );
    },

    pmClusterStatsFull() {
      return axiosProcessing.get('/platform-processing/pm-cluster-stats-full.do');
    },

    processingQueueEventsError({ params }) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer(
          `/platform-processing/processing-queue/events/error.json?&queue=${params.queue}&shard=${
            params.shard
          }&from=${moment(params.from).format('x') * 1000}&to=${
            moment(params.to).format('x') * 1000
          }&sort=${params.sort}&pageSize=9999999&pageNum=${params.pageNum}`
        )
      );
    },

    processingQueueEntitiesErrorList(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/entities-error-list.json'),
        { params }
      );
    },

    processingQueues(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/queues.do'),
        { params }
      );
    },

    processingQueueErrorEventByEntity(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/show-event.json'),
        { params }
      );
    },

    processingQueueForceMarkProcessed(params) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/processing-queue/force-mark-processed.do'),
        { params }
      );
    },

    loadTransactionEventStatusesList(params): Promise<string[]> {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-processing/transactions/event-ref-status-filters'),
        { params }
      );
    },
  },
});
