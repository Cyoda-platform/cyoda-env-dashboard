<template>
  <div class="export-import-all-dialog-file">
    <el-dialog :close-on-click-modal="false" title="Import data" v-model="dialogVisible" width="950px" @close="onCloseDialog">
      <el-form ref="formRef" inline :model="form">
        <template v-if="form.cleanBeforeImport || form.doPostProcess">
          <el-alert title="Warning" type="warning" description="You will delete the other configurations" :closable="false" show-icon> </el-alert>
        </template>
        <el-form-item>
          <template v-slot:label>
            Delete ALL configurations before import
            <el-popover placement="bottom" title="Clean Before Import" width="350" trigger="click" content="boolean, optional parameter, if true then existing cobi configs will be deleted before import, by default is FALSE">
              <template #reference>
              <i class="el-icon-warning icon-popover"></i>
              </template>
            </el-popover>
          </template>
          <el-checkbox v-model="form.cleanBeforeImport"></el-checkbox>
        </el-form-item>
        <el-form-item>
          <template v-slot:label>
            Synchronize configuration (may delete configurations)
            <el-popover placement="bottom" title="Do Post Process" width="350" trigger="click" content="boolean, optional parameter, if true, then post-processing will run, by default is FALSE">
              <template #reference>
              <i class="el-icon-warning icon-popover"></i>
              </template>
            </el-popover>
          </template>
          <el-checkbox v-model="form.doPostProcess"></el-checkbox>
        </el-form-item>
      </el-form>
      <FilePond name="test" ref="pondRef" @addfile="addfile" v-bind:allow-multiple="false" accepted-file-types="application/json" />
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useChainingConfigStore } from "../../stores/chaining-config";
import { usePlatformMappingStore } from "../../stores/platform-mapping";
import { useDataSourceConfigStore } from "../../stores/data-source-config";
import { ElNotification, ElMessageBox } from "element-plus";
import { ref } from "vue";

import vueFilePond from "vue-filepond";

import "filepond/dist/filepond.min.css";

import type { DataSourceConfigDto } from "../DataSourceConfig/DataSourceConfig";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const FilePond = vueFilePond();

const props = defineProps({ type: { default: "" } });
const dataSourceConfigStore = useDataSourceConfigStore();
const platformMappingStore = usePlatformMappingStore();
const chainingConfigStore = useChainingConfigStore();
function importCobiConfig(value) {
  return dataSourceConfigStore.importCobiConfig(value);
}

function getListAllDataMappings(value) {
  return platformMappingStore.getListAllDataMappings(value);
}

function getListAllChainings() {
  return chainingConfigStore.getListAll();
}

const pondRef = ref(null);
const formRef = ref(null);

const dialogVisible = ref<boolean>(false);
let form = ref({
  cleanBeforeImport: false,
  doPostProcess: false
});

async function addfile(err: any, file: any) {
  if (form.value.cleanBeforeImport || form.value.doPostProcess) {
    ElMessageBox.confirm("Import will delete existing other configurations. Continue?", "Warning", {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning",
      callback: async (action) => {
        if (action === "confirm") {
          processUploadFile(file);
        }
        if (action === "cancel") {
          pondRef.value.removeFiles();
        }
      }
    });
    return;
  }
  processUploadFile(file);
}

function processUploadFile(file: any) {
  let reader = new FileReader();
  reader.readAsText(file.file);
  reader.onload = async () => {
    let rawData = (reader as any).result;
    try {
      const dataForSend = await makeImportDataContent(rawData);
      await importCobiConfig({
        data: dataForSend,
        params: form.value
      });
      ElNotification({
        title: "Success",
        message: "File was uploaded",
        type: "success"
      });
      dialogVisible.value = false;
    } catch (e) {
      ElNotification({ type: "error", title: "Error", message: e.message });
      pondRef.value.removeFiles();
    }
  };
}

let defaultContainer = ref({
  "@bean": "com.cyoda.plugins.datasource.dtos.DataSourceConfigsContainerDto",
  dataSources: [],
  chainings: [],
  mappings: []
});

async function makeImportDataContent(rawData) {
  if (rawData.indexOf("com.cyoda.plugins.datasource.dtos.DataSourceConfigsContainerDto") > -1) {
    return JSON.parse(rawData);
  }

  const container = getContainer();
  rawData = rawData.replaceAll("com.cyoda.plugins.mapping.api.dtos", "com.cyoda.plugins.mapping.core.dtos");
  if (rawData.indexOf("com.cyoda.plugins.mapping.core.dtos.DataMappingConfigDto") > -1) {
    container.mappings = [...JSON.parse(rawData)];
  } else if (rawData.indexOf("com.cyoda.plugins.datasource.dtos.chaining.ChainingConfigDto") > -1) {
    container.chainings = [...JSON.parse(rawData)];
  } else if (rawData.indexOf("com.cyoda.plugins.datasource.dtos.DataSourceConfigDto") > -1) {
    const allDataSources: DataSourceConfigDto[] = JSON.parse(rawData);
    const { data: allDataMappings } = await getListAllDataMappings(false);
    const { data: allDataChainings } = await getListAllChainings();

    if (allDataMappings.length === 0) {
      ElNotification({ type: "error", title: "Error", message: "Not exist minimum one data mapping" });
      throw Error("Not exist minimum one data mapping");
    }

    const isChainingsHasErrpor = allDataSources.some((elDataSource) => elDataSource.endpoints.some((elEndoint) => elEndoint.chainings.length > 0 && allDataChainings.length === 0));

    if (isChainingsHasErrpor) {
      ElNotification({ type: "error", title: "Error", message: "Not exist minimum one data chainings" });
      throw Error("Not exist minimum one data chainings");
    }
    const wasReplaced: string[] = [];

    allDataSources.forEach((elDataSource) => {
      elDataSource.endpoints.forEach((elEndoint) => {
        const dataMapping = allDataMappings.find((el) => el.id === elEndoint.dataMappingConfigId);
        if (dataMapping) {
          if (container.mappings.indexOf(dataMapping) === -1) container.mappings.push(dataMapping);
        } else {
          if (wasReplaced.indexOf(elDataSource.name) === -1) wasReplaced.push(elDataSource.name);
          if (container.mappings.indexOf(allDataMappings[0]) === -1) container.mappings.push(allDataMappings[0]);
          elEndoint.dataMappingConfigId = allDataMappings[0].id;
        }

        elEndoint.chainings = elEndoint.chainings.map((chainingId) => {
          const dataChaining = allDataChainings.find((el) => el.id === chainingId);
          if (dataChaining) {
            if (container.chainings.indexOf(dataChaining) === -1) container.chainings.push(dataChaining);
            return chainingId;
          } else {
            if (wasReplaced.indexOf(elDataSource.name) === -1) wasReplaced.push(elDataSource.name);
            if (container.chainings.indexOf(allDataChainings[0]) === -1) container.chainings.push(allDataChainings[0]);
            return allDataChainings[0].id;
          }
        });
      });
    });

    container.dataSources = [...JSON.parse(rawData)];

    if (wasReplaced.length > 0) {
      ElNotification({
        title: "Success",
        message: `Please set correct Data Mapping Configs and chainings for: ${wasReplaced.join(", ")}`,
        type: "success"
      });
    }
  }
  return container;
}

function getContainer() {
  return JSON.parse(JSON.stringify(defaultContainer.value));
}

function onCloseDialog() {
  eventBus.$emit(`closedImportExport:${props.type}`);
}

function isJsonString(str: any) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

defineExpose({ dialogVisible, form, processUploadFile });
</script>

<style scoped lang="scss">
.export-import-all-dialog-file {
  .export-import {
    display: inline-block;
    margin-left: 10px;
  }

  .icon-popover {
    cursor: pointer;
    transition: all 0.5s;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
