<template>
  <div class="pm-tasks card">
    <div class="card-header">
      <div class="row justify-content-between">
        <div class="col-sm">Tasks (running now count {{ runningTaskCount }})</div>
        <div class="col-auto">Last task finish time: {{ lastTaskFinishTime }}</div>
      </div>
    </div>
    <div class="card-body">
      <data-tables
        :filters="filters"
        :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
        :table-props="{
          border: true
        }"
        :data="runningTasksTable"
        border
        style="width: 100%"
      >
        <template #tool>
          <el-form label-position="top" :inline="true">
            <h3>Filter</h3>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="Search">
                  <el-input v-model="filters[0].value" clearable placeholder="Search"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="Last Shard">
                  <el-select clearable filterable v-model="filters[1].value">
                    <el-option v-for="item in shardOptions" :key="item.value" :label="item.label"
                               :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="Last Queue">
                  <el-select clearable filterable v-model="filters[2].value">
                    <el-option v-for="item in queueOptions" :key="item.value" :label="item.label"
                               :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
        <el-table-column prop="lastEntity" label="Last Entity" width="300" fixed
                         sortable></el-table-column>
        <el-table-column prop="lastEventId" label="Last EventId" width="300"
                         sortable></el-table-column>
        <el-table-column prop="lastShard" label="Last Shard" width="130" sortable></el-table-column>
        <el-table-column prop="lastQueue" label="Last Queue" width="300" sortable></el-table-column>
        <el-table-column prop="lastProcesses" label="Last Processes" width="400"
                         sortable></el-table-column>
      </data-tables>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import HelperTable from "../../../helpers/HelperTable";

const props = defineProps({
  runningTaskCount: {default: 0},
  lastTaskFinishTime: {default: ""},
  tasksByEntity: {default: () => []}
});
const runningTasksTable = computed(() => {
  return props.tasksByEntity.map((el) => {
    const event = el.events[0];
    return {
      lastEntity: event.id,
      lastEventId: el.id,
      lastShard: event.shardId,
      lastQueue: event.queueName,
      lastProcesses: JSON.stringify(event.processIds)
    };
  });
});
const queueOptions = computed(() => {
  return HelperTable.createUniqMap("lastQueue", runningTasksTable.value);
});
const shardOptions = computed(() => {
  return HelperTable.createUniqMap("lastShard", runningTasksTable.value);
});

let filters = ref([
  {
    value: "",
    prop: ["lastEntity", "lastEventId", "lastProcesses"],
    filterFn(row: any, filterItem: any) {
      return !filterItem.value ||
        row.lastEntity.toLowerCase().includes(filterItem.value.toLowerCase()) ||
        row.lastEventId.toLowerCase().includes(filterItem.value.toLowerCase()) ||
        row.lastProcesses.toLowerCase().includes(filterItem.value.toLowerCase());
    }
  },
  {
    value: "",
    prop: "lastShard"
  },
  {
    value: "",
    prop: "lastQueue"
  }
]);
</script>

<style>
.pm-tasks {
  .cyoda-data-tables .tool .el-form-item {
    width: 100% !important;
  }
}
</style>
