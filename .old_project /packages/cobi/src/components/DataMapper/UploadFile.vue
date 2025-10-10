<template>
  <div class="upload-file">
    <el-upload :accept="acceptFileTypes" action="#" class="upload" drag :auto-upload="false"
               :multiple="isMultipleUpload" :on-change="onChange" :show-file-list="false">
      <el-icon class="el-icon--upload">
        <upload-filled/>
      </el-icon>
      <div class="el-upload__text">
        <template v-if="isMultipleUpload"> Drop file(s) here or <em>click to upload</em></template>
        <template v-else> Drop file here or <em>click to upload</em></template>
      </div>
    </el-upload>

    <DialogContentEditor @beforeSave="onBeforeSaveDialogContent" ref="dialogContentEditorRef"/>

    <template v-if="isEnableEditor">
      <div class="actions-upload-file">
        <el-button @click="onOpenEditor" type="primary">
          Open Editor
          <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {UploadFilled} from "@element-plus/icons-vue";
import {ref, reactive, computed} from "vue";

import DialogContentEditor from "../../components/DataMapper/DialogContentEditor.vue";
import HelperContent from "../../helpers/HelperContent";

import HelperConstants from "../../helpers/HelperConstants";
import _ from "lodash";
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import {ElMessage} from "element-plus";

const emit = defineEmits(["save", "save"]);
const props = defineProps({
  isEnableEditor: {
    default: false
  },
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  },
});
const platformMappingStore = usePlatformMappingStore();

const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const isMultipleUpload = computed(() => {
  return ["JSON", "XML"].includes(dataType.value);
});
const minFileSizeForEditKb = computed(() => {
  return HelperConstants.MIN_FILE_SIZE_FOR_EDIT_KB;
});
const maxFileSizeKb = computed(() => {
  return HelperConstants.MAX_FILE_SIZE_KB;
});
const acceptFileTypes = computed(() => {
  if (dataType.value === "JSON") {
    return ".json";
  } else if (dataType.value === "XML") {
    return ".xml";
  } else if (dataType.value === "CSV") {
    return ".csv";
  }
  return "*";
});

const dialogContentEditorRef = ref(null);

const dialogVisible = ref<boolean>(false);
let contents = reactive([]);
const timeoutId = ref(null);

async function onChange(fileElement: any) {
  const file = fileElement.raw;
  const fileName = file.name;
  let contentSave: string = "";

  if (dataType.value === "JSON") {
    try {
      contentSave = await getContent(file);
      const isJsonValid = HelperContent.isJsonValid(contentSave);
      if (!isJsonValid) {
        ElMessage.error(`File "${fileName}" is not valid json!`);
        return false;
      }
    } catch (e) {
      ElMessage.error(`Error with reading file ${fileName}!`);
      return false;
    }
  } else if (dataType.value === "XML") {
    try {
      contentSave = await getContent(file);
      const isXmlValid = HelperContent.isXmlValid(contentSave);
      if (!isXmlValid) {
        ElMessage.error(`File "${fileName}" is not valid xml!`);
        return false;
      }
    } catch (e) {
      ElMessage.error(`Error with reading file "${fileName}"!`);
      return false;
    }
  } else if (dataType.value === "CSV") {
    try {
      contentSave = await getContent(file);
      const isCsvValid = HelperContent.isCsvValid(contentSave);
      if (!isCsvValid) {
        ElMessage.error(`File "${fileName}" is not valid csv!`);
        return false;
      }
    } catch (e) {
      ElMessage.error(`Error with reading file "${fileName}"!`);
      return false;
    }
  } else {
    ElMessage.error(`You upload not correct file "${fileName}"!`);
    return false;
  }

  contents.push(contentSave);
  saveContent();

  return false;
}

function saveContent() {
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = setTimeout(() => {
    let contentSave = "";
    if (["JSON", "XML"].includes(dataType.value)) {
      const contentsTmp = contents.reverse().map((el) => {
        if (dataType.value === "JSON") {
          return JSON.parse(el);
        } else if (dataType.value === "XML") {
          return HelperContent.parseXml(el);
        }
      });
      contentSave = _.merge(contentsTmp[0], ...contentsTmp);
      if (dataType.value === "XML") {
        contentSave = HelperContent.buildXml(contentSave);
      } else if (dataType.value === "JSON") {
        contentSave = JSON.stringify(contentSave);
      }
    } else if (dataType.value === "CSV") {
      contentSave = contents[0];
    }
    dialogVisible.value = false;
    emit("save", contentSave);
    contents = [];
  }, 500);
}

function onBeforeSaveDialogContent(content: string) {
  emit("save", content);

  dialogContentEditorRef.value.content = "";

  dialogContentEditorRef.value.dialogVisible = false;
}

function getContent(file: File) {
  let reader = new FileReader();
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

function onOpenEditor() {
  const sampleContent = props.dataMappingConfigDto.sampleContent || "";
  dialogContentEditorRef.value.content = sampleContent;
  dialogContentEditorRef.value.dialogVisible = true;
}

defineExpose({dialogVisible});
</script>

<style lang="scss">
.upload-file {
  max-width: 410px;
  margin: 0 auto;
  text-align: center;

  .actions-upload-file {
    margin-top: 20px;
  }
}
</style>
