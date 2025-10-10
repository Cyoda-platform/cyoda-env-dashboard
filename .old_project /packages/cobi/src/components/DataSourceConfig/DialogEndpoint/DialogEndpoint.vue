<template>
  <div class="dialog-endpoint-connection">
    <el-dialog :close-on-click-modal="false" title="Endpoint" v-model="dialogVisible" width="90%" @close="onCloseDialog">
      <el-form :model="endpointDto" :rules="rules" ref="formRef" label-width="180px">
        <div class="inline-form">
          <div class="dropdown">
            <el-form-item label="Connection" prop="connectionIndex">
              <el-select @change="onChangeConnection" v-model="endpointDto.connectionIndex" placeholder="Select">
                <el-option v-for="connectionOption in connectionOptions" :key="connectionOption.value"
                           :label="connectionOption.label" :value="connectionOption.value"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div>
            <AIChatBot
              v-if="isChatBotEnabled"
              :id="chatBotId"
              :onlyReturnObject="onlyReturnObject"
              :chatBotDefaultMessages="chatBotDefaultMessages"
              :disabled="endpointDto.connectionIndex===null || !chatBotId"
              :initialFn="initialFn"
              :submitMessageFn="submitMessageFn"
              :axiosChatBotController="axiosChatBotController"
              defaultReturnObject="random"
              category="connections"
            />
          </div>
        </div>

        <template v-if="type === 'Http'">
          <DialogEndpointHttp :listAllDataMappings="listAllDataMappings" :endpointDto="endpointDto"
                              :connectionDetailsDto="connectionDetailsDto"/>
        </template>
        <template v-if="type === 'Sql'">
          <DialogEndpointSql :listAllDataMappings="listAllDataMappings" :endpointDto="endpointDto"
                             :connectionDetailsDto="connectionDetailsDto"/>
        </template>
        <template v-if="type === 'Workflow'">
          <DialogEndpointWorkflow :endpointDto="endpointDto"/>
        </template>
        <template v-if="type === 'BlobStorage'">
          <DialogEndpointBlobStorage :listAllDataMappings="listAllDataMappings" :endpointDto="endpointDto"/>
        </template>
      </el-form>
      <el-divider/>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="endpointDtoBefore">
          <el-button type="success" @click="onEdit">Apply</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="onSave">Apply</el-button>
        </template>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, watch, provide, inject} from "vue";

import type {HttpEndpointDto, SqlEndpointDto, WorkflowEndpointDto} from "../DataSourceConfig";
import DialogEndpointHttp from "./DialogEndpointHttp.vue";
import DialogEndpointSql from "./DialogEndpointSql.vue";

import DialogEndpointWorkflow from "./DialogEndpointWorkflow.vue";
import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";
import DialogEndpointBlobStorage from "./DialogEndpointBlobStorage.vue";
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import AIChatBot from "@cyoda/ui-lib/src/components-library/elements/AIChatBot/AIChatBot.vue";
import {useChatbotStore} from "@cyoda/ui-lib/src/stores/chatbot";
import {v4 as uuidv4} from "uuid";
import {handlerError} from "@cyoda/ui-lib/src/helpers/HelperChatbot";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";

const isChatBotEnabled = HelperFeatureFlags.isChatBotEnabled();
const chatBotId = inject("chatBotId");
const initialFn = inject("initialFn");
const chatBotDefaultMessages = {
  parameters: 'Parameters were changed'
};

const props = defineProps({
  dataSourceConfigDto: {
    default: () => {
      return {};
    }
  }
});
const platformMappingStore = usePlatformMappingStore();

const connectionOptions = computed(() => {
  return props.dataSourceConfigDto.connections.map((el, index) => {
    return {
      value: index,
      label: el.name,
      "@bean": el["@bean"]
    };
  });
});
const type = computed(() => {
  let type = null;
  if (endpointDto.value.connectionIndex === null) return type;
  const connection = props.dataSourceConfigDto.connections[endpointDto.value.connectionIndex];
  return HelperDataSourceConfig.geConnectionType(connection);
});

function getListAllDataMappings(value) {
  return platformMappingStore.getListAllDataMappings(value);
}

const formRef = ref(null);

let listAllDataMappings = ref([]);
loadListAllDataMappings();
eventBus.$on("dataMapping:created", loadListAllDataMappings);

async function loadListAllDataMappings() {
  const {data} = await getListAllDataMappings(false);
  listAllDataMappings.value = data;
}

const dialogVisible = ref<boolean>(false);

let connectionDetailsDto = reactive({});
const chatbotStore = useChatbotStore();

const endpointDto = ref<HttpEndpointDto | SqlEndpointDto | WorkflowEndpointDto>({
  "@bean": "com.cyoda.plugins.datasource.dtos.endpoint.HttpEndpointDto",
  operation: "",
  connectionIndex: null,
  type: "",
  query: "",
  cache: {
    parameters: [],
    ttl: 0
  },

  method: "",
  chainings: [],
  parameters: [],
  bodyTemplate: "",
  connectionTimeout: 300,
  readWriteTimeout: 300,
  consumerConfig: {
    configId: "",
    consumerType: "COBI_MAPPER"
  }
});

let endpointDtoDefault = JSON.parse(JSON.stringify(endpointDto.value));

const endpointDtoBefore = ref(null);

let rulesHttp = reactive({
  consumerConfig: {
    configId: [{required: true, message: "Please Select Consumer", trigger: "change"}],
    consumerType: [{required: true, message: "Please Select Consumer Type", trigger: "change"}]
  },
  type: [{required: true, message: "Please input Type", trigger: "change"}],
  query: [{required: true, message: "Please input Query", trigger: "blur"}],
  method: [{required: true, message: "Please input Method", trigger: "blur"}],
  operation: [{required: true, message: "Please input Operation", trigger: "blur"}],
  connectionIndex: [{required: true, message: "Please select connection", trigger: "change"}]
});

let rulesSql = reactive({
  consumerConfig: {
    configId: [{required: true, message: "Please input Name", trigger: "change"}]
  },
  query: [{required: true, message: "Please input Query", trigger: "blur"}],
  operation: [{required: true, message: "Please input Operation Name", trigger: "blur"}],
  connectionIndex: [{required: true, message: "Please select connection", trigger: "change"}]
});

let rulesWorkflow = reactive({
  operation: [{required: true, message: "Please input Operation Name", trigger: "blur"}]
});
let rules = reactive({});

function onChangeConnection(value) {
  if (type.value === "Http") {
    endpointDto.value = JSON.parse(JSON.stringify(endpointDtoDefault));
    rules = rulesHttp;
  } else if (type.value === "Sql") {
    endpointDto.value = {
      "@bean": "com.cyoda.plugins.datasource.dtos.endpoint.SqlEndpointDto",
      connectionIndex: null,
      operation: "",
      query: "",
      chainings: [],
      parameters: [],
      consumerConfig: {
        configId: "",
        consumerType: "COBI_MAPPER"
      }
    };

    rules = rulesSql;
  } else if (type.value === "Workflow") {
    endpointDto.value = {
      "@bean": "com.cyoda.plugins.datasource.dtos.endpoint.WorkflowSourceEndpointDto",
      connectionIndex: null,
      operation: ""
    };
    rules = rulesWorkflow;
  } else if (type.value === "BlobStorage") {
    endpointDto.value = {
      "@bean": "com.cyoda.plugins.datasource.dtos.endpoint.BlobStorageEndpointDto",
      connectionIndex: null,
      operation: "",
      consumerConfig: {
        configId: "",
        consumerType: "COBI_MAPPER"
      }
    };
  }
  endpointDto.value.connectionIndex = value;
  setTimeout(() => {
    formRef.value.clearValidate();
  }, 100);
}

function openDialogAndCreateNew() {
  dialogVisible.value = true;
  endpointDtoBefore.value = null;
  endpointDto.value = JSON.parse(JSON.stringify(endpointDtoDefault));
}

function openDialogAndEditRecord(data) {
  dialogVisible.value = true;
  endpointDtoBefore.value = data;
  let tmpEndpointDetailsDto = JSON.parse(JSON.stringify(data));

  if (type.value === "HTTP") {
    if (!tmpEndpointDetailsDto.cache) {
      tmpEndpointDetailsDto.cache = {
        parameters: [],
        ttl: 0
      };
    }
  }
  endpointDto.value = tmpEndpointDetailsDto;
}

function onSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      props.dataSourceConfigDto.endpoints.push(endpointDto.value);
      dialogVisible.value = false;
    }
  });
}

function onEdit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const index = props.dataSourceConfigDto.endpoints.indexOf(endpointDtoBefore.value);
      if (index > -1) {
        props.dataSourceConfigDto.endpoints[index] = endpointDto.value;

        dialogVisible.value = false;
      }
    }
  });
}

function getForm() {
  return formRef.value;
}

provide('getForm', getForm);

// Chatbot
const onlyReturnObject = ['random', 'parameters'];

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


    if (['parameters'].includes(key)) {
      data.message.forEach((param) => {
        endpointDto.value.parameters.push(param);
      })
      element.repeats.push([{
        type: 'text',
        text: 'Parameters were changed',
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

function onCloseDialog(){
  eventBus.$emit('dialogEndpoint:close');
}

watch(
  () => endpointDto.value.connectionIndex,
  (value) => {
    if (value < -1) return;
    connectionDetailsDto = props.dataSourceConfigDto.connections[value];
  },
  {immediate: true}
);

defineExpose({openDialogAndCreateNew, openDialogAndEditRecord});
</script>

<style lang="scss">
.inline-form {
  display: flex;
  gap: 10px;

  .dropdown {
    flex: 1;
  }
}
</style>
