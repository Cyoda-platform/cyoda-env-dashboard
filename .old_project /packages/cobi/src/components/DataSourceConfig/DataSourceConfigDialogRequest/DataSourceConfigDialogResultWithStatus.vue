<template>
  <el-dialog append-to-body :close-on-click-modal="false" :title="computedTitle" v-model="dialogVisible" width="800px">
    <div class="header">
      <el-row class="row" :gutter="20">
        <el-col :span="24">
          <strong>Status:</strong> {{ statusObj.status }}
          <font-awesome-icon v-if="!endAt" icon="spinner" spin />
        </el-col>
      </el-row>
      <el-row v-if="statusObj.requestUuid" class="row" :gutter="20">
        <el-col :span="24"><strong>Request UUID:</strong> <DataToClipboard :value="statusObj.requestUuid" /></el-col>
      </el-row>
    </div>
    <el-divider />

    <el-row class="row" :gutter="20">
      <el-col :span="8"><strong>Started At:</strong> {{ startedAt }}</el-col>
      <el-col :span="8"><strong>Ended At:</strong> {{ endAt }}</el-col>
      <el-col :span="8"><strong>Duration:</strong> {{ duration }}</el-col>
    </el-row>

    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import DataToClipboard from "../../DataToClipboard/DataToClipboard.vue";

const props = defineProps({
  statusObj: {
    default: () => {
      return {};
    }
  },
  dataSourceConfigDto: {
    default: () => {
      return {};
    }
  }
});

const emit=defineEmits(['emit']);
const startedAt = computed(() => {
  if (!props.statusObj.startTime) return "";
  return props.statusObj.startTime.format("DD.MM.YYYY H:mm:ss");
});
const endAt = computed(() => {
  if (!props.statusObj.endTime) return "";
  return props.statusObj.endTime.format("DD.MM.YYYY H:mm:ss");
});
const duration = computed(() => {
  if (!props.statusObj.endTime) return "";
  return `${props.statusObj.endTime.diff(props.statusObj.startTime, "seconds")} seconds`;
});
const computedTitle = computed(() => {
  return `Result: ${props.dataSourceConfigDto.name}`;
});
const requestUuid = computed(() => {
  return 1;
});

const dialogVisible = ref<boolean>(false);

watch(
  dialogVisible,
  (val) => {
    if (!val) emit("stop");
  }
);

defineExpose({ dialogVisible });
</script>

<style scoped>
.row {
  margin-bottom: 20px;
}

.header {
  .row {
    margin-bottom: 5px;
  }
}
</style>
