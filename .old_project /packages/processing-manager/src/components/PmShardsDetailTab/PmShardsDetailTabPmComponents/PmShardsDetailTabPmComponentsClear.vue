<template>
  <el-dropdown trigger="click" @command="handleClear">
    <el-button type="primary"> Clear <i class="el-icon-arrow-down el-icon--right"></i></el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="clear">Clear Caches</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import {ElMessage, ElMessageBox} from "element-plus";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();

function doClearAllCaches() {
  return processingStore.doClearAllCaches();
}

function handleClear(command: string) {
  if (command === "clear") {
    onClear();
  }
}

function onClear() {
  ElMessageBox.confirm("Clear Caches. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(() => {
      doClearAllCaches();
      ElMessage({
        type: "success",
        message: "Clear Caches completed"
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Clear Caches canceled"
      });
    });
}
</script>

<style scoped>
svg {
  margin-right: 5px;
}
</style>
