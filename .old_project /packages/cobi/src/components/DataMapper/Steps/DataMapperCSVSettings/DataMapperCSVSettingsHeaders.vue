<template>
  <div class="data-mapper-csv-settings-headers">
    <el-divider />
    <h2>Headers</h2>
    <div class="headers-row">
      <div class="description">
        <strong>{{ headerType }}:</strong> {{ headerName }}
      </div>
      <div class="wrap-input">
        <el-input placeholder="Please input" v-model="parserParameters.headers[indexHeader]"></el-input>
      </div>
    </div>
    <div class="wrap-steps">
      Step {{ indexHeader + 1 }} from {{ countHeaders }}
      <el-button @click="onPrev" :disabled="isDisabledPrev" size="default" type="primary">
        <font-awesome-icon icon="angle-left" />
      </el-button>
      <el-button @click="onNext" :disabled="isDisabledNext" size="default" type="primary">
        <font-awesome-icon icon="angle-right" />
      </el-button>

      <el-button @click="onShowAllHeaders" type="warning" size="default">Show All Headers</el-button>
    </div>
    <DataMapperCSVSettingsHeadersListAll ref="dataMapperCSVSettingsHeadersListAllRef" :currentIndex="indexHeader" :tableData="tableData" :headerType="headerType" :parserParameters="parserParameters" @change="onChangeIndexHeader" />
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, nextTick} from "vue";

import DataMapperCSVSettingsHeadersListAll from "./DataMapperCSVSettingsHeadersListAll.vue";

const props = defineProps({
  parserParameters: {
    default: () => ({})
  },
  tableData: {
    default: () => ([])
  }
});
const headerName = computed(() => {
  if (props.tableData && props.tableData.length > 0) {
    const keys = Object.keys(props.tableData[0]);
    return keys[indexHeader.value].replace(/__/g, ".");
  }
  return "";
});
const headerType = computed(() => {
  return props.parserParameters.withHeader ? "Header name" : "Header index";
});
const countHeaders = computed(() => {
  if (props.tableData && props.tableData.length > 0) {
    return Object.keys(props.tableData[0]).length;
  }
  return 0;
});
const isDisabledPrev = computed(() => {
  return indexHeader.value === 0;
});
const isDisabledNext = computed(() => {
  return indexHeader.value >= countHeaders.value - 1;
});

const dataMapperCSVSettingsHeadersListAllRef = ref(null);

const indexHeader = ref(0);

function onPrev() {
  indexHeader.value -= 1;
  if (indexHeader.value < 0) indexHeader.value = 0;
}
function onNext() {
  indexHeader.value += 1;
  if (indexHeader.value >= countHeaders.value) indexHeader.value = countHeaders.value - 1;
}
function onShowAllHeaders() {
  dataMapperCSVSettingsHeadersListAllRef.value.drawerVisible = true;
}
function onChangeIndexHeader(index) {
  indexHeader.value = index;
}

watch(
  () => props.parserParameters.withHeader,
  async () => {
    await nextTick();
    setHeaders();
  }
);

watch(
  () => props.parserParameters.delimiter,
  async () => {
    await nextTick();
    setHeaders();
  }
);

function setHeaders() {
  props.parserParameters.headers = [];
  indexHeader.value = 0;
  if (props.tableData.length === 0) {
    return;
  }
  const headers = Object.keys(props.tableData[0]).map((el) => el.toString().replace(/__/g, "."));
  props.parserParameters.headers = headers;
}
</script>

<style lang="scss">
.data-mapper-csv-settings-headers {
  .headers-title {
    display: flex;
    align-items: center;
  }

  .headers-row {
    display: flex;
    margin-top: 15px;
    border: 1px solid #dfe6ec;

    .description {
      min-width: 300px;
      background: #eef1f6;
      line-height: 40px;
      padding: 0 10px;
    }

    .wrap-input {
      flex-grow: 1;
    }

    .el-input {
      width: 100%;

      input, .el-input__wrapper {
        border: none !important;
        box-shadow: none !important;
        border-radius: 0;
      }
    }
  }

  .wrap-steps {
    margin-top: 10px;
  }
}
</style>
