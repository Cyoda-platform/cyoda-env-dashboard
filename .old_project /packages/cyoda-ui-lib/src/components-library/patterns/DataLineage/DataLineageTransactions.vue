<template>
  <div class="data-lineage-transactions">
    <div class="header">
      <strong>Current version</strong>
    </div>
    <div class="body">
      <el-checkbox-group v-model="checkedTransactions" :max="2">
        <el-timeline>
          <el-timeline-item v-for="(transaction, index) in transactionsData" :key="index" :hide-timestamp="true" :timestamp="transaction.timestamp">
            <div class="date">
              {{ transformDate(transaction.dateTime) }}
            </div>
            <div class="no-changed-fields">
              No. changed fields [{{ transaction.changeCount }}]
              <el-checkbox :label="transaction" :key="transaction.transactionId">{{}}</el-checkbox>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-checkbox-group>
      <el-button :loading="isLoadingCompare" :disabled="checkedTransactions.length < 2" @click="onCompare" type="primary">Compare</el-button>
      <DataLineageCompare v-if="checkedTransactions.length >= 2 && compareData" :checkedTransactions="checkedTransactionsComputed" :compareData="compareData" ref="dataLineageCompareRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import DataLineageCompare from "./DataLineageCompare.vue";
import moment from "moment";
import * as api from "../../../api";
import { Transaction, TransactionDiff } from "../../../types/types";
import _ from "lodash";

const props = defineProps({
  transactionsData: {
    default: () => []
  },
  requestClass: {
    default: ""
  },
  id: {
    default: ""
  }
});
const checkedTransactionsComputed = computed(() => {
  return _.sortBy(checkedTransactions.value, [
    (el) => {
      return moment(el.dateTime, "DD-MM-YYYY HH:mm:ss.SSS").format("X");
    }
  ]);
});

const dataLineageCompareRef = ref(null);

let checkedTransactions = ref([]);

let compareData = ref({});
const isLoadingCompare = ref<boolean>(false);

function transformDate(date: string) {
  return moment(date, "DD-MM-YYYY HH:mm:ss.SSS").format("DD/MM/YYYY HH:mm:ss");
}

async function onCompare() {
  try {
    isLoadingCompare.value = true;
    const { data } = await api.getEntityDiff(props.requestClass, props.id, checkedTransactions.value[0].transactionId, checkedTransactions.value[1].transactionId);
    compareData.value = data;
    dataLineageCompareRef.value.dialogVisible = true;
  } finally {
    isLoadingCompare.value = false;
  }
}
</script>

<style lang="scss">
.data-lineage-transactions {
  .header {
    strong {
      text-decoration: underline;
    }
  }

  .body {
    position: relative;
    margin-top: 20px;
    padding-left: 15px;
    border-left: 2px solid #606266;

    &::before {
      content: "";
      position: absolute;
      top: -5px;
      left: -8px;
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 7px solid #606266;
    }
  }

  .el-timeline {
    padding-left: 170px;

    .el-timeline-item {
      position: relative;
    }

    .date {
      position: absolute;
      left: -155px;
      top: 0;
    }

    .no-changed-fields .el-checkbox {
      position: absolute;
      right: 0;
      top: -20px;
    }

    .el-timeline-item__node{
      top:-10px
    }

    .no-changed-fields {
      width: 200px !important;
      position: relative;
    }
  }
}
</style>
