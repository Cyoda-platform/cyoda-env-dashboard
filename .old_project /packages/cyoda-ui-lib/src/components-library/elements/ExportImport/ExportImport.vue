<template>
  <div class="export-import">
    <el-tooltip :show-after="500" class="item" effect="dark" content="Export selected data" placement="top">
      <el-button :loading="isLoadingExport" :disabled="dataToExport.length === 0" @click="onExport" type="primary">
        <font-awesome-icon icon="upload"/>
        Export
      </el-button>
    </el-tooltip>
    <el-tooltip :show-after="500" class="item" effect="dark" content="Import previously exported data" placement="top">
      <el-button @click="onImport" type="success">
        <font-awesome-icon icon="download"/>
        Import
      </el-button>
    </el-tooltip>
    <ExportImportDialog :type="type" ref="exportImportDialogRef"/>
    <ExportImportExportVariants @export="onExportDialog" ref="exportImportExportVariantsRef"/>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import ExportImportFactory from "./Class/ExportImportFactory";
import ExportImportDialog from "./ExportImportDialog.vue";
import ExportImportExportVariants from "./ExportImportExportVariants.vue";

const props = defineProps({type: {default: ""}, dataToExport: {default: () => []}});
const exportImportDialogRef = ref(null);
const exportImportExportVariantsRef = ref(null);

const isLoadingExport = ref<boolean>(false);

async function onExport() {
  const factory = (ExportImportFactory as any).getFactory(props.type);
  if (factory.exportFormats.length > 0) {
    exportImportExportVariantsRef.value.exportFormats = factory.exportFormats;

    exportImportExportVariantsRef.value.dialogVisible = true;
  } else {
    exportRequest();
  }
}

function onExportDialog(data) {
  exportRequest(data);
}

async function exportRequest(data = null) {
  try {
    isLoadingExport.value = true;
    await (ExportImportFactory as any).getFactory(props.type).export(props.dataToExport, data);
  } finally {
    isLoadingExport.value = false;
  }
}

function onImport() {
  exportImportDialogRef.value.dialogVisible = true;
}
</script>

<style scoped lang="scss">
.export-import {
  display: flex;
  flex-wrap: nowrap;
  margin-left: 12px;
}
</style>
