<template>
  <div class="data-chaining-edit">
    <template v-if="!action">
      <portal to="header-title">
        {{ titleComputed }}
      </portal>
    </template>

    <el-alert class="error-alerts" v-if="allErrorMessages.length > 0" title="Errors" type="error" :closable="false"
              show-icon>
      <div>
        <ol>
          <li v-for="(allErrorMessage, index) in allErrorMessages" :key="index">{{ allErrorMessage }}</li>
        </ol>
      </div>
    </el-alert>

    <div class="actions-top">
      <div v-if="!isVirtual && chainingConfigDto.id" class="wrap-history">
        <CyodaHistory :dataDto="chainingConfigDto" :getHistory="getHistory" :getHistoryByTimeUid="getHistoryByTimeUid"/>
      </div>
    </div>

    <el-form :model="chainingConfigDto" :rules="rules" ref="formRef" label-width="120px">
      <el-tabs v-model="activeName">
        <el-tab-pane label="Default Settings" name="defaultSettings">
          <DataChainingConfigDefaultSettings :chainingConfigDto="chainingConfigDto"/>
        </el-tab-pane>

        <el-tab-pane label="Data Source" name="dataSource">
          <DataChainingConfigDataSource :dataSourceConfigList="dataSourceConfigList"
                                        :chainingConfigDto="chainingConfigDto"/>
        </el-tab-pane>

        <el-tab-pane label="Relative Paths" name="relativePaths">
          <DataChainingConfigRelativePaths :dataMappingList="dataMappingList" :chainingConfigDto="chainingConfigDto"/>
        </el-tab-pane>

        <el-tab-pane label="Parameters" name="parameters">
          <DataChainingConfigParameters :dataSourceConfigList="dataSourceConfigList" :dataMappingList="dataMappingList"
                                        :chainingConfigDto="chainingConfigDto"/>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <div class="actions">
      <portal to="data-chaining-edit-actions" :disabled="!action">
        <el-button :loading="isLoading" @click="onClickSave" type="success">
          Save
          <font-awesome-icon icon="save"/>
        </el-button>
      </portal>
    </div>
    <ConfigsCompareDialog @acceptTheirs="onAcceptTheirs" @acceptYours="onSaveCompareDialog" @save="onSaveCompareDialog"
                          ref="configsCompareDialogRef"/>

    <ConfigsCompareDialog v-if="helperPollingChanges"
                          acceptTheirsMessage="We will replace your data by data from server. Confirm?"
                          acceptYoursMessage="We will use your data. Confirm?"
                          @acceptTheirs="helperPollingChangesOnAcceptTheirs"
                          @acceptYours="helperPollingChangesOnAcceptYours"
                          @save="helperPollingChanges.onSave($event)" ref="configsCompareDialogPollingRef"/>
  </div>
</template>

<script setup lang="ts">
import {ElNotification, ElMessageBox} from "element-plus";
import {useChainingConfigStore} from "../../stores/chaining-config";
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import {useDataSourceConfigStore} from "../../stores/data-source-config";
import {useRouter, useRoute} from "vue-router";
import {ref, nextTick, computed, watch, onBeforeUnmount} from "vue";

import DataChainingConfigDefaultSettings
  from "../../components/DataChaining/steps/DataChainingConfigDefaultSettings.vue";
import DataChainingConfigDataSource from "../../components/DataChaining/steps/DataChainingConfigDataSource.vue";
import DataChainingConfigRelativePaths from "../../components/DataChaining/steps/DataChainingConfigRelativePaths.vue";
import DataChainingConfigParameters from "../../components/DataChaining/steps/DataChainingConfigParameters.vue";

import HelperErrors from "@cyoda/ui-lib/src/helpers/HelperErrors";
import HelperContent from "../../helpers/HelperContent";

import {useAutoSavingMixin} from "../../mixins/AutoSavingMixin";
import CyodaHistory from "../../components/CyodaHistory/CyodaHistory.vue";
import ConfigsCompareDialog from "../../components/ConfigsCompareDialog/ConfigsCompareDialog.vue";
import HelperPollingChanges from "../../helpers/HelperPollingChanges";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

// @TODO Mixins: AutoSavingMixin
const { autoDataStorageKey, isEnableAutoSaving, autoSave, isAvailableDraft, findAutoSaveRecordById, notFoundVirtualRecord, deleteAutoSaveRecordById, currentAutoSaveRecord } = useAutoSavingMixin();
const props = defineProps({action: {default: null}});
const route = useRoute();
const router = useRouter();
const dataSourceConfigStore = useDataSourceConfigStore();
const platformMappingStore = usePlatformMappingStore();
const chainingConfigStore = useChainingConfigStore();
const {getHistory, getHistoryByTimeUid} = chainingConfigStore;
const titleComputed = computed(() => {
  let title = "";
  if (route.params.id) {
    title = `Chaining Edit: ${chainingConfigDto.value.name}`;
  } else {
    title = "Chaining";
  }
  if (isDataWasChangedAndNotSaved.value) title += "*";
  return title;
});
const isDataWasChangedAndNotSaved = computed(() => {
  if (chainingConfigDtoBefore.value) {
    return chainingConfigDtoAfter.value !== chainingConfigDtoBefore.value;
  }
  return false;
});
const isVirtual = computed(() => {
  return route.query.virtual === "true";
});
const allErrorMessages = ref([]);

function getListAll() {
  return dataSourceConfigStore.getListAll();
}

function getListAllDataMappings() {
  return platformMappingStore.getListAllDataMappings();
}

function postSave(chainingConfigDto) {
  return chainingConfigStore.postSave(chainingConfigDto);
}

const formRef = ref(null);

const configsCompareDialogRef = ref(null);

const configsCompareDialogPollingRef = ref(null);

const activeForm = ref(null);
const activeName = ref<string>("defaultSettings");
let dataSourceConfigList = ref([]);
let dataMappingList = ref([]);
const isLoading = ref<boolean>(false);
const helperPollingChanges = ref(null);

let chainingConfigDto = ref({
  "@bean": "com.cyoda.plugins.datasource.dtos.chaining.ChainingConfigDto",
  id: null,
  datasourceId: "",
  name: "",
  description: "",
  nextOperation: "",
  rootRelativePaths: {},
  parameters: []
});

const chainingConfigDtoBefore = ref<string>("");
const chainingConfigDtoAfter = ref<string>("");

let rules = ref({
  name: [{required: true, message: "Please fill field Name", trigger: "blur"}],
  datasourceId: [{required: true, message: "Please select Datasource", trigger: "blur"}]
});
(async function () {
  autoDataStorageKey.value = `autoSave:${import.meta.env.VITE_APP_UI_VERSION}:dataChainingList`;

  await nextTick();

  loadDataSourceConfigList();
  loadDataMappingList();

  if (props.action !== null) return;

  if (route.params.id) {
    if (route.query.virtual) {
      const record = findAutoSaveRecordById(route.params.id);
      if (record) {
        chainingConfigDto.value = record;
      } else {
        notFoundVirtualRecord(this, "/data-mapper/chaining");
      }
    } else {
      await loadDataSourceById(route.params.id);
      runDraftCheck();
    }
  }

  chainingConfigDtoBefore.value = JSON.stringify(chainingConfigDto.value);
  chainingConfigDtoAfter.value = JSON.stringify(chainingConfigDto.value);

  isEnableAutoSaving.value = true;

  eventBus.$on("setNewConfig", setNewConfig);
})();

onBeforeUnmount(() => {
  eventBus.$off("setNewConfig", setNewConfig);
  if (helperPollingChanges.value) helperPollingChanges.value.beforeDestroy();
});

function setNewConfig(value) {
  const lastUpdated = chainingConfigDto.value.lastUpdated;
  chainingConfigDto.value = value;
  chainingConfigDto.value.lastUpdated = lastUpdated;
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

async function loadDataSourceConfigList() {
  const {data} = await getListAll();
  dataSourceConfigList.value = data;
}

async function loadDataMappingList() {
  const {data} = await getListAllDataMappings();
  dataMappingList.value = data;
}


function getById(id) {
  return chainingConfigStore.getById(id);
}

async function loadDataSourceById(id: string) {
  try {
    isLoading.value = true;
    const {data} = await getById(id);
    chainingConfigDto.value = data;

    helperPollingChanges.value = new HelperPollingChanges({
      configsCompareDialogPollingRef,
      loadFn: getById,
      id,
      data
    });
  } finally {
    isLoading.value = false;
  }
}

function onClickSave() {
  activeForm.value = null;
  formRef.value.validate(async (valid, invalidFields) => {
    allErrorMessages.value = HelperContent.getAllErrorMessagesFromForm(invalidFields);
    if (valid) {
      try {
        isLoading.value = true;
        const dataSave = JSON.parse(JSON.stringify(chainingConfigDto.value));
        delete dataSave.virtual;
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

async function checkOnChanges(chainingConfigDto) {
  if (chainingConfigDto.id) {
    const {data: serverData} = await getById(chainingConfigDto.id);
    if (serverData.lastUpdated !== chainingConfigDto.lastUpdated) {
      const serverDataString = HelperContent.prettyContent(JSON.stringify(serverData));
      const chainingConfigDtoDtoString = HelperContent.prettyContent(JSON.stringify(chainingConfigDto));
      configsCompareDialogRef.value.openDialog(serverDataString, chainingConfigDtoDtoString);
      return true;
    }
  }
  return false;
}

async function doSave(chainingConfigDto) {
  const {data} = await postSave(chainingConfigDto);
  if (data.success) {
    afterSave(data);
  } else {
    HelperErrors.handler(data);
  }
}

function afterSave(savedData) {
  deleteAutoSaveRecordById(chainingConfigDto.value.virtual?.id);
  if (props.action === "create:popup") {
    eventBus.$emit("dataChaining:created", savedData);
  } else {
    router.push("/data-mapper/chaining");
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

function onClickApplyDraft() {
  chainingConfigDto.value = findAutoSaveRecordById(route.params.id);
  ElNotification({
    title: "Success",
    message: "Data was updated",
    type: "success"
  });
}

function helperPollingChangesOnAcceptTheirs(newString){
  helperPollingChanges.value.onAcceptTheirs(newString);
}

function helperPollingChangesOnAcceptYours(newString) {
  helperPollingChanges.value.onAcceptYours(newString);
}

watch(
  chainingConfigDto,
  (data) => {
    if (props.action !== null) return;
    chainingConfigDtoAfter.value = JSON.stringify(data);
    autoSave(data);
  },
  {deep: true, immediate: true}
);

defineExpose({loadDataSourceById});
</script>

<style lang="scss">
.data-chaining-edit {
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

  .draft-info {
    margin-right: 10px;
    cursor: pointer;
  }
}
</style>
