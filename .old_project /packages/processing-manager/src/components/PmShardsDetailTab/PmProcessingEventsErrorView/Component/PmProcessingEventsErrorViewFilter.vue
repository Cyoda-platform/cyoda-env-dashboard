<template>
  <el-form class="pm-processing-events-error-view-filter" label-position="top">
    <h3>Filter</h3>
    <el-row class="wrap-row" :gutter="20">
      <el-col :span="5">
        <el-form-item label="Queue">
          <el-select filterable clearable v-model="form.queue">
            <el-option v-for="queue in queueOptions" :key="queue" :label="queue"
                       :value="queue"></el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="5">
        <el-form-item label="Shard">
          <el-select filterable clearable v-model="form.shard">
            <el-option v-for="actualShard in actualShardsOptions" :key="actualShard"
                       :label="actualShard" :value="actualShard"></el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="5">
        <el-form-item label="Time From">
          <el-date-picker :value-format="dateFormat" :format="dateFormat" :clearable="false"
                          v-model="form.from" type="date" placeholder="Pick a day"></el-date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="Time To">
          <el-date-picker :value-format="dateFormat" :format="dateFormat" :clearable="false"
                          v-model="form.to" type="date" placeholder="Pick a day"></el-date-picker>
        </el-form-item>
      </el-col>

      <el-col :span="5">
        <el-form-item label="Sort by time">
          <el-select filterable v-model="form.sort">
            <el-option v-for="listSort in listSortes" :key="listSort" :label="listSort"
                       :value="listSort"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col class="action-item" :span="4">
        <el-button :loading="isLoading" @click="onSubmit" type="primary">Load</el-button>
      </el-col>
    </el-row>
    <hr/>
  </el-form>
</template>

<script setup lang="ts">
import {ref} from "vue";

import moment from "moment";
import {useProcessingStore} from "../../../../stores/processing";

const emit = defineEmits(["change", "change"]);
const props = defineProps({isLoading: {default: false}});
const processingStore = useProcessingStore();

function loadSummary() {
  return processingStore.loadSummary();
}

function processingQueues() {
  return processingStore.processingQueues();
}

let listPageSizes = ref([10, 25, 50, 100, 200, 500, 1000]);

let listSortes = ref(["SORT_ASC", "SORT_DECS"]);

let actualShardsOptions = ref([]);

let queueOptions = ref([]);

const dateFormat = ref<string>("YYYY-MM-DD HH:mm:ss");

let form = ref({
  queue: "ALL",
  shard: "ALL",
  from: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss"),
  to: moment().format("YYYY-MM-DD HH:mm:ss"),
  sort: "SORT_DESC",
  pageNum: 0
});

(async function () {
  loadShards();
  loadProcessingQueues();
  emit("change", form.value);
})();

async function loadShards() {
  let dataServer: any = [];
  const {data} = await loadSummary();
  dataServer = data;
  const actualShardsServer = dataServer.actualShards.map((el: any) => el.shardId);
  actualShardsOptions.value = [...actualShardsServer, "ALL"];
}

async function loadProcessingQueues() {
  let dataServer = [];
  const {data} = await processingQueues();
  dataServer = data;
  queueOptions.value = [...dataServer, "ALL"];
}

function onSubmit() {
  emit("change", form.value);
}
</script>

<style lang="scss">
.pm-processing-events-error-view-filter {
  h3 {
    margin-bottom: 5px;
  }

  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .wrap-row {
    position: relative;

    .action-item {
      position: relative;
      top: 22px;
    }
  }
}
</style>
