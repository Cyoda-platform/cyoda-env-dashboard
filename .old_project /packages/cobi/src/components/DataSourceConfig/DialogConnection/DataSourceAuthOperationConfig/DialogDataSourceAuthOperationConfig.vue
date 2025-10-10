<template>
  <div class="dialog-data-source-auth-operation-config">
    <el-dialog append-to-body :close-on-click-modal="false" title="Auth steps" v-model="dialogVisible" width="80%">
      <el-alert class="error-alerts" v-if="allErrorMessages.length > 0" title="Errors" type="error" :closable="false" show-icon>
        <div>
          <ol>
            <li v-for="(allErrorMessage, index) in allErrorMessages" :key="index">{{ allErrorMessage }}</li>
          </ol>
        </div>
      </el-alert>
      <el-form ref="formRef" :rules="rules" :model="form" label-width="240px">
        <el-tabs v-model="activeTabName">
          <el-tab-pane label="Default">
            <el-form-item label="Auth Service Name" prop="authServiceName">
              <el-select clearable @clear="onClearAuthServiceName" @change="onChangeAuthServiceName" v-model="form.authServiceName" placeholder="Select">
                <el-option v-for="item in authServiceNameOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="Base Url" prop="baseUrl">
              <el-input v-model.trim="form.baseUrl" v-remove-slash />
              <span class="hint">Example: https://some_url.com/api</span>
            </el-form-item>

            <el-form-item label="Query Path" prop="query">
              <el-input v-model.trim="form.query" v-add-slash />
              <span class="hint">Example: /get-companies. Support placeholders: ${name} <strong>Full path:</strong> {{ form.baseUrl + form.query }}</span>
            </el-form-item>

            <el-form-item label="Method" prop="method">
              <el-select @change="onChangeMethod" filterable clearable v-model="form.method" placeholder="Select">
                <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="Connection Timeout" prop="connectionTimeout">
              <el-input-number v-model="form.connectionTimeout" :min="0"></el-input-number>
              <span class="hint">Seconds</span>
            </el-form-item>
            <el-form-item label="Read Write Timeout" prop="readWriteTimeout">
              <el-input-number v-model="form.readWriteTimeout" :min="0"></el-input-number>
              <span class="hint">Seconds</span>
            </el-form-item>
            <ProxyConfiguration :form="form" />

            <EndpointBodyTemplate v-if="isNeedBodyTemplate" :form="form" />
          </el-tab-pane>

          <el-tab-pane label="Data Source Authorization Response Config">
            <el-form-item label="Response Parser Name" prop="dataSourceAuthRespConfig.responseParserName">
              <el-select clearable @clear="onClearResponseParserName" @change="onChangeResponseParserName" v-model="form.dataSourceAuthRespConfig.responseParserName" placeholder="Select">
                <el-option v-for="item in responseParserOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>

            <DataSourceAuthOperationConfigEditor v-if="Object.keys(form.dataSourceAuthRespConfig.responseParamToPathMap).length > 0 && activeTabName === '1'" ref="dataSourceAuthOperationConfigEditorRef" :dataSourceAuthRespConfig="form.dataSourceAuthRespConfig" />
          </el-tab-pane>

          <el-tab-pane label="Parameters">
            <HttpParameters :query="form.query" :bodyTemplate="form.bodyTemplate" :parameters="form.parameters" />
          </el-tab-pane>

          <el-tab-pane label="Headers">
            <DataSourceHeaders v-model:targetHeaders="form.headers" />
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="formBefore">
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
import { useDataSourceConfigStore } from "../../../../stores/data-source-config";
import { ref, nextTick, computed, watch } from "vue";

import type { DataSourceAuthOperationConfigDto } from "../../DataSourceConfig";
import HelperDataSourceConfig from "../../../../helpers/HelperDataSourceConfig";
import EndpointBodyTemplate from "../../EndpointBodyTemplate.vue";
import DataSourceHeaders from "../DataSourceHeaders.vue";
import HttpParameters from "../../HttpParameters/HttpParameters.vue";
import ProxyConfiguration from "../../ProxyConfiguration/ProxyConfiguration.vue";

import DataSourceAuthOperationConfigEditor from "./DataSourceAuthOperationConfigEditor.vue";
import HelperContent from "../../../../helpers/HelperContent";

const props = defineProps({
  connectionDetailsDto: {
    default: () => {
      return {};
    }
  }
});
const dataSourceConfigStore = useDataSourceConfigStore();
const isNeedBodyTemplate = computed(() => {
  return ["POST_BODY"].indexOf(form.value.method) > -1;
});
const authServiceNameOptions = computed(() => {
  return authServiceConfigsPreDefined.value.map((el) => {
    return {
      value: el.authServiceName,
      label: el.authServiceName
    };
  });
});
const responseParserOptions = computed(() => {
  return responseParserPreDefined.value.map((el) => {
    return {
      value: el.responseParserName,
      label: el.responseParserName
    };
  });
});
const allErrorMessages = ref([]);
function authServiceConfigs() {
  return dataSourceConfigStore.authServiceConfigs();
}

function authRespParserConfigs() {
  return dataSourceConfigStore.authRespParserConfigs();
}

const formRef = ref(null);

const dataSourceAuthOperationConfigEditorRef = ref(null);

const dialogVisible = ref<boolean>(false);
let methodOptions = ref(HelperDataSourceConfig.endpointMethodOptions);

const activeTabName = ref<string>("0");

let authServiceConfigsPreDefined = ref([]);
let responseParserPreDefined = ref([]);

let form = ref({
  authService: "",
  authServiceName: "",
  baseUrl: "",
  query: "",
  method: "GET",
  bodyTemplate: "",
  headers: {},
  parameters: [],
  dataSourceAuthRespConfig: {
    "@bean": "com.cyoda.plugins.datasource.dtos.connection.auth.resp.DataSourceAuthRespConfigDto",
    responseParser: "",
    responseParserName: "",
    responseParamToPathMap: {}
  },
  connectionTimeout: 300,
  readWriteTimeout: 300,
  proxyConfigurationKey: ""
});

let formDefault = JSON.parse(JSON.stringify(form.value));
const formBefore = ref(null);
const activeForm = ref(null);

let rules = ref({
  authServiceName: [{ required: true, message: "Please select Auth Service Name", trigger: "change" }],
  "dataSourceAuthRespConfig.responseParserName": [{ required: true, message: "Please select Response Parser Name", trigger: "change" }]
});

loadAuthServiceConfigs();
loadAuthRespParserConfigs();

function openDialogAndCreateNew() {
  dialogVisible.value = true;
  formBefore.value = null;
  form.value = JSON.parse(JSON.stringify(formDefault));
}

function openDialogAndEditRecord(data: DataSourceAuthOperationConfigDto) {
  dialogVisible.value = true;

  formBefore.value = data;
  form.value = JSON.parse(JSON.stringify(data));
}

async function loadAuthServiceConfigs() {
  const { data } = await authServiceConfigs();

  authServiceConfigsPreDefined.value = data;
}

function onChangeAuthServiceName(val: string) {
  const selected = authServiceConfigsPreDefined.value.find((el) => el.authServiceName === val);

  if (selected) {
    form.value.authService = selected.authService;

    const blackList = ["authServiceName", "authService", "dataSourceAuthRespConfig"];
    for (const key of Object.keys(selected)) {
      if (blackList.includes(key)) continue;

      if (key === "parameters" && !selected[key]) selected[key] = [];
      form.value[key] = selected[key];
    }
  }
}

function onChangeResponseParserName(val) {
  const selected = responseParserPreDefined.value.find((el) => el.responseParserName === val);

  if (selected) {
    form.value.dataSourceAuthRespConfig.responseParser = selected.responseParser;

    const blackList = ["responseParserName", "responseParser"];
    for (const key of Object.keys(selected)) {
      if (blackList.includes(key)) continue;
      const data = typeof selected[key] === "object" ? JSON.parse(JSON.stringify(selected[key])) : selected[key];
      form.value.dataSourceAuthRespConfig[key] = data;
    }
  }
}

function onClearResponseParserName() {
  form.value.dataSourceAuthRespConfig.responseParamToPathMap = {};
  form.value.dataSourceAuthRespConfig.responseParser = "";
}

function onClearAuthServiceName() {
  form.value.authService = "";
}

async function loadAuthRespParserConfigs() {
  const { data } = await authRespParserConfigs();

  responseParserPreDefined.value = data;
}

function onSave() {
  activeForm.value = null;
  formRef.value.validate((valid, invalidFields) => {
    allErrorMessages.value = HelperContent.getAllErrorMessagesFromForm(invalidFields);
    if (valid) {
      const formValue = JSON.parse(JSON.stringify(form.value));
      props.connectionDetailsDto.authConfig.authOperationConfigs.push(formValue);
      dialogVisible.value = false;
    } else {
      activeForm.value = formRef.value;
    }
  });
}

function onEdit() {
  activeForm.value = null;
  formRef.value.validate((valid, invalidFields) => {
    allErrorMessages.value = HelperContent.getAllErrorMessagesFromForm(invalidFields);
    if (valid) {
      const authOperationConfigs = props.connectionDetailsDto.authConfig.authOperationConfigs;

      const index = authOperationConfigs.indexOf(formBefore.value);
      if (index > -1) {
        authOperationConfigs[index] = form.value;

        dialogVisible.value = false;
      }
    } else {
      activeForm.value = formRef.value;
    }
  });
}

function onChangeMethod() {
  form.value.bodyTemplate = "";
}

watch(
  dialogVisible,
  async (val: boolean) => {
    if (val) {
      await nextTick();

      formRef.value.clearValidate();
    }
  }
);

defineExpose({ dialogVisible, openDialogAndCreateNew, openDialogAndEditRecord });
</script>

<style scoped lang="scss">
.h-cyoda-title {
  margin-left: -20px !important;
  margin-right: -20px !important;
}

.error-alerts ol {
  padding: 0;
  padding-left: 10px;
}
</style>
