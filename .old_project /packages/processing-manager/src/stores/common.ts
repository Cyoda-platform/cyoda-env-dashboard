import { defineStore } from 'pinia';
import { axiosProcessing } from '../plugins/axios';
import HelperUrl from '../helpers/HelperUrl';

export const useCommonStore = defineStore('common', {
  state: () => ({}), // You can define state if needed

  actions: {
    // Composite Indexes
    async platformCommonCompositeIndexesList({ entity }) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-common/composite-indexes/list?entityClass=${entity}`)
      );
    },

    async platformCommonCompositeIndexesReindex({ indexId }) {
      return axiosProcessing.post(
        HelperUrl.getLinkToServer('/platform-common/composite-indexes/reindex'),
        [indexId]
      );
    },

    async platformCommonCompositeIndexesDelete({ indexId }) {
      return axiosProcessing.post(
        HelperUrl.getLinkToServer('/platform-common/composite-indexes/delete'),
        [indexId]
      );
    },

    async platformCommonCompositeIndexesCreate({ data }) {
      return axiosProcessing.post(
        HelperUrl.getLinkToServer('/platform-common/composite-indexes/create'),
        data
      );
    },

    // Caches list
    async platformCommonCachesList() {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-common/cache-info/caches-list')
      );
    },

    async platformCommonInvalidateCache(cacheType) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer(
          `/platform-common/cache-info/invalidate-cache?cacheType=${cacheType}`
        )
      );
    },

    async platformCommonCacheKeys(cacheType) {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer(`/platform-common/cache-info/cache-keys?cacheType=${cacheType}`)
      );
    },

    // Net info
    async platformCommonNetInfoServer() {
      return axiosProcessing.get(HelperUrl.getLinkToServer('/platform-common/net-info/server'));
    },

    async platformCommonNetInfoClients() {
      return axiosProcessing.get(HelperUrl.getLinkToServer('/platform-common/net-info/clients'));
    },

    // Zk info
    async platformCommonZkInfoCurrNodeInfo() {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-common/zk-info/curr-node-info')
      );
    },

    async platformCommonZkInfoLoadedOnlineNodes() {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-common/zk-info/loaded-online-nodes')
      );
    },

    async platformCommonZkInfoLoadedShardsDistribution() {
      return axiosProcessing.get(
        HelperUrl.getLinkToServer('/platform-common/zk-info/loaded-shards-distribution')
      );
    },

    async platformCommonZkInfoClusterState() {
      return axiosProcessing.get(HelperUrl.getLinkToServer('/platform-common/zk-info/cluster-state'));
    },
  },
});
