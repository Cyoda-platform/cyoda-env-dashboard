<template>
  <div class="upload-file">
    <div class="actions">
      <el-button @click="onCreateConfiguration" type="primary">
        <font-awesome-icon icon="plus" />
        Create Configuration for CSV File
      </el-button>
      <el-button @click="onCreateConfigurationXml" type="primary">
        <font-awesome-icon icon="plus" />
        Create Configuration for XML File
      </el-button>
      <el-button @click="onCreateConfigurationMySql" type="primary">
        <font-awesome-icon icon="plus" />
        Create Configuration for JDBC
      </el-button>
      <el-button @click="onUploadFile" type="success">
        <font-awesome-icon icon="upload" />
        Ingest Source
      </el-button>
    </div>
    <UploadFileCreateConfigurationPopUp v-if="isInitUploadFilePopUp" ref="uploadFileCreateConfigurationPopUp" />
    <UploadFilePopUp v-if="isInitUploadFilePopUp" ref="uploadFilePopUp" />
    <UploadFilePopUpXml ref="uploadFilePopUpXml" />
    <UploadFilePopUpMySql v-if="isDisplayUploadFilePopUpMySql" ref="uploadFilePopUpMySql" />
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";

import { ref, nextTick } from "vue";

import UploadFilePopUp from "./UploadFilePopUp.vue";
import UploadFilePopUpXml from "./UploadFilePopUpXml.vue";
import UploadFileCreateConfigurationPopUp from "./UploadFileCreateConfigurationPopUp.vue";
import UploadFileSample from "./UploadFileSample.vue";

import UploadFilePopUpMySql from "./UploadFilePopUpMySql.vue";

const props = defineProps({
  tableData: {
    default: () => {
      return [];
    }
  }
});
const router = useRouter();
// const fillTestPackStore = useFillTestPackStore();

// function getExport() {
//   return fillTestPackStore.getExport();
// }
const uploadFilePopUpMySqlRef = ref(null);
const uploadFilePopUpXmlRef = ref(null);
const uploadFilePopUpRef = ref(null);
const uploadFileCreateConfigurationPopUpRef = ref(null);

const isInitUploadFilePopUp = ref<boolean>(true);

const isDisplayUploadFilePopUpMySql = ref<boolean>(true);

async function onCreateConfiguration() {
  isInitUploadFilePopUp.value = false;
  await nextTick();

  isInitUploadFilePopUp.value = true;
  setTimeout(async () => {
    await nextTick();

    uploadFileCreateConfigurationPopUpRef.value.dialogVisible = true;
    uploadFileCreateConfigurationPopUpRef.value.editData = {};
  }, 300);
}

async function onUploadFile() {
  isInitUploadFilePopUp.value = false;
  await nextTick();

  isInitUploadFilePopUp.value = true;
  setTimeout(async () => {
    await nextTick();

    uploadFilePopUpRef.value.dialogVisible = true;
  }, 300);
}

function onAddNew() {
  router.push("/test-pack/questions");
}

function onCreateConfigurationXml() {
  uploadFilePopUpXmlRef.value.dialogVisible = true;
}

async function onCreateConfigurationMySql() {
  isDisplayUploadFilePopUpMySql.value = false;
  await nextTick();

  isDisplayUploadFilePopUpMySql.value = true;
  setTimeout(() => {
    uploadFilePopUpMySqlRef.value.dialogVisible = true;
  }, 200);
}
</script>

<style scoped lang="scss">
.actions {
  margin-bottom: 20px;
}
</style>
