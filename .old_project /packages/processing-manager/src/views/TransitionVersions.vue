<template>
  <ViewWrapper>
    <div>
      <h1>{{ title }}</h1>
      <TransitionVersionsFilter ref="transitionVersionsFilterRef" :isLoading="isLoading" @change="loadData" />
      <TransitionVersionsAggregated v-loading="isLoading" :rows="data.rows" />
      <TransitionVersionsSorted v-loading="isLoading" :rows="data.rows" />
      <div class="card">
        <div class="card-body">
          <Pagination ref="paginationRef" @change="loadData" :nextCursor="nextCursor" :prevCursor="prevCursor" :firstPage="data.firstPage" :lastPage="data.lastPage" />
        </div>
      </div>
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, onMounted } from "vue";

import TransitionVersionsAggregated from "../components/PmTransitionVersions/TransitionVersionsAggregated.vue";
import TransitionVersionsSorted from "../components/PmTransitionVersions/TransitionVersionsSorted.vue";

import TransitionVersionsFilter from "../components/PmTransitionVersions/TransitionVersionsFilter.vue";
import Pagination from "../components/Pagination/Pagination.vue";
import ViewWrapper from "../components/ViewWrapper.vue";
import {useProcessingStore} from "../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
const title = computed(() => {
  return `Version columns of entity (${route.query.type.split(".").pop()}): ${route.query.entityId}`;
});
const prevCursor = computed(() => {
  let cursor = "";
  if (data.value.rows.length > 0) {
    cursor = data.value.rows[0].transactionId;
  }
  return cursor;
});
const nextCursor = computed(() => {
  let cursor = "";
  if (data.value.rows.length > 0) {
    cursor = data.value.rows[data.value.rows.length - 1].transactionId;
  }
  return cursor;
});
function transactionsViewEntityVersions(value) {
  return processingStore.transactionsViewEntityVersions(value);
}

const paginationRef = ref(null);

const transitionVersionsFilterRef = ref(null);

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
    const { data: dataValue } = await transactionsViewEntityVersions({
      type: route.query.type,
      id: route.query.entityId,
      ...transitionVersionsFilterRef.value.form,
      ...paginationRef.value.form
    });
    data.value = dataValue;
  } finally {
    isLoading.value = false;
  }
}
</script>
