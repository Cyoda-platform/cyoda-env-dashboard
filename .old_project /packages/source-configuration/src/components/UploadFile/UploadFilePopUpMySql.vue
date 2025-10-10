<template>
  <div class="configuration-form">
    <el-dialog :close-on-click-modal="false" :title="computedTitle" v-model="dialogVisible" width="90%">
      <el-steps :active="activeStep" align-center>
        <el-step title="Step 1" />
        <el-step title="Step 2" />
      </el-steps>
      <template v-if="activeStep === 1">
        <UploadFilePopUpMySqlConnectionForm ref="uploadFilePopUpMySqlConnectionFormRef" :form="wkJdbcSourceConfDto.connection" />
      </template>
      <template v-if="activeStep === 2">
        <UploadFileSampleColumnSettings @create="onCreate" @mySqlAddNewStep="onMySqlAddNewStep" @mySqlRemoveStep="onMySqlRemoveStep" :dstColumns="dstColumnsComputed" fileType="MySql" :wkJdbcSourceConfDto="wkJdbcSourceConfDto" />
      </template>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" v-if="activeStep === 1" @click="onTestConnection">Test Connection</el-button>
        <el-button v-if="isEditMode" @click="activeStep = 1" :disabled="activeStep === 1">Prev</el-button>
        <el-button v-if="isEditMode" @click="activeStep = 2" :disabled="activeStep === 2">Next</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref, computed } from "vue";

import UploadFileSample from "./UploadFileSample.vue";
import UploadFilePopUpMySqlConnectionForm from "./UploadFilePopUpMySqlConnectionForm.vue";
import UploadFileSampleColumnSettings from "./UploadFileSampleColumnSettings.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useFileUploadApiStore} from "../../stores/encompass";
import {useWolterskluwerStore} from "../../stores/wolterskluwer";

const wolterskluwerStore = useWolterskluwerStore();
const fileUploadApiStore = useFileUploadApiStore();
const dstColumnsComputed = computed(() => {
  return dstColumns.value.filter((el) => el.entityClass === wkJdbcSourceConfDto.value.dstEntityClass);
});
const computedTitle = computed(() => {
  return isEditMode.value ? `Update New Configuration for JDBC` : `Create New Configuration for JDBC`;
});
const isEditMode = computed(() => {
  return Object.keys(editData.value).length > 0;
});
function postTestConnection(connection) {
  return wolterskluwerStore.postTestConnection(connection);
}

function postSave() {
  return wolterskluwerStore.postSave();
}

function getAliases() {
  return fileUploadApiStore.getAliases();
}

const uploadFilePopUpMySqlConnectionFormRef = ref(null);

const dialogVisible = ref<boolean>(false);

let dstColumns = ref([]);
const activeStep = ref(1);
let editData = ref({});

let mySqlColumnMappingConfig = ref({
  srcColumnName: "",
  srcColumnType: "",
  mapperClass: "",
  mapperFormatParam: "",
  dstType: "",
  dstAliasId: "",
  dstAliasName: "",
  dstColumnPath: ""
});

let wkJdbcSourceConfDto = ref({
  id: "",
  connection: {
    url: "",
    driverClassName: "",
    username: "",
    password: "",
    testSql: ""
  },
  dstEntityClass: "",
  srcSql: "",
  columnMappingConfigs: [],
  name: ""
});

eventBus.$on("upload-data:edit", editConfiguration);
loadEntityFields();

if (wkJdbcSourceConfDto.value.columnMappingConfigs.length === 0) {
  addNewConfigToMySql();
}

function editConfiguration(data: any) {
  editData.value = JSON.parse(JSON.stringify(data));
  wkJdbcSourceConfDto.value = JSON.parse(JSON.stringify(editData.value));
  dialogVisible.value = true;
}

function onCreate() {
  dialogVisible.value = false;
  eventBus.$emit("create:csv");
}

function onMySqlAddNewStep() {
  addNewConfigToMySql();
}

function onMySqlRemoveStep(index: string | number) {
  wkJdbcSourceConfDto.value.columnMappingConfigs.splice(index, 1);
}

async function loadEntityFields() {
  const data = await getAliases();
  dstColumns.value = data.filter((el: any) => el.aliasDef.aliasPaths.value.length === 1);
}

function addNewConfigToMySql() {
  wkJdbcSourceConfDto.value.columnMappingConfigs.push(JSON.parse(JSON.stringify(mySqlColumnMappingConfig.value)));
}

function onTestConnection() {
  uploadFilePopUpMySqlConnectionFormRef.value.elForm.validate(async (valid) => {
    if (valid) {
      const data = await postTestConnection(wkJdbcSourceConfDto.value.connection);
      if (data.success) {
        ElNotification({ type: "success", title: "Success", message: "Correct settings" });
        if (!isEditMode.value) {
          activeStep.value = 2;
        }
      } else {
        ElNotification({ type: "error", title: "Error", message: "Settings is wrong" });
      }
    }
  });
}

defineExpose({ dialogVisible });
</script>

<style lang="scss">
.configuration-form {
  .footer-nav {
    svg {
      margin-right: 5px;
    }
  }

  .footer ul li a {
    padding: 0.5rem 1rem !important;
  }

  .el-form-item__label {
    padding-bottom: 5px !important;
    line-height: normal !important;
  }

  .hint {
    line-height: 22px;
    color: #a1a0a0;
  }
}
</style>
