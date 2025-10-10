<template>
  <div>
    <el-dialog class="upload-file-pop-up" title="Create configuration for Csv File" v-model="dialogVisible" width="550px">
      <el-form ref="form" label-position="top" label-width="120px">
        <el-form-item label="Separator">
          <el-input placeholder="Please input separator" v-model="form.separator"></el-input>
        </el-form-item>
      </el-form>

      <FilePond @initfile="onStartUploading" @processfile="onStopUploading" v-if="isAvailableFilePond" :disabled="isUploadDisabled" name="file" ref="pond" :allow-multiple="false" :server="serverSettings" />
      <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="isLoading" @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>

    <UploadFileSample file-type="CSV" ref="uploadFileSample" :tableSampleData="tableSampleData" />
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, computed } from "vue";

import vueFilePond from "vue-filepond";

import "filepond/dist/filepond.min.css";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import UploadFileSample from "./UploadFileSample.vue";
import {useFileUploadApiStore} from "../../stores/encompass";

const FilePond = vueFilePond(FilePondPluginFileValidateType);
const helperStorage = new HelperStorage();

const fileUploadApiStore = useFileUploadApiStore();
const uploadConfigSampleUploadUrl = computed(() => {
  return fileUploadApiStore.uploadConfigSampleUploadUrl;
});
const serverSettings = computed(() => {
  return {
    url: process.env.VITE_APP_API_BASE,
    process: {
      url: uploadConfigSampleUploadUrl.value,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "X-Requested-With": "XMLHttpRequest"
      },
      withCredentials: false,
      ondata: (formData: any) => {
        formData.append("separator", form.value.separator);
        return formData;
      },
      onload: (response: string) => {
        tableSampleData.value = JSON.parse(response);
        uploadFileSampleRef.value.dialogVisible = true;
      }
    }
  };
});
const isUploadDisabled = computed(() => {
  return !form.value.separator;
});
function getListNames() {
  return fileUploadApiStore.getListNames();
}
const uploadFileSampleRef = ref(null);

const dialogVisible = ref<boolean>(false);
const isAvailableFilePond = ref<boolean>(true);
const isLoading = ref<boolean>(false);
let tableSampleData = ref({
  columnNames: [],
  rows: [],
  separator: ""
});

let token = ref(helperStorage.get("auth") && helperStorage.get("auth").token);

let form = ref({
  separator: ""
});

let editData = ref({});

let defaultForm = ref(JSON.parse(JSON.stringify(form.value)));

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm.value));
}

function onStartUploading() {
  isLoading.value = true;
}

function onStopUploading() {
  isLoading.value = false;
  dialogVisible.value = false;
  reInitFilePond();
  resetForm();
}

async function reInitFilePond() {
  isAvailableFilePond.value = false;
  tableSampleData.value.separator = "";
  await nextTick();

  isAvailableFilePond.value = true;
}
</script>

<style lang="scss">
.upload-file-pop-up {
  .el-form-item__label {
    margin: 0 !important;
    padding: 0 !important;
  }

  .el-dialog__body {
    padding-top: 0;
  }

  .el-form-item {
    margin-bottom: 15px;
  }
}
</style>
