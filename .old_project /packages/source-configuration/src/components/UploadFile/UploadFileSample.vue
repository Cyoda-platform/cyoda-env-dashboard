<template>
  <el-dialog class="upload-file-sample" :title="computedTitle" v-model="dialogVisible" width="90%">
    <UploadFileSampleColumnSettings @create="onCreate" :dstColumns="dstColumnsComputed" :xmlDataObj="xmlDataObj"
                                    :xmlBaseXPathOptions="xmlBaseXPathOptions" :csvUploadConfigDto="csvUploadConfigDto"
                                    :fileType="fileType"/>

    <el-divider/>

    <div v-if="csvUploadConfigDto.fileType === 'CSV' && tableSampleData && tableSampleData.columnNames.length > 0">
      <h3>Sample Data</h3>
      <el-table :data="rows" class="ab-style" style="width: 100%">
        <el-table-column v-for="header in headers" :key="header.prop" :prop="header.prop" :label="header.label"
                         min-width="200"></el-table-column>
      </el-table>
    </div>

    <div v-if="csvUploadConfigDto.fileType === 'XML' && xmlData">
      <h3>Sample Data</h3>
      <pre :class="codeObjXml.class"><code :class="codeObjXml.class" v-html="codeObjXml.code"></code></pre>
    </div>

    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import {ref, computed, watch, onBeforeUnmount} from "vue";

import UploadFileSampleColumnSettings from "./UploadFileSampleColumnSettings.vue";

import Prism from "prismjs";
import "prismjs/themes/prism.css";
import parser from "fast-xml-parser";
import _ from "lodash";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useFileUploadApiStore} from "../../stores/encompass";

const props = defineProps({
  tableSampleData: {
    default: () => {
      return {};
    },
  },
  xmlData: {
    default: ""
  },
  fileType: {
    default: () => {
      return {};
    }
  },
  wkJdbcSourceConfDto: {
    default: () => {
      return {};
    }
  }
});
const fileUploadApiStore = useFileUploadApiStore();
const dstColumnsComputed = computed(() => {
  return dstColumns.value.filter((el) => el.entityClass.indexOf("EncompassCompany") > -1);
})
const headers = computed(() => {
  return props.tableSampleData.columnNames.map((el: string) => {
    return {
      label: el,
      prop: setColumnProp(el)
    };
  });
})
const rows = computed(() => {
  const dataRows: any[] = [];
  if (props.tableSampleData.rows) {
    props.tableSampleData.rows.forEach((row: any) => {
      const dataRow: any = {};
      props.tableSampleData.columnNames.forEach((el: string, index: string | number) => {
        dataRow[setColumnProp(el)] = row.columns[index];
      });
      dataRows.push(dataRow);
    });
  }
  return dataRows;
})
const xmlDataObj = computed(() => {
  if (props.xmlData) {

    return parser.parse(props.xmlData);
  } else {
    return {};
  }
})
const computedTitle = computed(() => {
  if (Object.keys(editData.value).length === 0) {
    return `Create New Configuration ${csvUploadConfigDto.value.fileType}`;
  } else {
    return `Update Configuration for ${csvUploadConfigDto.value.fileType}: ${editData.value.name}`;
  }
})
const codeObjXml = computed(() => {
  return {
    class: "language-xml",
    code: Prism.highlight(props.xmlData, Prism.languages.xml, "xml")
  };
})

function getAliases() {
  return fileUploadApiStore.getAliases();
}


let dstColumns = ref([]);

let xmlBaseXPathOptions = ref([]);

let editData = ref({});

const dialogVisible = ref<boolean>(false);

let csvUploadConfigDto = ref({
  id: "",
  name: "",
  csvSeparator: "",
  columnMappingConfigs: [],
  xmlBaseXPath: "",
  fileType: props.fileType
});


eventBus.$on("upload-data:edit", editConfiguration);
loadEntityFields();

async function loadEntityFields() {
  const data = await getAliases();
  dstColumns.value = data.filter((el: any) => el.aliasDef.aliasPaths.value.length === 1);
}


onBeforeUnmount(() => {
  eventBus.$off("upload-data:edit", editConfiguration);
});

function editConfiguration(data: {
  fileType: string
}) {
  if (props.fileType === "MySql") {
    editData.value = JSON.parse(JSON.stringify(data));
    props.wkJdbcSourceConfDto = JSON.parse(JSON.stringify(editData.value));
    dialogVisible.value = true;
  } else if (csvUploadConfigDto.value.fileType && data.fileType && csvUploadConfigDto.value.fileType === data.fileType) {
    editData.value = JSON.parse(JSON.stringify(data));
    csvUploadConfigDto.value = JSON.parse(JSON.stringify(editData.value));
    dialogVisible.value = true;
  }
}


watch(() => props.tableSampleData.columnNames, (columns: any) => {

  csvUploadConfigDto.value.columnMappingConfigs = [];
  if (columns && columns.length > 0 && csvUploadConfigDto.value.fileType === "CSV") {
    columns.forEach((el: any) => {
      csvUploadConfigDto.value.columnMappingConfigs.push({
        type: "CSV",
        csvColumnName: el,
        mapperClass: "",
        dstType: "",
        dstColumnPath: "",
        dstAliasId: "",
        dstAliasName: "",
        mapperFormatParam: ""
      });
    });
  }
}, {immediate: true});


watch(csvUploadConfigDto.xmlBaseXPath, (string: any) => {

  if (string && props.xmlData) {
    csvUploadConfigDto.value.columnMappingConfigs = [];
    const path = string.substring(1).replace(/\//g, ".");
    const data = _.get(xmlDataObj.value, path);
    const targetObj = Array.isArray(data) ? data[0] : data;
    Object.keys(targetObj).forEach((el) => {
      csvUploadConfigDto.value.columnMappingConfigs.push({
        type: "XML",
        xmlColumnName: el,
        xmlColumnXPath: `${el}`,
        mapperClass: "",
        dstType: "",
        dstColumnPath: "",
        dstAliasId: "",
        dstAliasName: "",
        mapperFormatParam: ""
      });
    });
  }
}, {immediate: true});


watch(xmlDataObj, () => {

  if (Object.keys(xmlDataObj.value).length > 0) {
    xmlBaseXPathOptions.value = createXmlBaseXPathOptions(xmlDataObj.value);
  }
}, {immediate: true});


function createXmlBaseXPathOptions(data: any, rootPath = "") {
  let options: any[] = [];
  Object.keys(data).forEach((el) => {
    const value = `${rootPath}/${el}`;
    const countDelimiters = value.split("/").length - 1;
    const label = `${"-".repeat(countDelimiters)}${el}`;
    if (typeof data[el] === "object" && !Array.isArray(data[el])) {
      options.push({
        label,
        value
      });
      options = [...options, ...createXmlBaseXPathOptions(data[el], value)];
    } else if (Array.isArray(data[el])) {
      options.push({
        label,
        value
      });
    }
  });
  return options;
}

function onCreate() {
  dialogVisible.value = false;
  eventBus.$emit("create:csv");
}


function setColumnProp(name: string) {
  return name.replace(/\./g, "_");
}


watch(() => props.tableSampleData.separator, (val: string) => {

  if (val) {
    csvUploadConfigDto.value.csvSeparator = val;
  }
}, {immediate: true});
</script>

<style lang="scss">
.upload-file-sample {
  .el-dialog__body {
    padding-top: 0;
  }

  .el-form-item__label {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
