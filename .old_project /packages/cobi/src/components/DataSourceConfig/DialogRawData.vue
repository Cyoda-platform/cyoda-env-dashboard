<template>
  <el-drawer append-to-body z-index="5000" direction="rtl" :close-on-click-modal="false" title="Raw data"
             v-model="dialogVisible" size="50%">
    <template v-if="isEmptyContent">
      <el-alert :closable="false" title="No Data" type="warning"
                description="We have not received any content for display" show-icon></el-alert>
    </template>
    <template v-else>
      <pre :class="codeObj.class"><code :class="codeObj.class" v-html="codeObj.code"></code></pre>
    </template>
    <div v-if="!isPossibleToCreateNewDataMapperConfig">
      <el-divider></el-divider>
      <div class="define-content-desc">We can not define automatic type of content, please select manually:</div>
      <el-form :model="form" label-width="120px">
        <el-form-item label="Content Type">
          <el-select :teleported="false" v-model="form.type" clearable placeholder="Select">
            <el-option v-for="item in optionsTypes" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <el-divider></el-divider>
    <div class="demo-drawer__footer">
      <el-button @click="dialogVisible = false">Close</el-button>
      <template v-if="!isEmptyContent">
        <el-button @click="onSaveFile" type="success">
          Save file
          <font-awesome-icon icon="download"/>
        </el-button>
        <el-button :disabled="isCreateNewDisabled" @click="onCreateNewDataMapperConfig" type="primary">
          Create new data mapper config
          <font-awesome-icon icon="plus"/>
        </el-button>
      </template>
    </div>
    <DialogCreateDataMapping v-if="dialogCreateDataMappingVisible" ref="dialogCreateDataMappingRef"/>
    <DialogContentEditor @beforeSave="onBeforeSaveDialogContent" ref="dialogContentEditorRef"/>
  </el-drawer>
</template>

<script setup lang="ts">
import {ref, nextTick, computed} from "vue";
import FileSaver from "file-saver";

import Prism from "prismjs";
import "prismjs/themes/prism.css";

import HelperContent from "../../helpers/HelperContent";
import DialogCreateDataMapping from "../../components/DataSourceConfig/DialogCreateDataMapping.vue";
import moment from "moment";
import HelperConstants from "../../helpers/HelperConstants";
import DialogContentEditor from "@cyoda/cobi/src/components/DataMapper/DialogContentEditor.vue";

const props = defineProps({
  content: {
    default: () => {
      return {};
    }
  }
});
const codeObj = computed(() => {
  if (!props.content) return {};
  if (HelperContent.getFileType(props.content) === "json") {
    return {
      class: "language-javascript",
      code: Prism.highlight(HelperContent.prettyContent(props.content), Prism.languages.javascript, "javascript")
    };
  } else if (HelperContent.getFileType(props.content) === "xml") {
    return {
      class: "language-xml",
      code: Prism.highlight(HelperContent.prettyContent(props.content), Prism.languages.xml, "xml")
    };
  } else {
    return {
      class: "language-html",
      code: Prism.highlight(props.content, Prism.languages.html, "html")
    };
  }
});
const isPossibleToCreateNewDataMapperConfig = computed(() => {
  return ["xml", "json"].indexOf(HelperContent.getFileType(props.content)) > -1;
});
const isCreateNewDisabled = computed(() => {
  return !(isPossibleToCreateNewDataMapperConfig.value || form.value.type);
});
const fileSizeInKb = computed(() => {
  return (props.content || "").length / 1024;
});
const minFileSizeForEditKb = computed(() => {
  return HelperConstants.MIN_FILE_SIZE_FOR_EDIT_KB;
});
const maxFileSizeKb = computed(() => {
  return HelperConstants.MAX_FILE_SIZE_KB;
});
const isEmptyContent = computed(() => {
  return ["{}", ""].includes(props.content);
});

const dialogCreateDataMappingRef = ref(null);

const dialogContentEditorRef = ref(null);

const dialogVisible = ref<boolean>(false);
const dialogCreateDataMappingVisible = ref<boolean>(true);

let form = ref({
  type: null
});

let optionsTypes = ref([
  {
    value: "CSV",
    label: "Csv"
  }
]);

async function onCreateNewDataMapperConfig() {
  dialogCreateDataMappingVisible.value = false;
  await nextTick();

  dialogCreateDataMappingVisible.value = true;
  await nextTick();
  setContentToMapConfig(props.content);
  dialogVisible.value = false;
}

async function setContentToMapConfig(content) {
  dialogCreateDataMappingRef.value.dialogVisible = true;
  await nextTick();

  dialogCreateDataMappingRef.value.dataMapperEditRef.dataMappingConfigDto.sampleContent = content;
  if (["json", "xml"].includes(HelperContent.getFileType(props.content)) || form.value.type) {
    dialogCreateDataMappingRef.value.dataMapperEditRef.dataMappingConfigDto.dataType = form.value.type || HelperContent.getFileType(props.content).toUpperCase();
  }
}

function onSaveFile() {
  const file = new File([props.content], `file_${moment().format("YYYY-MM-DD HH:mm:ss")}.${HelperContent.getFileType(props.content)}`, {type: "text/plain;charset=utf-8"});
  FileSaver(file, file.name, {autoBom: false});
}

function onBeforeSaveDialogContent(content: string) {
  dialogContentEditorRef.value.content = "";
  dialogContentEditorRef.value.dialogVisible = false;
  setContentToMapConfig(content);
}

defineExpose({dialogVisible, dialogCreateDataMappingVisible});
</script>

<style scoped lang="scss">
pre {
  max-height: calc(100vh - 140px);
}

.define-content-desc {
  margin-bottom: 10px;
}
</style>
