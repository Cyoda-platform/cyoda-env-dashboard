<template>
  <div class="transaction-events">
    <EventsFilter ref="eventsFilterRef" :isLoading="isLoading" @change="loadData" />
    <EventsTable :tableData="data.rows" :isLoading="isLoading" />
    <div class="card">
      <div class="card-body">
        <Pagination ref="paginationRef" @change="loadData" :nextCursor="nextCursor" :prevCursor="prevCursor" :firstPage="data.firstPage" :lastPage="data.lastPage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, onMounted } from "vue";

import Pagination from "../../components/Pagination/Pagination.vue";
import EventsFilter from "../../components/PmTransitionDetail/Events/EventsFilter.vue";
import EventsTable from "../../components/PmTransitionDetail/Events/EventsTable.vue";
import {useProcessingStore} from "../../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
const prevCursor = computed(() => {
  let cursor = "";
  if (data.value.rows.length > 0) {
    cursor = data.value.rows[0].timeUUID;
  }
  return cursor;
});
const nextCursor = computed(() => {
  let cursor = "";
  if (data.value.rows.length > 0) {
    cursor = data.value.rows[data.value.rows.length - 1].timeUUID;
  }
  return cursor;
});
function transactionsViewEvents(value) {
  return processingStore.transactionsViewEvents(value);
}

const eventsFilterRef = ref(null);

const paginationRef = ref(null);

const isLoading = ref<boolean>(false);

let data = ref({
  rows: [],
  firstPage: false,
  lastPage: false
});

onMounted(() => {
  loadData();
});

async function loadData() {
  try {
    isLoading.value = true;
    const { data:dataValue } = await transactionsViewEvents({
      id: route.params.transactionId,
      ...eventsFilterRef.value.form,
      ...paginationRef.value.form
    });
    data.value = dataValue;
  } finally {
    isLoading.value = false;
  }
}
</script>
