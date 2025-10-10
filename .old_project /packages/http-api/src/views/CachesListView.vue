<template>
  <div class="cache-view-page">
    <h1 class="heading h1">Caches List</h1>
    <el-table v-loading="isLoading" class="ab-style" row-key="cache" border :data="tableData" size="small"
              style="width: 100%" @expand-change="loadCacheKeys">
      <el-table-column type="expand">
        <template #default="{ row }">
          <el-table v-loading="row.children.isLoading" class="ab-style" border :data="row.children.tableData"
                    size="small" style="width: 100%">
            <el-table-column sortable prop="key" label="Key"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column sortable prop="cache" label="Cache"></el-table-column>
      <el-table-column sortable prop="cacheServiceClass" label="Cache Service Class"></el-table-column>
      <el-table-column sortable prop="size" label="Size"></el-table-column>
      <el-table-column sortable prop="lastInvalidateAllTimeMkTime" label="Last Invalidate AllTime">
        <template v-slot:default="{ row }">
          {{ $filters.dateTime(row.lastInvalidateAllTime) }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="lastInvalidateKeyTimeMkTime" label="Last Invalidate Key Time">
        <template v-slot:default="{ row }">
          {{ $filters.dateTime(row.lastInvalidateKeyTime) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Actions">
        <template v-slot:default="{ row }">
          <el-tooltip effect="dark" content="Invalidate" placement="top">
            <el-button size="default" @click="onInvalidate(row)" type="primary">
              <font-awesome-icon icon="sync"/>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick} from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import type {Cache} from "@cyoda/ui-lib/src/types/types";
import moment from "moment";

const props = defineProps({
  getCachesListRequestFn: {
    default: null,
  },
  getInvalidateCacheRequestFn: {
    default: null,
  },
  getCacheKeysRequestFn: {
    default: null,
  }
})

interface TableDataRow extends Cache {
  children: {
    isLoading: boolean;
    tableData: Array<{
      key: string
    }>;
  };
}

let tableData = ref([]);
const isLoading = ref<boolean>(false);

function getCachesListRequest() {
  if (props.getCachesListRequestFn) return props.getCachesListRequestFn();
  return api.getCachesList();
}

function getInvalidateCacheRequest(cacheType: string) {
  if (props.getInvalidateCacheRequestFn) return props.getInvalidateCacheRequestFn(cacheType);
  return api.getInvalidateCache(cacheType);
}

function getCacheKeysRequest(cacheType: string) {
  if (props.getCacheKeysRequestFn) return props.getCacheKeysRequestFn(cacheType);
  return api.getCacheKeys(cacheType);
}

try {
  isLoading.value = true;
  loadData();
} finally {
  isLoading.value = false;
}

async function loadData() {
  const {data} = await getCachesListRequest();
  tableData.value = data.map((el) => {
    return {
      ...el,
      lastInvalidateAllTimeMkTime: el.lastInvalidateAllTime? moment(el.lastInvalidateAllTime).format('x'): 0,
      lastInvalidateKeyTimeMkTime: el.lastInvalidateKeyTime? moment(el.lastInvalidateKeyTime).format('x'): 0,
      children: {
        isLoading: false,
        tableData: []
      }
    };
  });
}

async function onInvalidate(row: TableDataRow) {
  try {
    isLoading.value = true;
    await getInvalidateCacheRequest(row.cache);
    await loadData();
  } finally {
    isLoading.value = false;
  }
}

async function loadCacheKeys(row: TableDataRow) {
  if (row.children.tableData.length === 0) {
    try {
      row.children.isLoading = true;
      const {data} = await getCacheKeysRequest(row.cache);
      row.children.tableData = data.map((el) => {
        return {
          key: el
        };
      });
    } finally {
      row.children.isLoading = false;
    }
  }
}

defineExpose({getCachesListRequest, getInvalidateCacheRequest, getCacheKeysRequest});
</script>

<style lang="scss">
.cache-view-page {
  .h1 {
    font-size: 24px;
    margin-top: 16px;
    margin-bottom: 16px;
    padding-left: 0;
  }
}
</style>
