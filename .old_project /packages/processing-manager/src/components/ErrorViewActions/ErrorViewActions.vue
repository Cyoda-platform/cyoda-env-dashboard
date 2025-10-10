<template>
  <el-dropdown trigger="click" @command="handleClear">
    <el-button type="primary"> Actions <i class="el-icon-arrow-down el-icon--right"></i></el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="forceMarkProcessed">Force mark processed</el-dropdown-item>
        <el-dropdown-item command="resubmitWithErrorEvent">Resubmit Events For Error(with error
          event)
        </el-dropdown-item>
        <el-dropdown-item command="resubmitWithoutErrorEvent">Resubmit Events For Error(without
          error event)
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {useProcessingStore} from "../../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
const emit=defineEmits(['reload']);

function processingQueueForceMarkProcessed(value) {
  return processingStore.processingQueueForceMarkProcessed(value);
}

function handleClear(command: string) {
  if (command === "forceMarkProcessed") {
    onForceMarkProcessed();
  } else if (command === "resubmitWithErrorEvent") {
    onResubmitWithErrorEvent();
  } else if (command === "resubmitWithoutErrorEvent") {
    onResubmitWithoutErrorEvent();
  }
}

function onForceMarkProcessed() {
  ElMessageBox.confirm("Force mark processed. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(async () => {
      await processingQueueForceMarkProcessed({
        params: route.query
      });
      emit("reload");
      ElMessage({
        type: "success",
        message: "Force mark processed completed"
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Force mark processed canceled"
      });
    });
}

function onResubmitWithErrorEvent() {
  ElMessageBox.confirm("Resubmit Events For Error(with error event). Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(async () => {
      ElMessage({
        type: "success",
        message: "Resubmit Events For Error(with error event) completed"
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Resubmit Events For Error(with error event) canceled"
      });
    });
}

function onResubmitWithoutErrorEvent() {
  ElMessageBox.confirm("Resubmit Events For Error(without error event). Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(async () => {
      ElMessage({
        type: "success",
        message: "Resubmit Events For Error(without error event) completed"
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Resubmit Events For Error(without error event) canceled"
      });
    });
}
</script>

<style scoped>
svg {
  margin-right: 5px;
}
</style>
