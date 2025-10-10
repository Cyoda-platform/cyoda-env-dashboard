<template>
  <div v-loading="isLoading" class="data-mapper-edit">
    <template v-if="!action">
      <portal to="header-title">
        {{ titleComputed }}
      </portal>
    </template>
    <el-steps
      :active="activeStep"
      align-center
      :class="{
        'steps-is-edit': !isNew
      }"
    >
      <el-step v-for="(step, index) in steps" :key="index" @click.native="changeNavigationToStep(index)" :title="step"/>
    </el-steps>
    <div class="step-inner" v-if="steps[activeStep] === 'Default Settings'">
      <DataMapperDefaultSettings ref="dataMapperDefaultSettingsRef" :dataMappingConfigDto="dataMappingConfigDto"/>
    </div>
    <div class="step-inner" v-if="steps[activeStep] === 'Upload File'">
      <DataMapperUploadFile :isVirtual="isVirtual" :dataMappingConfigDto="dataMappingConfigDto"
                            @save="onSaveDataMapperUploadFile"/>
    </div>
    <div class="step-inner" v-if="steps[activeStep] === 'CSV Settings'">
      <DataMapperCSVSettings ref="dataMapperCSVSettingsRef" :dataMappingConfigDto="dataMappingConfigDto"/>
    </div>
    <div class="step-inner" v-if="steps[activeStep] === 'Entity'">
      <DataMapperSelectEntity :noneMappingFields="noneMappingFields" :sourceData="sourceData"
                              ref="dataMapperSelectEntityRef" :dataMappingConfigDto="dataMappingConfigDto"/>
    </div>
    <div class="step-inner" v-if="steps[activeStep] === 'Data Mapping'">
      <DataMapper :action="action" :sourceData="sourceData" @reset="onReset" :isSaveButtonTouched="isSaveButtonTouched"
                  ref="dataMapperRef" :dataMappingConfigDto="dataMappingConfigDto"
                  :noneMappingFields="noneMappingFields"
                  :chatBotId="chatBotId"
                  :isChatBotReady="isChatBotReady"/>
    </div>
    <div class="actions action-footer">
      <portal to="data-mapper-edit-actions" :disabled="!action">
        <el-button :disabled="isDisablePrevStep" @click="onClickPrevStep" type="default">
          <font-awesome-icon icon="arrow-left"/>
          Previous step
        </el-button>
        <el-button :disabled="isDisableNextStep" @click="onClickNextStep" type="primary">
          Next step
          <font-awesome-icon icon="arrow-right"/>
        </el-button>

        <el-divider direction="vertical"/>

        <el-button v-if="!isVirtual" :disabled="isDisableSave" @click="onClickSaveInFile" type="info">
          Save config in file
          <font-awesome-icon icon="save"/>
        </el-button>

        <DataMappingRunTest class="data-mapping-run-test-btn" :dataMappingConfigDto="dataMappingConfigDto"
                            :isDisableSave="isDisableSave"/>

        <el-button v-if="!isNew && !isCreatedPopup" :loading="isLoading" :disabled="isDisableSave"
                   @click="onClickSaveStep(true)"
                   type="success">
          Save
          <font-awesome-icon icon="save"/>
        </el-button>

        <el-button :loading="isLoading" :disabled="isDisableSave" @click="onClickSaveStep(false)" type="success">
          Save & close
          <font-awesome-icon icon="save"/>
        </el-button>

        <AIChatBot
          v-if="isChatBotEnabled && chatBotId"
          v-model:ready="isChatBotReady"
          ref="aIChatBotRef"
          :id="chatBotId"
          :hiddenReturnObject="hiddenReturnObject"
          :chatBotDefaultMessages="chatBotDefaultMessages"
          :disabled="isDisableSave"
          :initialFn="initialFn"
          :submitMessageFn="submitMessageFn"
          :axiosChatBotController="axiosChatBotController"
          defaultReturnObject="random"
          category="mappings"
        />
      </portal>
    </div>
    <ConfigsCompareDialog @acceptTheirs="onAcceptTheirs" @acceptYours="onSaveCompareDialog" @save="onSaveCompareDialog"
                          ref="configsCompareDialogRef"/>
    <ConfigsCompareDialog v-if="helperPollingChanges"
                          acceptTheirsMessage="We will replace your data by data from server. Confirm?"
                          acceptYoursMessage="We will use your data. Confirm?"
                          @acceptTheirs="helperPollingChangesOnAcceptTheirs"
                          @acceptYours="helperPollingChangesOnAcceptYours"
                          @save="helperPollingChanges.onSave($event)"
                          ref="configsCompareDialogPollingRef"/>
  </div>
</template>

<script setup lang="ts">
import {useDataSourceConfigStore} from "../../stores/data-source-config";
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import {ElNotification, ElMessageBox} from "element-plus";
import {useRouter, useRoute} from "vue-router";
import {ref, nextTick, computed, watch, onBeforeUnmount, provide, reactive, onMounted} from "vue";

import DataMapperDefaultSettings from "../../components/DataMapper/Steps/DataMapperDefaultSettings.vue";
import DataMapper from "../../components/DataMapper/DataMapper.vue";

import HelperErrors from "@cyoda/ui-lib/src/helpers/HelperErrors";
import DataMapperUploadFile from "../../components/DataMapper/Steps/DataMapperUploadFile.vue";
import DataMapperSelectEntity from "../../components/DataMapper/Steps/DataMapperSelectEntity.vue";
import HelperContent from "../../helpers/HelperContent";
import type {MappingConfigDto} from "../../components/DataMapper/MappingConfigDto";
import HelperMapper from "../../helpers/HelperMapper";
import FileSaver from "file-saver";
import {useAutoSavingMixin} from "../../mixins/AutoSavingMixin";

import DataMappingRunTest from "../../components/DataMapper/DataMappingRunTest.vue";
import DataMapperCSVSettings from "../../components/DataMapper/Steps/DataMapperCSVSettings/DataMapperCSVSettings.vue";
import * as api from "@cyoda/ui-lib/src/api";
import {setUid} from "../../helpers/HelperEntityMappingConfigId";
import HelperPollingChanges from "../../helpers/HelperPollingChanges";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import ConfigsCompareDialog from "../../components/ConfigsCompareDialog/ConfigsCompareDialog.vue";
import AIChatBot from "@cyoda/ui-lib/src/components-library/elements/AIChatBot/AIChatBot.vue";
import {useChatbotStore} from "@cyoda/ui-lib/src/stores/chatbot";
import {handlerError} from "@cyoda/ui-lib/src/helpers/HelperChatbot";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";
import {v4 as uuidv4} from "uuid";

const {
  autoDataStorageKey,
  isEnableAutoSaving,
  autoSave,
  isAvailableDraft,
  findAutoSaveRecordById,
  notFoundVirtualRecord,
  deleteAutoSaveRecordById,
  currentAutoSaveRecord
} = useAutoSavingMixin();

const props = defineProps({action: {default: null}});
const route = useRoute();
const router = useRouter();
const platformMappingStore = usePlatformMappingStore();
const dataSourceConfigStore = useDataSourceConfigStore();
const chatbotStore = useChatbotStore();
const isChatBotEnabled = HelperFeatureFlags.isChatBotEnabled();
const aIChatBotRef = ref(null);

const isDisablePrevStep = computed(() => {
  return activeStep.value === 0;
});
const isDisableNextStep = computed(() => {
  if (activeStep.value == 1 && !dataMappingConfigDto.value.sampleContent) {
    return true;
  }
  return activeStep.value == steps.value.length - 1;
});
const isDisableSave = computed(() => {
  if (dataMappingConfigDto.value.entityMappings && dataMappingConfigDto.value.entityMappings.length > 0 && isDisableNextStep.value) {
    return false;
  } else {
    return true;
  }
});
const platformVersion = computed(() => {
  return platform.value.version || "-";
});

const isCreatedPopup = computed(() => {
  return props.action === "create:popup";
})

const steps = computed(() => {
  const data: any[] = [];
  data.push("Default Settings");
  if (isCreatedPopup.value) {
    if (!dataMappingConfigDto.value.id) {
      data.push("Entity");
    }
  } else {
    if (isNew.value && !isExistEntity.value) {
      data.push("Upload File");
      if (dataMappingConfigDto.value.dataType === "CSV") data.push("CSV Settings");
      data.push("Entity");
    }
  }
  data.push("Data Mapping");
  return data;
});
const isVirtual = computed(() => {
  return route.query.virtual === "true";
});
const isNew = computed(() => {
  return route.query.action === "new" || route.query.virtual === "true";
});
const sourceData = computed(() => {
  return HelperContent.getSourceData(dataMappingConfigDto.value.sampleContent, dataMappingConfigDto.value);
});
const isCanBeUploadedFiles = computed(() => {
  return HelperMapper.isCanBeUploadedFile(dataMappingConfigDto.value.dataType);
});
const titleComputed = computed(() => {
  let title = "";
  if (route.params.id) {
    title = `Data Mapper Configuration Edit: ${dataMappingConfigDto.value.name}`;
  } else {
    title = "Data Mapping";
  }
  if (isDataWasChangedAndNotSaved.value) title += "*";
  return title;
});
const isDataWasChangedAndNotSaved = computed(() => {
  if (dataMappingConfigDtoStringBefore.value) {
    return dataMappingConfigDtoStringAfter.value !== dataMappingConfigDtoStringBefore.value;
  }
  return false;
});

function postSave(dataMappingConfigDto) {
  return platformMappingStore.postSave(dataMappingConfigDto);
}

function getDataMapping(id) {
  return platformMappingStore.getDataMapping(id);
}

function setTypeContent() {
  return platformMappingStore.setTypeContent();
}

function exportCobiForKeys(value) {
  return dataSourceConfigStore.exportCobiForKeys(value);
}

function pluginsSetup() {
  return dataSourceConfigStore.pluginsSetup();
}

const dataMapperDefaultSettingsRef = ref(null);

const dataMapperRef = ref(null);

const dataMapperSelectEntityRef = ref(null);

const dataMapperCSVSettingsRef = ref(null);

const configsCompareDialogRef = ref(null);

const configsCompareDialogPollingRef = ref(null);

const activeStep = ref(0);
const isLoading = ref<boolean>(false);
const isSaveButtonTouched = ref<boolean>(false);
const isExistContent = ref<boolean>(false);
const isExistEntity = ref<boolean>(false);
let platform = ref({});
let uiVersion = ref(import.meta.env.VITE_APP_UI_VERSION!);
let noneMappingFields = ref([]);
const helperPollingChanges = ref(null);
const isChatBotReady = ref(false);
const chatBotIdCreatedPopup = ref(null);

onMounted(() => {
  initChatBotIdForCreatedPopup();
})

function initChatBotIdForCreatedPopup() {
  if (!isCreatedPopup.value) return;
  setTimeout(() => {
    chatBotIdCreatedPopup.value = uuidv4();
  }, 2000);
}

const selectedEntityMapping = computed(() => {
  return dataMapperRef.value?.selectedEntityMapping;
})

const chatBotId = computed(() => {
  if (isCreatedPopup.value) {
    return dataMappingConfigDto.value.id || chatBotIdCreatedPopup.value;
  }
  return route.params.id || dataMappingConfigDto.value?.virtual?.id || dataMappingConfigDto.value.id;
})

let dataMappingConfigDto = ref({
  "@bean": "com.cyoda.plugins.mapping.core.dtos.DataMappingConfigDto",
  id: null,
  sampleContent: "",
  dataType: "JSON",
  name: "",
  description: "",
  entityMappings: [],
  metadata: "",
  chatBotId: null,
  parserParameters: {
    "@bean": "com.cyoda.plugins.mapping.core.dtos.CSVParserParametersDto",
    withHeader: false,
    headers: [],
    delimiter: null,
    quoteChar: null
  }
});

let dataMappingConfigDtoDefault = ref(JSON.parse(JSON.stringify(dataMappingConfigDto.value)));

const dataMappingConfigDtoStringBefore = ref<string>("");
const dataMappingConfigDtoStringAfter = ref<string>("");

function onClickPrevStep() {
  if (activeStep.value > 0) {
    activeStep.value -= 1;
  }
}

function onClickNextStep() {
  const stepName = steps.value[activeStep.value];
  if (stepName == "Default Settings") {
    dataMapperDefaultSettingsRef.value.formRef.validate((valid) => {
      if (valid) {
        activeStep.value += 1;
      }
    });
  } else if (stepName == "CSV Settings") {
    dataMapperCSVSettingsRef.value.formRef.validate((valid) => {
      if (valid) {
        activeStep.value += 1;
      }
    });
  } else if (stepName == "Entity") {
    dataMapperSelectEntityRef.value.entityMappingRef.formRef.validate((valid) => {
      if (valid) {
        if (dataMappingConfigDto.value.entityMappings.length > 0) {
          dataMappingConfigDto.value.entityMappings[0] = dataMapperSelectEntityRef.value.entityMappingRef.entityMapping;
        } else {
          dataMappingConfigDto.value.entityMappings = [];

          dataMappingConfigDto.value.entityMappings.push(dataMapperSelectEntityRef.value.entityMappingRef.entityMapping);
        }
        activeStep.value += 1;
      }
    });
  } else {
    activeStep.value += 1;
  }
}

(async function () {
  eventBus.$on("setNewConfig", setNewConfig);

  setUid(1);

  autoDataStorageKey.value = `autoSave:${import.meta.env.VITE_APP_UI_VERSION}:dataMapperList`;

  await nextTick();

  if (route.params.id && props.action === null) {
    await loadMappingById(route.params.id);
    runDraftCheck();
  }

  isEnableAutoSaving.value = true;

  loadPlatformVersion();
  loadNoneMappingFields();
})();

function runDraftCheck() {
  if (isAvailableDraft.value && !route.query.virtual) {
    ElMessageBox.confirm(`We found draft record from ${currentAutoSaveRecord.value.virtual.updatedAt}. Do you want restore information from previous state?`, "Confirm", {
      distinguishCancelAndClose: true,
      cancelButtonText: "Remove Draft",
      showCancelButton: !route.query.virtual,
      confirmButtonText: "Apply",
      callback: async (action) => {
        if (action === "confirm") {
          onClickApplyDraft();
        } else if (action === "cancel") {
          deleteAutoSaveRecordById(route.params.id);
        }
      }
    });
  }
}

onBeforeUnmount(() => {
  eventBus.$off("setNewConfig", setNewConfig);
  if (helperPollingChanges.value) helperPollingChanges.value.beforeDestroy();
});

function setNewConfig(value) {
  const lastUpdated = dataMappingConfigDto.value.lastUpdated;

  dataMappingConfigDto.value = HelperMapper.mappingConfigDtoConvertToUi(value, noneMappingFields.value);
  dataMappingConfigDto.value.lastUpdated = lastUpdated;
}

async function loadNoneMappingFields() {
  const {data} = await pluginsSetup();
  noneMappingFields.value = data.noneMappingFields || [];
}

async function loadMappingById(id: string) {
  try {
    isLoading.value = true;
    let dataMappingConfigDtoLocal: MappingConfigDto = {} as MappingConfigDto;
    if (route.query.virtual && props.action === null) {
      const record = findAutoSaveRecordById(route.params.id);
      if (record) {
        dataMappingConfigDtoLocal = record;
      } else {
        notFoundVirtualRecord(this, "/data-mapper");
      }
    } else {
      setUid(0);
      const {data} = await getDataMapping(id);
      dataMappingConfigDtoLocal = HelperMapper.mappingConfigDtoConvertToUi(data, noneMappingFields.value);
      helperPollingChanges.value = new HelperPollingChanges({
        configsCompareDialogPollingRef,
        loadFn: getDataMapping,
        id,
        data: dataMappingConfigDtoLocal,
        convertToUiFn: (data) => {
          return HelperMapper.mappingConfigDtoConvertToUi(data, noneMappingFields.value);
        },
        convertToBackendFn: HelperMapper.mappingConfigDtoConvertToBackend
      });
    }

    if (dataMappingConfigDtoLocal?.sampleContent) isExistContent.value = true;
    if (dataMappingConfigDtoLocal?.entityMappings.length > 0 && dataMappingConfigDtoLocal?.entityMappings[0] && dataMappingConfigDtoLocal?.entityMappings[0].entityRelationConfigs[0] && dataMappingConfigDtoLocal?.entityMappings[0].entityRelationConfigs[0].srcRelativeRootPath) isExistEntity.value = true;
    dataMappingConfigDto.value = dataMappingConfigDtoLocal;
    dataMappingConfigDtoStringBefore.value = JSON.stringify(dataMappingConfigDto.value);
    dataMappingConfigDtoStringAfter.value = JSON.stringify(dataMappingConfigDto.value);
  } finally {
    isLoading.value = false;
  }
}

async function onClickSaveStep(isStayOnCurrentPageValue = false) {
  isSaveButtonTouched.value = false;
  if (isValid()) {
    try {
      isLoading.value = true;
      let dataMappingConfigDtoLocal = HelperMapper.mappingConfigDtoConvertToBackend(dataMappingConfigDto.value);
      if (!isStayOnCurrentPageValue && await checkOnChanges(dataMappingConfigDtoLocal)) {
        return;
      }
      await doSave(dataMappingConfigDtoLocal, isStayOnCurrentPageValue);
    } finally {
      isLoading.value = false;
    }
  } else {
    ElNotification({type: "error", title: "Error", message: "Data mapper have errors!"});
    isSaveButtonTouched.value = true;
  }
}

async function checkOnChanges(dataMappingConfigDto) {
  if (dataMappingConfigDto.id) {
    const {data: serverData} = await getDataMapping(dataMappingConfigDto.id);
    if (serverData.lastUpdated !== dataMappingConfigDto.lastUpdated) {
      const serverDataString = HelperContent.getDataMappingDataForConfirm(serverData);
      const dataMappingConfigDtoString = HelperContent.getDataMappingDataForConfirm(dataMappingConfigDto);
      configsCompareDialogRef.value.openDialog(serverDataString, dataMappingConfigDtoString);
      return true;
    }
  }
  return false;
}

async function doSave(dataMappingConfigDto, isStayOnCurrentPageValue = false) {
  const {data} = await postSave(dataMappingConfigDto);
  if (data.success) {
    await afterSave(data, isStayOnCurrentPageValue);
  } else {
    HelperErrors.handler(data);
  }
}

async function afterSave(savedData, isStayOnCurrentPageValue = false) {
  let doRedirect = false;
  if (isCreatedPopup.value && !isStayOnCurrentPageValue) {
    await chatAfterSave(savedData);
    eventBus.$emit("dataMapping:created", savedData);
    return;
  } else if (isStayOnCurrentPageValue) {
    ElNotification({
      title: "Success",
      message: "Your data has been successfully saved",
      type: "success"
    });
    isEnableAutoSaving.value = false;
    await loadMappingById(route.params.id);
    isEnableAutoSaving.value = true;
  } else {
    deleteAutoSaveRecordById(route.params.id);
    deleteAutoSaveRecordById(dataMappingConfigDto.value.virtual?.id);
    doRedirect = true;
  }

  await chatAfterSave(savedData);

  deleteAutoSaveRecordById(route.params.id);
  deleteAutoSaveRecordById(dataMappingConfigDto.value.virtual?.id);
  if (doRedirect) {
    nextTick(() => {
      router.push("/data-mapper");
    })
  }
}

async function chatAfterSave(savedData) {
  if (isChatBotReady.value) {
    if (dataMappingConfigDto.value.virtual?.id || isCreatedPopup.value) {
      const oldId = isCreatedPopup.value ? chatBotId.value : dataMappingConfigDto.value.virtual?.id;
      await aIChatBotRef.value.updateId(oldId, savedData.configId);
    }
    aIChatBotRef.value.saveChat(savedData.configId);
  }
}

function onAcceptTheirs(data) {
  afterSave(data);
}

async function onSaveCompareDialog(data) {
  try {
    isLoading.value = true;
    await doSave(data);
  } finally {
    isLoading.value = false;
  }
}

async function onClickSaveInFile() {
  const {data} = await exportCobiForKeys({
    mappingsIds: [dataMappingConfigDto.value.id]
  });
  const file = new File([JSON.stringify(data)], `platform_v${platformVersion.value}_UI_v${uiVersion.value}_export_all_data_selected.json`, {type: "text/plain;charset=utf-8"});
  FileSaver.saveAs(file);
}

async function loadPlatformVersion() {
  const {data: platform} = await api.versionPlatform();
  platform.value = platform;
}

function isValid() {
  return dataMapperRef.value && dataMapperRef.value.listOfNotCorrectRelations.length == 0 && dataMapperRef.value.notExistRelations.length == 0;
}

async function onReset(params = {}) {
  isEnableAutoSaving.value = false;
  dataMappingConfigDto.value = JSON.parse(JSON.stringify(dataMappingConfigDtoDefault.value));
  Object.keys(params).forEach((attr) => {
    dataMappingConfigDto.value[attr] = params[attr];
  });
  await nextTick();

  isEnableAutoSaving.value = true;
}

function getDataMappingConfigDto() {
  return dataMappingConfigDto.value;
}

provide('getDataMappingConfigDto', getDataMappingConfigDto);

function onClickApplyDraft() {
  dataMappingConfigDto.value = findAutoSaveRecordById(route.params.id);
  ElNotification({
    title: "Success",
    message: "Data was updated",
    type: "success"
  });
}

function onSaveDataMapperUploadFile(data: any) {
  dataMappingConfigDto.value.sampleContent = data;
  activeStep.value += 1;
}

function changeNavigationToStep(step: number) {
  if (!isNew.value) {
    activeStep.value = step;
  }
}

function helperPollingChangesOnAcceptTheirs(newString) {
  helperPollingChanges.value.onAcceptTheirs(newString);
}

function helperPollingChangesOnAcceptYours(newString) {
  helperPollingChanges.value.onAcceptYours(newString);
}

// ChatBot
const hiddenReturnObject = ['transformers'];

function initialFn() {
  let data = HelperContent.restoreContent(dataMapperRef.value.sourceDataComputed, dataMappingConfigDto.value);
  if (typeof data === 'object') data = JSON.stringify(data);
  return chatbotStore.postMappingsInitial({
    entity_name: selectedEntityMapping.value.entityClass,
    ds_input: data,
    chat_id: chatBotId.value,
  });
}

let axiosChatBotController = ref(null);

const chatBotDefaultMessages: any = {
  script: 'The script was successfully applied',
  columns: 'Column was updated',
}

async function submitMessageFn({message, key}, element) {
  let user_script = undefined;
  if (['script', 'code'].includes(key)) {
    user_script = JSON.stringify({
      script: {
        body: selectedEntityMapping.value.script.body,
        inputSrcPaths: selectedEntityMapping.value.script.inputSrcPaths,
      }
    });
  }

  try {
    axiosChatBotController.value = new AbortController();
    const {data} = await chatbotStore.getMappingsAiChat({
      question: message,
      return_object: key,
      chat_id: chatBotId.value,
      user_script
    }, axiosChatBotController.value.signal);

    if (!data.success) {
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
      return;
    }

    if (key === 'script') {
      element.repeats.push([{
        type: 'text',
        text: chatBotDefaultMessages[key],
      }])
      selectedEntityMapping.value.script.body = data.message.script.body;
      selectedEntityMapping.value.script.inputSrcPaths = data.message.script.inputSrcPaths;
    } else if (key === 'columns') {
      element.repeats.push([{
        type: 'text',
        text: chatBotDefaultMessages[key],
      }])
      data.forEach((chatBotColumn) => {
        if (chatBotColumn.action === 'add') {
          const column = selectedEntityMapping.value.columns.find((column) => {
            return column.srcColumnPath === chatBotColumn.column.srcColumnPath &&
              column.dstCyodaColumnPath === chatBotColumn.column.dstCyodaColumnPath;
          });
          if (!column) {
            selectedEntityMapping.value.columns.push(chatBotColumn.column);
          }
        } else if (chatBotColumn.action === 'delete') {
          selectedEntityMapping.value.columns = selectedEntityMapping.value.columns.filter((column) => {
            return !(column.srcColumnPath === chatBotColumn.column.srcColumnPath &&
              column.dstCyodaColumnPath === chatBotColumn.column.dstCyodaColumnPath);
          })
        }
      })
    } else if (data.message) {
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
    }

    if (['columns', 'mapping', 'script'].includes(key)) {
      selectedEntityMapping.value.isShowNoneMappingFields = false;

      await nextTick();
      eventBus.$emit("updateSourceDataKey");
      await nextTick();
      eventBus.$emit("clearAllNotExistRelations");
      eventBus.$emit("updateRelations");
    }
  } catch (e) {
    handlerError(e, element);
  } finally {
    axiosChatBotController.value = null;
  }
}

watch(
  () => dataMappingConfigDto.value,
  (data) => {
    if (props.action !== null) return;
    dataMappingConfigDtoStringAfter.value = JSON.stringify(data);
    autoSave(data);
  },
  {deep: true, immediate: true}
);

watch(
  () => isDataWasChangedAndNotSaved,
  (val) => {
    route.meta.isDataWasChangedAndNotSaved = val;
  }
);

defineExpose({dataMappingConfigDto, loadMappingById, dataMappingConfigDtoDefault});
</script>

<style lang="scss">
.data-mapper-edit {
  padding-bottom: 80px;

  h1 {
    margin-bottom: 10px;
  }

  .actions {
    text-align: right;
    padding-top: 25px;
    margin-top: 20px;
    border-top: 1px solid #dedede;

    .data-mapping-run-test-btn {
      margin: 0 12px;
    }
  }

  .step-inner {
    padding-top: 15px;
  }

  .steps-is-edit {
    .el-step__title {
      cursor: pointer;
      text-decoration: underline;
    }
  }

  .draft-info {
    margin-right: 10px;
    cursor: pointer;
  }

  .action-footer {
    position: fixed;
    bottom: 0;
    z-index: 10;
    background: #fff;
    padding-bottom: 20px;
    padding-right: 20px;
    right: 0;
    width: 100%;
  }

  .next-step {
    .wrapper-inner {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
}

body.error-handler {
  .action-footer {
    padding-right: 80px;
  }
}

body {
  aside {
    position: relative;
    z-index: 300;
  }
}

.el-dialog {
  .dialog-footer.action-footer {
    padding-top: 25px;
    border-top: 1px solid #dedede;
    position: fixed;
    bottom: 0;
    z-index: 10;
    background: #fff;
    padding-bottom: 20px;
    padding-right: 20px;
    right: 0;
    width: 100%;
  }

  .data-mapper-edit {
    padding-bottom: 60px;
  }
}
</style>
