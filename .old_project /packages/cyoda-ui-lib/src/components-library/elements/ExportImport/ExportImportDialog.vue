<template>
  <el-dialog :close-on-click-modal="false" title="Import data" v-model="dialogVisible" @close="onCloseDialog"
             width="600px">
    <el-steps :active="active" finish-status="success" align-center>
      <el-step title="Import"></el-step>
      <el-step title="Result"></el-step>
    </el-steps>

    <el-form ref="formRef" inline :model="form">
      <el-form-item>
        <template v-slot:label>
          Fail On Exists
          <el-popover placement="bottom" title="Fail On Exists" width="450" trigger="click"
                      content="boolean, optional parameter, if true then existing cobi configs will not overwrite">
            <template #reference>
              <i class="el-icon-warning icon-popover"></i>
            </template>
          </el-popover>
        </template>
        <el-checkbox v-model="form.failOnExists"></el-checkbox>
      </el-form-item>
    </el-form>
    <div v-loading="loading" class="body">
      <div v-if="active === 0">
        <ExportImportDialogFile @change="onChangeFile"/>
      </div>
      <div v-if="active === 1">
        <ExportImportDialogResult v-for="(instance, index) in importInstances" :key="index" :instance="instance"/>
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
import {ElNotification} from "element-plus";
import {ref, nextTick, watch, onBeforeUnmount} from "vue";

import ExportImportFactory from "./Class/ExportImportFactory";
import ExportImportDialogFile from "./ExportImportDialogFile.vue";
import ExportImportDialogResult from "./ExportImportDialogResult.vue";
import eventBus from "../../../plugins/eventBus";
import {useRoute} from "vue-router";

const props = defineProps({type: {default: ""}});

const dialogVisible = ref<boolean>(false);
const loading = ref<boolean>(false);
const active = ref(0);
const uploadedData = ref(undefined);
let importInstances = ref([]);
const route = useRoute();
let importValidateFn = ExportImportFactory.getFactory(props.type)?.importValidateFn;

const defaultForm = {
  failOnExists: false
};

const form = ref(JSON.parse(JSON.stringify(defaultForm)));

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm));
}

const exportImportSuccessData = ref(null);

async function onChangeFile(data: {
  data: any

}) {
  if (importValidateFn) {
    const importValidationData = importValidateFn(data, route);
    if (!importValidationData.result) {
      ElNotification({type: "error", title: "Error", message: importValidationData.message});
      resetUploadFile();
      return;
    }
  }
  uploadedData.value = data;
  active.value = 1;
  loading.value = true;
  importInstances.value = await ExportImportFactory.getFactory(props.type).makeImportInstances(data, form.value);
  loading.value = false;
}

eventBus.$on("exportImport:success", exportImportSuccess);

onBeforeUnmount(() => {
  eventBus.$off("exportImport:success", exportImportSuccess);
});

function exportImportSuccess(data) {
  if (!dialogVisible.value) return;
  exportImportSuccessData.value = data;
}

function onCloseDialog() {
  eventBus.$emit(`closedImportExport:${props.type}`, exportImportSuccessData.value);
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
      resetForm();
    }
  },
  {immediate: true}
);

defineExpose({dialogVisible})
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

:deep(.el-form) {
  margin-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
