<template>
  <div class="dialog-endpoint-http">
    <el-tabs>
      <el-tab-pane label="Main settings">
        <DialogEndpointFieldOperation :endpointDto="endpointDto"/>
        <el-form-item label="Query Path" prop="query">
          <el-input v-model.trim="endpointDto.query" v-add-slash/>
          <span class="hint">Example: /get-companies. Support placeholders: ${name} <strong>Full path:</strong> {{
              connectionDetailsDto.baseUrl + endpointDto.query
            }}</span>
        </el-form-item>

        <el-form-item label="Method" prop="method">
          <el-select filterable clearable v-model="endpointDto.method" placeholder="Select">
            <el-option v-for="item in methodOptions" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
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

        <el-form-item label="Connection Timeout" prop="connectionTimeout">
          <el-input-number v-model="endpointDto.connectionTimeout" :min="0"></el-input-number>
          <span class="hint">Seconds</span>
        </el-form-item>
        <el-form-item label="Read Write Timeout" prop="readWriteTimeout">
          <el-input-number v-model="endpointDto.readWriteTimeout" :min="0"></el-input-number>
          <span class="hint">Seconds</span>
        </el-form-item>

        <EndpointBodyTemplate v-if="isNeedBodyTemplate" :form="endpointDto"/>

        <div class="action-test">
          <el-button :disabled="isDisabledGetDataBtn" :loading="isLoadingTestBtn" @click="onGetTestData" type="warning">
            Get Data
            <font-awesome-icon icon="cubes"/>
          </el-button>
          <el-button :disabled="!testContent" @click="onViewTestData" type="primary">
            View Data
            <font-awesome-icon icon="search"/>
          </el-button>
          <div v-if="isDisabledGetDataBtn" class="hint">Please input Base Url and Query for activate "Get Data" button
          </div>
        </div>

        <el-divider>Consumer</el-divider>
        <div class="flex-row">
          <div class="full-width">
            <el-form-item label="Consumer" prop="consumerConfig.configId">
              <el-select filterable clearable v-model="endpointDto.consumerConfig.configId" placeholder="Select">
                <el-option v-for="item in dataMappingConfigOptions" :key="item.value" :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Consumer Type" prop="consumerConfig.consumerType">
              <el-select filterable v-model="endpointDto.consumerConfig.consumerType" placeholder="Select">
                <el-option v-for="item in dataMappingConsumerTypeOptions" :key="item.value" :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div>
            <el-button :disabled="!endpointDto.consumerConfig.configId" @click="onEditMappingConfig" type="primary">
              Edit
              <font-awesome-icon icon="pencil-alt"/>
            </el-button>
          </div>
        </div>
        <el-divider></el-divider>

        <el-form-item label="Description" prop="type">
          <el-input v-model.trim="endpointDto.type"/>
          <span
            class="hint">Another parameter to separate few endpoints with same operations, but different query.</span>
        </el-form-item>

        <HttpParameters :isDisabledTest="false" :query="endpointDto.query" :bodyTemplate="endpointDto.bodyTemplate"
                        :parameters="endpointDto.parameters" :httpEndpointDto="endpointDto"/>
      </el-tab-pane>
      <el-tab-pane label="Cache" name="second">
        <DialogEndpointHttpCache :cache="endpointDto.cache"/>
      </el-tab-pane>
    </el-tabs>
    <DialogRawData ref="dialogRawDataRef" :content="testContent"/>
    <DialogEndpointUserParameters @confirm="onGetTestDataRequest" ref="dialogEndpointUserParametersRef"/>

    <DialogCreateDataMapping v-if="dialogCreateDataMappingVisible" ref="dialogCreateDataMappingRef"/>
    <DialogCreateChaining v-if="dialogCreateChainingVisible" ref="dialogCreateChainingRef"/>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, nextTick, computed, onBeforeUnmount, inject} from "vue";

import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";
import EndpointBodyTemplate from "../../../components/DataSourceConfig/EndpointBodyTemplate.vue";

import DialogRawData from "../../../components/DataSourceConfig/DialogRawData.vue";

import DialogCreateDataMapping from "../../../components/DataSourceConfig/DialogCreateDataMapping.vue";
import DialogEndpointUserParameters from "../../../components/DataSourceConfig/DialogEndpointUserParameters.vue";
import DialogCreateChaining from "../DialogCreateChaining.vue";
import HttpParameters from "../HttpParameters/HttpParameters.vue";
import DialogEndpointHttpCache from "./DialogEndpointHttpCache.vue";
import DialogEndpointFieldOperation from "./Fields/DialogEndpointFieldOperation.vue";
import {Buffer} from "buffer";
import {useDataSourceConfigStore} from "../../../stores/data-source-config";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useChainingConfigStore} from "../../../stores/chaining-config";

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

const isNeedBodyTemplate = computed(() => {
  return ["POST_BODY"].indexOf(props.endpointDto.method) > -1;
});
const dataMappingConfigOptions = computed(() => {
  return props.listAllDataMappings.map((el) => {
    return {
      value: el.id,
      label: el.name
    };
  });
});
const isDisabledGetDataBtn = computed(() => {
  return !props.connectionDetailsDto.baseUrl || !props.endpointDto.query || !props.endpointDto.method || !props.endpointDto.consumerConfig.configId;
});

function postCheckEndpointConnection(dataRequest) {
  return dataSourceConfigStore.postCheckEndpointConnection(dataRequest);
}

function getAvailableAuthTypeConfig(authType) {
  return dataSourceConfigStore.getAvailableAuthTypeConfig(authType);
}

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
let dataMappingConsumerTypeOptions = reactive([
  {
    value: "COBI_MAPPER",
    label: "Cobi Mapper"
  },
  {
    value: "ARCHIVE_CONTENT_MAPPER",
    label: "Archive Content Mapper"
  }
]);
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

let methodOptions = reactive(HelperDataSourceConfig.endpointMethodOptions);

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
  try {
    isLoadingTestBtn.value = true;

    const {data} = await getAvailableAuthTypeConfig(props.connectionDetailsDto.authType);
    data.forEach((el) => {
      userParameters.push({
        name: el,
        value: "",
        type: "AUTH",
        required: false
      });
    });
  } finally {
    isLoadingTestBtn.value = false;
  }
  props.endpointDto.parameters.forEach((el) => {
    userParameters.push({
      name: el.name,
      value: el.defaultValue,
      type: "PARAM",
      required: el.required
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
      type: "HTTP",
      connectionDetails,
      endpointDetailsDto: endpoint,
      userParameters
    };
    const {data} = await postCheckEndpointConnection(dataRequest);
    let responseContent = "";
    if (data.responseContentType === "application/octet-stream") {
      responseContent = Buffer.from(data.responseContent, "hex").toString("utf8");
    } else {
      responseContent = data.responseContent;
    }
    testContent.value = responseContent;
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
  dialogRawDataRef.value.dialogCreateDataMappingVisible = false;
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
  dialogCreateDataMappingRef.value.dataMapperEditRef.loadMappingById(props.endpointDto.consumerConfig.configId)
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
  await nextTick()
  dialogCreateChainingRef.value.dataChainingEditRef.loadDataSourceById(id);
}

defineExpose({dialogCreateDataMappingVisible, dialogCreateChainingVisible, dialogVisible});
</script>

<style lang="scss">
.dialog-endpoint-http {
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
