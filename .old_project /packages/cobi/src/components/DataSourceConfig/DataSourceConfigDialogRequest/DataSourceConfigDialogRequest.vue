<template>
  <div class="data-source-config-dialog-request">
    <el-dialog :close-on-click-modal="false" :title="computedTitle" v-model="dialogVisible" width="70%">
      <template #header>
        <div class="wrap-header">
          <span class="el-dialog__title">{{ computedTitle }}</span>
          <template v-if="isLoading && requestId">
            <el-divider direction="vertical"></el-divider>
            Request UUID:&nbsp;<DataToClipboard :value="requestId" />
          </template>
        </div>
      </template>
      <el-form v-loading="isLoading" :model="formSettings" label-width="140px">
        <el-form-item label="Return only state">
          <el-switch v-model="formSettings.onlyState"></el-switch>
        </el-form-item>
        <div class="flex flex-wrap-select">
          <el-form-item class="flex-select" label="Operations">
            <el-select clearable v-model="formSettings.operation" placeholder="Select">
              <el-option v-for="item in operationOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <div>
            <el-button :disabled="!formSettings.operation" @click="onClickAddOperation" type="primary">
              Add
              <font-awesome-icon icon="plus" />
            </el-button>
          </div>
        </div>
        <el-divider />

        <template v-if="form.data_source_operations.length > 0">
          <el-tabs v-model="activeTab" type="border-card" closable @tab-remove="removeTab">
            <template v-for="(dataSourceOperation, index) in form.data_source_operations">
              <el-tab-pane :label="dataSourceOperation.operation" :name="dataSourceOperation.operation">
                <DataSourceConfigDialogRequestOperation :key="dataSourceOperation.operation" :dataSourceOperation="dataSourceOperation" :activeRequestFields="activeRequestFields" :index="index" />
              </el-tab-pane>
            </template>
          </el-tabs>
        </template>
        <template v-else>
          <el-empty description="Please select minimum one operation"></el-empty>
        </template>
      </el-form>

      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="isLoading">
          <el-button type="danger" @click="onStop">Stop</el-button>
        </template>
        <template v-else>
          <el-button type="success" @click="onRun">Run</el-button>
        </template>
      </span>
      </template>
    </el-dialog>
    <DataSourceConfigDialogResult ref="dataSourceConfigDialogResultRef" :requestId="requestId" :result="resultData" :dataSourceConfigDto="dataSourceConfigDto" />

    <DataSourceConfigDialogResultWithStatus @stop="onStop" ref="dataSourceConfigDialogResultWithStatusRef" :statusObj="statusObj" :dataSourceConfigDto="dataSourceConfigDto" />
  </div>
</template>

<script setup lang="ts">
import { useDataSourceConfigStore } from "../../../stores/data-source-config";
import { ref, computed, watch, onBeforeUnmount } from "vue";

// import { DataSourceConfigDto } from "../DataSourceConfig";
import DataSourceConfigDialogRequestOperation from "./DataSourceConfigDialogRequestOperation.vue";
import DataSourceConfigDialogResult from "./DataSourceConfigDialogResult/DataSourceConfigDialogResult.vue";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import moment from "moment";
import DataSourceConfigDialogResultWithStatus from "./DataSourceConfigDialogResultWithStatus.vue";
import HelperConstants from "../../../helpers/HelperConstants";
import DataToClipboard from "../../DataToClipboard/DataToClipboard.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const helperStorage = new HelperStorage();

const dataSourceConfigStore = useDataSourceConfigStore();
const operationOptions = computed(() => {
  if (!dataSourceConfigDto.value.endpoints) return [];
  const usedOperations = form.value.data_source_operations.map((el) => el.operation);
  return dataSourceConfigDto.value.endpoints

    .filter((el) => {
      return usedOperations.indexOf(el.operation) === -1;
    })
    .map((el) => {
      return {
        value: el.operation,
        label: el.operation
      };
    });
});
const computedTitle = computed(() => {
  return `Dialog Request: ${dataSourceConfigDto.value.name}`;
});

function request(form) {
  return dataSourceConfigStore.request(form);
}

function result(id) {
  return dataSourceConfigStore.result(id);
}

function resultState(id) {
  return dataSourceConfigStore.resultState(id);
}

function getListAll() {
  return dataSourceConfigStore.getListAll();
}

const dataSourceConfigDialogResultRef = ref(null);

const dataSourceConfigDialogResultWithStatusRef = ref(null);

const dialogVisible = ref<boolean>(false);

let dataSourceConfigDto = ref({});
let dataSource = ref({});

const isLoading = ref<boolean>(false);
const isLoadingState = ref<boolean>(false);
const intervalId = ref(null);
const intervalTime = ref(5000);

let formSettings = ref({
  operation: null,
  onlyState: false
});

let form = ref({
  data_source_operations: [],
  datasource_id: "",
  lastUpdated: 0
});

function openDialog(dataSourceValue, dataSourceConfigDtoValue) {
  dataSource.value = dataSourceValue;
  dataSourceConfigDto.value = dataSourceConfigDtoValue;
  dialogVisible.value = true;

  const storageData = helperStorage.get(HelperConstants.getDataSourceConfigDialogRequestKey(dataSourceConfigDto.value.id));
  if (storageData && storageData.datasource_id && storageData.lastUpdated === dataSourceConfigDto.value.lastUpdated) {
    form.value = storageData;
    if (form.value.data_source_operations.length > 0) activeTab.value = form.value.data_source_operations[0].operation;
  }
}

const activeTab = ref(null);
let resultData = ref({});
const requestId = ref<string>("");
let activeRequestFields = ref({});

let statusObj = ref({
  status: "",
  startTime: null,
  endTime: null,
  requestUuid: null
});

let statusObjDefault = ref(JSON.parse(JSON.stringify(statusObj.value)));

let doneStatuses = ref(["DONE", "PARTIALLY_DONE", "AUTH_ERROR"]);

watch(
  dataSourceConfigDto,
  () => {
    if (form.value.data_source_operations.length === 0 && dataSourceConfigDto.value && dataSourceConfigDto.value.endpoints.length > 0) {
      addOperation(dataSourceConfigDto.value.endpoints[0].operation);
    }

    form.value.datasource_id = dataSourceConfigDto.value.id;
  }
);

function addOperation(operation) {
  const endpointDataSourceConfigDto = dataSourceConfigDto.value.endpoints.find((el) => el.operation === operation)!;
  const request_fields = getActiveRequestFieldsForOperation(operation);

  form.value.data_source_operations.push({
    operation: endpointDataSourceConfigDto.operation,
    request_fields,
    clientData: {}
  });
  activeTab.value = operation;
}

function getActiveRequestFieldsForOperation(operation) {
  if (!dataSourceConfigDto.value || !dataSourceConfigDto.value.endpoints) return {};

  const endpointDataSourceConfigDto = dataSourceConfigDto.value.endpoints.find((el) => el.operation === operation)!;
  const dataSourceperation = dataSource.value.operations.find((el) => el.operation === operation)!;
  const request_fields = {};

  const parameters = endpointDataSourceConfigDto.parameters || [];
  const existParameters = parameters.map((el) => el.name);
  parameters.forEach((el) => {
    request_fields[el.name] = el.defaultValue;
  });

  if (dataSourceperation) {
    dataSourceperation.queryFields.forEach((name) => {
      if (!existParameters.includes(name)) {
        request_fields[name] = "";
      }
    });
  }
  return request_fields;
}

onBeforeUnmount(() => {
  onStop(false);
});

async function loadList() {
  const { data } = await getListAll();
  return data;
}

async function onRun() {
  isLoading.value = true;
  resultData.value = {};
  resetStatus();
  let id = "";
  requestId.value = "";
  const listConfigs: any[] = await loadList();
  try {
    const formValue = JSON.parse(JSON.stringify(form.value));
    delete formValue.lastUpdated;

    const dataSource: any = listConfigs.find((el) => el.id === formValue.datasource_id);
    for (const dataSourceOperation of formValue.data_source_operations) {
      const endpoint = dataSource.endpoints.find((endpoint) => endpoint.operation === dataSourceOperation.operation);
      if (!endpoint) continue;
      if (!endpoint.hasOwnProperty('parameters')) continue;for (const key of Object.keys(dataSourceOperation.request_fields)) {
        const endpointParam = endpoint.parameters.find((el) => el.name === key);
        if (!endpointParam) continue;
        if (!dataSourceOperation.request_fields[key]) {
          delete dataSourceOperation.request_fields[key];
        }
      }
    }
    const { data } = await request(formValue);
    id = data;
    requestId.value = id;
  } catch (e) {
    console.error(e);
    onStop();
    return;
  }

  if (formSettings.value.onlyState) {
    dataSourceConfigDialogResultWithStatusRef.value.dialogVisible = true;
    dialogVisible.value = false;
  }
  doRequest(id);

  if (intervalId.value) clearInterval(intervalId.value);
  intervalId.value = setInterval(async () => {
    doRequest(id);
  }, intervalTime.value);
}

function resetStatus() {
  statusObj.value = JSON.parse(JSON.stringify(statusObjDefault.value));
}

async function doRequest(id) {
  if (formSettings.value.onlyState) {
    if (!statusObj.value.startTime) {
      statusObj.value.startTime = moment();
      statusObj.value.requestUuid = id;
    }
    doRequestWithStatus(id);
  } else {
    doRequestWithResult(id);
  }
}

async function doRequestWithResult(id) {
  if (isLoadingState.value) return;

  let resultLocal = null;
  try {
    isLoadingState.value = true;
    const response = await result(id);
    resultLocal = response.data;
  } catch (e) {
    onStop();
    return;
  } finally {
    isLoadingState.value = false;
  }
  if (doneStatuses.value.includes(resultLocal.state)) {
    onStop();
    resultData.value = resultLocal;
    dataSourceConfigDialogResultRef.value.dialogVisible = true;
  }
}

async function doRequestWithStatus(id) {
  if (isLoadingState.value) return;

  let data = null;
  try {
    isLoadingState.value = true;
    const response = await resultState(id);
    data = response.data;
  } catch (e) {
    onStop();
    return;
  } finally {
    isLoadingState.value = false;
  }
  statusObj.value.status = data;
  if (doneStatuses.value.includes(data)) {
    statusObj.value.endTime = moment();
    onStop();
  }
}

function onStop(runEvent = true) {
  isLoading.value = false;
  if (runEvent) eventBus.$emit("connectionRun:stop");
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
  intervalId.value = null;
}

function onClickAddOperation() {
  addOperation(formSettings.value.operation);
  formSettings.value.operation = null;
}

function removeTab(operation) {
  const index = form.value.data_source_operations.findIndex((el) => el.operation === operation);
  let activeTabNew = null;
  const nextIndex = index === 0 ? index + 1 : index - 1;

  if (form.value.data_source_operations[nextIndex]) {
    activeTabNew = form.value.data_source_operations[nextIndex].operation;
    activeTab.value = activeTabNew;
  }

  form.value.data_source_operations.splice(index, 1);
}

watch(
  form,
  () => {
    form.value.lastUpdated = dataSourceConfigDto.value.lastUpdated;
    helperStorage.set(HelperConstants.getDataSourceConfigDialogRequestKey(dataSourceConfigDto.value.id), form.value);
  },
  { deep: true }
);

watch(
  activeTab,
  (value) => {
    activeRequestFields.value = getActiveRequestFieldsForOperation(value) || {};
  },
  { immediate: true }
);

const activeEndpoint = computed(()=>{
  if (!dataSourceConfigDto.value.endpoints) return {};
  // @ts-ignore
  return dataSourceConfigDto.value.endpoints.find((el) => el.operation === activeTab.value)
})

const parametersErrorDescription = computed(()=>{
  if (activeEndpoint.value.hasOwnProperty('parameters') || !activeEndpoint.value['@bean']) return null;
  return `For this type of endpoint, you cannot set additional parameters`;
})

defineExpose({ dialogVisible, dataSourceConfigDto, dataSource, openDialog });
</script>

<style lang="scss">
.data-source-config-dialog-request {
  .flex-wrap-select {
    align-items: center;
    display: flex;
  }

  .flex-select {
    flex-grow: 1;
    margin-bottom: 0 !important;
    padding-right: 15px;
  }

  .el-tabs__nav-prev,
  .el-tabs__nav-next {
    line-height: 39px !important;
  }

  .wrap-header {
    display: flex;
    align-items: center;
    line-height: 24px;
    font-size: 18px;
    color: #303133;
  }
}
</style>
