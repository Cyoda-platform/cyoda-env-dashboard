<template>
  <div v-loading="isLoading">
    <PmProcessingEventsEntitiesErrorListViewFilter @change="onChange" />
    <PmProcessingEventsEntitiesErrorListViewTable v-loading="isLoading" :tableData="tableData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import PmProcessingEventsEntitiesErrorListViewFilter from "../../../components/PmShardsDetailTab/PmProcessingEventsEntitiesErrorListView/Component/PmProcessingEventsEntitiesErrorListViewFilter.vue";
import PmProcessingEventsEntitiesErrorListViewTable from "../../../components/PmShardsDetailTab/PmProcessingEventsEntitiesErrorListView/Component/PmProcessingEventsEntitiesErrorListViewTable.vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
function processingQueueEntitiesErrorList(value) {
  return processingStore.processingQueueEntitiesErrorList(value);
}

let tableData = ref([]);

const isLoading = ref<boolean>(false);

async function onChange(filter: any) {
  isLoading.value = true;
  const { data } = await processingQueueEntitiesErrorList({
    type: filter.type
  });
  isLoading.value = false;
  tableData.value = data.elements;
}
</script>
