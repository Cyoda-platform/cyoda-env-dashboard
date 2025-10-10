<template>
  <div class="transaction-detail">
    <MembersFilter ref="membersFilterRef" :isLoading="isLoading" @change="loadData" />
    <MembersTable :tableData="data.rows" :isLoading="isLoading" />
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

import MembersTable from "./Members/MembersTable.vue";

import MembersFilter from "../../components/PmTransitionDetail/Members/MembersFilter.vue";
import Pagination from "../../components/Pagination/Pagination.vue";
import moment from "moment";
import {useProcessingStore} from "../../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
const prevCursor = computed(() => {
  let cursor = "";
  if (data.value.rows.length > 0) {
    cursor = convertTime(data.value.rows[0].versionCheckTimeMillis);
  }
  return cursor;
});
const nextCursor = computed(() => {
  let cursor = "";
  if (data.value.rows.length > 0) {
    cursor = convertTime(data.value.rows[data.value.rows.length - 1].versionCheckTimeMillis);
  }
  return cursor;
});
function transactionsViewMembers(value) {
  return processingStore.transactionsViewMembers(value);
}

const membersFilterRef = ref(null);

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
    const { data:dataValue } = await transactionsViewMembers({
      id: route.params.transactionId,
      ...membersFilterRef.value.form,
      ...paginationRef.value.form
    });
    data.value = dataValue;
  } finally {
    isLoading.value = false;
  }
}

function convertTime(mkTime: number) {
  return moment(mkTime).format("YYYY-MM-DD HH:mm:ss.SSS");
}
</script>
