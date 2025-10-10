<template>
  <el-dropdown trigger="click" @command="handleClear">
    <el-button type="primary"> Reset <i class="el-icon-arrow-down el-icon--right"></i></el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="reset">Hard reset consistency time</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import {ElMessage, ElMessageBox} from "element-plus";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();

function doHardResetConsistencyTime() {
  return processingStore.doHardResetConsistencyTime();
}

function handleClear(command: string) {
  if (command === "reset") {
    onReset();
  }
}

function onReset() {
  ElMessageBox.confirm(
    `
    WARNING: This will delete all consistency time data from the system.
    Any current or queued read/write operations may subsequently fail or experience negative side effects.
    Hard resetting the consistency time should only be used as a last resort to unblock the consistency clock.
    Are you sure you want to hard reset consistency time?
    `,
    "Warning",
    {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning"
    }
  )
    .then(async () => {
      doHardResetConsistencyTime();
      ElMessage({
        type: "success",
        message: "Hard reset consistency time completed"
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Hard reset consistency time canceled"
      });
    });
}
</script>

<style scoped>
svg {
  margin-right: 5px;
}
</style>
