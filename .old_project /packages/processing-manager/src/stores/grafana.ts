import { defineStore } from 'pinia';
import { axiosGrafana } from '../plugins/axios';
import HelperFormat from '../helpers/HelperFormat';

const GRAFANA_SOURSE_URL = `/datasources/proxy/${import.meta.env.VITE_APP_GRAFANA_SERVER_SOURCE_ID}`;

const defaultState = {
  nodes: [],
};

export const useGrafanaStore = defineStore('grafana', {
  state: () => defaultState,

  actions: {
    setNodes(nodes) {
      this.nodes = nodes;
    },
    async init() {
      const { data } = await this.loadNodes();
      if(!data.data) return;
      this.setNodes(
        data.data.filter((el) => el.instance.indexOf(':9100') !== -1)
      );
    },

    async loadNodes() {
      return axiosGrafana.get(`${GRAFANA_SOURSE_URL}/api/v1/series?match[]=up`);
    },

    async loadNodeInfo(node) {
      const query = encodeURIComponent(`
        count(count(node_cpu_seconds_total{instance=~"${node.instance}",job=~"${node.job}"}) by (cpu)) or
        node_filesystem_size_bytes{instance=~"${node.instance}",job=~"${node.job}",mountpoint="/",fstype!="rootfs"} or
        node_memory_MemTotal_bytes{instance=~"${node.instance}",job=~"${node.job}"} or
        node_uname_info{instance=~"${node.instance}",job=~"${node.job}"}
      `);
      const { data } = await axiosGrafana.get(`${GRAFANA_SOURSE_URL}/api/v1/query?query=${query}`);

      let osName = '';
      if (data.data.result[3]) {
        const { version } = data.data.result[3] && data.data.result[3].metric;
        const found = version.match(/-(.*?)\s/i);
        osName = found[1];
      }

      return {
        cpu: (data.data.result[0] && data.data.result[0].value[1]) || '',
        storage: (data.data.result[1] && HelperFormat.bytesToSize(data.data.result[1].value[1])) || '',
        ram: (data.data.result[2] && HelperFormat.bytesToSize(data.data.result[2].value[1])) || '',
        osName,
        up: (data.data.result[4] && data.data.result[4].value[1]) || '',
      };
    },

    async loadUp(node) {
      const query = encodeURIComponent(`
        up{instance=~"${node.instance}",job=~"${node.job}"}
      `);
      const { data } = await axiosGrafana.get(`${GRAFANA_SOURSE_URL}/api/v1/query?query=${query}`);

      if (data.data.result.length > 0 && data.data.result[0].value.length > 0) {
        return !!data.data.result[0].value[1];
      }
      return false;
    },

    async isServerUp(node) {
      const query = encodeURIComponent(`up{instance=~"${node.instance}",job=~"${node.job}"}`);
      return axiosGrafana.get(`${GRAFANA_SOURSE_URL}/api/v1/query?query=${query}`);
    },

    async getDashboardByName(name) {
      const query = encodeURIComponent(name);
      return axiosGrafana.get(`/search?query=${query}`);
    },

    async getAllPanelsByUid(uid) {
      return axiosGrafana.get(`/dashboards/uid/${uid}`);
    },
  },
});
