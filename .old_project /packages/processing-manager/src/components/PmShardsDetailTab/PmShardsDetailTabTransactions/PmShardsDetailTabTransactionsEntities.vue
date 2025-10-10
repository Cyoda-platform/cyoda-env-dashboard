<template>
  <div>
    <PmShardsDetailTabTransactionsEntitiesFilter :isLoading="isLoading" @change="onChangeFilter" />
    <PmShardsDetailTabTransactionsEntitiesTable :isLoading="isLoading" :tableData="tableData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import PmShardsDetailTabTransactionsEntitiesFilter from "../../../components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsEntities/PmShardsDetailTabTransactionsEntitiesFilter.vue";
import PmShardsDetailTabTransactionsEntitiesTable from "../../../components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsEntities/PmShardsDetailTabTransactionsEntitiesTable.vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
function loadTransactionsEntitiesList(value) {
  return processingStore.loadTransactionsEntitiesList(value);
}

let tableData = ref([]);

const isLoading = ref<boolean>(false);

async function loadData(filter: any) {
  try {
    isLoading.value = true;
    const { data } = await loadTransactionsEntitiesList({
      ...filter
    });
    tableData.value = data.entities;
  } finally {
    isLoading.value = false;
  }
}

function onChangeFilter(filter: any) {
  loadData(filter);
}
</script>
