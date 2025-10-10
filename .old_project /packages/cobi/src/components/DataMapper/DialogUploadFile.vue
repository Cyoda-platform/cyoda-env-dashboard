<template>
  <el-dialog append-to-body :close-on-click-modal="false" title="Upload File" v-model="dialogVisible" width="60%">
    <el-form ref="formRef" :model="form" label-width="120px">
      <el-form-item label="Upload type">
        <el-radio-group v-model="form.selectedFileUploadType">
          <el-radio-button v-for="fileUploadType in fileUploadTypes" :key="fileUploadType.key" :label="fileUploadType.key">
            {{ fileUploadType.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div class="dialog-upload-file">
      <UploadFile @save="onSaveNewFile" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import UploadFile from "../../components/DataMapper/UploadFile.vue";
import _ from "lodash";
import HelperContent from "../../helpers/HelperContent";

const emit = defineEmits(["openCSVSettings", "save"]);
const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});

const dialogVisible = ref<boolean>(false);
let fileUploadTypes = ref([
  {
    key: "replace",
    label: "Replace"
  },
  {
    key: "merge",
    label: "Merge"
  }
]);
let form = ref({
  selectedFileUploadType: "replace"
});

let defaultForm = ref(JSON.parse(JSON.stringify(form.value)));

function onSaveNewFile(content: string) {
  dialogVisible.value = false;
  if (form.value.selectedFileUploadType === "merge" && props.dataMappingConfigDto.dataType !== "CSV") {
    if (props.dataMappingConfigDto.dataType === "JSON") {
      const sampleContent = JSON.parse(props.dataMappingConfigDto.sampleContent);
      content = _.merge(sampleContent, JSON.parse(content));
      content = JSON.stringify(content);
    } else if (props.dataMappingConfigDto.dataType === "XML") {
      const sampleContent = HelperContent.parseXml(props.dataMappingConfigDto.sampleContent);
      content = _.merge(sampleContent, HelperContent.parseXml(content));
      content = HelperContent.prettyContent(HelperContent.buildXml(content), "xml");
    }
  }

  const saveObj = { content, fileUploadType: form.value.selectedFileUploadType };
  if (props.dataMappingConfigDto.dataType === "CSV") {
    emit("openCSVSettings", saveObj);
  } else {
    emit("save", saveObj);
  }
}

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm.value));
}

watch(dialogVisible, (val) => {
  if (!val) resetForm();
});

defineExpose({ dialogVisible });
</script>

<style lang="scss">
.dialog-upload-file {
  max-width: 410px;
  margin: 0 auto;
  text-align: center;
}
</style>
