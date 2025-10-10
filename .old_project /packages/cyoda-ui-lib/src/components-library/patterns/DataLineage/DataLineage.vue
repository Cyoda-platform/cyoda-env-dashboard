<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <DataLineageFilter :filter="filter" />
    </el-col>
    <el-col :span="18">
      <DataLineageTransactions :requestClass="requestClass" :id="id" :transactionsData="transactionsDataComputed" />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import * as api from "../../../api";
import DataLineageFilter from "./DataLineageFilter.vue";
import DataLineageTransactions from "./DataLineageTransactions.vue";
import moment from "moment";
import { Transaction } from "../../../types/types";
import { Filter } from "./types";
import _ from "lodash";

const props = defineProps({
  requestClass: {
    default: ""
  },
  id: {
    default: ""
  }
});
const transactionsDataComputed = computed(() => {
  let transactionsDataValue: Transaction[] = JSON.parse(JSON.stringify(transactionsData.value));
  if (filter.value.dateFrom) {
    const dateFrom = moment(filter.value.dateFrom).format("X");
    transactionsDataValue = transactionsDataValue.filter((el) => {
      return moment(el.dateTime, "DD-MM-YYYY HH:mm:ss.SSS").format("X") >= dateFrom;
    });
  }
  if (filter.value.dateTo) {
    const dateTo = moment(filter.value.dateTo).format("X");
    transactionsDataValue = transactionsDataValue.filter((el) => {
      return moment(el.dateTime, "DD-MM-YYYY HH:mm:ss.SSS").format("X") <= dateTo;
    });
  }
  return transactionsDataValue;
});

let transactionsData = ref([]);

let filter = ref({
  dateFrom: "",
  dateTo: ""
});

(async function () {
  let { data } = await api.getEntityTransactions(props.requestClass, props.id);
  data = _.sortBy(data, [
    (el) => {
      return moment(el.dateTime, "DD-MM-YYYY HH:mm:ss.SSS").format("X");
    }
  ]).reverse();
  transactionsData.value = data;
})();
</script>
