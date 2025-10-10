<template>
  <div>
    <el-dialog class="upload-file-pop-up-xml" title="Upload XML File" v-model="dialogVisible" width="550px">
      <FilePond @addfilestart="onStartUploading" v-if="isAvailableFilePond" name="file" ref="pond" :allow-multiple="false" />
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
    <UploadFileSample file-type="XML" :xmlData="xmlData" ref="uploadFileSample" />
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick } from "vue";

import vueFilePond from "vue-filepond";

import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import UploadFileSample from "./UploadFileSample.vue";

const FilePond = vueFilePond(FilePondPluginFileValidateType);

const uploadFileSampleRef = ref(null);

const dialogVisible = ref<boolean>(false);
const isAvailableFilePond = ref<boolean>(true);

const xmlData = ref<string>("");

async function onStartUploading(file: { file: Blob }) {
  xmlData.value = await getContent(file.file);
  uploadFileSampleRef.value.dialogVisible = true;
  reInitFilePond();
  dialogVisible.value = false;
}

async function reInitFilePond() {
  isAvailableFilePond.value = false;
  await nextTick();

  isAvailableFilePond.value = true;
}

function getContent(file: Blob) {
  const reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  return new Promise((resolve, reject) => {
    reader.onload = function (evt: any) {
      resolve(evt.target.result);
    };
    reader.onerror = function (e: any) {
      reject(e);
    };
  });
}
</script>

<style lang="scss">
.upload-file-pop-up-xml {
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
