<template>
  <div>
    <PmShardsDetailTabPmComponentsServiceProcessesViewReady :tableData="ready" class="ready" />
    <hr class="delimiter" />
    <PmShardsDetailTabPmComponentsServiceProcessesViewNoneReady :tableData="noneReady" class="not-ready" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import PmShardsDetailTabPmComponentsServiceProcessesViewReady from "../../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsServiceProcessesView/PmShardsDetailTabPmComponentsServiceProcessesViewReady.vue";
import PmShardsDetailTabPmComponentsServiceProcessesViewNoneReady from "../../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsServiceProcessesView/PmShardsDetailTabPmComponentsServiceProcessesViewNoneReady.vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
function loadServiceProcessesStats() {
  return processingStore.loadServiceProcessesStats();
}

let ready = ref([]);

let noneReady = ref([]);
loadData();

async function loadData() {
  const { data } = await loadServiceProcessesStats();
  ready.value = data.ready;
  noneReady.value = data.noneReady;
}
</script>

<style scoped>
.ready {
  margin-top: 20px;
  margin-bottom: 40px;
}

.not-ready {
  margin-top: 40px;
}

.delimiter {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
