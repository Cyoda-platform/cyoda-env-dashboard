<template>
  <el-drawer size="50%" title="Error Handler" v-model="isVisible" direction="btt">
    <div class="actions">
      <el-button @click="onRemoveAll" type="default">Remove ALL errors and notifications</el-button>
      <el-button @click="onExportAll" type="primary">Export ALL errors</el-button>
    </div>
    <data-tables
      :pageSize="10"
      :pagination-props="{ pageSizes: [5, 10, 20, 50] }"
      :table-props="{
        border: true,
        height: 220
      }"
      class="table"
      border
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column sortable prop="message" label="Name" />
      <el-table-column sortable prop="error.pageUrl" label="Page Url" />
      <el-table-column sortable prop="events" label="Events" />
      <el-table-column sortable prop="lastEvent" label="Last Event">
        <template v-slot:default="{ row }">
          {{ $filters.mktimeToDateTime(row.lastEvent) }}
        </template>
      </el-table-column>
      <el-table-column width="180" label="Actions">
        <template #default="{ row }">
          <el-button size="default" type="primary" @click="onDetailView(row.error)">
            <font-awesome-icon icon="magnifying-glass" />
          </el-button>
          <el-button size="default" type="warning" @click="onExport(row.error)">
            <font-awesome-icon icon="download" />
          </el-button>
        </template>
      </el-table-column>
    </data-tables>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import _ from "lodash";
import useErrorHandlerStore from "../../../stores/error-handler";

const emit = defineEmits(["export", "detailView", "clearErrors","exportAll"]);
const errorHandlerStore = useErrorHandlerStore();
const errors = computed(() => {
  return errorHandlerStore.errors;
});
const tableData = computed(() => {
  if (errors.value.length === 0) return [];
  const groupedData = _.groupBy(errors.value, (el) => {
    return el.message;
  });
  return Object.keys(groupedData)
    .map((el: any) => {
      const lastEvent = _.maxBy(groupedData[el], (elMax: any) => parseInt(elMax.createdAt, 10));
      return {
        events: groupedData[el].length,
        message: el,
        lastEvent: parseInt(lastEvent.createdAt, 10),
        error: lastEvent
      };
    })
    .reverse();
});

const isVisible = ref<boolean>(false);

function onExport(error) {
  emit("export", error);
}

function onDetailView(error) {
  emit("detailView", error);
}

function onRemoveAll() {
  emit("clearErrors");
}

function onExportAll() {
  emit("exportAll");
}

defineExpose({ isVisible });
</script>

<style lang="scss" scoped>
.actions {
  margin-bottom: 15px;
  text-align: right;
}
</style>
