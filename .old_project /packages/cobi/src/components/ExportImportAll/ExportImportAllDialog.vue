<template>
  <div class="export-import-all-dialog">
    <el-dialog :close-on-click-modal="false" title="Export data" v-model="dialogVisible" width="90%">
      <div class="actions">
        <el-button @click="onExportAllCobi" type="primary">
          <font-awesome-icon icon="cloud" />
          Export All
        </el-button>
        <el-button :disabled="!isAvailableIds" @click="onExportCobiForKeys" type="warning">
          <font-awesome-icon icon="cloud" />
          Export Selected
        </el-button>
      </div>
      <el-tabs v-model="activeName">
        <el-tab-pane label="Data mappings" name="dataMappings">
          <ExportImportDataMapping @multipleSelection="onMultipleSelection" />
        </el-tab-pane>

        <el-tab-pane label="Chaining" name="chaining">
          <ExportImportChaining @multipleSelection="onMultipleSelection" />
        </el-tab-pane>

        <el-tab-pane label="Connections" name="connections">
          <ExportImportConnection @multipleSelection="onMultipleSelection" />
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Close</el-button>
        </div>
      </template>
    </el-dialog>
    <ExportImportAllDialogSettings ref="exportImportAllDialogSettingsRef" />
  </div>
</template>

<script setup lang="ts">
import { useDataSourceConfigStore } from "../../stores/data-source-config";
import { ref, computed, inject } from "vue";

import FileSaver from "file-saver";
import ExportImportDataMapping from "./tabs/ExportImportDataMapping.vue";
import ExportImportConnection from "./tabs/ExportImportConnection.vue";
import ExportImportChaining from "./tabs/ExportImportChaining.vue";

import * as api from "@cyoda/ui-lib/src/api";
import ExportImportAllDialogSettings from "./ExportImportAllDialogSettings.vue";

const dataSourceConfigStore = useDataSourceConfigStore();
let multipleSelection = ref({
  datasourcesIds: [],
  chainingsIds: [],
  mappingsIds: []
});

const isAvailableIds = computed(() => {
  return Object.keys(multipleSelection.value).some((key) => {
    return multipleSelection.value[key].length > 0;
  });
});
const platformVersion = computed(() => {
  return platform.value.version || "-";
});

function exportAllCobi() {
  return dataSourceConfigStore.exportAllCobi();
}

function exportCobiForKeys(multipleSelection) {
  return dataSourceConfigStore.exportCobiForKeys(multipleSelection);
}

const exportImportAllDialogSettingsRef = ref(null);
const selectedItemsType = inject("selectedItemsType");

const dialogVisible = ref<boolean>(false);
const activeName = ref<string>("dataMappings");
let platform = ref({});
let uiVersion = ref(import.meta.env.VITE_APP_UI_VERSION);
loadPlatformVersion();
activeName.value = selectedItemsType;

async function loadPlatformVersion() {
  const { data: platform } = await api.versionPlatform();
  platform.value = platform;
}

async function onExportAllCobi() {
  exportImportAllDialogSettingsRef.value.dialogVisible = true;
  exportImportAllDialogSettingsRef.value.showMultipleSettings = false;
  exportImportAllDialogSettingsRef.value.form.fileName = buildBaseName("cobi-config");
  exportImportAllDialogSettingsRef.value.callbackFunction = async ({ fileName }) => {
    const { data } = await exportAllCobi();
    const file = new File([JSON.stringify(data)], fileName, { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(file);
  };
}

function isSelectedOne() {
  const datas = [];
  Object.keys(multipleSelection.value).forEach((key) => {
    datas.push(...multipleSelection.value[key]);
  });
  if (datas.length === 1) return datas[0];
  return false;
}

async function onExportCobiForKeys() {
  exportImportAllDialogSettingsRef.value.dialogVisible = true;
  const isSelectedOneValue = isSelectedOne();
  if (isSelectedOneValue) {
    exportImportAllDialogSettingsRef.value.form.fileName = buildBaseName(isSelectedOneValue.name);
  } else {
    exportImportAllDialogSettingsRef.value.showMultipleSettings = true;
    exportImportAllDialogSettingsRef.value.form.fileName = buildBaseName("cobi-config");
  }
  exportImportAllDialogSettingsRef.value.callbackFunction = async ({ fileName, isSeparateFiles }) => {
    if (isSeparateFiles) {
      Object.keys(multipleSelection.value).forEach((key) => {
        multipleSelection.value[key].forEach(async (el) => {
          const multipleSelection: any = {
            [key]: [el.id]
          };
          const { data } = await exportCobiForKeys(multipleSelection);
          const file = new File([JSON.stringify(data)], buildBaseName(el.name), { type: "text/plain;charset=utf-8" });
          FileSaver.saveAs(file);
        });
      });
    } else {
      const multipleSelectionLocal: any = {};
      Object.keys(multipleSelection.value).forEach((key) => {
        multipleSelectionLocal[key] = multipleSelection.value[key].map((el) => el.id);
      });
      const { data } = await exportCobiForKeys(multipleSelectionLocal);
      const file = new File([JSON.stringify(data)], fileName, { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(file);
    }
  };
}

function buildBaseName(name) {
  return `${name}_platform_v${platformVersion.value}_UI_v${uiVersion.value}.json`;
}

function onMultipleSelection({ key, data }) {
  multipleSelection.value[key] = data;
}

defineExpose({ dialogVisible });
</script>

<style scoped lang="scss">
.export-import-all-dialog {
  .actions {
    text-align: right;
  }
}
</style>
