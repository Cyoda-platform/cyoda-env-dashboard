<template>
  <div>
    <PmShardsDetailTabTransactionsViewFilter ref="pmShardsDetailTabTransactionsViewFilterRef" :isLoading="isLoading" @change="loadData" />
    <PmShardsDetailTabTransactionsViewTable :isLoading="isLoading" :tableData="data.rows" />
    <Pagination ref="paginationRef" @change="loadData" :nextCursor="nextCursor" :prevCursor="prevCursor" :firstPage="data.firstPage" :lastPage="data.lastPage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import PmShardsDetailTabTransactionsViewTable from "../../../components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsView/PmShardsDetailTabTransactionsViewTable.vue";
import PmShardsDetailTabTransactionsViewFilter from "../../../components/PmShardsDetailTab/PmShardsDetailTabTransactions/PmShardsDetailTabTransactionsView/PmShardsDetailTabTransactionsViewFilter.vue";
import Pagination from "../../Pagination/Pagination.vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
const prevCursor = computed(() => {
  let cursor = "";
  if (data.value.rows.length > 0) {
    cursor = data.value.rows[0].createTime;
  }
  return cursor;
});
const nextCursor = computed(() => {
  let cursor = "";
  if (data.value.rows.length > 0) {
    cursor = data.value.rows[data.value.rows.length - 1].createTime;
  }
  return cursor;
});
function loadTransactions(value) {
  return processingStore.loadTransactions(value);
}

const pmShardsDetailTabTransactionsViewFilterRef = ref(null);

const paginationRef = ref(null);

let data = ref({
  rows: [],
  firstPage: false,
  lastPage: false
});

const isLoading = ref<boolean>(false);

onMounted(() => {
  loadData();
});

async function loadData() {
  try {
    isLoading.value = true;
    const { data:dataValue } = await loadTransactions({
      ...pmShardsDetailTabTransactionsViewFilterRef.value.form,
      ...paginationRef.value.form
    });
    data.value = dataValue;
  } finally {
    isLoading.value = false;
  }
}
</script>
