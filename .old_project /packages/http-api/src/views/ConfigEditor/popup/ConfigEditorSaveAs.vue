<template>
  <el-dialog :close-on-click-modal="false" title="Copy" v-model="dialogVisible" @closed="dialogClosed" width="500px">
    <el-form v-loading="isLoading" :rules="rules" ref="ruleSaveAsFormRef" label-width="100px" :model="form">
      <el-form-item prop="name" label="Name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item prop="description" label="Description">
        <el-input rows="4" type="textarea" v-model="form.description"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="saveAsReport">Save</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {ref, watch, getCurrentInstance} from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperReportDefinition from "../../../helpers/HelperReportDefinition";
import {ElForm} from "element-plus";
import ConfigEditorReports from "../ConfigEditorReports.vue";

const router = useRouter();

const definitionId = ref<string>("");
const dialogVisible = ref<boolean>(false);

const ruleSaveAsFormRef = ref(null);

let configDefinition = ref(HelperReportDefinition.reportDefinition());

const dialogSaveAs = ref<boolean>(false);
const isLoading = ref<boolean>(false);

let rules = ref({
  name: [
    {required: true, message: "Please input name", trigger: "blur"},
    {min: 3, max: 50, message: "Length should be 3 to 50", trigger: "blur"}
  ]
});

let form = ref({
  name: "",
  description: ""
});

const instance = getCurrentInstance();
const parent = instance.parent;

function dialogClosed() {
  ruleSaveAsFormRef.value.resetFields();
}

async function saveAsReport() {
  ruleSaveAsFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      dialogSaveAs.value = false;
      isLoading.value = true;
      const configDefinitionValue = JSON.parse(JSON.stringify(configDefinition.value));
      configDefinitionValue.description = form.value.description;
      try {
        const {data} = await api.createDefinitions(form.value.name, configDefinitionValue);
        dialogVisible.value = false;
        ruleSaveAsFormRef.value.resetFields();
        router.push(`/http-api/config-editor-simple/${data.content}`);
      } finally {
        isLoading.value = false;
      }
    }
  });
}

watch(dialogVisible, async (val: boolean) => {
  if (val) {
    isLoading.value = true;
    form.value.name = definitionId.value.split("-").pop() + "_copy";
    configDefinition.value = await parent.exposed.loadPreConfigDefinition(definitionId.value);
    isLoading.value = false;
  }
});

defineExpose({dialogVisible, definitionId, parent});
</script>

<style lang="scss">
.config-editor-new-form {
  margin-top: 15px;

  .el-select {
    width: 100%;
  }
}
</style>
