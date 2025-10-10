<template>
  <el-dialog :close-on-click-modal="false" title="Import data" v-model="dialogVisible" @close="onCloseDialog" width="550px">
    <slot name="alert"></slot>
    <el-steps :active="active" finish-status="success" align-center>
      <el-step title="Import"></el-step>
      <el-step title="Result"></el-step>
    </el-steps>
    <div v-loading="loading" class="body">
      <div v-if="active === 0">
        <slot name="parameters" :formParameters="formParameters"></slot>
        <ExportImportDialogFile @change="onChangeFile" />
      </div>
      <div v-if="active === 1">
        <ExportImportDialogResult v-for="(instance, index) in importInstances" :key="index" :instance="instance" />
      </div>
    </div>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref, nextTick, watch } from "vue";

import ExportImportFactory from "./Class/ExportImportFactory";
import ExportImportDialogFile from "./ExportImportDialogFile.vue";
import ExportImportDialogResult from "./ExportImportDialogResult.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({ type: { default: "" } });

const dialogVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const active = ref(0);
const uploadedData = ref(undefined);
let importInstances = ref([]);
let formParameters = ref({});
let typeImport = ref((ExportImportFactory as any).getFactory(props.type));

async function onChangeFile(data: { data: any }) {
  if (typeImport.value && typeImport.value.importValidateFn) {
    const importValidationData = typeImport.value.importValidateFn(this, data);
    if (!importValidationData.result) {
      ElNotification({ type: "error", title: "Error", message: importValidationData.message });
      resetUploadFile();
      return;
    }
  }
  uploadedData.value = data;
  active.value = 1;
  loading.value = true;
  try {
    if (typeImport.value.setParameters) typeImport.value.setParameters(formParameters.value);
    importInstances.value = await typeImport.value.makeImportInstances(data);
  } catch (e) {
    ElNotification({ type: "error", title: "Error", message: "Something is wrong. Please try again" });
    active.value = 0;
  } finally {
    loading.value = false;
  }
}

function onCloseDialog() {
  eventBus.$emit(`closedImportExport:${props.type}`);
}

async function resetUploadFile() {
  active.value = -99;
  await nextTick();

  active.value = 0;
}

watch(
  dialogVisible,
  (val: boolean) => {
    if (val) {
      active.value = 0;
      importInstances.value = [];
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.export-import {
  display: inline-block;
  margin-left: 10px;
}

.body {
  margin-top: 15px;
}

.import-result {
  font-size: 16px;
  margin: 15px 0;

  span {
    font-weight: bold;
  }
}
</style>
