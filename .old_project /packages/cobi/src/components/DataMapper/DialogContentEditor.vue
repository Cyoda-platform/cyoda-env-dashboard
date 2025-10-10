<template>
  <el-dialog append-to-body :close-on-click-modal="false" title="Content Editor" v-model="dialogVisible" width="90%">
    <div class="dialog-content-editor">
      <template v-if="listOfErrors.length > 0 && isSaveBtnTouched">
        <el-alert class="alert-box" title="Errors!" type="error" :closable="false" show-icon>
          Editor contains several errors:
          <ol>
            <li v-for="error in listOfErrors" :key="error">
              {{ error }}
            </li>
          </ol>
        </el-alert>
      </template>
      <CyodaEditor v-if="dialogVisible" v-model="content" :language="getMode" />
      <div class="info"><strong>Content size:</strong> {{ fileSize }}kb</div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button type="primary" @click="onSave">OK</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../stores/platform-mapping";
import { ElNotification } from "element-plus";
import { ref, computed, watch } from "vue";

import HelperContent from "../../helpers/HelperContent";

import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

const emit = defineEmits(["beforeSave"]);
const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});
const platformMappingStore = usePlatformMappingStore();
const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const getMode = computed(() => {
  if (dataType.value === "JSON") {
    return "json";
  } else if (dataType.value === "XML") {
    return "xml";
  } else if (dataType.value === "CSV") {
    return "text/csv";
  }
  return "text/plain";
});
const isValid = computed(() => {
  return listOfErrors.value.length == 0;
});
const fileSize = computed(() => {
  return Math.ceil(content.value.length / 1024);
});
const listOfErrors = computed(() => {
  const data: any[] = [];
  if (dataType.value == "JSON" && !HelperContent.isJsonValid(content.value)) {
    data.push("Content is not valid json");
  } else if (dataType.value == "XML" && !HelperContent.isXmlValid(content.value)) {
    data.push("Content is not valid xml");
  }
  return data;
});

const content = ref<string>("");

const dialogVisible = ref<boolean>(false);
const isSaveBtnTouched = ref<boolean>(false);

function onSave() {
  isSaveBtnTouched.value = false;
  if (isValid.value) {
    emit("beforeSave", content.value);
  } else {
    ElNotification({ type: "error", title: "Error", message: "Editor have errors!" });
    isSaveBtnTouched.value = true;
  }
}

function reset() {
  isSaveBtnTouched.value = false;
}

watch(dialogVisible, (val: boolean) => {
  if (val) {
    reset();
  }
});

defineExpose({ dialogVisible, isSaveBtnTouched, content });
</script>

<style lang="scss">
.CyodaEditor {
  height: 400px;
}

.dialog-content-editor {
  .alert-box {
    margin-bottom: 10px !important;

    ol {
      padding-left: 15px;
      margin-top: 10px;
    }
  }

  .info {
    margin-top: 10px;
  }
}
</style>
