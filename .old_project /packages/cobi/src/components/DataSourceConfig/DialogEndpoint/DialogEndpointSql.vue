<template>
  <div class="dialog-endpoint-sql">
    <DialogEndpointFieldOperation :endpointDto="endpointDto"/>

    <el-form-item label="Query" prop="query">
      <el-input v-model="endpointDto.query"/>
      <span class="hint">Example: SELECT * FROM users WHERE id=:id</span>
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Chainings" prop="chainings">
          <el-select multiple clearable filterable v-model="endpointDto.chainings" placeholder="Select">
            <el-option v-for="item in listAllChainingList" :key="item.id" :label="item.name"
                       :value="item.id"></el-option>
          </el-select>
          <div v-if="endpointDto.chainings.length > 0">
            Edit:
            <template v-for="(chainingId, index) in endpointDto.chainings">
              <el-link @click="onClickEditNewChaining(chainingId)" type="primary">
                {{ getChainingNameById(chainingId) }}
              </el-link>
              <el-divider v-if="endpointDto.chainings.length !== index + 1" direction="vertical"/>
            </template>
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-button @click="onClickAddNewChaining" type="primary">
          Add New Chaining
          <font-awesome-icon icon="plus"/>
        </el-button>
      </el-col>
    </el-row>

    <div class="action-test">
      <el-button :disabled="isDisabledGetDataBtn" :loading="isLoadingTestBtn" @click="onGetTestData" type="warning">
        Get Data
        <font-awesome-icon icon="cubes"/>
      </el-button>
      <el-button :disabled="!testContent" @click="onViewTestData" type="primary">
        View Data
        <font-awesome-icon icon="search"/>
      </el-button>

      <div v-if="isDisabledGetDataBtn" class="hint">Please input jdbcUrl, driverClassName and Query for activate "Get
        Data" button
      </div>
    </div>
    <div class="flex-row">
      <div class="full-width">
        <el-form-item label="Data Mapping Config" prop="consumerConfig.configId">
          <el-select filterable clearable v-model="endpointDto.consumerConfig.configId" placeholder="Select">
            <el-option v-for="item in dataMappingConfigOptions" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
          <span class="hint">Only CSV mappings available</span>
        </el-form-item>
      </div>
      <div>
        <el-button :disabled="!endpointDto.consumerConfig.configId" @click="onEditMappingConfig" type="primary">
          Edit
          <font-awesome-icon icon="pencil-alt"/>
        </el-button>
      </div>
    </div>

    <div class="endpoint-actions">
      <el-button @click="addNewParameter" type="primary">
        Add New Parameter
        <font-awesome-icon icon="plus"/>
      </el-button>
    </div>

    <el-table :data="endpointDto.parameters" stripe style="width: 100%">
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="type" label="Type">
        <template #default="{ row }">
          {{ getParameterName(row.sqlType) }}
        </template>
      </el-table-column>
      <el-table-column label="Actions">
        <template #default="{ row }">
          <el-button @click="onEditParameter(row)" size="default" type="primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
          </el-button>
          <el-button @click="onDeleteParameter(row)" size="default" type="danger">
            <font-awesome-icon icon="trash"></font-awesome-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-form-item class="check-parameters" :rules="[{ validator: checkParameters }]" prop="parameters"></el-form-item>
    <DialogEndpointParametersSql ref="dialogEndpointParametersRef" :endpointDto="endpointDto"
                                 :placeholders="placeholders"/>
    <DialogRawData ref="dialogRawDataRef" :content="testContent"/>
    <DialogEndpointUserParameters @confirm="onGetTestDataRequest" ref="dialogEndpointUserParametersRef"/>

    <DialogCreateDataMapping v-if="dialogCreateDataMappingVisible" ref="dialogCreateDataMappingRef"/>
    <DialogCreateChaining v-if="dialogCreateChainingVisible" ref="dialogCreateChainingRef"/>
  </div>
</template>

<script setup lang="ts">
import {ElMessageBox} from "element-plus";

import {ref, nextTick, computed, onBeforeUnmount, inject} from "vue";

import type {HttpParameterDto} from "../DataSourceConfig";
import DialogEndpointParametersSql from "../DialogEndpointParameters/DialogEndpointParametersSql.vue";
import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";
import HelperContent from "../../../helpers/HelperContent";

import DialogRawData from "../../../components/DataSourceConfig/DialogRawData.vue";

import DialogCreateDataMapping from "../../../components/DataSourceConfig/DialogCreateDataMapping.vue";
import DialogEndpointUserParameters from "../../../components/DataSourceConfig/DialogEndpointUserParameters.vue";
import DialogCreateChaining from "../DialogCreateChaining.vue";
import DialogEndpointFieldOperation from "./Fields/DialogEndpointFieldOperation.vue";
import {useChainingConfigStore} from "../../../stores/chaining-config";
import {useDataSourceConfigStore} from "../../../stores/data-source-config";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  endpointDto: {
    default: () => {
      return {};
    }
  },
  connectionDetailsDto: {
    default: () => {
      return {};
    }
  },
  listAllDataMappings: {
    default: () => {
      return [];
    }
  }
});
const dataSourceConfigStore = useDataSourceConfigStore();
const chainingConfigStore = useChainingConfigStore();

const dataMappingConfigOptions = computed(() => {
  return props.listAllDataMappings
    .filter((el) => el.dataType === "CSV")
    .map((el) => {
      return {
        value: el.id,
        label: el.name
      };
    });
});
const isDisabledGetDataBtn = computed(() => {
  return !props.connectionDetailsDto.jdbcUrl || !props.connectionDetailsDto.driverClassName || !props.endpointDto.query;
});
const placeholders = computed(() => {
  const placeholdersForQuery = HelperContent.getPlaceholdersFromSqlString(props.endpointDto.query).map((el) => {
    return {
      type: "PATH_VARIABLE",
      label: el
    };
  });

  return [...placeholdersForQuery];
});

function postCheckEndpointConnection(dataRequest) {
  return dataSourceConfigStore.postCheckEndpointConnection(dataRequest);
}

function getAvailableAuthTypeConfig() {
  return dataSourceConfigStore.getAvailableAuthTypeConfig();
}

const dialogEndpointParametersRef = ref(null);

const dialogRawDataRef = ref(null);

const dialogEndpointUserParametersRef = ref(null);

const dialogCreateDataMappingRef = ref(null);

const dialogCreateChainingRef = ref(null);

const getForm = inject("getForm");

const dialogCreateDataMappingVisible = ref<boolean>(true);
const dialogCreateChainingVisible = ref<boolean>(true);
const dialogVisible = ref<boolean>(false);
const isLoadingTestBtn = ref<boolean>(false);
const testContent = ref(null);

let listAllChainingList = ref([]);
eventBus.$on("dataMapping:created", dataMappingCreated);
eventBus.$on("dataChaining:created", dataChainingCreated);
loadChainings();

onBeforeUnmount(() => {
  eventBus.$off("dataMapping:created", dataMappingCreated);
  eventBus.$off("dataChaining:created", dataChainingCreated);
});

async function loadChainings() {
  const {data} = await chainingConfigStore.getListAll();
  listAllChainingList.value = data;
}

function checkParameters(rule: any, value: any, callback: any) {
  const placeholdersQuery = HelperContent.getPlaceholdersFromSqlString(props.endpointDto.query);
  const parametersPathVariables = props.endpointDto.parameters.map((el) => el.name.toLowerCase());
  const notFoundQuery = getNotUsedPlaceholders(parametersPathVariables, placeholdersQuery);

  if (notFoundQuery.length > 0) {
    return callback(new Error(`Please add 'Path Variable' to parameters for placeholders: ${notFoundQuery.join(", ")}`));
  }

  callback();
}

function getNotUsedPlaceholders(parameters: string[], placeholders: string[]) {
  let notFound: string[] = [];
  if (placeholders.length > 0) {
    placeholders.forEach((placeholder) => {
      if (parameters.indexOf(placeholder) == -1) {
        notFound.push(placeholder);
      }
    });
  }
  return notFound;
}

function addNewParameter() {
  dialogEndpointParametersRef.value.openDialogAndCreateNew();
}

function onEditParameter(row: HttpParameterDto) {
  dialogEndpointParametersRef.value.openDialogAndEditRecord(row);
}

function onDeleteParameter(row: HttpParameterDto) {
  ElMessageBox.confirm("Do you really want to remove parameter?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const index = props.endpointDto.parameters.indexOf(row);
        if (index !== -1) {
          props.endpointDto.parameters.splice(index, 1);
        }
      }
    }
  });
}

function getParameterName(val: string) {
  return HelperDataSourceConfig.getNameFromEndpointParameterSqlTypeOptions(val);
}

async function onGetTestData() {
  getForm().validate(async (valid) => {
    if (valid) {
      const userParameters = await getListOfUserParameters();
      if (userParameters.length > 0) {
        Object.keys(dialogEndpointUserParametersRef.value.form).forEach((key) => {
          const userParameter = userParameters.find((el) => el.name === key);
          if (userParameter) {
            userParameter.value = dialogEndpointUserParametersRef.value.form[key];
          }
        });
        dialogEndpointUserParametersRef.value.userParameters = userParameters;
        dialogEndpointUserParametersRef.value.dialogVisible = true;
      } else {
        onGetTestDataRequest();
      }
    }
  });
}

async function getListOfUserParameters() {
  const userParameters: {
    name: string;
    value: string;
    type: string;
    required: boolean;
  }[] = [];
  props.endpointDto.parameters.forEach((el) => {
    userParameters.push({
      name: el.name,
      value: el.defaultValue,
      type: "PARAM",
      required: false
    });
  });

  return userParameters;
}

async function onGetTestDataRequest(userParameters = []) {
  isLoadingTestBtn.value = true;
  testContent.value = null;

  const connectionDetails = JSON.parse(JSON.stringify(props.connectionDetailsDto));
  const endpoint = JSON.parse(JSON.stringify(props.endpointDto));
  delete endpoint['chatBotId'];
  delete connectionDetails.connectionIndex;
  try {
    const dataRequest = {
      type: "SQL",
      connectionDetails,
      endpointDetailsDto: endpoint,
      userParameters
    };
    const {data} = await postCheckEndpointConnection(dataRequest);
    testContent.value = data.responseContent;
    dialogRawDataRef.value.dialogVisible = true;
  } finally {
    isLoadingTestBtn.value = false;
  }
}

function onViewTestData() {
  dialogRawDataRef.value.dialogVisible = true;
}

function dataMappingCreated(data: any) {
  dialogCreateDataMappingRef.value.dialogVisible = false;
  dialogRawDataRef.value.dialogVisible = false;
  if (dialogRawDataRef.value && dialogRawDataRef.value.dialogCreateDataMapping) dialogRawDataRef.value.dialogCreateDataMapping.dialogVisible = false;
  props.endpointDto.consumerConfig.configId = data.configId;
}

function dataChainingCreated(data: any) {
  loadChainings();
  if (!props.endpointDto.chainings.includes(data.configId)) {
    props.endpointDto.chainings.push(data.configId);
  }
  dialogCreateChainingRef.value.dialogVisible = false;
}

async function onEditMappingConfig() {
  dialogCreateDataMappingVisible.value = false;
  await nextTick();

  dialogCreateDataMappingVisible.value = true;
  await nextTick();

  dialogCreateDataMappingRef.value.dialogVisible = true;
  await nextTick();
  dialogCreateDataMappingRef.value.dataMapperEditRef.loadMappingById(props.endpointDto.consumerConfig.configId);
}

function getChainingNameById(id) {
  const chaining = listAllChainingList.value.find((el) => el.id === id);
  if (chaining) {
    return chaining.name;
  }
  return "";
}

async function onClickAddNewChaining() {
  dialogCreateChainingVisible.value = false;
  await nextTick();

  dialogCreateChainingVisible.value = true;
  await nextTick();

  dialogCreateChainingRef.value.dialogVisible = true;
}

async function onClickEditNewChaining(id) {
  dialogCreateChainingVisible.value = false;
  await nextTick();

  dialogCreateChainingVisible.value = true;
  await nextTick();

  dialogCreateChainingRef.value.dialogVisible = true;
  await nextTick();
  dialogCreateChainingRef.value.dataChainingEditRef.loadDataSourceById(id);
}

defineExpose({dialogCreateDataMappingVisible, dialogCreateChainingVisible, dialogVisible});
</script>

<style lang="scss">
.dialog-endpoint-sql {
  .endpoint-actions {
    margin-bottom: 10px;
    text-align: right;
  }

  .action-test {
    margin-bottom: 15px;
    padding-left: 180px;
  }

  .hint {
    font-size: 12px;
    color: #a1a0a0;
    line-height: normal;
    display: block;
    margin-top: 5px;
  }

  .flex-row {
    display: flex;

    .full-width {
      flex-grow: 1;
      margin-right: 15px;
    }
  }

  .handle {
    cursor: pointer;
    transition: all 0.5s;

    &:hover {
      opacity: 0.5;
    }
  }

  .check-parameters {
    margin-top: 15px;
  }
}
</style>
