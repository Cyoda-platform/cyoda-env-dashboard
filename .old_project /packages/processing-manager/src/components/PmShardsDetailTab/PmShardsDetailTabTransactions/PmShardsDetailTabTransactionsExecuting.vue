<template>
  <div class="pm-shards-detail-tab-transactions-executing">
    <el-form class="form" label-position="top">
      <h3>Settings</h3>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Limit">
            <el-input-number :min="1" v-model="form.limit"> </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Update Interval (seconds)">
            <el-input-number :min="1" v-model="form.updateInterval"> </el-input-number>
          </el-form-item>
        </el-col>
        <el-col class="wrap-button" :span="6">
          <template v-if="intervalId">
            <el-button @click="stopInterval" type="warning">
              <font-awesome-icon icon="stop" />
            </el-button>
          </template>
          <template v-else>
            <el-button @click="runInterval" type="primary">
              <font-awesome-icon icon="play" />
            </el-button>
          </template>
        </el-col>
      </el-row>
      <hr />
    </el-form>
    <data-tables
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="index" label="№" width="100" fixed sortable> </el-table-column>
      <el-table-column prop="id" label="ID" sortable> </el-table-column>
      <el-table-column prop="time" label="Time" sortable> </el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
function loadExecTransactionsInfo(value) {
  return processingStore.loadExecTransactionsInfo(value);
}

let form = ref({
  limit: 100,
  updateInterval: 2
});

let tableData = ref([]);

const intervalId = ref(0);

loadData();

function runInterval() {
  intervalId.value = setInterval(loadData, form.value.updateInterval * 1000);
}

function stopInterval() {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = 0;
  }
}

onBeforeUnmount(() => {
  stopInterval();
});

async function loadData() {
  let { data } = await loadExecTransactionsInfo({
    limit: form.value.limit
  });
  data = data.map((el: any, index: any) => ({
    ...el,
    index: index + 1
  }));
  tableData.value = data;
}
</script>

<style lang="scss">
.pm-shards-detail-tab-transactions-executing {
  .form .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .wrap-button {
    padding-top: 22px;
  }
}
</style>
