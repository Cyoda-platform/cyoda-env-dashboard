<template>
  <div class="upload-file-fample-column-settings-item">
    <template v-if="columnMappingConfig.type === 'CSV'">
      CSV column name: <strong>{{ columnMappingConfig.csvColumnName }}</strong>
    </template>
    <template v-if="columnMappingConfig.type === 'XML'">
      XML column XPath:
      <strong>{{ columnMappingConfig.xmlColumnXPath }}</strong>
    </template>
    <template v-if="fileType === 'MySql'">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Source Column Name">
            <el-input placeholder="Please Source Column Name" v-model="columnMappingConfig.srcColumnName"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Source Column Type">
            <el-select filterable clearable v-model="columnMappingConfig.srcColumnType" placeholder="Select">
              <el-option v-for="item in sourceColumnTypes" :key="item.id" :label="item.name"
                         :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Alias">
          <el-select @change="onChangeDstColumnPath" filterable clearable v-model="columnMappingConfig.dstAliasId"
                     placeholder="Select">
            <el-option v-for="item in dstColumns" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <div class="wrap-selected-type">
            <span v-if="columnMappingConfig.dstType">Selected type: {{
                columnMappingConfig.dstType.split(".").pop()
              }}</span>
          </div>
        </el-form-item>
      </el-col>
      <el-col class="wrap-mappers" :span="12">
        <el-form-item label="Mapper Class">
          <el-select filterable clearable v-model="columnMappingConfig.mapperClass" placeholder="Select">
            <el-option v-for="item in filteredMapperOptions" :key="item.mapperClass" :label="item.name"
                       :value="item.mapperClass"></el-option>
          </el-select>
        </el-form-item>
        <template
          v-if="selectedMapperClass && Object.keys(selectedMapperClass).length > 0 && selectedMapperClass.needFormatParameter">
          <el-form-item class="mapper-label">
            <div slot="label">
              Mapper Format Parameters
              <span v-if="selectedDocMapper">
                <font-awesome-icon @click="openDocumentation" icon="info-circle"/>
              </span>
            </div>
            <el-input placeholder="Please input" v-model="columnMappingConfig.mapperFormatParam"></el-input>
          </el-form-item>
        </template>
      </el-col>
    </el-row>
    <UploadFileSampleColumnSettingsMapperDocumentation ref="uploadFileSampleColumnSettingsMapperDocumentation"
                                                       :docMapper="selectedDocMapper"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";


import dateDoc from "./MapperDocs/date.html?raw";
import UploadFileSampleColumnSettingsMapperDocumentation from "./UploadFileSampleColumnSettingsMapperDocumentation.vue";

const props = defineProps({
  fileType: {
    default: ""
  },
  columnMappingConfig: {
    default: () => {
      return {};
    },
  },
  dstColumns: {
    default: () => {
      return {};
    }
  },
  mappersList: {
    default: () => {
      return [];
    }
  }
});

const filteredMapperOptions = computed(() => {
  if (props.columnMappingConfig.dstType && props.columnMappingConfig.dstType.indexOf("com.cyoda.business") > -1) {
    return props.mappersList.filter((el) => el.mapperClass.indexOf("EnumMapper") > -1);
  } else if (props.columnMappingConfig.dstType && props.columnMappingConfig.dstType.indexOf("Date") > -1) {
    return props.mappersList.filter((el) => el.mapperClass.indexOf("Date") > -1);
  } else {
    return props.mappersList.filter((el) => el.mapperReturnType === props.columnMappingConfig.dstType);
  }
})
const selectedMapperClass = computed(() => {
  return props.mappersList.find((el) => el.mapperClass === props.columnMappingConfig.mapperClass);
})
const selectedDocMapper = computed(() => {
  if (props.columnMappingConfig.mapperClass && selectedMapperClass.value && Object.keys(selectedMapperClass.value).length > 0) {
    return docTypes.value.find((el) => selectedMapperClass.value.mapperReturnType.toLowerCase().indexOf(el.type) > -1);
  } else {
    return false;
  }
})
const uploadFileSampleColumnSettingsMapperDocumentationRef = ref(null);


let sourceColumnTypes = ref([
  {
    id: "STRING",
    name: "String"
  },
  {
    id: "INT",
    name: "Int"
  },
  {
    id: "LONG",
    name: "Long"
  },
  {
    id: "DOUBLE",
    name: "Double"
  },
  {
    id: "FLOAT",
    name: "Float"
  },
  {
    id: "DATE",
    name: "Date"
  }
]);

let docTypes = ref([
  {
    type: "date",
    title: "Date",
    doc: dateDoc
  }
]);


function onChangeDstColumnPath(id: string) {
  const item = props.dstColumns.find((el) => el.id === id);
  props.columnMappingConfig.dstAliasName = (item && item.name) || "";
  props.columnMappingConfig.dstType = (item && item.aliasDef.aliasType) || "";
  props.columnMappingConfig.dstColumnPath = (item && item.aliasDef.aliasPaths.value[0].colDef.fullPath) || "";
  if (props.columnMappingConfig.dstType !== props.columnMappingConfig.mapperClass) {
    props.columnMappingConfig.mapperClass = "";
    props.columnMappingConfig.mapperFormatParam = "";
  }
}

function openDocumentation() {
  uploadFileSampleColumnSettingsMapperDocumentationRef.value.drawerVisible = true;
}
</script>

<style lang="scss">
.upload-file-fample-column-settings-item {
  margin-top: 10px;
}

.wrap-selected-type {
  height: 20px;
}

.wrap-mappers {
  .el-form-item {
    margin-bottom: 0;
  }
}

.mapper-label {
  svg {
    cursor: pointer;
    font-size: 16px;
    color: black;
    transition: opacity 0.5s;
    opacity: 0.5;
    position: relative;
    top: 2px;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
