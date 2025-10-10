<template>
  <div>
    <PmShardsDetailTabPmComponentsExecutionMonitorsFilter @filter="onFilter" />
    <PmShardsDetailTabPmComponentsExecutionMonitorsTable :tableData="tableData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";

import PmShardsDetailTabPmComponentsExecutionMonitorsFilter from "../../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionMonitors/PmShardsDetailTabPmComponentsExecutionMonitorsFilter.vue";
import PmShardsDetailTabPmComponentsExecutionMonitorsTable from "../../../components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionMonitors/PmShardsDetailTabPmComponentsExecutionMonitorsTable.vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
const tableData = computed(() => {
  return data.value.filter((data: any) => !form.value.name || data.name.toLowerCase().includes(form.value.name.toLowerCase()));
});
function execMonitorsInfo() {
  return processingStore.execMonitorsInfo();
}

let data = ref([]);

let form = ref({});

const intervalId = ref(undefined);

async function loadData() {
  const { data:dataValue } = await execMonitorsInfo();
  data.value = dataValue;
}

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

function onFilter(form: any) {
  form.value = form;
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
  intervalId.value = setInterval(() => {
    loadData();
  }, form.value.updateInterval * 1000);
}
</script>
