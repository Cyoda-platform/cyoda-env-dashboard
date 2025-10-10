<template>
  <div class="data-mapper-csv-settings">
    <h2 class="sample-content-header">Sample Content (First 5 rows)</h2>

    <el-form :model="dataMappingConfigDto.parserParameters" ref="formRef" label-width="120px">
      <div class="sample-content">
        <div class="row-sample-content" v-for="row in sampleContentRows" :key="row">
          {{ row }}
        </div>
      </div>

      <el-form-item
        class="table-data-row"
        :rules="[{ validator: validateCSV }]"
        prop="tableData"/>

      <el-divider/>
      <el-form-item label="With Header">
        <el-switch v-model="dataMappingConfigDto.parserParameters.withHeader"/>
      </el-form-item>

      <el-form-item label="Delimiter">
        <el-input v-model="dataMappingConfigDto.parserParameters.delimiter"/>
      </el-form-item>

      <el-form-item label="Quote Char">
        <el-input v-model="dataMappingConfigDto.parserParameters.quoteChar"/>
      </el-form-item>

      <el-alert v-if="parsingError" title="Warning" type="warning" :description="parsingError" show-icon></el-alert>

      <el-form-item :rules="{ validator: checkAllHeaders }" prop="headers" class="headers-form-item">
        <DataMapperCSVSettingsHeaders :parserParameters="dataMappingConfigDto.parserParameters" :tableData="tableData"/>
      </el-form-item>

      <el-divider/>

      <h2 class="sample-content-header">Parsed Data</h2>
      <div class="table-data">
        <data-tables
          :table-props="{
          border: true,
          showHeader: dataMappingConfigDto.parserParameters.withHeader
        }"
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column v-for="optionHeader in optionsHeaders" :key="optionHeader" :width="300" :prop="optionHeader"
                           :label="optionHeader.replace(/__/g, '.')"/>
        </data-tables>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import DataMapperCSVSettingsHeaders from "./DataMapperCSVSettingsHeaders.vue";
import HelperContent from "../../../../helpers/HelperContent";
import _ from "lodash";
import HelperReportDefinition from "@cyoda/http-api/src/helpers/HelperReportDefinition";

const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});

const sampleContentRows = computed(() => {
  return props.dataMappingConfigDto.sampleContent.split("\n").slice(0, 5);
});

const optionsHeaders = computed(() => {
  if (tableData.value.length > 0) {
    return Object.keys(tableData.value[0]);
  }
  return [];
});

const tableData = computed(() => {
  try {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    parsingError.value = null;
    let csvs = HelperContent.parseCsv(props.dataMappingConfigDto);

    const datas: any[] = [];
    csvs.forEach((row) => {
      const keys = Object.keys(row);
      const dataRow: any = {};
      keys.forEach((key) => {
        const newKey = key.replace(/\./g, "__");
        dataRow[newKey] = _.get(row, key);
      });
      datas.push(dataRow);
    });
    csvs = [];
    return datas;
  } catch (e) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    parsingError.value = e.message;
    return [];
  }
});
const tableColumns = computed(() => {
  return [];
});

const formRef = ref(null);

const parsingError = ref(null);

async function checkAllHeaders(rule: any, value: any, callback: any) {
  if (tableData.value.length === 0) callback();
  const totalLenght = Object.keys(tableData.value[0]).length;
  if (totalLenght > props.dataMappingConfigDto.parserParameters.headers.length) {
    return callback(new Error(`Please fill ALL headers for ALL columns`));
  }
  callback();
}

function validateCSV(rule: any, value: any, callback: any) {
  if (tableData.value.length === 0) {
    return callback(new Error("CSV data is not valid"));
  }
  callback();
}

defineExpose({parsingError, formRef});
</script>

<style lang="scss">
.data-mapper-csv-settings {
  .sample-content-header {
    margin-bottom: 10px;
  }

  .sample-content {
    overflow-x: scroll;
    padding: 15px;
    background-color: #f5f2f0;

    .row-sample-content {
      white-space: nowrap;
    }
  }

  .headers-form-item .el-form-item__content {
    margin-left: 0 !important;
  }

  .table-data-row .el-form-item__content {
    margin-left: 0 !important;
    margin-top: 15px;

    .el-form-item__error {
      position: unset !important;
    }
  }
}
</style>
