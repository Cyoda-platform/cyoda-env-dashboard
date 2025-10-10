<template>
  <div class="row">
    <div class="col-sm-9">
      <PmGrafanaChartResetButton />
      <PmGrafanaChart dashboard-name="Linux" panel-name="CPU basic" :node="node" :port="port" :job="job" />

      <PmGrafanaChart dashboard-name="Linux" panel-name="Disk IOps Completed" :node="node" :port="port" :job="job" />

      <PmGrafanaChart dashboard-name="Linux" panel-name="Network Traffic by Packets" :node="node" :port="port" :job="job" />
    </div>
    <div class="col-sm-3">
      <PmShardsDetailTabSummaryPower />
      <PmShardsDetailTabSummarySsh />
      <PmShardsDetailTabSummaryIp />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, watch } from "vue";

import PmTimeCpuUsage from "../../components/PmCharts/PmTimeCpuUsage.vue";
import PmTimeDiskIO from "../../components/PmCharts/PmTimeDiskIO.vue";
import PmShardsDetailTabSummaryIp from "../../components/PmShardsDetailTab/PmShardsDetailTabSummary/PmShardsDetailTabSummaryIp.vue";
import PmShardsDetailTabSummaryPower from "../../components/PmShardsDetailTab/PmShardsDetailTabSummary/PmShardsDetailTabSummaryPower.vue";
import PmShardsDetailTabSummarySsh from "../../components/PmShardsDetailTab/PmShardsDetailTabSummary/PmShardsDetailTabSummarySsh.vue";
import PmGrafanaChart from "../../components/PmGrafanaChart/PmGrafanaChart.vue";

import PmGrafanaChartResetButton from "../../components/PmGrafanaChart/PmGrafanaChartResetButton.vue";
import {useProcessingStore} from "../../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
const nodes = computed(() => {
  return processingStore.nodes;
});

const node = ref<string>("");

const port = ref<string>("");

const job = ref<string>("");

watch(
  nodes,
  () => {
    if (nodes.value.length > 0) {
      const current = nodes.value.find((el: any) => el.hostname.indexOf(route.params.name) !== -1);
      if (current.grafana) {
        const [node, port] = current.grafana.instance.split(":");
        node.value = node;
        port.value = port;
        job.value = current.grafana.job;
      }
    }
  },
  { immediate: true, deep: true }
);
</script>
