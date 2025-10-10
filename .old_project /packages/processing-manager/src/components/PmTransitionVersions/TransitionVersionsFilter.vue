<template>
  <div class="card">
    <div class="card-header">Filter</div>
    <div class="card-body">
      <el-form class="transition-versions-filter" label-position="top">
        <el-row class="wrap-row" :gutter="20">
          <el-col :span="4">
            <el-form-item label="Date From">
              <el-date-picker format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" v-model="form.dateFrom" type="datetime" placeholder="Pick a day" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="Date To">
              <el-date-picker format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" v-model="form.dateTo" type="datetime" placeholder="Pick a day" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="Action Type">
              <el-select v-model="form.actionTypeStr" placeholder="Action Type">
                <el-option v-for="actionType in actionTypeOptions" :key="actionType" :label="actionType" :value="actionType" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="Sort">
              <el-select v-model="form.sort" placeholder="Sort">
                <el-option label="Asc" value="ASC" />
                <el-option label="Desc" value="DESC" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="action-item" :span="4">
            <el-button @click="onSubmit" :loading="isLoading" type="primary">Load</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import moment from "moment";
import {useProcessingStore} from "../../stores/processing";

const emit = defineEmits(["change", "change"]);
const props = defineProps({ isLoading: { default: false } });
const processingStore = useProcessingStore();
function loadTransactionsStatuses() {
  return processingStore.loadTransactionsStatuses();
}

let transactionStatusData = ref([]);

let actionTypeOptions = ref(["ALL", "READ", "UPDATE", "REMOVE"]);

(async function () {
  await loadStatuses();
  emit("change", form.value);
})();

async function loadStatuses() {
  const { data } = await loadTransactionsStatuses();
  transactionStatusData.value = data.map((el: any) => ({
    label: el,
    value: el
  }));
}

let form = ref({
  transactionId: "",
  status: "",
  dateFrom: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss"),
  dateTo: moment().format("YYYY-MM-DD HH:mm:ss"),
  sort: "ASC",
  actionTypeStr: "ALL"
});

function onSubmit() {
  emit("change", form.value);
}

defineExpose({ form });
</script>

<style lang="scss">
.transition-versions-filter {
  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .wrap-row {
    position: relative;

    .action-item {
      position: relative;
      left: 0;
      top: 22px;
    }
  }
}
</style>
