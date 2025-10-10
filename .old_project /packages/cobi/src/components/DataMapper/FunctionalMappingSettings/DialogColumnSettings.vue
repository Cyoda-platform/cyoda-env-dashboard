<template>
  <el-dialog ref="rootRef" draggable class="dialog-column-settings dialog-column-settings-functional cyoda-dialog"
             append-to-body @dragStart="onDragStart"
             @dragStop="onDragStop" :fullscreen="isFullscreen" :close-on-click-modal="false" v-model="dialogVisible"
             :before-close="handleClose" overflow width="80%">
    <template #header>
      <div class="title">
        <div>Settings</div>
        <div class="wrap-icon">
          <font-awesome-icon class="toggle-fullscreen" @click.prevent="toggleFullscreen"
                             :icon="isFullscreen ? 'compress-arrows-alt' : 'window-maximize'"/>
        </div>
      </div>
    </template>
    <el-alert class="error-alerts" v-if="allErrorMessages.length > 0" title="Errors" type="error" :closable="false"
              show-icon>
      <div>
        <ol>
          <li v-for="(allErrorMessage, index) in allErrorMessages" :key="index">{{ allErrorMessage }}</li>
        </ol>
      </div>
    </el-alert>

    <el-form ref="formRef" label-position="top" label-width="120px">
      <FunctionalMapping
        :isDialogDragged="isDialogDragged"
        :blocklyHeight="blocklyHeight"
        :class="{
          'full-screen': isFullscreen
        }"
        v-if="isFunctionalMappingVisible"
        @onReInitBlockly="onReInitBlockly"
        ref="functionalMappingRef"
        @codeChange="onCodeChange"
        v-model:workspace="blocklyWorkspace"
        :functionalMappingConfig="functionalMappingConfig"
        :selectedEntityMapping="selectedEntityMapping"
      />
    </el-form>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="onCloseDialog">Close</el-button>
      <DataMappingRunTest class="data-mapping-run-test" :isValidJson="isValidJson"
                          :dataMappingConfigDto="dataMappingConfigDtoForTest"/>
      <el-button :disabled="isDisabledSaveBtn" type="primary" @click="onClickSave">OK</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ElMessageBox} from "element-plus";
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import {ref, nextTick, computed, watch, onMounted, inject} from "vue";

import HelperContent from "../../../helpers/HelperContent";
import FunctionalMapping
  from "../../../components/DataMapper/FunctionalMappingSettings/FunctionalMapping/FunctionalMapping.vue";
import type {FunctionalMappingConfigDto} from "../../../components/DataMapper/MappingConfigDto";
import * as Blockly from "blockly/core";
// import CyodaDialog from "../../../extends/elementui/dialog/main.vue";
import DataMappingRunTest from "../DataMappingRunTest.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  }
});
const rootRef = ref(null);
const platformMappingStore = usePlatformMappingStore();
const listAllTransformers = computed(() => {
  return platformMappingStore.listAllTransformers;
});
const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const isDisabledSaveBtn = computed(() => {
  return false;
});
const isDataWasChangedAndNotSaved = computed(() => {
  return functionalMappingConfigBeforeString.value !== JSON.stringify(functionalMappingConfig.value) || codeBeforeString.value !== functionalMappingRef.value.code;
});

const formRef = ref(null);

const functionalMappingRef = ref(null);

const getDataMappingConfigDto = inject("getDataMappingConfigDto");

const isDialogDragged = ref<boolean>(false);
const functionalMappingConfigBeforeString = ref<string>("");
let dataMappingConfigDtoForTest = ref({});
const codeBeforeString = ref<string>("");
let functionalMappingConfigBefore = ref({});
let positionBeforeToggle = ref({
  left: null,
  top: null
});

const activeForm = ref(null);

const isFullscreen = ref<boolean>(false);
const isValidJson = ref<boolean>(false);
const isFunctionalMappingVisible = ref<boolean>(false);
const blocklyHeight = ref(450);
let blocklyWorkspace = null;

let functionalMappingConfig = ref({});

let transformer = ref({
  type: "COMPOSITE",
  children: []
});

let allErrorMessages = ref([]);

const showErrorLastTransform = ref<boolean>(false);

const dialogVisible = ref<boolean>(false);

function openDialogAndEditRecord(functionalMappingConfigProp: FunctionalMappingConfigDto) {
  dialogVisible.value = true;
  codeBeforeString.value = "";
  functionalMappingConfigBefore.value = functionalMappingConfigProp;
  functionalMappingConfigBeforeString.value = JSON.stringify(functionalMappingConfigProp);
  functionalMappingConfig.value = JSON.parse(JSON.stringify(functionalMappingConfigProp));
}

async function onClickSave() {
  if (isValid()) {
    const code = JSON.parse(functionalMappingRef.value.code || "{}");
    Object.assign(functionalMappingConfigBefore.value, functionalMappingConfig.value);
    functionalMappingConfigBefore.value.statements = code.statements || [];
    dialogVisible.value = false;

    functionalMappingConfigBefore.value.metaPaths = getMetaPaths();

    removeContentForMetaPaths();
    await nextTick();

    eventBus.$emit("updateRelations");
  }
}

function getMetaPaths() {
  const metaPaths = [];
  functionalMappingRef.value.getBlocksByType("expression_meta_value_read").forEach((el) => {
    metaPaths.push(el.getFieldValue("NAME"));
  });
  return metaPaths;
}

function resetForm() {
  transformer.value.children = [];
}

function handleClose(done) {
  if (isDataWasChangedAndNotSaved.value) {
    dialogCheckDataWasChanged(done);
  } else {
    done();
    removeContentForMetaPaths();
  }
}

function onCloseDialog() {
  if (isDataWasChangedAndNotSaved.value) {
    dialogCheckDataWasChanged(() => {
      dialogVisible.value = false;
    });
    return;
  }
  dialogVisible.value = false;
  removeContentForMetaPaths();
}

function dialogCheckDataWasChanged(callback) {
  ElMessageBox.confirm("If you close the window you will lose your data. Are you sure?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  }).then(() => {
    callback();
    removeContentForMetaPaths();
  });
}

function removeContentForMetaPaths() {
  if (functionalMappingConfigBefore.value.srcPaths.length > 0
    ||functionalMappingConfigBefore.value.metaPaths.length > 0
    || functionalMappingConfigBefore.value.statements.length > 0
  ) return;
  props.selectedEntityMapping.functionalMappings = props.selectedEntityMapping.functionalMappings.filter((el) => el.dstPath !== functionalMappingConfigBefore.value.dstPath);
}

onMounted(() => {
  // new ResizeObserver(detectResizeFunctionalMapping).observe(formRef.value.rootRef.value);
});

function isValid(isOnlyReturn = false) {
  const blockLyErrors: string[] = [];

  if (functionalMappingRef.value.code && !HelperContent.isJsonValid(functionalMappingRef.value.code)) {
    blockLyErrors.push("Data is not valid");
  }
  const allErrors = [...blockLyErrors];
  if (isOnlyReturn) {
    return allErrors.length === 0;
  }

  allErrorMessages.value = allErrors;
  return allErrorMessages.value.length === 0;
}

async function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  await nextTick();

  Blockly.svgResize(blocklyWorkspace);
}

function detectResizeFunctionalMapping() {
  if (functionalMappingRef.value && blocklyWorkspace) {
    Blockly.svgResize(blocklyWorkspace);
  }
}

function onCodeChange(data) {
  if (!codeBeforeString.value) {
    codeBeforeString.value = data;
  }

  isValidJson.value = true;
  if (!isValid(true)) {
    isValidJson.value = false;
    return;
  }

  const code = JSON.parse(data || "{}");
  dataMappingConfigDtoForTest.value = JSON.parse(JSON.stringify(getDataMappingConfigDto()));
  dataMappingConfigDtoForTest.value.entityMappings.forEach((entityMapping) => {
    entityMapping.functionalMappings.forEach((functionalMapping) => {
      if (functionalMapping.dstPath === functionalMappingConfigBefore.value.dstPath) {
        functionalMapping.statements = code.statements || [];
        functionalMapping.metaPaths = getMetaPaths();
      }
    });
  });
}

async function onReInitBlockly() {
  isFunctionalMappingVisible.value = false;
  await nextTick();

  isFunctionalMappingVisible.value = true;
}

function onDragStart() {
  isDialogDragged.value = true;
}

function onDragStop() {
  isDialogDragged.value = false;
}

watch(
  dialogVisible,
  (value) => {
    isFunctionalMappingVisible.value = value;
  },
  {immediate: true}
);

defineExpose({dialogVisible, openDialogAndEditRecord});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.dialog-column-settings-functional {
  .dialog-title {
    margin-top: 0;
    margin-bottom: 10px;
  }

  .dialog-title-info {
    overflow-wrap: break-word;

    div {
      margin-bottom: 5px;
    }
  }

  h3 {
    margin: 40px 0 0;
  }

  ol {
    padding-left: 15px;
  }

  .error-alerts {
    margin-bottom: 10px;
  }

  .toggle-fullscreen {
    cursor: pointer;
    position: absolute;
    right: 65px;
    top: 18px;
  }

  .el-dialog__body {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .data-mapping-run-test {
    margin: 0 10px;
  }
}
</style>
