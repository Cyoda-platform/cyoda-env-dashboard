<template>
  <el-dialog
    :before-close="onBeforeClose"
    :close-on-press-escape="false"
    class="dialog-content-script-editor"
    append-to-body
    :close-on-click-modal="false"
    title="Content Script Editor"
    v-model="dialogVisible"
    width="90%">
    <div v-if="dialogVisible">
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

      <el-alert v-if="scriptErrors.length > 0" class="alert-scripts" :closable="false" title="Warning" type="warning"
                show-icon>
        <div>Not all script can be found. Not found {{ scriptErrors.length }} script(s)</div>
      </el-alert>

      <DialogContentScriptEditorErrors v-if="isExistScriptErrors" :allScriptsData="allScriptsData" />

      <div class="flex">
        <div class="column column-fields">
          <DialogContentScriptEditorFieldsFiles @data="onData" :script="selectedEntityMapping.script" />
          <DialogContentScriptEditorFields :script="selectedEntityMapping.script" />
        </div>
        <div class="column column-editor">
          <DialogContentScriptEditorFieldsUsedScripts @scriptErrors="onScriptErrors"
                                                      :script="selectedEntityMapping.script" />

          <div class="hint-block">
            function mapping(input, entity) {
          </div>
          <div ref="cyodaEditorRef"
               class="cyoda-resize-editor">
            <CyodaEditor
              v-loading="isLoading"
              v-model="selectedEntityMapping.script.body"
              :actions="editorActions"
              language="js"
              :style="{height: heightEditor}"
            />
          </div>
          <div class="hint-block">
            }
          </div>
        </div>
      </div>
    </div>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="onClose">Close</el-button>
      <DataMappingRunTest class="run-test-btn" :dataMappingConfigDto="dataMappingConfigDtoComputed"
                          :isDisableSave="false" @success="onSuccessRunTest" />
      <el-button :type="isNeedShowWarningMessageForRunTest ? 'danger' : 'primary'" @click="onSave">OK</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessageBox, ElNotification } from "element-plus";
import { ref, computed, watch, onMounted } from "vue";

import type { EntityMappingConfigDto, MappingConfigDto } from "./MappingConfigDto";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";
import DataMappingRunTest from "./DataMappingRunTest.vue";
import DialogContentScriptEditorFields from "./DialogContentScriptEditorFields/DialogContentScriptEditorFields.vue";
import DialogContentScriptEditorFieldsFiles
  from "./DialogContentScriptEditorFields/DialogContentScriptEditorFieldsFiles.vue";
import DialogContentScriptEditorFieldsUsedScripts
  from "./DialogContentScriptEditorFields/DialogContentScriptEditorFieldsUsedScripts.vue";
import DialogContentScriptEditorErrors from "./DialogContentScriptEditorErrors.vue";
import { useChatbotStore } from "@cyoda/ui-lib/src/stores/chatbot";
import * as monaco from "monaco-editor";
import { useResizeObserver } from "@vueuse/core";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";

const isValid = computed(() => {
  return listOfErrors.value.length == 0;
});

const listOfErrors = computed(() => {
  return [];
});

const cyodaEditorRef = ref(null);

const heightEditor = ref("400px");

useResizeObserver(cyodaEditorRef, (entries) => {
  const entry = entries[0];
  let { height } = entry.contentRect;
  heightEditor.value = `${height}px`;
});

const dataMappingConfigDtoComputed = computed(() => {
  if (!dataMappingConfigDto.value) return {};
  dataMappingConfigDto.value.entityMappings[selectedEntityMappingIndex.value] = JSON.parse(JSON.stringify(selectedEntityMapping.value));

  return dataMappingConfigDto.value;
});
const isExistScriptErrors = computed(() => {
  if (allScriptsData.value.linksErrors && Object.keys(allScriptsData.value.linksErrors).length > 0) return true;
  if (allScriptsData.value.structureErrors && Object.keys(allScriptsData.value.structureErrors).length > 0) return true;

  return false;
});
const isNeedShowWarningMessageForRunTest = computed(() => {
  return JSON.stringify(selectedEntityMappingBefore.value) !== JSON.stringify(selectedEntityMapping.value) && !isWasRunnedRunTest.value;
});

const selectedEntityMappingBefore = ref(null);
const selectedEntityMapping = ref(null);

const dataMappingConfigDtoBefore = ref(null);
const dataMappingConfigDto = ref(null);

const selectedEntityMappingIndex = ref(0);

const dialogVisible = ref<boolean>(false);
const isSaveBtnTouched = ref<boolean>(false);
const isWasRunnedRunTest = ref<boolean>(false);
let scriptErrors = ref([]);
let allScriptsData = ref({});
const isLoading = ref(false);
const chatbotStore = useChatbotStore();
const isChatBotEnabled = HelperFeatureFlags.isChatBotEnabled();

const editorActions = [];

const props = defineProps({
  chatBotId: {
    default: null
  }
});

onMounted(() => {
  if (isChatBotEnabled) addAutocompleteAction();
});

function addAutocompleteAction() {
  editorActions.push({
    id: "chatBot",
    label: "ChatBot Autocomplete",
    contextMenuGroupId: "chatbot",
    keybindings: [
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyA
    ],
    run: async (editor) => {
      if (!props.chatBotId) {
        ElMessageBox.alert("Please initialize the AI before using it", "Warning");
        return;
      }

      const selectedValue = editor.getModel().getValueInRange(editor.getSelection());

      if (!selectedValue) {
        ElMessageBox.alert("Please select text before use it", "Warning");
        return;
      }

      try {
        isLoading.value = true;
        const { data } = await chatbotStore.getMappingsAiChat({
          question: selectedValue,
          return_object: "autocomplete",
          chat_id: props.chatBotId,
          user_script: editor.getValue()
        });

        const position = editor.getPosition();
        const lineCount = editor.getModel().getLineCount();
        const message = data.message.replaceAll("```javascript", "").replaceAll("```", "").trim();
        let textToInsert = `/*\n${message}\n*/`;
        if (position.lineNumber === lineCount) {
          textToInsert = "\n" + textToInsert;
        } else {
          textToInsert = textToInsert + "\n";
        }
        const range = new monaco.Range(
          position.lineNumber + 1,
          1,
          position.lineNumber + 1,
          1
        );
        editor.executeEdits("DialogContentScriptEditor", [
          {
            range,
            text: textToInsert
          }
        ]);
        editor.setPosition({
          lineNumber: position.lineNumber + 1,
          column: textToInsert.length + 1
        });

        ElNotification({
          title: "Success",
          message: "The code was generated",
          type: "success"
        });
      } finally {
        isLoading.value = false;
      }

    }
  });
}

function reset() {
  isSaveBtnTouched.value = false;
}

function openDialog(selectedEntityMappingValue: EntityMappingConfigDto, dataMappingConfigDtoValue: MappingConfigDto, selectedEntityMappingIndexValue: number) {
  reset();
  selectedEntityMappingBefore.value = selectedEntityMappingValue;
  selectedEntityMapping.value = JSON.parse(JSON.stringify(selectedEntityMappingValue));

  dataMappingConfigDtoBefore.value = dataMappingConfigDtoValue;
  dataMappingConfigDto.value = JSON.parse(JSON.stringify(dataMappingConfigDtoValue));

  selectedEntityMappingIndex.value = selectedEntityMappingIndexValue;
  dialogVisible.value = true;
}

function onSave() {
  const saveAction = () => {
    isSaveBtnTouched.value = false;
    dataMappingConfigDtoBefore.value.entityMappings[selectedEntityMappingIndex.value] = JSON.parse(JSON.stringify(selectedEntityMapping.value));

    dialogVisible.value = false;
  };
  if (isNeedShowWarningMessageForRunTest.value) {
    ElMessageBox.confirm("You have untested changes. Please test before saving", "Warning", {
      confirmButtonText: "Save anyway",
      cancelButtonText: "Cancel",
      type: "warning"
    }).then(() => {
      saveAction();
    });
  } else {
    saveAction();
  }
}

function onClose() {
  if (JSON.stringify(selectedEntityMappingBefore.value) !== JSON.stringify(selectedEntityMapping.value)) {
    ElMessageBox.confirm("If you close the window you will lose your data. Are you sure?", "Warning", {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning"
    }).then(() => {
      dialogVisible.value = false;
    });
  } else {
    dialogVisible.value = false;
  }
}

async function onBeforeClose(done) {
  await onClose();
  if (!dialogVisible.value) done();
}

function onScriptErrors(data) {
  scriptErrors.value = data;
}

function onData(data) {
  allScriptsData.value = data;
}

function onSuccessRunTest() {
  isWasRunnedRunTest.value = true;
}

watch(
  () => selectedEntityMapping.value?.script,
  () => {
    isWasRunnedRunTest.value = false;
  },
  { deep: true }
);

defineExpose({ dialogVisible, isSaveBtnTouched, isWasRunnedRunTest, openDialog });
</script>

<style lang="scss">
.dialog-content-script-editor {
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

  .run-test-btn {
    margin: 0 10px;
  }

  .actions {
    text-align: right;
    margin-bottom: 10px;
  }

  .flex {
    display: flex;
    justify-content: stretch;

    .column-editor {
      flex-grow: 1;
    }

    .column-fields {
      width: 30%;
      padding-right: 10px;
      margin-right: 10px;
      border-right: 1px solid #dcdfe6;
    }
  }

  .alert-scripts {
    margin-bottom: 15px;
  }

  .cyoda-resize-editor {
    resize: vertical;
    overflow: hidden;
    min-height: 400px;
    max-height: 1000px;
  }

  .hint-block {
    background-color: #797a81;
    color: #fff;
    padding: 10px 20px;
    font-size: 16px;
  }
}
</style>
