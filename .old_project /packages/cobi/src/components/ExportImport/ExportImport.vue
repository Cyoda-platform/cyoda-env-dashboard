<template>
  <div class="export-import">
    <el-button @click="onExportAllCobi" type="primary">
      <font-awesome-icon icon="cloud" />
      Export
    </el-button>
    <el-button @click="onImportAllCobi" type="success">
      <font-awesome-icon icon="download" />
      Import
    </el-button>
    <el-divider direction="vertical"></el-divider>
    <ExportImportDialog :type="type" ref="exportImportDialog">
      <template #alert>
      <slot name="alert"></slot>
      </template>
      <template #parameters="{ formParameters }">
      <slot>
        <slot :formParameters="formParameters" name="parameters"></slot>
      </slot>
      </template>
    </ExportImportDialog>
    <ExportImportExportVariants @export="onExportDialog" ref="exportImportExportVariantsRef" />
    <ExportImportAllDialog :key="`exportImportAllDialogKey${exportImportAllDialogKey}`" ref="exportImportAllDialogRef" />
    <ExportImportAllDialogFile :type="type" :key="`exportImportAllDialogFileKey${exportImportAllDialogFileKey}`" ref="exportImportAllDialogFileRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

import ExportImportFactory from "./Class/ExportImportFactory";
import ExportImportDialog from "./ExportImportDialog.vue";
import ExportImportExportVariants from "./ExportImportExportVariants.vue";
import ExportImportAllDialog from "../ExportImportAll/ExportImportAllDialog.vue";
import ExportImportAllDialogFile from "../ExportImportAll/ExportImportAllDialogFile.vue";

const props = defineProps({ type: { default: "" }, dataToExport: { default: () => [] } });
const asRef = ref(null);
const exportImportExportVariantsRef = ref(null);

const exportImportAllDialogRef = ref(null);

const exportImportAllDialogFileRef = ref(null);

const isLoadingExport = ref<boolean>(false);
const exportImportAllDialogKey = ref(0);
const exportImportAllDialogFileKey = ref(0);

async function onExport() {
  const factory = (ExportImportFactory as any).getFactory(props.type);
  if (factory.exportFormats.length > 0) {
    exportImportExportVariantsRef.value.exportFormats = factory.exportFormats;
    exportImportExportVariantsRef.value.dialogVisible = true;
  } else {
    exportRequest();
  }
}

function onExportDialog(data: any) {
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

// function onImport() {
//   exportImportDialogRef.value.dialogVisible = true;
// }

async function onExportAllCobi() {
  exportImportAllDialogKey.value += 1;
  await nextTick();

  setTimeout(() => {
    exportImportAllDialogRef.value.dialogVisible = true;
  }, 300);
}

async function onImportAllCobi() {
  exportImportAllDialogFileKey.value += 1;
  await nextTick();

  setTimeout(() => {
    exportImportAllDialogFileRef.value.dialogVisible = true;
  }, 300);
}
</script>

<style scoped lang="scss">
.export-import {
  display: inline-block;
  margin-right: 0 !important;
  margin-bottom: 10px;
}
</style>
