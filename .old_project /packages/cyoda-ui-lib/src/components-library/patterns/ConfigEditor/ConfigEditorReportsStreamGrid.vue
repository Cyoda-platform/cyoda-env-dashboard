<template>
  <el-dialog :close-on-click-modal="false" class="config-editor-reports-stream-grid" v-model="dialogVisible" width="80%"
             append-to-body>
    <template #header>
      {{ title }} | <span class="page-size">Page Size: {{ pageSize }}</span>
    </template>

    <div class="wrap-filter-builder" v-if="hasFilterBuilder">
      <div class="filter-builder">
        <FilterBuilderGroup v-if="configDefinitionRequest && configDefinitionRequest.sdDef" :showErrors="showErrors"
                            :level="0" :cols="cols" :condition="configDefinitionRequest.sdDef.condition"/>
      </div>
      <div class="actions">
        <el-button @click="onApplyFilterBuilder" type="primary">Apply Filter</el-button>
      </div>
    </div>

    <ConfigEditorReportsStreamGridDeleteActions v-if="isExistTableId && isDeleteAvailable" :pageSize="pageSize"
                                                :page="page"
                                                :tableData="tableData" :isTableSelectAll="isTableSelectAll"
                                                :multipleSelection="multipleSelection"
                                                :configDefinitionRequest="configDefinitionRequest"
                                                @clearMultipleSelection="onClearMultipleSelection" @refresh="loadPage"/>

    <el-table ref="tableRef" @row-dblclick="rowClick" v-loading="isLoading" max-height="400" class="ab-style"
              :data="tableData" @selection-change="handleSelectionChange" @select-all="onTableSelectAll"
              style="width: 100%">
      <el-table-column v-if="isExistTableId && isDeleteAvailable" type="selection" width="55"></el-table-column>
      <el-table-column v-for="(column, index) in columns" :key="column.prop" :prop="column.prop" :label="column.prop"
                       sortable :min-width="200">
        <template v-slot:default="scope">
          {{ getRowValue(scope.row, column.prop) }}
        </template>
      </el-table-column>
    </el-table>

    <AdaptableBlotterEntity :configDefinition="configDefinitionRequest.sdDef" :selectedRow="selectedRow"/>

    <template #footer>
      <span class="dialog-footer">
      <span class="page-info">Current page: {{ page + 1 }}</span>
      <el-form label-position="left" ref="form" label-width="120px">
        <el-form-item label="Page Size">
          <el-select @change="onPageSize" v-model="pageSize" placeholder="Select">
            <el-option v-for="item in optionsPageSize" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="wrap-buttons">
        <el-button type="primary" :disabled="page === 0" @click="onPrev">Previous {{ pageSize }}</el-button>
        <el-button type="primary" :disabled="isDisableNextPage" @click="onNext">Next {{ pageSize }}</el-button>
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, computed, watch, onBeforeUnmount} from "vue";

import * as api from "../../../api";
import AdaptableBlotterEntity from "../../../components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity.vue";
import _ from "lodash";
import HelperFormat from "../../../helpers/HelperFormat";
import type {IDefinitionContentStreamResult} from "../../../types/types";
import ConfigEditorReportsStreamGridDeleteActions from "./ConfigEditorReportsStreamGridDeleteActions.vue";
import {ElNotification, ElTable} from "element-plus";
import moment from "moment";
import HelperReportDefinition from "@cyoda/http-api/src/helpers/HelperReportDefinition";
import FilterBuilderGroup from "../FilterBuilder/FilterBuilderGroup.vue";
import eventBus from "../../../plugins/eventBus";

const props = defineProps({
  title: {
    default: "Report Stream Result"
  },
  hasFilterBuilder: {
    default: false
  },
  isDeleteAvailable: {
    default: false
  }
});

const columns = computed(() => {
  if (lastRequest.value && lastRequest.value.rows && lastRequest.value.rows.length > 0) {
    return configDefinitionRequest.value.sdDef.columns.map((el) => {
      const path = HelperFormat.shortNamePath(el.name);
      return {
        prop: path,
        label: path
      };
    });
  } else {
    return [];
  }
});
const tableData = computed(() => {
  if (lastRequest.value && lastRequest.value.rows && lastRequest.value.rows.length > 0) {
    let data = lastRequest.value.rows.map((el) => {
      return el.columnsValues;
    });
    const keys = Object.keys(data[0]);
    if (onlyUniq.value && keys.length === 1) {
      data = _.uniqBy(data, keys[0]);
    }
    return data;
  } else {
    return [];
  }
});
const isExistTableId = computed(() => {
  return tableData.value.some((el) => el.id);
});
const cols = computed(() => {
  return HelperReportDefinition.buildCols(configDefinitionRequest.value.sdDef);
});

const tableRef = ref(null);

const definitionId = ref<string>("");
const dialogVisible = ref<boolean>(false);
const onlyUniq = ref<boolean>(false);
let configDefinitionRequest = ref({});
const loadDataFunctionCallback = ref(null);
const showErrors = ref<boolean>(false);

const selectedRow = ref(null);
let lastRequest = ref({});
const page = ref(0);

const pageSize = ref(100);
const isLoading = ref<boolean>(false);
const isDisableNextPage = ref<boolean>(false);
let optionsPageSize = ref([20, 50, 100, 200, 300]);

let multipleSelection = ref([]);
const isTableSelectAll = ref<boolean>(false);
const emit = defineEmits(['close']);

eventBus.$on('dialogEntityClose', onDialogEntityClose);
onBeforeUnmount(() => {
  eventBus.$off('dialogEntityClose', onDialogEntityClose);
});

function onDialogEntityClose() {
  selectedRow.value = null;
}

async function loadPage(reset = false) {
  try {
    if (reset) lastRequest.value.pointTime = parseInt(moment().format("x"));
    isLoading.value = true;
    configDefinitionRequest.value.offset = page.value * pageSize.value;
    configDefinitionRequest.value.length = pageSize.value;
    configDefinitionRequest.value.pointTime = lastRequest.value.pointTime || null;

    let data: any = {};
    if (loadDataFunctionCallback.value) {
      let {data: response} = await loadDataFunctionCallback.value(configDefinitionRequest.value);
      data = response;
    } else {
      let {data: response} = await api.getStreamData(configDefinitionRequest.value);
      data = response;
    }
    if (validateResponse(data, reset)) {
      lastRequest.value = data;
      isDisableNextPage.value = data.rows.length < pageSize.value;
    } else {
      isDisableNextPage.value = true;
      return false;
    }
  } finally {
    isLoading.value = false;
  }
  return true;
}

function rowClick(row: {
  [key: string]: string
}) {
  selectedRow.value = row;
}

function onPrev() {
  if (page.value > 0) {
    isDisableNextPage.value = false;
    page.value -= 1;
    loadPage();
  }
}

async function onNext() {
  page.value += 1;
  const result = await loadPage();
  if (!result) {
    page.value -= 1;
  }
}

function getRowValue(row: {
  [key: string]: string
}, path: string) {
  let value = _.get(row, path);
  if (typeof value === "boolean") {
    value = value.toString();
  } else if (Array.isArray(value)) {
    value = value.join(", ");
  } else if (value === undefined) {
    value = "-";
  }
  return value;
}

function validateResponse(data: IDefinitionContentStreamResult, reset = false) {
  if (data.rows.length === 0) {
    lastRequest.value.rows = [];
    if (reset) return;

    ElNotification({
      title: "Warning",
      message: "Report contains 0 rows or this is last page",
      type: "warning"
    });
    return false;
  }
  if (data.rows.length > 0 && Object.keys(data.rows[0].columnsValues).length === 0) {
    ElNotification({
      title: "Warning",
      message: `No values in report, ${data.rows.length} rows returned`,
      type: "warning"
    });
    return false;
  }
  return true;
}

function onPageSize(pageSizeSelected: number) {
  pageSize.value = pageSizeSelected;
  if (pageSize.value * page.value > lastRequest.value.lastRowIndexPosition) {
    page.value = 0;
  }
  loadPage();
}

function handleSelectionChange(val) {
  multipleSelection.value = val;
  isTableSelectAll.value = false;
}

function onClearMultipleSelection() {
  tableRef.value.clearSelection();
  multipleSelection.value = [];
  isTableSelectAll.value = false;
}

function onTableSelectAll(selection) {
  isTableSelectAll.value = selection.length > 0;
}

async function onApplyFilterBuilder() {
  page.value = 0;
  await loadPage();
}

watch(dialogVisible, async (val: boolean) => {
  page.value = 0;
  isDisableNextPage.value = false;
  lastRequest.value = {} as IDefinitionContentStreamResult;
  if (val && definitionId.value) {
    const {data} = await api.getStreamDefinition(definitionId.value);
    configDefinitionRequest.value = {
      "@bean": "com.cyoda.core.streamdata.StreamDataRequest",
      sdDef: data.streamDataDef,
      pointTime: null,
      offset: 0,
      length: 100,
      fromPosIndex: 0
    };
    loadPage();
  }
  if (!val) {
    emit("close");
  }
});

defineExpose({dialogVisible, onlyUniq, definitionId, loadDataFunctionCallback, configDefinitionRequest, loadPage});
</script>

<style lang="scss">
.config-editor-reports-stream-grid {
  .page-info {
    padding-top: 10px;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
  }

  .page-size {
    font-weight: normal !important;
    font-size: 14px;
  }

  .el-table-column--selection .cell {
    padding-left: 14px !important;
  }

  .wrap-filter-builder {
    display: flex;

    .filter-builder {
      flex-grow: 1;
    }

    .actions {
      margin-left: 20px;
      margin-bottom: 20px;
      align-self: end;
    }
  }
}
</style>
