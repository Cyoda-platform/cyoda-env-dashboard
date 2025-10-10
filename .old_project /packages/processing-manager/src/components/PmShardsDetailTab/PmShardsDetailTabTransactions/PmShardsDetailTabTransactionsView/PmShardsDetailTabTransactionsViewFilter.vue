<template>
  <el-form class="pm-shards-detail-tab-transactions-view-filter" label-position="top">
    <h3>Filter</h3>

    <el-row class="wrap-row" :gutter="20">
      <el-col :span="4">
        <el-form-item label="Transaction ID">
          <el-input clearable v-model="form.transactionId"> </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="Transaction Status">
          <el-select filterable clearable v-model="form.status">
            <el-option v-for="transactionStatus in transactionStatusData" :key="transactionStatus.label" :label="transactionStatus.label" :value="transactionStatus.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="Date From">
          <el-date-picker v-model="form.dateFrom" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss.000" type="datetime" placeholder="Pick a day" />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="Date To">
          <el-date-picker v-model="form.dateTo" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss.000" type="datetime" placeholder="Pick a day" />
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
    <hr />
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";

import moment from "moment";
import {useProcessingStore} from "../../../../stores/processing";

const emit = defineEmits(["change", "change"]);
const props = defineProps({ isLoading: { default: false } });
const processingStore = useProcessingStore();
function loadTransactionsStatuses() {
  return processingStore.loadTransactionsStatuses();
}

let transactionStatusData = ref([]);

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
  dateFrom: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss.000"),
  dateTo: moment().format("YYYY-MM-DD HH:mm:ss.000"),
  sort: "DESC"
});

function onSubmit() {
  emit("change", form.value);
}

defineExpose({ form });
</script>

<style lang="scss">
.pm-shards-detail-tab-transactions-view-filter {
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
