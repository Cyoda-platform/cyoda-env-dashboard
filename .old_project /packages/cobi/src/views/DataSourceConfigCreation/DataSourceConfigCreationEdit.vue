<template>
  <div v-loading="isLoading" class="data-source-config-creation-edit">
    <portal to="header-title">
      {{ titleComputed }}
    </portal>

    <el-alert class="error-alerts" v-if="allErrorMessages.length > 0" title="Errors" type="error" :closable="false"
              show-icon>
      <div>
        <ol>
          <li v-for="(allErrorMessage, index) in allErrorMessages" :key="index">{{ allErrorMessage }}</li>
        </ol>
      </div>
    </el-alert>

    <div v-if="action !== 'create:popup'" class="actions-top">
      <div v-if="!isVirtual && dataSourceConfigDto.id" class="wrap-history">
        <CyodaHistory :dataDto="dataSourceConfigDto" :getHistory="getHistory"
                      :getHistoryByTimeUid="getHistoryByTimeUid"/>
      </div>
    </div>

    <el-form :model="dataSourceConfigDto" :rules="rules" ref="formRef" label-width="160px">
      <el-tabs v-model="activeName">
        <el-tab-pane label="Default Settings" name="defaultSettings">
          <DataSourceConfigDefaultSettings :dataSourceConfigDto="dataSourceConfigDto"/>
        </el-tab-pane>

        <!-- DataSourceConfigConnectionDetails-->
        <el-tab-pane label="Connection Details" name="connections">
          <DataSourceConfigConnectionDetails :dataSourceConfigDto="dataSourceConfigDto"/>
        </el-tab-pane>

        <!-- DataSourceConfigEndpoints-->
        <el-tab-pane label="Endpoints" name="endpoints">
          <DataSourceConfigEndpoint :dataSourceConfigDto="dataSourceConfigDto"/>
        </el-tab-pane>
        <!-- End DataSourceConfigEndpoints-->
      </el-tabs>
    </el-form>

    <div class="actions">
      <portal to="data-source-config-actions" :disabled="!action">
        <el-button :disabled="isDisableSave" @click="onClickSaveStep" type="success">
          {{ isUpdate ? "Update" : "Save" }}
          <font-awesome-icon icon="save"/>
        </el-button>
        <AIChatBot
          :key="aIChatBotKey"
          v-if="isChatBotEnabled"
          v-model:ready="isChatBotReady"
          ref="aIChatBotRef"
          :id="chatBotId"
          :hiddenReturnObject="hiddenReturnObject"
          :disabledReturnObject="disabledReturnObject"
          :chatBotDefaultMessages="chatBotDefaultMessages"
          :initialFn="initialFn"
          :submitMessageFn="submitMessageFn"
          :axiosChatBotController="axiosChatBotController"
          defaultReturnObject="random"
          category="connections"
        />
      </portal>
    </div>
    <ConfigsCompareDialog @acceptTheirs="onAcceptTheirs" @acceptYours="onSaveCompareDialog" @save="onSaveCompareDialog"
                          ref="configsCompareDialogRef"/>

    <ConfigsCompareDialog
      v-if="helperPollingChanges"
      acceptTheirsMessage="We will replace your data by data from server. Confirm?"
      acceptYoursMessage="We will use your data. Confirm?"
      @acceptTheirs="helperPollingChangesOnAcceptTheirs"
      @acceptYours="helperPollingChangesOnAcceptYours"
      @save="helperPollingChanges.onSave($event)"
      ref="configsCompareDialogPollingRef"/>
  </div>
</template>

<script setup lang="ts">
import {ElNotification, ElMessageBox} from "element-plus";
import {useDataSourceConfigStore} from "../../stores/data-source-config";
import {useRouter, useRoute} from "vue-router";
import {ref, nextTick, computed, watch, onBeforeUnmount, provide} from "vue";

import DataSourceConfigDefaultSettings
  from "../../components/DataSourceConfig/Steps/DataSourceConfigDefaultSettings.vue";

import HelperErrors from "@cyoda/ui-lib/src/helpers/HelperErrors";
import HelperContent from "../../helpers/HelperContent";

import HelperConstants from "../../helpers/HelperConstants";
import HelperStorage from "../../helpers/HelperStorage";
import HelperDataSourceConfig from "../../helpers/HelperDataSourceConfig";
import DataSourceConfigConnectionDetails
  from "../../components/DataSourceConfig/Steps/DataSourceConfigConnectionDetails/DataSourceConfigConnectionDetails.vue";
import DataSourceConfigEndpoint
  from "../../components/DataSourceConfig/Steps/DataSourceConfigEndpoints/DataSourceConfigEndpoint.vue";
import CyodaHistory from "../../components/CyodaHistory/CyodaHistory.vue";
import ConfigsCompareDialog from "../../components/ConfigsCompareDialog/ConfigsCompareDialog.vue";
import HelperPollingChanges from "../../helpers/HelperPollingChanges";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useAutoSavingMixin} from "../../mixins/AutoSavingMixin";
import AIChatBot from "@cyoda/ui-lib/src/components-library/elements/AIChatBot/AIChatBot.vue";
import {useChatbotStore} from "@cyoda/ui-lib/src/stores/chatbot";
import {v4 as uuidv4} from "uuid";
import {handlerError} from "@cyoda/ui-lib/src/helpers/HelperChatbot";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";
import moment from "moment";

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

const helperStorage = new HelperStorage();
const isChatBotEnabled = HelperFeatureFlags.isChatBotEnabled();
const isChatBotReady = ref(false);
const aIChatBotRef = ref(null);
const aIChatBotKey = ref(0);

// @TODO Mixins: AutoSavingMixin
const props = defineProps({action: {default: null}});
const route = useRoute();
const router = useRouter();
const dataSourceConfigStore = useDataSourceConfigStore();
const {getHistory, getHistoryByTimeUid} = dataSourceConfigStore;
const isDisableSave = computed(() => {
  return false;
});
const allErrorMessages = ref([]);

const titleComputed = computed(() => {
  let title = "";
  if (route.params.id && dataSourceConfigDto.value) {
    title = `Edit: ${dataSourceConfigDto.value.name}`;
  } else {
    title = "Data Source Config Creation";
  }
  if (isDataWasChangedAndNotSaved.value) title += "*";
  return title;
});
const isDataWasChangedAndNotSaved = computed(() => {
  if (dataSourceConfigDtoBefore.value) {
    return dataSourceConfigDtoAfter.value !== dataSourceConfigDtoBefore.value;
  }
  return false;
});
const isUpdate = computed(() => {
  return listAll.value.find((el) => el.id === dataSourceConfigDto.value.id);
});
const isVirtual = computed(() => {
  return route.query.virtual === "true";
});

function postSave(dataSourceConfigDto) {
  return dataSourceConfigStore.postSave(dataSourceConfigDto);
}

function getById(id) {
  return dataSourceConfigStore.getById(id);
}

function getListAll() {
  return dataSourceConfigStore.getListAll();
}

const formRef = ref(null);

const configsCompareDialogRef = ref(null);

const configsCompareDialogPollingRef = ref(null);

const activeName = ref<string>("defaultSettings");
const isLoading = ref<boolean>(false);
const activeForm = ref(null);
let listAll = ref([]);
const helperPollingChanges = ref(null);
const chatbotStore = useChatbotStore();

let rules = ref({
  name: [
    {required: true, message: "Please fill field Name", trigger: "blur"},
    {validator: checkUniqName, trigger: "blur"}
  ],
  type: [{required: true, message: "Please fill field Type", trigger: "change"}],
  connections: [{type: "array", required: true, message: "Please add minimum one connections", trigger: "change"}],
  endpoints: [{type: "array", required: true, message: "Please add minimum one endpoints", trigger: "change"}]
});

async function checkUniqName(rule: any, value: any, callback: any) {
  const names = listAll.value.filter((el: any) => el.id !== route.params.id && el.id !== dataSourceConfigDto.value.id).map((el: any) => el.name);
  if (names.indexOf(value) > -1) {
    return callback(new Error(`This name is not unique`));
  }
  callback();
}

(async function () {
  loadListAll();

  autoDataStorageKey.value = `autoSave:${import.meta.env.VITE_APP_UI_VERSION}:dataSourceList`;

  await nextTick();

  if (route.params.id) {
    if (route.query.virtual) {
      const record = findAutoSaveRecordById(route.params.id);
      if (record) {
        dataSourceConfigDto.value = record;
      } else {
        notFoundVirtualRecord(this, "/data-mapper/data-source-config-creation");
      }
    } else {
      await loadDataSourceById(route.params.id);
      if (!props.action) {
        runDraftCheck();
      }
    }
  }

  dataSourceConfigDtoBefore.value = JSON.stringify(dataSourceConfigDto.value);
  dataSourceConfigDtoAfter.value = JSON.stringify(dataSourceConfigDto.value);

  isEnableAutoSaving.value = true;

  eventBus.$on("setNewConfig", setNewConfig);
  eventBus.$on("dialogEndpoint:close", dialogEndpointClose);
})();

onBeforeUnmount(() => {
  eventBus.$off("setNewConfig", setNewConfig);
  eventBus.$on("dialogEndpoint:close", dialogEndpointClose);
  if (helperPollingChanges.value) helperPollingChanges.value.beforeDestroy();
});


function dialogEndpointClose() {
  aIChatBotKey.value += 1;
}

function setNewConfig(value) {
  const lastUpdated = dataSourceConfigDto.value.lastUpdated;
  dataSourceConfigDto.value = value;
  dataSourceConfigDto.value.lastUpdated = lastUpdated;
}

async function loadListAll() {
  const {data} = await getListAll();
  listAll.value = data;
}

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

async function loadDataSourceById(id: string) {
  try {
    isLoading.value = true;
    const {data} = await getById(id);
    getHistory(id);
    dataSourceConfigDto.value = HelperDataSourceConfig.mappingConfigDtoConvertToUi(data);
    helperPollingChanges.value = new HelperPollingChanges({
      configsCompareDialogPollingRef,
      loadFn: getById,
      id,
      data: dataSourceConfigDto.value,
      convertToUiFn: HelperDataSourceConfig.mappingConfigDtoConvertToUi
    });
  } finally {
    isLoading.value = false;
  }
}

function helperPollingChangesOnAcceptTheirs(newString) {
  helperPollingChanges.value.onAcceptTheirs(newString);
}

function helperPollingChangesOnAcceptYours(newString) {
  helperPollingChanges.value.onAcceptYours(newString);
}

let dataSourceConfigDto = ref({
  "@bean": "com.cyoda.plugins.datasource.dtos.DataSourceConfigDto",
  id: null,
  name: null,
  description: "",
  connections: [],
  endpoints: [],
  active: true
});

const dataSourceConfigDtoBefore = ref<string>("");
const dataSourceConfigDtoAfter = ref<string>("");

async function onClickSaveStep() {
  activeForm.value = null;
  formRef.value.validate(async (valid, invalidFields) => {
    allErrorMessages.value = HelperContent.getAllErrorMessagesFromForm(invalidFields);
    if (valid) {
      try {
        isLoading.value = true;
        const dataSave = JSON.parse(JSON.stringify(dataSourceConfigDto.value));
        delete dataSave.virtual;
        dataSave.endpoints.forEach((el) => delete el.chatBotId);
        if (await checkOnChanges(dataSave)) {
          return;
        }
        await doSave(dataSave);
      } finally {
        isLoading.value = false;
      }
    } else {
      activeForm.value = formRef.value;
    }
  });
}

async function checkOnChanges(dataSourceConfigDto) {
  if (dataSourceConfigDto.id) {
    const {data: serverData} = await getById(dataSourceConfigDto.id);
    if (serverData.lastUpdated !== dataSourceConfigDto.lastUpdated) {
      const serverDataString = HelperContent.prettyContent(JSON.stringify(serverData));
      const chainingConfigDtoDtoString = HelperContent.prettyContent(JSON.stringify(dataSourceConfigDto));
      configsCompareDialogRef.value.openDialog(serverDataString, chainingConfigDtoDtoString);
      return true;
    }
  }
  return false;
}

async function doSave(dataSourceConfigDto) {
  const {data} = await postSave(dataSourceConfigDto);
  if (data.success) {
    await afterSave(data);
  } else {
    HelperErrors.handler(data);
  }
}

async function afterSave(savedData) {
  if (isChatBotReady.value) {
    if (dataSourceConfigDto.value.virtual?.id) {
      await aIChatBotRef.value.updateId(dataSourceConfigDto.value.virtual?.id, savedData.configId);
    }
    aIChatBotRef.value.saveChat(savedData.configId);
  }

  deleteAutoSaveRecordById(dataSourceConfigDto.value.virtual?.id);
  if (props.action === "create:popup") {
    eventBus.$emit("dataSourceConfig:created", savedData);
  } else {
    router.push("/data-mapper/data-source-config-creation");
  }

  if (savedData.id) helperStorage.deleteByKey(HelperConstants.getDataSourceConfigDialogRequestKey(savedData.id));
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

function onClickApplyDraft() {
  dataSourceConfigDto.value = findAutoSaveRecordById(route.params.id);
  ElNotification({
    title: "Success",
    message: "Data was updated",
    type: "success"
  });
}

// ChatBot
async function initialFn() {
  if (!chatBotId.value) {
    if (!dataSourceConfigDto.value.name) dataSourceConfigDto.value.name = '';
    await nextTick();
  }
  return chatbotStore.postConnectionsInitial({
    chat_id: chatBotId.value,
  });
}

const hiddenReturnObject = ['parameters'];

const disabledReturnObject = computed(() => {
  const data = [];
  if (dataSourceConfigDto.value.endpoints.length === 0) {
    data.push('endpoints');
  }
  return data;
})

const chatBotId = computed(() => {
  return route.params.id || dataSourceConfigDto.value?.virtual?.id || dataSourceConfigDto.value.id;
})

const chatBotDefaultMessages: any = {
  endpoints: 'A new endpoint(s) was added',
  connections: 'A new connections was added',
  'import-connections': 'A new connections was imported',
}

let axiosChatBotController = ref(null);

async function submitMessageFn({message, key}, element) {
  try {
    axiosChatBotController.value = new AbortController();
    const {data} = await chatbotStore.getConnectionsAiChat({
      question: message,
      return_object: key,
      chat_id: chatBotId.value,
    }, axiosChatBotController.value.signal);

    if (!data.success) {
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
      return;
    }


    if (['endpoints'].includes(key)) {
      data.message.forEach((el) => {
        if (!el.consumerConfig) {
          el.consumerConfig = {
            configId: "",
            consumerType: "COBI_MAPPER"
          };
        }
        dataSourceConfigDto.value.endpoints.push(el);
      })

      element.repeats.push([{
        type: 'text',
        text: chatBotDefaultMessages[key],
      }])
    } else if (['connections'].includes(key)) {
      const dataSourcesTmp = data.message.dataSources[0];
      dataSourceConfigDto.value = {
        ...dataSourcesTmp,
        id: dataSourceConfigDto.value.id,
        virtual: dataSourceConfigDto.value.virtual,
        lastUpdated: Number(moment().add(5, "years").format("x"))
      };

      element.repeats.push([{
        type: 'text',
        text: chatBotDefaultMessages[key],
      }])
    } else if (['sources'].includes(key)) {
      element.repeats.push([{
        type: 'text',
        text: data.message.message,
      }])
    } else if (['import-connections'].includes(key)) {
      element.repeats.push([{
        type: 'text',
        text: chatBotDefaultMessages[key],
      }])
    } else if (data.message) {
      element.repeats.push([{
        type: 'text',
        text: data.message,
      }])
    }

  } catch (e) {
    handlerError(e, element);
  } finally {
    axiosChatBotController.value = null;
  }
}

provide('chatBotId', chatBotId);
provide('initialFn', initialFn);

watch(
  dataSourceConfigDto,
  (data) => {
    dataSourceConfigDtoAfter.value = JSON.stringify(data);
    autoSave(data);
  },
  {deep: true, immediate: true}
);

defineExpose({dataSourceConfigDto});
</script>

<style lang="scss">
.data-source-config-creation-edit {
  .actions {
    text-align: right;
    padding-top: 25px;
    margin-top: 20px;
    border-top: 1px solid #dedede;
  }

  .actions-top {
    display: flex;

    .wrap-history {
      margin-left: auto;
    }
  }

  .error-alerts ol {
    padding: 0;
    padding-left: 10px;
  }

  .draft-info {
    margin-right: 10px;
    cursor: pointer;
  }
}
</style>
