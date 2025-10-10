<template>
  <div class="row">
    <div class="col-sm-9">
      <PmGrafanaChartResetButton />
      <PmGrafanaChart dashboard-name="Cassandra" panel-name="Writes / sec $instance" :job="job" :node="node" port="7070" />
      <PmGrafanaChart dashboard-name="Cassandra" panel-name="Reads / sec $instance" :job="job" :node="node" port="7070" />
      <PmGrafanaChart dashboard-name="Cassandra" panel-name="Avg write latency $instance" :job="job" :node="node" port="7070" />
      <PmGrafanaChart dashboard-name="Cassandra" panel-name="Avg read latency $instance" :job="job" :node="node" port="7070" />
    </div>
    <div class="col-sm-3">
      <PmShardsDetailTabCassandraService />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, watch } from "vue";

import PmShardsDetailTabCassandraService from "../../components/PmShardsDetailTab/PmShardsDetailTabCassandra/PmShardsDetailTabCassandraService.vue";
import PmGrafanaChart from "../../components/PmGrafanaChart/PmGrafanaChart.vue";

import PmGrafanaChartResetButton from "../../components/PmGrafanaChart/PmGrafanaChartResetButton.vue";
import {useProcessingStore} from "../../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
const nodes = computed(() => {
  return processingStore.nodes;
});

const node = ref<string>("");

const job = ref<string>("");

watch(
  nodes,
  () => {
    if (nodes.value.length > 0) {
      const current = nodes.value.find((el: any) => el.hostname.indexOf(route.params.name) !== -1);
      if (current.grafana) {
        const [node] = current.grafana.instance.split(":");
        node.value = node;
        job.value = current.grafana.job;
      }
    }
  },
  { immediate: true, deep: true }
);
</script>
