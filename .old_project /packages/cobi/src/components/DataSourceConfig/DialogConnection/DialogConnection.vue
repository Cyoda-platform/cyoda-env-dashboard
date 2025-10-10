<template>
  <div class="dialog-endpoint-connection">
    <el-dialog :close-on-click-modal="false" title="Connection" v-model="dialogVisible" width="90%">
      <el-form :model="connectionDetailsDto" :rules="rules" ref="formRef" label-width="180px">
        <el-form-item label="Type" prop="type">
          <el-select @change="onChangeType" v-model="type" placeholder="Select">
            <el-option v-for="value in typeOptions" :key="value" :label="value" :value="value"></el-option>
          </el-select>
        </el-form-item>

        <template v-if="type === 'Http'">
          <DialogConnectionHttp :connectionDetailsDto="connectionDetailsDto"/>
        </template>
        <template v-if="type === 'Sql'">
          <DialogConnectionSql :connectionDetailsDto="connectionDetailsDto"/>
        </template>
        <template v-if="type === 'Workflow'">
          <DialogConnectionWorkflow :connectionDetailsDto="connectionDetailsDto"/>
        </template>
        <template v-if="type === 'BlobStorage'">
          <DialogConnectionBlobStorage :connectionDetailsDto="connectionDetailsDto"/>
        </template>
      </el-form>
      <el-divider/>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="connectionDetailsDtoBefore">
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
import {ref} from "vue";

import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";
import DialogConnectionHttp from "./DialogConnectionHttp.vue";
import DialogConnectionSql from "./DialogConnectionSql.vue";

import {isWebUri} from "valid-url";
import DialogConnectionWorkflow from "./DialogConnectionWorkflow.vue";
import DialogConnectionBlobStorage from "./DialogConnectionBlobStorage.vue";

const props = defineProps({
  dataSourceConfigDto: {
    default: () => {
      return {};
    }
  }
});

const formRef = ref(null);

const dialogVisible = ref<boolean>(false);
const type = ref(null);

const connectionDetailsDto = ref({
  "@bean": "com.cyoda.plugins.datasource.dtos.connection.HttpConnectionDetailsDto",
  name: "",
  baseUrl: "",
  authType: "NONE",
  headers: {},
  proxyConfigurationKey: null,
  authConfig: HelperDataSourceConfig.getDefaultAuthConfig()
});

let connectionDetailsDtoDefault = ref(JSON.parse(JSON.stringify(connectionDetailsDto.value)));

const connectionDetailsDtoBefore = ref(null);

let rulesHttp = ref({
  name: [{required: true, trigger: "blur", message: "Please fill field Name"}],
  baseUrl: [{validator: checkUrl, required: true, trigger: "blur"}],
  authType: [{required: true, trigger: "blur", message: "Please fill field Auth Type"}]
});

let rulesSql = ref({
  name: [{required: true, trigger: "blur", message: "Please fill field Name"}]
});

let rulesWorkflow = ref({
  name: [{required: true, trigger: "blur", message: "Please fill field Name"}]
});

let rules = ref(rulesHttp.value);

function checkUrl(rule: any, value: any, callback: any) {
  if (!value) {
    return callback(new Error("Please fill field Base Url"));
  }

  if (!isWebUri(value)) {
    callback(new Error("Please fill correct field Base Url"));
  }
  callback();
}

let typeOptions = ref(["Http", "Sql", "Workflow", "BlobStorage"]);

function onChangeType(type) {
  if (type === "Http") {
    connectionDetailsDto.value = JSON.parse(JSON.stringify(connectionDetailsDtoDefault.value));
    rules.value = rulesHttp.value;
  } else if (type === "Sql") {
    rules.value = rulesSql.value;
    connectionDetailsDto.value = {
      "@bean": "com.cyoda.plugins.datasource.dtos.connection.SqlConnectionDetailsDto",
      name: "",
      jdbcUrl: "",
      username: "",
      password: "",
      driverClassName: "",
      connectionProperties: {}
    };
  } else if (type === "Workflow") {
    rules.value = rulesWorkflow.value;
    connectionDetailsDto.value = {
      "@bean": "com.cyoda.plugins.datasource.dtos.connection.WorkflowSourceConnectionDetailsDto",
      name: "",
      entityClass: null
    };
  } else if (type === "BlobStorage") {
    connectionDetailsDto.value = {
      "@bean": "com.cyoda.plugins.datasource.dtos.connection.BlobStorageConnectionDetailsDto",
      name: "",
      storageSpec: {
        "@bean": "com.cyoda.plugins.datasource.dtos.connection.storage.CyodaBlobStorageSpecDto"
      }
    };
  }
  setTimeout(()=>{
    formRef.value.clearValidate();
  },100);
}

function openDialogAndCreateNew() {
  dialogVisible.value = true;
  connectionDetailsDtoBefore.value = null;
  connectionDetailsDto.value = JSON.parse(JSON.stringify(connectionDetailsDtoDefault.value));
}

function openDialogAndEditRecord(data) {
  dialogVisible.value = true;
  connectionDetailsDtoBefore.value = data;
  connectionDetailsDto.value = JSON.parse(JSON.stringify(data));
  type.value = HelperDataSourceConfig.geConnectionType(data);
}

function onSave() {
  formRef.value.validate((valid) => {
    if (valid) {
      props.dataSourceConfigDto.connections.push(connectionDetailsDto.value);
      dialogVisible.value = false;
    }
  });
}

function onEdit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const index = props.dataSourceConfigDto.connections.indexOf(connectionDetailsDtoBefore.value);
      if (index > -1) {
        props.dataSourceConfigDto.connections[index] = connectionDetailsDto.value;

        dialogVisible.value = false;
      }
    }
  });
}

defineExpose({openDialogAndCreateNew, openDialogAndEditRecord});
</script>
