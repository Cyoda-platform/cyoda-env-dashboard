<template>
  <data-tables
    :filters="filters"
    :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
    :table-props="{
      border: true
    }"
    :data="pollinginfoTable"
    border
    style="width: 100%"
  >
    <template #tool>
      <el-form label-position="top" :inline="true">
        <h3>Filter</h3>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Shard">
              <el-select clearable filterable v-model="filters[0].value">
                <el-option v-for="shard in shardIdFilterData" :key="shard.label"
                           :label="shard.label"
                           :value="shard.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Entity Type">
              <el-select clearable filterable v-model="filters[1].value">
                <el-option v-for="shard in queueTypeOptions" :key="shard.label" :label="shard.label"
                           :value="shard.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Processing">
              <el-select clearable filterable v-model="filters[2].value">
                <el-option v-for="shard in processingOptions" :key="shard.label"
                           :label="shard.label"
                           :value="shard.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <hr/>
      </el-form>
    </template>

    <el-table-column prop="shardId" label="Shard" width="300" fixed sortable></el-table-column>
    <el-table-column prop="queueType" label="Entity Type" width="300" sortable></el-table-column>
    <el-table-column prop="processing" label="Processing" width="130" sortable></el-table-column>
    <el-table-column prop="lastEmptyPollings" label="Last Empty Pollings count" width="300"
                     sortable></el-table-column>
    <el-table-column prop="maxTimeout" label="Max Timeout" width="400" sortable></el-table-column>
    <el-table-column prop="lastDelayTime" label="Last Delay Time" width="400"
                     sortable></el-table-column>
    <el-table-column prop="lastPollingTime" label="Last Polling Time" width="400"
                     sortable></el-table-column>
  </data-tables>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import _ from "lodash";

import HelperTable from "../../../helpers/HelperTable";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
const pollinginfoTable = computed(() => {
  const data: any[] = [];
  Object.values(pollingInfoData.value).forEach((pollingInfoEl: any) =>
    Object.values(pollingInfoEl).forEach((el: any) => {
      el.processing = el.processing.toString();
      data.push(el);
    })
  );
  return data;
})
const shardIdFilterData = computed(() => {
  const data = pollinginfoTable.value.map((el) => ({
    label: el.shardId,
    value: el.shardId
  }));
  return _.uniqBy(data, "value");
})
const queueTypeOptions = computed(() => {
  return HelperTable.createUniqMap("queueType", pollinginfoTable.value);
})
const processingOptions = computed(() => {
  return HelperTable.createUniqMap("processing", pollinginfoTable.value);
})

function loadPollingInfo() {
  return processingStore.loadPollingInfo();
}

let pollingInfoData = ref([]);
(async function () {

  const {data} = await loadPollingInfo();
  pollingInfoData.value = data;
})()

let filters = ref([
  {
    value: "",
    prop: "shardId",
    filterFn(row: any, filterItem: any) {
      return !filterItem.value || row.shardId === filterItem.value;
    }
  },
  {
    value: "",
    prop: "queueType"
  },
  {
    value: "",
    prop: "processing"
  }
]);
</script>
