<template>
  <div v-loading="isLoading">
    <PmProcessingEventsErrorViewFilter @change="onChange" />
    <PmProcessingEventsErrorViewTable :tableData="tableData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import PmProcessingEventsErrorViewFilter from "../../../components/PmShardsDetailTab/PmProcessingEventsErrorView/Component/PmProcessingEventsErrorViewFilter.vue";
import PmProcessingEventsErrorViewTable from "../../../components/PmShardsDetailTab/PmProcessingEventsErrorView/Component/PmProcessingEventsErrorViewTable.vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
function processingQueueEventsError(value) {
  return processingStore.processingQueueEventsError(value);
}

let tableData = ref([]);

const isLoading = ref<boolean>(false);

async function onChange(filter: any) {
  isLoading.value = true;
  const { data } = await processingQueueEventsError({
    params: filter
  });
  tableData.value = data.rows;
  isLoading.value = false;
}
</script>
