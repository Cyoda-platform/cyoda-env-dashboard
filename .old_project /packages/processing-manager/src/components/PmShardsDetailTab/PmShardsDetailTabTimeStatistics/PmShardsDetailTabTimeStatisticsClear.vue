<template>
  <el-dropdown trigger="click" @command="handleClear">
    <el-button type="primary"> Clear <i class="el-icon-arrow-down el-icon--right"></i></el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="clear">Clear time stats</el-dropdown-item>
        <el-dropdown-item command="clearAll">Clear time stats (ALL nodes)</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import {ElMessage, ElMessageBox} from "element-plus";
import {computed} from "vue";
import {useProcessingStore} from "../../../stores/processing";

const processingStore = useProcessingStore();
const emit=defineEmits(['reload']);
const nodes = computed(() => {
  return processingStore.nodes;
});

function clearTimeStats() {
  return processingStore.clearTimeStats();
}

function handleClear(command: string) {
  if (command === "clear") {
    onClear();
  } else if (command === "clearAll") {
    onClearAll();
  }
}

function onClear() {
  ElMessageBox.confirm("Clear time stats. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(async () => {
      try {
        await clearTimeStats();
      } catch (e) {
        console.error(e);
      }
      ElMessage({
        type: "success",
        message: "Clear time stats completed"
      });
      emit("reload");
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Clear time stats canceled"
      });
    });
}

function onClearAll() {
  ElMessageBox.confirm("Clear timestats request send to all nodes. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(async () => {
      const listPromises = nodes.value.map((el: any) => {
        return clearTimeStats(el.baseUrl);
      });
      try {
        await Promise.all(listPromises);
      } catch (e) {
        console.error(e);
      }
      ElMessage({
        type: "success",
        message: "Clear time stats (ALL nodes) completed"
      });
      emit("reload");
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Clear time stats (ALL nodes) canceled"
      });
    });
}
</script>

<style scoped>
svg {
  margin-right: 5px;
}
</style>
