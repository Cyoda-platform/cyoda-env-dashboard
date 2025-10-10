<template>
  <div>
    <el-dialog class="upload-file-pop-up" title="Upload File" v-model="dialogVisible" width="550px">
      <el-form ref="form" label-position="top" label-width="120px">
        <el-form-item label="Configuration">
          <el-select filterable clearable v-model="form.configurationId" placeholder="Select">
            <el-option v-for="item in listNames" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <FilePond @initfile="onStartUploading" @processfile="onStopUploading" v-if="isAvailableFilePond" :disabled="isUploadDisabled" name="file" ref="pond" :allow-multiple="false" :server="serverSettings" />
      <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="isLoading" @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref, nextTick, computed, watch } from "vue";

import vueFilePond from "vue-filepond";

import "filepond/dist/filepond.min.css";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import {useFileUploadApiStore} from "../../stores/encompass";

const FilePond = vueFilePond(FilePondPluginFileValidateType);
const helperStorage = new HelperStorage();

const fileUploadApiStore = useFileUploadApiStore();
const uploadFileUploadUrl = computed(() => {
  return fileUploadApiStore.uploadFileUploadUrl;
});
const serverSettings = computed(() => {
  return {
    url: import.meta.env.VITE_APP_API_BASE,
    process: {
      url: uploadFileUploadUrl.value,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "X-Requested-With": "XMLHttpRequest"
      },
      withCredentials: false,
      ondata: (formData: any) => {
        formData.append("configId", form.value.configurationId);
        return formData;
      }
    }
  };
});
const isUploadDisabled = computed(() => {
  return !form.value.configurationId;
});
function getListNames() {
  return fileUploadApiStore.getListNames();
}

const dialogVisible = ref<boolean>(false);
const isAvailableFilePond = ref<boolean>(true);
const isLoading = ref<boolean>(false);
let listNames = ref([]);

let token = ref(helperStorage.get("auth") && helperStorage.get("auth").token);

let form = ref({
  configurationId: ""
});

let defaultForm = ref(JSON.parse(JSON.stringify(form.value)));

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm.value));
}

function onStartUploading() {
  isLoading.value = true;
}

async function loadListNames() {
  listNames.value = await getListNames();
}

function onStopUploading(error: any) {
  isLoading.value = false;
  dialogVisible.value = false;
  reInitFilePond();
  if (error) {
    ElNotification({
      title: "Error",
      message: "File not was uploaded",
      type: "error"
    });
  } else {
    ElNotification({
      title: "Success",
      message: "File was uploaded",
      type: "success"
    });
  }
  resetForm();
}

async function reInitFilePond() {
  isAvailableFilePond.value = false;
  await nextTick();

  isAvailableFilePond.value = true;
}

watch(dialogVisible, (val: boolean) => {
  if (val) {
    loadListNames();
  }
});
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
