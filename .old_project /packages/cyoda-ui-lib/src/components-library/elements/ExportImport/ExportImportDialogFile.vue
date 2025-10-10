<template>
  <FilePond name="test" ref="pond" @addfile="addfile" v-bind:allow-multiple="false" accepted-file-types="application/json" />
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref } from "vue";

import vueFilePond from "vue-filepond";

import "filepond/dist/filepond.min.css";

const FilePond = vueFilePond();

const emit = defineEmits(["change"]);
const pondRef = ref(null);

function addfile(err: any, file: any) {
  let reader = new FileReader();
  reader.readAsText(file.file);
  reader.onload = () => {
    const rawData = (reader as any).result;
    if (!isJsonString(rawData)) {
      ElNotification({ type: "error", title: "Error", message: "Was uploaded incorrect file" })(pondRef.value).removeFile(0);
    } else {
      const dataFile = JSON.parse(rawData);
      emit("change", dataFile);
    }
  };
}

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
</script>

<style scoped lang="scss">
.export-import {
  display: inline-block;
  margin-left: 10px;
}
</style>
