<template>
  <div>
    <el-dialog title="Existing report" v-model="dialogVisible" width="750px">
      <span>You have configuration with existing reports.</span>

      <template #footer>
      <span class="dialog-footer">
        <el-button :loading="isLoadingDeleteExistingReportsAndSave" type="danger" @click="onClickDeleteAndSave">
          <font-awesome-icon icon="trash" />
          Delete existing reports and save
        </el-button>
        <el-button :loading="isLoadingCreateNewConfigDefinition" type="primary" @click="onClickCreateNew">
          <font-awesome-icon icon="save" />
          Create new report definition
        </el-button>
        <el-button @click="dialogVisible = false">Cancel</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {ref, getCurrentInstance} from "vue";

import * as api from "@cyoda/ui-lib/src/api";

const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  },
  definitionId: {
    default: ""
  }
});
const router = useRouter();

const dialogVisible = ref<boolean>(false);
const isLoadingDeleteExistingReportsAndSave = ref<boolean>(false);
const isLoadingCreateNewConfigDefinition = ref<boolean>(false);
const instance = getCurrentInstance();

async function onClickDeleteAndSave() {
  isLoadingDeleteExistingReportsAndSave.value = true;
  try {
    await api.deleteProcessingReport(props.definitionId, "reports");

    instance.parent.exposed.updateReport();
    dialogVisible.value = false;
  } finally {
    isLoadingDeleteExistingReportsAndSave.value = false;
  }
}

function onClickCreateNew() {
  ElMessageBox.prompt("Please input new name", "Create new", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    inputErrorMessage: "Invalid Name",
    inputValue: props.definitionId.split("-").pop() + "_copy"
  }).then(async ({ value }) => {
    isLoadingCreateNewConfigDefinition.value = true;
    const { data } = await api.createDefinitions(value, props.configDefinition);
    if (data) {
      ElNotification({
        title: "Success",
        message: `Report was Updated`,
        type: "success"
      });
      dialogVisible.value = false;
      router.push(`/http-api/config-editor-simple/${data.content}`);

      instance.parent.definitionId = data.content;
    } else {
      ElNotification({ type: "error", title: "Error", message: "Error during update" });
    }
    isLoadingCreateNewConfigDefinition.value = false;
  });
}

defineExpose({ dialogVisible });
</script>
