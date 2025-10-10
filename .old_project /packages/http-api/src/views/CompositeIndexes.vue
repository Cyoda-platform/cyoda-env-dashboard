<template>
  <div v-loading="tableLoading" class="composite-indexes">
    <div>
      <h1 class="label">Composite indexes</h1>
    </div>
    <div class="select-entity">
      <el-form label-position="top">
        <el-form-item label="Entity">
          <el-select clearable v-model="entityClass" @change="onChangeEntityClass" filterable
                     placeholder="Entity Class">
            <el-option v-for="item in entityClassOptions" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="flex">
      <div class="search">
        <el-input v-model="search" placeholder="Search Composite Index name here..."/>
      </div>
      <div class="wrap-btn">
        <el-button :disabled="!entityClass" @click="onModalCreateNew" type="warning">
          <font-awesome-icon icon="plus"/>
          Create New
        </el-button>
        <ExportImport :dataToExport="dataToExport" type="compositeIndex"/>
      </div>
    </div>
    <el-table :empty-text="emptyTextComputed" @selection-change="handleSelectionChange" class="ab-style" border
              :data="tableData" size="small" style="width: 100%">
      <el-table-column :default-sort="defaultSort" type="selection" :selectable="canSelectRow"></el-table-column>
      <el-table-column sortable prop="indexName" label="Name"></el-table-column>
      <el-table-column sortable width="150" prop="rangeField.columnName" label="Range Field"></el-table-column>
      <el-table-column sortable prop="noneRangeFields" label="None Range Fields">
        <template v-slot:default="{ row }">
          <ol>
            <li v-for="noneRangeField in row.noneRangeFields">
              {{ noneRangeField.columnName }}
            </li>
          </ol>
        </template>
      </el-table-column>
      <el-table-column sortable prop="decision" label="Decision"></el-table-column>
      <el-table-column sortable prop="persisted" label="Index Type">
        <template v-slot:default="{ row }">
          {{ row.persisted ? "Custom" : "System" }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="createDate" width="150" label="Created">
        <template v-slot:default="{ row }">
          {{ $filters.dateTime(row.createDate) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="180" label="Action">
        <template v-slot:default="{ row }">
          <el-tooltip v-if="row.persisted" content="Reindex" placement="top">
            <el-button size="default" type="primary" @click="onReindex(row)">
              <font-awesome-icon icon="sync-alt"/>
            </el-button>
          </el-tooltip>
          <el-tooltip v-if="row.persisted" content="Delete" placement="top">
            <el-button size="default" @click="onDelete(row)" type="danger">
              <font-awesome-icon icon="trash"/>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <CompositeIndexesNew @created="onCreated" :key="entityClass" :entityClass="entityClass"
                         ref="compositeIndexesNewRef"/>
  </div>
</template>

<script setup lang="ts">
import {ElNotification, ElMessageBox} from "element-plus";
import {ref, computed} from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import type {IndexConfiguration} from "@cyoda/ui-lib/src/types/types";
import ExportImport from "@cyoda/ui-lib/src/components-library/elements/ExportImport/ExportImport.vue";
import CompositeIndexesNew from "./CompositeIndexes/CompositeIndexesNew.vue";
import moment from "moment";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

interface TableDataRow extends IndexConfiguration {
  createdTimestamp: number;
}

const tableData = computed(() => {
  let tableDataValue = compositeIndexData.value.map((el) => {
    return {
      ...el,
      createdTimestamp: el.createDate ? moment(el.createDate).format("X") : ""
    };
  });
  tableDataValue = tableDataValue.filter((data) => {
    return !search.value || data.indexName.toLowerCase().includes(search.value.toLowerCase());
  });
  return tableDataValue;
});
const dataToExport = computed(() => {
  return multipleSelection.value;
});
const emptyTextComputed = computed(() => {
  let text = "No Data";
  if (!entityClass.value) {
    text += ". Please, select entity";
  }
  return text;
});

const compositeIndexesNewRef = ref(null);

const tableLoading = ref<boolean>(false);
const props = defineProps({
  getAllCompositeIndexesRequestFn: {
    default: null,
  },
  getReportingFetchTypesRequestFn: {
    default: null,
  },
  postCompositeIndexesReindexRequestFn: {
    default: null,
  },
  postCompositeIndexesDeleteRequestFn: {
    default: null,
  },
  postCompositeIndexesCreateRequestFn: {
    default: null,
  }
});

let entityClassOptions = ref([]);
const entityClass = ref<string>("");
const search = ref<string>("");
let multipleSelection = ref([]);
let compositeIndexData = ref([]);
let defaultSort = ref({
  prop: "createDate",
  order: "descending"
});

function getAllCompositeIndexesRequest(entity: string) {
  if (props.getAllCompositeIndexesRequestFn) return props.getAllCompositeIndexesRequestFn(entity);
  return api.getAllCompositeIndexes(entity);
}

function getReportingFetchTypesRequest() {
  if (props.getReportingFetchTypesRequestFn) return props.getReportingFetchTypesRequestFn();
  return api.getReportingFetchTypes();
}

function postCompositeIndexesReindexRequest(indexId: string) {
  if (props.postCompositeIndexesReindexRequestFn) return props.postCompositeIndexesReindexRequestFn(indexId);
  return api.postCompositeIndexesReindex(indexId);
}

function postCompositeIndexesDeleteRequest(indexId: string) {
  if (props.postCompositeIndexesDeleteRequestFn) return props.postCompositeIndexesDeleteRequestFn(indexId);
  return api.postCompositeIndexesDelete(indexId);
}

function postCompositeIndexesCreateRequest(form: any) {
  if (props.postCompositeIndexesCreateRequestFn) return props.postCompositeIndexesCreateRequestFn(form);
  return api.postCompositeIndexesCreate(form);
}

loadDataClassOptions();
eventBus.$on("closedImportExport:compositeIndex", (data) => {
  entityClass.value = data.entityClass;
  loadCompositeIndexes(entityClass.value);
});

async function loadCompositeIndexes(entity: string) {
  if (entity) {
    try {
      tableLoading.value = true;
      const {data} = await getAllCompositeIndexesRequest(entity);
      compositeIndexData.value = data;
    } finally {
      tableLoading.value = false;
    }
  } else {
    compositeIndexData.value = [];
  }
}

async function loadDataClassOptions() {
  try {
    tableLoading.value = true;
    const {data} = await getReportingFetchTypesRequest();
    entityClassOptions.value = HelperEntities.getOptionsFromData(data);
  } finally {
    tableLoading.value = false;
  }
}

async function onReindex(row: TableDataRow) {
  try {
    row["isReindex"] = true;

    const {data} = await postCompositeIndexesReindexRequest(row.indexId);
    if (data[row.indexId]) {
      ElNotification({
        title: "Success",
        message: "Reindex is done",
        type: "success"
      });
      onRefresh();
    } else {
      ElNotification({type: "error", title: "Error", message: "Reindex is fail"});
    }
  } finally {
    row["isReindex"] = false;
  }
}

async function onDelete(row: TableDataRow) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async () => {
      const {data} = await postCompositeIndexesDeleteRequest(row.indexId);

      if (data[row.indexId]) {
        ElNotification({
          title: "Success",
          message: "Index was deleted",
          type: "success"
        });
        loadCompositeIndexes(entityClass.value);
      } else {
        ElNotification({type: "error", title: "Error", message: "Index not was deleted"});
      }
    }
  });
}

function handleSelectionChange(val: IndexConfiguration[]) {
  multipleSelection.value = val;
}

function onModalCreateNew() {
  compositeIndexesNewRef.value.dialogVisible = true;
}

function canSelectRow(row: TableDataRow) {
  return row.persisted;
}

async function onCreated(form: any) {
  try {
    compositeIndexesNewRef.value.isLoadingForm = true;
    await postCompositeIndexesCreateRequest(form);
    loadCompositeIndexes(entityClass.value);
    compositeIndexesNewRef.value.dialogVisible = false;
  } finally {
    compositeIndexesNewRef.value.isLoadingForm = false;
  }
}

function onRefresh() {
  loadCompositeIndexes(entityClass.value);
}

function onChangeEntityClass(val: string) {
  loadCompositeIndexes(val);
}

defineExpose({
  getAllCompositeIndexesRequest,
  getReportingFetchTypesRequest,
  postCompositeIndexesReindexRequest,
  postCompositeIndexesDeleteRequest,
  postCompositeIndexesCreateRequest
});
</script>

<style lang="scss">
.composite-indexes {

  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  ol {
    padding: 0;
    padding-left: 10px;
  }

  .flex {
    display: flex;

    .search-toolbar {
      width: 300px;
      margin-right: 15px;
    }

    .table {
      flex-grow: 1;

      .flex {
        margin-bottom: 10px;
      }
    }

    .search {
      margin-right: 10px;
      flex-grow: 1;
    }

    .wrap-btn {
      display: flex;
      flex-wrap: nowrap;
    }
  }

  .select-entity {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .wrap-btn {
      padding-top: 52px;
    }

    .el-form {
      flex-grow: 1;

      .el-select {
        width: 100%;
      }
    }

    .el-form-item__label {
      margin-bottom: 0;
    }
  }

  .ab-style {
    margin-top: 30px;
  }
}
</style>
