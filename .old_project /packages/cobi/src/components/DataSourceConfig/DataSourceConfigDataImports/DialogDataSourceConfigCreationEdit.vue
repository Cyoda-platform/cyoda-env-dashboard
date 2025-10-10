<template>
  <el-dialog width="90%" append-to-body class="dialog-create-data-mapping" :close-on-click-modal="false" title="Connection" v-model="dialogVisible">
    <DataSourceConfigCreationEdit v-if="dialogVisible" action="create:popup" ref="dataSourceConfigCreationEditRef" />
    <template #footer>
    <span class="dialog-footer">
      <portal-target name="data-source-config-actions"></portal-target>
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";

import DataSourceConfigCreationEdit from "../../../views/DataSourceConfigCreation/DataSourceConfigCreationEdit.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const dataSourceConfigCreationEditRef = ref(null);

const dialogVisible = ref<boolean>(false);
eventBus.$on("dataSourceConfig:created", dataSourceConfigCreated);

onBeforeUnmount(() => {
  eventBus.$off("dataSourceConfig:created", dataSourceConfigCreated);
});

function dataSourceConfigCreated() {
  dialogVisible.value = false;
}

defineExpose({ dialogVisible, dataSourceConfigCreationEditRef });
</script>

<style scoped lang="scss">
.vue-portal-target {
  display: inline-block;
  margin-right: 10px;

  :deep(.el-dropdown) {
    margin: 0 10px;
  }
}
</style>
