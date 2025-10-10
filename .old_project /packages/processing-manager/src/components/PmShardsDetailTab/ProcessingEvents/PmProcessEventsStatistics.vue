<template>
  <data-tables
    :filters="filters"
    :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
    :table-props="{
      border: true
    }"
    :data="tableData"
    border
    style="width: 100%"
  >
    <template #tool>
      <el-form label-position="top" :inline="true">
        <h3>Filter</h3>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Queue">
              <el-select filterable clearable v-model="filters[0].value">
                <el-option v-for="item in queueOptions" :key="item" :label="item"
                           :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Shard">
              <el-select filterable clearable v-model="filters[1].value">
                <el-option v-for="item in shardOptions" :key="item" :label="item"
                           :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Class">
              <el-select filterable clearable v-model="filters[2].value">
                <el-option v-for="item in classOptions" :key="item.value" :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Processor">
              <el-select filterable clearable v-model="filters[3].value">
                <el-option v-for="item in processorOptions" :key="item.value" :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <hr/>
      </el-form>
    </template>

    <el-table-column prop="queue" label="Queue" width="300" fixed sortable></el-table-column>
    <el-table-column prop="shard" label="Shard" width="300" sortable></el-table-column>
    <el-table-column prop="class" label="Class" sortable></el-table-column>
    <el-table-column prop="processor" label="Processor" width="300" sortable></el-table-column>
    <el-table-column prop="count" label="Count" width="100" sortable></el-table-column>
  </data-tables>
</template>

<script setup lang="ts">
import {ref} from "vue";


import HelperTable from "../../../helpers/HelperTable";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();

function loadStatsProcessEvents() {
  return processingStore.loadStatsProcessEvents();
}

function processingQueues() {
  return processingStore.processingQueues();
}

function loadSummary() {
  return processingStore.loadSummary();
}

let filters = ref([
  {
    value: "",
    prop: "queue"
  },
  {
    value: "",
    prop: "shard",
    filterFn(row: any, filterItem: any) {
      return !filterItem.value || row.shard === filterItem.value;
    }
  },
  {
    value: "",
    prop: "class"
  },
  {
    value: "",
    prop: "processor"
  }
]);

let tableData = ref([]);

let queueOptions = ref([]);

let shardOptions = ref([]);

let classOptions = ref([]);

let processorOptions = ref([]);
(async function () {

  const {data} = await loadStatsProcessEvents();
  tableData.value = data.map((el: any) => {
    const {key} = el;
    return {
      queue: key.entityClass,
      shard: Number(key.shard),
      class: key.entityClass,
      count: el.count,
      processor: JSON.stringify(key.processor)
    };
  });
  loadShards();
  loadProcessingQueues();
  classOptions.value = HelperTable.createUniqMap("class", tableData.value);
  processorOptions.value = HelperTable.createUniqMap("processor", tableData.value);
})()

async function loadShards() {
  const {data} = await loadSummary();
  shardOptions.value = data.actualShards.map((el: any) => Number(el.shardId));
}

async function loadProcessingQueues() {

  const {data} = await processingQueues();

  queueOptions.value = data;
}
</script>
