<template>
  <el-dialog append-to-body :close-on-click-modal="false" :title="computedTitle" v-model="dialogVisible" width="80%">
    <DataSourceConfigDialogResultTabs :requestId="requestId" :result="result" />
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import "prismjs/themes/prism.css";
import DataSourceConfigDialogResultTabs from "./DataSourceConfigDialogResultTabs/DataSourceConfigDialogResultTabs.vue";
const props = defineProps({
  result: {
    default: () => {
      return {};
    }
  },
  dataSourceConfigDto: {
    default: () => {
      return {};
    }
  },
  requestId: {
    default: ""
  }
});
const computedTitle = computed(() => {
  return `Result: ${props.dataSourceConfigDto.name}`;
});

const dialogVisible = ref<boolean>(false);

defineExpose({ dialogVisible });
</script>
