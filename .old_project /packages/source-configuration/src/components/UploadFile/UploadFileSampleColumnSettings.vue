<template>
  <div class="upload-file-sample-column-settings">
    <el-form ref="form" :model="configDto" :rules="rules" label-position="top" label-width="120px">
      <div class="wrap-row" :gutter="20">
        <div class="wrap-column">
          <template v-if="fileType === 'MySql'">
            <el-form-item label="Sql">
              <el-input placeholder="Please input Sql" v-model="configDto.srcSql"></el-input>
            </el-form-item>
            <el-form-item label="Entity Class">
              <el-select v-model="configDto.dstEntityClass" filterable placeholder="Entity Class">
                <el-option v-for="item in dstEntityClasOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
              <div class="hint-error" v-if="configDto.dstEntityClass && dstColumns.length === 0">Selected Entity not have Aliases</div>
            </el-form-item>
          </template>
          <div class="flex space-between">
            <div>
              <h3>Map Columns</h3>
            </div>
          </div>
          <div class="info">
            You on <strong>{{ currentIndex + 1 }}</strong> step from <strong>{{ countSteps }}</strong> steps
            <template v-if="props.fileType === 'MySql'">
              <el-button @click="mySqlAddNewStep" type="primary" size="default">
                <font-awesome-icon icon="plus" />
              </el-button>
              <el-button @click="mySqlRemoveStep" type="danger" size="default">
                <font-awesome-icon icon="trash" />
              </el-button>
            </template>
          </div>
          <template v-if="csvUploadConfigDto.fileType === 'XML'">
            <el-form-item prop="xmlBaseXPath" label="Xml Base XPath">
              <el-select :disabled="xmlBaseXPathOptions.length === 0" v-model="csvUploadConfigDto.xmlBaseXPath" placeholder="Select">
                <el-option v-for="item in xmlBaseXPathOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </template>
          <UploadFileSampleColumnSettingsItem v-if="Object.keys(currentItem).length > 0" :key="currentItem.csvColumnName" :columnMappingConfig="currentItem" :dstColumns="dstColumns" :mappersList="mappersList" :fileType="fileType" />
          <div class="actions">
            <el-button :disabled="isDisabledPrev" @click="onPrev" type="primary">
              <font-awesome-icon icon="arrow-left" />
              Prev
            </el-button>
            <el-button :disabled="isDisabledNext" @click="onNext" type="primary">
              Next
              <font-awesome-icon icon="arrow-right" />
            </el-button>
            <el-button class="button" @click="onOpenHistory" type="warning">
              <font-awesome-icon icon="clipboard" />
              History Information
            </el-button>
            <UploadFileSampleColumnSettingsHistory :currentIndex="currentIndex" :configDto="configDto" :fileType="fileType" ref="uploadFileSampleColumnSettingsHistory" @navigation="onNavigation" />
          </div>
        </div>
        <div class="wrap-column">
          <h3>Settings</h3>
          <UploadFileSampleColumnConfiguration :configDto="configDto" />
          <div class="actions action-finish">
            <el-button :loading="isLoadingFinish" @click="onFinish" type="success">
              Finish
              <font-awesome-icon icon="flag-checkered" />
            </el-button>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { ref, computed } from "vue";

import UploadFileSampleColumnSettingsItem from "./UploadFileSampleColumnSettingsItem.vue";

import UploadFileSampleColumnSettingsHistory from "./UploadFileSampleColumnSettingsHistory.vue";
import UploadFileSampleColumnConfiguration from "./UploadFileSampleColumnConfiguration.vue";
import UploadFileSampleColumnSettingsXMLDocumentation from "./UploadFileSampleColumnSettingsXMLDocumentation.vue";
import {useFileUploadApiStore} from "../../stores/encompass";
import {useHttpApiStore} from "../../stores/httpApi";

const emit = defineEmits(["mySqlRemoveStep", "create", "mySqlAddNewStep"]);
const props = defineProps({
  csvUploadConfigDto: {
    default: () => {
      return {};
    }
  },
  dstColumns: {
    default: () => {
      return [];
    }
  },
  xmlBaseXPathOptions: {
    default: () => {
      return [];
    }
  },
  fileType: {
    default: ""
  },
  wkJdbcSourceConfDto: {
    default: () => {
      return {};
    }
  }
});
const fileUploadApiStore = useFileUploadApiStore();
const httpApiStore = useHttpApiStore();
const rules = computed(() => {
  const data: any = {
    name: [
      { required: true, message: "Please input name", trigger: "blur" },
      { validator: validateName, trigger: "blur" }
    ]
  };
  if (props.csvUploadConfigDto.fileType === "XML") {
    data["xmlBaseXPath"] = [{ required: true, message: "Please input name", trigger: "blur" }];
  }
  return data;
});
const configDto = computed(() => {
  if (props.fileType === "MySql") {
    return props.wkJdbcSourceConfDto;
  } else {
    return props.csvUploadConfigDto;
  }
});
const isDisabledNext = computed(() => {
  return configDto.value.columnMappingConfigs.length - 1 === currentIndex.value;
});
const isDisabledPrev = computed(() => {
  return currentIndex.value === 0;
});
const currentItem = computed(() => {
  return configDto.value.columnMappingConfigs[currentIndex.value] || {};
});
const countSteps = computed(() => {
  return configDto.value.columnMappingConfigs.length;
});
function postSave(csvUploadConfigDto) {
  return fileUploadApiStore.postSave(csvUploadConfigDto);
}

function getMappersList() {
  return fileUploadApiStore.getMappersList();
}

function getListNames() {
  return fileUploadApiStore.getListNames();
}

function getReportingFetchTypes() {
  return httpApiStore.getReportingFetchTypes();
}
const uploadFileSampleColumnSettingsXMLDocumentationRef = ref(null);
const uploadFileSampleColumnSettingsHistoryRef = ref(null);
const formRef = ref(null);

let mappersList = ref([]);
let listNames = ref([]);

const isLoadingFinish = ref<boolean>(false);

let dstEntityClasOptions = ref([]);

loadMappersList();
loadListNames();
loadDataClassOptions();

async function loadMappersList() {
  let data = [];
  if (props.fileType === "MySql") {
    data = await getWkMappersList();
  } else {
    data = await getMappersList();
  }
  mappersList.value = data;
}

async function loadDataClassOptions() {
  const data = await getReportingFetchTypes();
  dstEntityClasOptions.value = data.map((el: string) => {
    return {
      value: el,
      label: el
    };
  });
}

async function loadListNames() {
  listNames.value = await getListNames();
}

const currentIndex = ref(0);
const isFinishLoading = ref<boolean>(false);

function onNext() {
  currentIndex.value += 1;

  if (currentIndex.value > configDto.value.columnMappingConfigs.length) {
    currentIndex.value = configDto.value.columnMappingConfigs.length - 1;
  }
}

function onPrev() {
  currentIndex.value -= 1;
  if (currentIndex.value < 0) {
    currentIndex.value = 0;
  }
}

function checkExistMapperForCurrentItem() {
  return currentItem.value.dstAliasName && !currentItem.value.mapperClass;
}

function onFinish() {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const srcColumnNames = configDto.value.columnMappingConfigs.filter((el: any) => !el.srcColumnName);

      if (srcColumnNames.length > 0) {
        ElNotification({ type: "error", title: "Error", message: `Fields: ${srcColumnNames.length} not filled by Column Name!` });
        return false;
      }

      try {
        isLoadingFinish.value = true;
        if (props.fileType === "MySql") {
          await postWkSave(configDto.value);
        } else {
          await postSave(props.csvUploadConfigDto);
        }
        emit("create");
      } finally {
        isLoadingFinish.value = false;
      }
    }
  });
}

function onOpenHistory() {
  return (uploadFileSampleColumnSettingsHistoryRef.value.drawerVisible = true);
}

function onNavigation(index: number) {
  currentIndex.value = index;
}

function validateName(rule: any, value: any, callback: any) {
  const isExistName = !!listNames.value.find((el: any) => {
    return el.name === configDto.value.name && el.id !== configDto.value.id;
  });
  if (isExistName) {
    callback(new Error("This name in not unique. Please, input, another name"));
  } else {
    callback();
  }
}

function onOpenXmlDoc() {
  uploadFileSampleColumnSettingsXMLDocumentationRef.value.drawerVisible = true;
}

function mySqlAddNewStep() {
  emit("mySqlAddNewStep");
  currentIndex.value += 1;
}

function mySqlRemoveStep() {
  ElMessageBox.confirm("Do you really want to remove column?", "Confirm", {
    callback: async () => {
      emit("mySqlRemoveStep", currentIndex.value);
      currentIndex.value -= 1;
    }
  });
}
</script>

<style lang="scss">
.upload-file-sample-column-settings {
  .wrap-columns {
    border-right: 1px solid #dedede;
  }

  .wrap-row {
    display: flex;

    > div {
      padding-bottom: 60px;
      position: relative;
    }

    .wrap-column:first-child {
      width: 60%;
      border-right: 1px solid #dcdfe6;
      margin-right: 30px;
      padding-right: 30px;

      .actions {
        right: 30px;
      }
    }

    .wrap-column:last-child {
      flex-grow: 1;
    }

    .actions {
      position: absolute;
      bottom: -10px;
      left: 0;
      right: 0;
    }
  }

  .info {
    margin-bottom: 15px;
  }

  .flex {
    display: flex;

    &.space-between {
      justify-content: space-between;
    }

    .manual_xml {
      padding-top: 20px;
    }

    .button {
      margin-left: 15px;
    }
  }

  .hint-error {
    font-size: 12px;
    color: red;
    line-height: 20px;
  }
}
</style>
