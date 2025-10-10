<template>
  <el-dialog :close-on-click-modal="false" class="export-import-all-dialog-settings" title="Save As" v-model="dialogVisible" width="80%">
    <el-form :model="form" label-width="200px">
      <template v-if="showMultipleSettings">
        <el-form-item label="Export as separate files">
          <el-switch v-model="form.isSeparateFiles"></el-switch>
        </el-form-item>
      </template>
      <template v-if="!form.isSeparateFiles">
        <el-form-item label="Activity name">
          <el-input v-model="form.fileName"></el-input>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="onExport">Export</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const dialogVisible = ref<boolean>(false);
const showMultipleSettings = ref<boolean>(false);
const callbackFunction = ref(null);

let form = ref({
  fileName: "",
  isSeparateFiles: false
});

let defaultForm = ref(JSON.parse(JSON.stringify(form.value)));

function onExport() {
  callbackFunction.value(form.value);
  dialogVisible.value = false;
}

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm.value));
}

watch(
  dialogVisible,
  (val) => {
    if (!val) resetForm();
  }
);

defineExpose({ dialogVisible, showMultipleSettings, callbackFunction, form, defaultForm });
</script>
