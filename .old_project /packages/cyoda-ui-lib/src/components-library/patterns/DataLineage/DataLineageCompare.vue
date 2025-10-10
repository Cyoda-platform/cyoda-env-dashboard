<template>
  <el-dialog :close-on-click-modal="false" :append-to-body="true" title="Compare" v-model="dialogVisible" class="data-lineage-compare" width="80%">
    <div class="row flex">
      <div>
        <strong>Date:</strong> {{ transformDate(checkedTransactions[0].dateTime) }}<br />
        <strong>Transaction Id:</strong> {{ checkedTransactions[0].transactionId }}
      </div>
      <div>
        <strong>Date:</strong> {{ transformDate(checkedTransactions[1].dateTime) }}<br />
        <strong>Transaction Id:</strong> {{ checkedTransactions[1].transactionId }}
      </div>
    </div>
    <CyodaEditor :old-string="oldStrComputed" :new-string="newStrComputed" :diff="true"/>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import moment from "moment";
import { Transaction, TransactionDiff } from "../../../types/types";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

const props = defineProps({
  compareData: {
    default: () => {
      return [];
    }
  },
  checkedTransactions: {
    default: () => {
      return [];
    }
  }
});
const oldStrComputed = computed(() => {
  return getDataFor("prevValue");
});
const newStrComputed = computed(() => {
  return getDataFor("currValue");
});

const dialogVisible = ref<boolean>(false);

function getDataFor(field: "currValue" | "prevValue") {
  return (
    (props.compareData &&
      props.compareData.changedFields &&
      props.compareData.changedFields
        .map((el) => {
          return `${el.columnPath}: ${el.columnPathContainer[field]}`;
        })
        .join("\n")) ||
    ""
  );
}

function transformDate(date: string) {
  return moment(date, "DD-MM-YYYY HH:mm:ss.SSS").format("DD/MM/YYYY HH:mm:ss");
}

defineExpose({ dialogVisible });
</script>

<style lang="scss">
.data-lineage-compare {
  .flex {
    display: flex;
    margin-bottom: 10px;

    > div {
      width: 50%;
      line-height: 1.3;
    }
  }
}
</style>
