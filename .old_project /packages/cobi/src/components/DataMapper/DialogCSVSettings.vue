<template>
  <el-dialog append-to-body :close-on-click-modal="false" title="CSV Settings" v-model="dialogVisible" width="80%">
    <div>
      <DataMapperCSVSettings ref="dataMapperCSVSettingsRef" :dataMappingConfigDto="dataMappingConfigDto" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button type="primary" @click="onApply">Apply</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import DataMapperCSVSettings from "./Steps/DataMapperCSVSettings/DataMapperCSVSettings.vue";

const emit = defineEmits(["save"]);

const dataMapperCSVSettingsRef = ref(null);

let dataMappingConfigDto = ref({});

const dialogVisible = ref<boolean>(false);
const fileUploadType = ref<string>("replace");

function onApply() {
  if (dataMapperCSVSettingsRef.value.parsingError) return;

  dataMapperCSVSettingsRef.value.formRef.validate((valid: any) => {
    if (valid) {
      emit("save", {
        dataMappingConfigDto: dataMappingConfigDto.value,
        fileUploadType: fileUploadType.value
      });
      dialogVisible.value = false;
    }
  });
}

defineExpose({ dialogVisible, fileUploadType, dataMappingConfigDto });
</script>
