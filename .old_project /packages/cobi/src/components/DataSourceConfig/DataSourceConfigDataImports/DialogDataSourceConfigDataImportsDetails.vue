<template>
  <el-dialog width="80%" append-to-body :close-on-click-modal="false" title="List of Executed Connection steps" v-model="dialogVisible">
    <data-tables
      :pageSize="5"
      :pagination-props="{ pageSizes: [5, 10, 20, 50], total: totalElements }"
      :table-props="{
        border: true
      }"
      :loading="isLoading"
      class="table"
      border
      :data="tableData"
      :default-sort="{ prop: 'lastUpdated', order: 'descending' }"
      style="width: 100%"
      :remote="true"
      @query-change="loadData"
    >
      <el-table-column show-overflow-tooltip prop="id" width="200" label="Event Id"></el-table-column>
      <el-table-column prop="chainingStep" width="200" label="Chaining Step"></el-table-column>
      <el-table-column width="200" label="Start timestamp">
        <template v-slot:default="{ row }">
          {{ momentTime(row.timeStatistic.startProcessing) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" width="200" label="Status"></el-table-column>
      <el-table-column prop="dataSourceName" width="200" label="Data Source"></el-table-column>
      <el-table-column prop="mappingConfigName" width="300" label="Mapping operation" />
      <el-table-column show-overflow-tooltip prop="className" width="400" label="Entity Classes" />
      <el-table-column prop="createdEntitiesCount" width="170" label="Created"></el-table-column>
      <el-table-column prop="updatedEntitiesCount" width="170" label="Updated"></el-table-column>
      <el-table-column width="170" label="Duration (ms)">
        <template v-slot:default="{ row }">
          {{ row.timeStatistic.finishProcessing - row.timeStatistic.startProcessing }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="80px" label="Actions">
        <template v-slot:default="{ row }">
          <el-tooltip :show-after="1000" class="item" effect="dark" content="View updated/created entities" placement="top">
            <el-button size="default" type="success" @click="onViewImportedRows(row)">
              <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </data-tables>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useDataSourceConfigStore } from "../../../stores/data-source-config";
import { ref, computed } from "vue";

import moment from "moment";

const emit = defineEmits(["viewImportedRows"]);
const dataSourceConfigStore = useDataSourceConfigStore();
const totalElements = computed(() => {
  return page.value.totalElements || 0;
});
const tableData = computed(() => {
  return dataSourceEndpointStatisticDtoes.value;
});
function getStatisticsSearchByRawRequestId(value) {
  return dataSourceConfigStore.getStatisticsSearchByRawRequestId(value);
}

const dialogVisible = ref<boolean>(false);
let parentRow = ref({});

let page = ref({});
const isLoading = ref<boolean>(false);
let lastPagination = ref({
  pageSize: 5,
  page: 1
});
let dataSourceEndpointStatisticDtoes = ref([]);

async function loadData(pagination: any = {}) {
  if (Object.keys(pagination).length > 0) {
    lastPagination.value = pagination;
  } else {
    pagination = lastPagination.value;
  }
  isLoading.value = true;
  const { data } = await getStatisticsSearchByRawRequestId({
    rootRawRequestId: parentRow.value.rootRawRequestId,
    pagination
  });

  const { _embedded, page: pageData } = data;
  dataSourceEndpointStatisticDtoes.value = (_embedded && _embedded.dataSourceEndpointStatisticDtoes.slice(0, pagination.pageSize)) || [];
  page.value = pageData;
  isLoading.value = false;
}

function momentTime(time) {
  return moment(time).format("DD.MM.YYYY hh:mm:ss");
}

function onViewImportedRows(rows: any) {
  emit("viewImportedRows", rows);
}

function openDialogWindow(row) {
  dialogVisible.value = true;
  parentRow.value = row;
}

defineExpose({ openDialogWindow });
</script>
