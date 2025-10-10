<template>
  <div>
    <div style="margin-bottom: 10px">
      <el-row>
        <el-col :span="10">
          <el-input v-model="filters[0].value" placeholder="Search"></el-input>
        </el-col>
      </el-row>
    </div>

    <data-tables
      :filters="filters"
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="timeStatsTable"
      border
      style="width: 100%"
    >
      <el-table-column prop="key" label="Key" width="500" fixed sortable> </el-table-column>
      <el-table-column prop="numCalls" label="Num Calls" width="130" sortable> </el-table-column>
      <el-table-column prop="min" label="Min" width="130" sortable>
        <template v-slot:default="{ row }">
          {{ transformTime(row.min, row) }}
        </template>
      </el-table-column>
      <el-table-column prop="avg" label="Avg" width="130" sortable>
        <template v-slot:default="{ row }">
          {{ transformTime(row.avg, row) }}
        </template>
      </el-table-column>
      <el-table-column prop="max" label="Max" width="130" sortable>
        <template v-slot:default="{ row }">
          {{ transformTime(row.max, row) }}
        </template>
      </el-table-column>
      <el-table-column prop="last" label="Last" width="130" sortable>
        <template v-slot:default="{ row }">
          {{ transformTime(row.last, row) }}
        </template>
      </el-table-column>
      <el-table-column prop="total" label="Total" width="130" sortable>
        <template v-slot:default="{ row }"> {{ row.total }}(s) </template>
      </el-table-column>
      <el-table-column prop="from000To001MsCnt" label="0 to 1Ms" width="130" sortable> </el-table-column>
      <el-table-column prop="from001To010MsCnt" label="1 to 10Ms" width="130" sortable> </el-table-column>
      <el-table-column prop="from010To050MsCnt" label="10 to 50Ms" width="130" sortable> </el-table-column>
      <el-table-column prop="from050To100MsCnt" label="50 to 100Ms" width="150" sortable> </el-table-column>
      <el-table-column prop="from100To500MsCnt" label="100 to 500Ms" width="150" sortable> </el-table-column>
      <el-table-column prop="from500To999MsCnt" label="500 to 999Ms" width="150" sortable> </el-table-column>
      <el-table-column prop="from01To02SecCnt" label="1 to 2Sec" width="130" sortable> </el-table-column>
      <el-table-column prop="from02To10SecCnt" label="2 to 10Sec" width="130" sortable> </el-table-column>
      <el-table-column prop="more10SecCnt" label="more 10 Sec" width="150" sortable> </el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
function loadStatsTime() {
  return processingStore.loadStatsTime();
}

let timeStatsTable = ref([]);

let filters = ref([
  {
    value: "",
    filterFn: (row: any, filter: any) => Object.keys(row).some((prop) => row[prop].toString().toLowerCase().indexOf(filter.value.toLowerCase()) > -1)
  }
]);

loadData();
async function loadData() {
  const { data } = await loadStatsTime();
  timeStatsTable.value = data;
}

function transformTime(time: any, row: any) {
  return `${(time / row.measure).toFixed(0)}(${row.measureDesc})`;
}
</script>
