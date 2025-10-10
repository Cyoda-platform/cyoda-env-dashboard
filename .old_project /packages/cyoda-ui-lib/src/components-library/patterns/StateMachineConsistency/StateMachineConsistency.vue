<template>
  <div>
    <div class="actions">
      <el-button @click="onCheckConsistency" :loading="isLoading" type="primary">Check Consistency</el-button>
    </div>
    <StateMachineConsistencyDialog ref="stateMachineConsistencyDialogRef" :data="data" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import * as api from "../../../api";
import StateMachineConsistencyDialog from "./StateMachineConsistencyDialog.vue";

const stateMachineConsistencyDialogRef = ref(null);

const isLoading = ref<boolean>(false);
let data = ref({});

async function onCheckConsistency() {
  try {
    isLoading.value = true;
    const { data } = await api.getStatemachineCheck();
    data.value = data;
    stateMachineConsistencyDialogRef.value.dialogVisible = true;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.actions {
  text-align: right;
}
</style>
