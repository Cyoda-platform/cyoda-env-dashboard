<template>
  <div class="pm-processing-events-view">
    <el-form class="form-filter w-full" label-position="top" :inline="true">
      <h3>Filter</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Queue">
            <el-select clearable filterable v-model="filters.queue">
              <el-option v-for="queue in queueOptions" :key="queue" :label="queue"
                         :value="queue"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Shard">
            <el-select clearable filterable v-model="filters.shard">
              <el-option v-for="item in shardOptions" :key="item" :label="item"
                         :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Event Status">
            <el-select clearable filterable v-model="filters.eventStatus">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Time From">
            <el-date-picker format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                            v-model="fromTime" @change="onChangeDate($event, 'from')"
                            type="datetime" placeholder="Pick a day"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Time To">
            <el-date-picker format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                            v-model="toTime" @change="onChangeDate($event, 'to')" type="datetime"
                            placeholder="Pick a day"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-button class="reset-button" :disabled="isDisableFilter" @click="resetFilter">
            Reset Filter
            <font-awesome-icon icon="sync-alt"/>
          </el-button>
        </el-col>
      </el-row>
      <hr/>
    </el-form>
    <data-tables
      v-loading="isLoading"
      :pagination-props="{ pageSizes: [5, 10, 15, 20, 50] }"
      :table-props="{
        border: true
      }"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="createTime" label="Create Time" width="300" fixed
                       sortable></el-table-column>
      <el-table-column prop="doneTime" label="Done Time" width="300" sortable></el-table-column>
      <el-table-column prop="errorTime" label="Error Time" width="130" sortable></el-table-column>
      <el-table-column prop="queue" label="Queue" width="300" sortable></el-table-column>
      <el-table-column prop="shard" label="Shard" width="200" sortable></el-table-column>
      <el-table-column prop="status" label="Status" width="400" sortable></el-table-column>
      <el-table-column prop="timeUUID" label="Time UUID" width="400" sortable>
        <template v-slot:default="scope">
          <router-link :to="onClickTimeUuid(scope.row)">
            {{ scope.row.timeUUID }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="entityClassName" label="Entity Class" width="400"
                       sortable></el-table-column>
      <el-table-column prop="entityId" label="Entity ID" width="400" sortable></el-table-column>
      <el-table-column prop="hasErrors" label="Has Errors" width="400" sortable></el-table-column>
      <el-table-column prop="errorEventTimeUUID" label="Error Event Time UUID" width="400"
                       sortable></el-table-column>
      <el-table-column prop="coreDataClassName" label="Core Event Data Class" width="400"
                       sortable></el-table-column>
      <el-table-column prop="clientDataClassName" label="Client Event Data Class" width="400"
                       sortable></el-table-column>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {ref, computed, watch} from "vue";


import HelperTable from "../../../helpers/HelperTable";
import moment from "moment";
import {useProcessingStore} from "../../../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
const isDisableFilter = computed(() => {
  return Object.keys(filters.value).every((key) => !filters.value[key]);
})

function loadProcessingQueueEvents(value) {
  return processingStore.loadProcessingQueueEvents(value);
}

function processingQueues() {
  return processingStore.processingQueues();
}

function loadSummary() {
  return processingStore.loadSummary();
}

let tableData = ref([]);

let queueOptions = ref([]);

let shardOptions = ref([]);

let statusOptions = ref([]);

const isLoading = ref<boolean>(false);

let fromTime = ref(moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"));

let toTime = ref(moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"));

const filters = ref({
  queue: "",
  shard: "",
  eventStatus: "",
  from: fromTime.value,
  to: toTime.value,
  timeUUID: ""
});

(async function () {
  await loadData(filters.value);
  loadShards();
  loadProcessingQueues();
  statusOptions.value = HelperTable.createUniqMap("status", tableData.value);
  statusOptions.value.push({
    value: 'test',
    label: 'test'
  })
})()

async function loadShards() {
  let dataServer: any = [];
  const {data} = await loadSummary();
  dataServer = data;
  shardOptions.value = dataServer.actualShards.map((el: any) => Number(el.shardId));
}

async function loadProcessingQueues() {

  const {data} = await processingQueues();

  queueOptions.value = data;
}

async function loadData(customParams = {}) {
  isLoading.value = true;
  const params = {
    pageSize: 1000,
    sort: "DECS",
    ...customParams
  };
  const {data} = await loadProcessingQueueEvents({...params});
  tableData.value = data.map((el: any) => ({
    createTime: el.createTime,
    doneTime: el.doneTime,
    errorTime: el.errorTime || "",
    queue: el.queueName,
    shard: Number(el.shardId),
    status: el.status,
    timeUUID: el.timeUUID,
    entityClassName: el.entityClassName,
    entityId: el.entityId,
    entityHasErrors: el.entityHasErrors ? "Yes" : "No",
    errorEventTimeUUID: el.errorEventTimeUUID || "",
    coreDataClassName: el.coreDataClassName || "",
    clientDataClassName: el.clientDataClassName || ""
  }));
  isLoading.value = false;
}

function onClickTimeUuid(row: any) {
  return `/processing-ui/nodes/${route.params.name}/event-view?queue=${row.entityClassName}&shard=${row.shard}&timeUUID=${row.timeUUID}`;
}


function resetFilter() {

  Object.keys(filters.value).forEach((key) => (filters.value[key] = ""));
  filters.value.from = fromTime.value;
  filters.value.to = toTime.value;
}

function onChangeDate(value, field) {
  filters.value[field] = value;
}


watch(filters, () => {

  loadData(filters.value);
}, {deep: true});
</script>

<style lang="scss">
.pm-processing-events-view {
  h3 {
    margin-bottom: 5px;
  }

  .reset-button {
    margin-top: 22px;
  }

  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .form-filter {
    .el-form-item {
      margin-bottom: 10px;
    }
  }

  form {
    display: block !important;
  }
}
</style>
