<template>
  <div class="card">
    <template v-if="node">
      <iframe v-if="isEnabled" :src="link" width="100%" height="300" frameborder="0"></iframe>
    </template>
    <template v-else>
      <div class="empty-statistics">
        <div class="title">
          {{ computedPanelName }}
        </div>
        <div class="body">No data. IP {{ route.params.name }} not connected to Grafana</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { useRoute } from "vue-router";
import { ref, nextTick, computed, onBeforeUnmount } from "vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useGrafanaStore} from "../../stores/grafana";

const props = defineProps({ node: { default: "" }, port: { default: "" }, dashboardName: { default: "" }, panelName: { default: "" }, job: { default: "" } });
const route = useRoute();
const grafanaStore = useGrafanaStore();
const authStore = useAuthStore();
const token = computed(() => {
  return authStore.token;
});
const computedPanelName = computed(() => {
  return props.panelName.replace("$instance", `${route.params.name}:${props.port}`);
});
function getDashboardByName(dashboardName) {
  return grafanaStore.getDashboardByName(dashboardName);
}

function getAllPanelsByUid(uid) {
  return grafanaStore.getAllPanelsByUid(uid);
}

const link = ref<string>("");

const isEnabled = ref<boolean>(true);
getLink();
eventBus.$on("grafana:chart:reset", resetChart);

onBeforeUnmount(() => {
  eventBus.$off("grafana:chart:reset", resetChart);
});

async function resetChart() {
  isEnabled.value = false;
  await nextTick();

  isEnabled.value = true;
}

async function getLink() {
  let dataDashboardByName: any = {};
  dataDashboardByName = await getDashboardByName(props.dashboardName);
  const { uid } = dataDashboardByName.data[0];
  const url = dataDashboardByName.data[0].url?.replace("/d/", "/d-solo/");
  if(!url) return;
  let dataAllPanelsByUid: any = {};
  dataAllPanelsByUid = await getAllPanelsByUid(uid);
  const chartData = getChartData(dataAllPanelsByUid.data.dashboard);
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const port = import.meta.env.MODE === "development" ? "8000" : "8001";
  link.value = `${baseUrl}:${port}${url}?orgId=${import.meta.env.VITE_APP_GRAFANA_SERVER_SOURCE_ID}&var-DS_PROMETHEUS=Prometheus&refresh=30s&var-job=${props.job}&var-instance=${props.node}:${props.port}&theme=light&panelId=${chartData.id}&token=${token.value}`;
}

function getChartData(obj: any): any {
  let chartData;
  for (let i = 0; i < obj.panels.length; i += 1) {
    const panel = obj.panels[i];
    if (panel.title.toLowerCase() === props.panelName.toLowerCase()) {
      chartData = panel;
      break;
    }
    if ("panels" in panel) {
      chartData = getChartData(panel);
    }
    if (chartData) break;
  }
  return chartData;
}
</script>

<style lang="scss" scoped>
.empty-statistics {
  height: 300px;

  .title {
    text-align: center;
    padding: 10px;
    font-weight: bold;
  }

  .body {
    display: flex;
    padding-top: 100px;
    justify-content: center;
  }
}
</style>
