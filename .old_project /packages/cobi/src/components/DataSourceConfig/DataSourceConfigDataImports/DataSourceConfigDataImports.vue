<template>
  <div class="data-source-config-data-imports">
    <data-tables
      ref="dataTableRef"
      @headerDragend="onHeaderDragend"
      :filters="filters"
      :pageSize="5"
      :pagination-props="{ pageSizes: [5, 10, 20, 50], total: totalElements }"
      :table-props="{
        border: true
      }"
      :loading="isLoading"
      class="table"
      border
      :data="tableData"
      :default-sort="{ prop: 'lastUpdated', order: 'descending' }"
      style="width: 100%"
      :remote="true"
      @query-change="loadData"
    >
      <template #tool>
        <el-form label-position="top" :inline="true">
          <h3>Filter</h3>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="From Date">
                <el-date-picker style="width: 100%" format="DD.MM.YYYY HH:mm:ss" v-model="filters[0].value" type="datetime"
                                placeholder="From Date"></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="To Date">
                <el-date-picker style="width: 100%" format="DD.MM.YYYY HH:mm:ss" v-model="filters[1].value" type="datetime"
                                placeholder="To date"></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="Status">
                <el-select style="width: 100%" clearable v-model="filters[2].value">
                  <el-option v-for="status in statusArr" :key="status.value" :label="status.label"
                             :value="status.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <el-table-column show-overflow-tooltip prop="rootRawRequestId" width="200" label="Event Id"></el-table-column>
      <el-table-column width="200" label="Start timestamp">
        <template v-slot:default="{ row }">
          {{ momentTime(row.timeStatistic.startProcessing) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" width="200" label="Status"></el-table-column>
      <el-table-column prop="dataSourceNames" width="200" label="Data Source"></el-table-column>
      <el-table-column prop="operationData.mappingConfigNames" width="300" label="Mapping operations">
        <template v-slot:default="{ row }">
          {{ arrayNormalizer(row.mappingConfigNames) }}
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="classNames" width="400" label="Entity Classes">
        <template v-slot:default="{ row }">
          {{ arrayNormalizer(row.classNames) }}
        </template>
      </el-table-column>
      <el-table-column prop="totalCreatedEntitiesCount" width="170" label="Created"></el-table-column>
      <el-table-column prop="totalUpdatedEntitiesCount" width="170" label="Updated"></el-table-column>
      <el-table-column width="170" label="Duration (ms)">
        <template v-slot:default="{ row }">
          {{ row.timeStatistic.finishProcessing - row.timeStatistic.startProcessing }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="200px" label="Actions">
        <template #default="{ row }">
          <el-tooltip :show-after="1000" class="item" effect="dark" content="Delete" placement="top">
            <el-button :loading="isDeleteInProgress(row)" size="default" type="danger" @click="onDelete(row)">
              <font-awesome-icon icon="trash"/>
            </el-button>
          </el-tooltip>
          <template v-if="!isDeleteInProgress(row)">
            <el-tooltip :show-after="1000" class="item" effect="dark" content="View config" placement="top">
              <el-button size="default" type="primary" @click="onViewConfig(row)">
                <font-awesome-icon icon="fa-solid fa-gears"/>
              </el-button>
            </el-tooltip>

            <el-tooltip v-if="isViewImportsExist" :show-after="1000" class="item" effect="dark"
                        content="View Connection Execution Details" placement="top">
              <el-button size="default" type="success" @click="onViewDetailDialog(row)">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass"/>
              </el-button>
            </el-tooltip>
          </template>
        </template>
      </el-table-column>
    </data-tables>

    <DialogDataSourceConfigCreationEdit ref="dialogDataSourceConfigCreationEditRef"/>
    <ConfigEditorReportsStreamGrid :hasFilterBuilder="true" ref="configEditorReportsStreamGridRef"/>
    <DialogDataMapperSelect @change="onChangeDialogDataMapperSelect" ref="dialogDataMapperSelectRef"/>
    <DialogDataSourceConfigDataImportsDetails :key="dialogDataSourceConfigDataImportsDetailsKey"
                                              ref="dialogDataSourceConfigDataImportsDetailsRef"
                                              @viewImportedRows="onViewImportedRows"/>
  </div>
</template>

<script setup lang="ts">
import {useCobiProcessingStore} from "../../../stores/cobi-processing";
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import {useDataSourceConfigStore} from "../../../stores/data-source-config";
import {ElMessageBox} from "element-plus";
import {ref, nextTick, computed, watch, onBeforeUnmount} from "vue";

import DialogDataSourceConfigCreationEdit from "./DialogDataSourceConfigCreationEdit.vue";
import moment from "moment";
import ConfigEditorReportsStreamGrid
  from "@cyoda/ui-lib/src/components-library/patterns/ConfigEditor/ConfigEditorReportsStreamGrid.vue";
import type {EntityMappingConfigDto} from "../../DataMapper/MappingConfigDto";
import DialogDataMapperSelect from "./DialogDataMapperSelect.vue";
import DialogDataSourceConfigDataImportsDetails from "./DialogDataSourceConfigDataImportsDetails.vue";
import type {DataSourceRequestStatisticDto} from "../DataSourceConfig";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useTableSaveStateMixin} from "@cyoda/ui-lib/src/mixins/TableSaveStateMixin";

const dataTableRef = ref(null);
const dataSourceConfigStore = useDataSourceConfigStore();
const platformMappingStore = usePlatformMappingStore();
const cobiProcessingStore = useCobiProcessingStore();
const transactionsList = computed(() => {
  return cobiProcessingStore.transactionsList || [];
});
const tableData = computed(() => {
  return dataSourceRequestStatisticDtoes.value;
});
const totalElements = computed(() => {
  return page.value.totalElements || 0;
});
const statusArr = computed(() => {
  return [
    {
      label: "In Progress",
      value: "IN_PROGRESS"
    },
    {
      label: "Success",
      value: "SUCCESS"
    },
    {
      label: "Failed",
      value: "FAILED"
    }
  ];
});
const filtersComputed = computed(() => {
  const data = {};
  filters.value.forEach((el) => {
    if (['from', 'to'].includes(el.prop) && el.value) {
      data[el.prop] = moment(el.value).utcOffset('+0200').format('YYYY-MM-DDTHH:mm:ssZ')
    } else {
      data[el.prop] = el.value;
    }
  });
  return data;
});

const isViewImportsExist = computed(() => {
  return true;
});

function getStatisticsSearch(value) {
  return dataSourceConfigStore.getStatisticsSearch(value);
}

function getStatisticsById(rootRawRequestId) {
  return dataSourceConfigStore.getStatisticsById(rootRawRequestId);
}

function getStatisticsMapping(value) {
  return dataSourceConfigStore.getStatisticsMapping(value);
}

function getStatisticsSearchByRawRequestId() {
  return dataSourceConfigStore.getStatisticsSearchByRawRequestId();
}

function getStatisticsSearchEntitiesByRequestIdAndStreamReport(value) {
  return dataSourceConfigStore.getStatisticsSearchEntitiesByRequestIdAndStreamReport(value);
}

function deleteRequestDeleteById(rootRawRequestId) {
  return dataSourceConfigStore.deleteRequestDeleteById(rootRawRequestId);
}

function getDataMapping() {
  return platformMappingStore.getDataMapping();
}

function addTransactionsToList(value) {
  return cobiProcessingStore.addTransactionsToList(value);
}

function deleteTransactionsFromList(id) {
  return cobiProcessingStore.deleteTransactionsFromList(id);
}

function getStatusOfTransactions(transactionId) {
  return cobiProcessingStore.getStatusOfTransactions(transactionId);
}

const dialogDataSourceConfigCreationEditRef = ref(null);

const configEditorReportsStreamGridRef = ref(null);

const dialogDataMapperSelectRef = ref(null);

const dialogDataSourceConfigDataImportsDetailsRef = ref(null);

const selectedRow = ref(null);
const loadDataIntervalId = ref(null);

let runnedTransactionsForDelete = ref(new Map());

const isLoading = ref<boolean>(false);
let dataSourceRequestStatisticDtoes = ref([]);
let page = ref({});
let lastPagination = ref({});
const dialogDataSourceConfigDataImportsDetailsKey = ref(0);

const {onHeaderDragend} = useTableSaveStateMixin('dataSourceConfigDataImportsTable', dataTableRef);

eventBus.$on("connectionRun:stop", connectionRunStop);

onBeforeUnmount(() => {
  eventBus.$off("connectionRun:stop", connectionRunStop);
});

function connectionRunStop() {
  loadData();
}

let filters = ref([
  {
    value: "",
    prop: "from"
  },
  {
    value: "",
    prop: "to"
  },
  {
    value: "",
    prop: "status"
  }
]);

async function loadData(pagination: any = {}) {
  if (loadDataIntervalId.value) {
    clearInterval(loadDataIntervalId.value);
    loadDataIntervalId.value = null;
  }
  loadDataIntervalId.value = setTimeout(async () => {
    if (Object.keys(pagination).length > 0) {
      lastPagination.value = pagination;
    } else {
      pagination = lastPagination.value;
    }
    isLoading.value = true;
    const {data} = await getStatisticsSearch({
      pagination,
      filter: filtersComputed.value
    });

    const {_embedded, page: pageResponse} = data;
    dataSourceRequestStatisticDtoes.value = (_embedded && _embedded.dataSourceRequestStatisticDtoes.slice(0, pagination.pageSize)) || [];
    page.value = pageResponse;
    isLoading.value = false;
  }, 250);
}

function onDelete(row: DataSourceRequestStatisticDto) {
  ElMessageBox.confirm("Do you really want to delete selected row?", "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        const {data} = await deleteRequestDeleteById(row.rootRawRequestId);
        addTransactionsToList({
          id: row.rootRawRequestId,
          transactionId: data
        });
      }
    }
  });
}

function onViewDetailDialog(row) {
  dialogDataSourceConfigDataImportsDetailsKey.value += 1;
  setTimeout(() => {
    dialogDataSourceConfigDataImportsDetailsRef.value.openDialogWindow(row);
  }, 500);
}

async function onViewConfig(row: DataSourceRequestStatisticDto) {
  const {data} = await getStatisticsById(row.rootRawRequestId);
  dialogDataSourceConfigCreationEditRef.value.dialogVisible = true;
  await nextTick();

  await nextTick(() => {
    dialogDataSourceConfigCreationEditRef.value.dataSourceConfigCreationEditRef.dataSourceConfigDto = data;
  });
}

async function getHistoryDataMappingByRow(row: DataSourceRequestStatisticDto) {
  const {data: connection} = await getStatisticsById(row.rootRawRequestId);

  const endpoint = connection.endpoints.find((el) => el.operation === row.operationData.operation);
  const {data: dataMapping} = await getStatisticsMapping({
    rootRawRequestId: row.rootRawRequestId,
    mappingConfigId: endpoint.consumerConfig.configId
  });

  return dataMapping;
}

function isDeleteInProgress(row) {
  return !!transactionsList.value.find((el) => el.id === row.rootRawRequestId);
}

async function getConfigDefinitionRequestByEntityMapping(entityMapping: EntityMappingConfigDto) {
  const columns = [];
  entityMapping.columns.forEach((el) => {
    columns.push({
      name: el.dstCyodaColumnPath,
      type: el.dstCyodaColumnPathType
    });
  });

  entityMapping.functionalMappings.forEach((el) => {
    columns.push({
      name: el.dstPath,
      type: "java.lang.String"
    });
  });

  const requestClass = entityMapping.entityClass;

  const columnsStreamReport = columns.map((el) => {
    return {
      "@bean": "com.cyoda.core.reports.columns.ReportSimpleColumn",
      name: el.name
    };
  });

  const colDefs = columns.map((el) => {
    return {
      fullPath: el.name,
      parts: {
        "@meta": "com.cyoda.core.reports.columndefs.ReportColPartDef[]",
        value: [
          {
            rootClass: requestClass,
            path: el.name,
            type: el.type
          }
        ]
      },
      colType: el.type
    };
  });

  return {
    "@bean": "com.cyoda.core.streamdata.StreamDataRequest",
    sdDef: {
      requestClass,
      rangeCondition: {
        "@bean": "com.cyoda.core.conditions.queryable.Equals",
        fieldName: "requestId",
        operation: "EQUALS",

        rangeField: "false",
        value: {
          "@type": "UUID",
          value: selectedRow.value.rootRawRequestId
        },
        queryable: true
      },
      rangeOrder: "ASC",
      condition: {
        "@bean": "com.cyoda.core.conditions.GroupCondition",
        operator: "AND",
        conditions: []
      },
      columns: [
        {
          "@bean": "com.cyoda.core.reports.columns.ReportSimpleColumn",
          name: "id"
        },
        ...columnsStreamReport
      ],
      colDefs: [
        {
          fullPath: "id",
          parts: {
            "@meta": "com.cyoda.core.reports.columndefs.ReportColPartDef[]",
            value: [
              {
                rootClass: requestClass,
                path: "id",
                type: "java.util.UUID"
              }
            ]
          },
          colType: "java.util.UUID"
        },
        ...colDefs
      ],
      aliasDefs: []
    },
    pointTime: null,
    offset: 0,
    length: 100,
    fromPosIndex: 0
  };
}

async function onViewImportedRows(row: DataSourceRequestStatisticDto) {
  selectedRow.value = row;
  const dataMapping = await getHistoryDataMappingByRow(row);
  if (dataMapping.entityMappings.length > 1) {
    dialogDataMapperSelectRef.value.openDialogWindow(dataMapping);
  } else {
    openViewer(dataMapping.entityMappings[0]);
  }
}

async function openViewer(entityMapping) {
  configEditorReportsStreamGridRef.value.configDefinitionRequest = await getConfigDefinitionRequestByEntityMapping(entityMapping);
  configEditorReportsStreamGridRef.value.dialogVisible = true;
  configEditorReportsStreamGridRef.value.onlyUniq = true;
  configEditorReportsStreamGridRef.value.loadDataFunctionCallback = (configDefinitionRequest) => {
    return getStatisticsSearchEntitiesByRequestIdAndStreamReport({
      requestId: selectedRow.value.rootRawRequestId,
      configDefinitionRequest
    });
  };
  configEditorReportsStreamGridRef.value.loadPage();
}

function onChangeDialogDataMapperSelect(entityMapping) {
  openViewer(entityMapping);
}

function momentTime(time) {
  return moment(time).format("DD.MM.YYYY HH:mm:ss");
}

function arrayNormalizer(string) {
  if (!string) return "";
  return string.split(",").join(", ");
}

watch(
  () => transactionsList.value,
  async () => {
    for (const el of transactionsList.value) {
      if (runnedTransactionsForDelete.value.has(el.id)) continue;
      const intervalId = setInterval(async () => {
        runnedTransactionsForDelete.value.set(el.id, el);
        try {
          const {data} = await getStatusOfTransactions(el.transactionId);
          if (data.rows[0].finishTime) {
            clearInterval(intervalId);
            runnedTransactionsForDelete.value.delete(el.id);
            deleteTransactionsFromList(el.id);
            loadData();
          }
        } catch (e) {
          clearInterval(intervalId);
        }
      }, 2000);
    }
  },
  {immediate: true, deep: true}
);
</script>

<style lang="scss">
.data-source-config-data-imports {
  .el-form-item__label {
    padding-bottom: 0 !important;
  }

  .el-table__expanded-cell {
    padding-bottom: 15px !important;

    .table {
      margin-left: 15px;
    }
  }
}
</style>
