<template>
  <el-dialog
    v-model="dialogVisible"
    title="Upload"
    width="500"
  >
    <AIGenerateUploadFile v-loading="isLoading" @save="onSaveUploadFile"/>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import resourceDataMapper from './resources/test_demo_kl_ml_1_platform_v2.8.1-SNAPSHOT_UI_v2.8.1-1-CP2870-1.json';
import resourceDataSource from './resources/mockoon auth_platform_v2.8.1-SNAPSHOT_UI_v2.8.1-1-CP2870-1.json';

import {ref} from 'vue';
import AIGenerateUploadFile from "./AIGenerateUploadFile.vue";
import {useDataSourceConfigStore} from "../../stores/data-source-config";
import {ElNotification} from "element-plus";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const dialogVisible = ref(false);
const isLoading = ref(false);
const dataSourceConfigStore = useDataSourceConfigStore();

const props = defineProps({
  type: {
    default: null,
  }
});

function importCobiConfig(value) {
  return dataSourceConfigStore.importCobiConfig(value);
}

async function onSaveUploadFile() {
  let source;
  if (props.type === 'dataMapper') {
    source = resourceDataMapper;
  }

  if (props.type === 'dataSource') {
    source = resourceDataSource;
  }

  if (!source) return;

  isLoading.value = true;
  setTimeout(async () => {
    await dataSourceConfigStore.importCobiConfig({
      data: source,
      params: {
        cleanBeforeImport: false,
        doPostProcess: false,
      }
    });

    ElNotification({
      title: "Success",
      message: "Data was generated",
      type: "success"
    });

    isLoading.value = false;
    dialogVisible.value = false;
    eventBus.$emit("closedImportExport:data-mapper");
    eventBus.$emit("closedImportExport:data-source-config");
  },2000);
}

defineExpose({dialogVisible})
</script>

<style scoped lang="scss">

</style>
