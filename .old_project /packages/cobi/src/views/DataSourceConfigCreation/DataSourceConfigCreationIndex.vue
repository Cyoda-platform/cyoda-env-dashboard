<template>
  <div class="data-source-config-creation-index">
    <div class="card">
      <div class="card-body">
        <div class="flex">
          <div>
            <h4>List of Configs</h4>
          </div>
          <div>
            <el-button @click="onClickDeleteSelected" :disabled="multipleSelection.length === 0" type="danger">
              Delete Selected
              <font-awesome-icon icon="trash"/>
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <ExportImport class="export-import" type="data-source-config" :dataToExport="multipleSelection"/>
            <el-button @click="onAddNewConfiguration" type="primary">
              Create Configuration
              <font-awesome-icon icon="plus"/>
            </el-button>
          </div>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-input placeholder="Filter" v-model="form.filter"></el-input>
          </el-col>
          <el-col :span="12">
<!--            <AIGenerate type="dataSource"/>-->
          </el-col>
        </el-row>


        <data-tables
          ref="dataTableRef"
          @headerDragend="onHeaderDragend"
          v-model:pageSize="form.pageSize"
          v-model:currentPage="form.currentPage"
          :pagination-props="{ pageSizes: [5, 10, 20, 50] }"
          :table-props="{
            border: true
          }"
          @selection-change="handleSelectionChange"
          v-loading="isLoading"
          class="table"
          border
          :data="tableData"
          :default-sort="{ prop: 'lastUpdated', order: 'descending' }"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column type="expand">
            <template v-slot:default="{ row }">
              <h3>Connections</h3>
              <el-table :data="row.connections" stripe style="width: 100%">
                <el-table-column label="Type">
                  <template v-slot:default="{ row }">
                    {{ getConnectionType(row) }}
                  </template>
                </el-table-column>
                <el-table-column sortable prop="baseUrl" label="Base Url"></el-table-column>
                <el-table-column sortable prop="authType" label="Auth Type">
                  <template v-slot:default="{ row }">
                    {{ getAuthTypeName(row.authType) }}
                  </template>
                </el-table-column>
              </el-table>

              <el-divider/>

              <h3>Endpoints</h3>
              <el-table :data="row.endpoints" stripe style="width: 100%">
                <el-table-column prop="operation" label="Operation"></el-table-column>
                <el-table-column prop="dataMappingConfigId" label="Data Mapping Config">
                  <template v-slot:default="{ row }">
                    {{ getDataMappingNameById(row.consumerConfig.configId) }}
                  </template>
                </el-table-column>
                <el-table-column prop="chaining" label="Chaining">
                  <template v-slot:default="{ row }">
                    {{ getChainingsNames(row.chainings) }}
                  </template>
                </el-table-column>
                <el-table-column prop="query" label="Query"></el-table-column>
                <el-table-column prop="Method" label="method">
                  <template v-slot:default="{ row }">
                    {{ endpointMethodName(row.method) }}
                  </template>
                </el-table-column>
                <el-table-column prop="connectionTimeout" label="Connection Timeout">
                  <template v-slot:default="{ row }">
                    {{ row.connectionTimeout || "-" }}
                  </template>
                </el-table-column>
                <el-table-column prop="readWriteTimeout" label="Read Write Timeout">
                  <template v-slot:default="{ row }">
                    {{ row.readWriteTimeout || "-" }}
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="Type"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column sortable prop="name" label="Name">
            <template v-slot:default="{ row }">
              <ViewsHelpersIndexName :row="row"/>
            </template>
          </el-table-column>
          <el-table-column sortable prop="description" label="Description"></el-table-column>
          <el-table-column sortable prop="lastUpdated" label="Updated at">
            <template v-slot:default="{ row }">
              <span v-if="row.id">
                {{ $filters.mktimeToDateTime(row.lastUpdated) }}
              </span>
              <span v-else> - </span>
            </template>
          </el-table-column>
          <el-table-column width="260px" label="Actions">
            <template v-slot:default="{ row }">
              <CyodaButton size="default" type="warning" :to="getEditLink(row)">
                <font-awesome-icon icon="pencil-alt"/>
              </CyodaButton>
              <el-button size="default" type="danger" @click="onDelete(row)">
                <font-awesome-icon icon="trash"/>
              </el-button>
              <el-button size="default" type="primary" @click="onCopy(row)">
                <font-awesome-icon icon="copy"/>
              </el-button>
              <el-button v-if="!isVirtual(row)" size="default" type="success" @click="onPlay(row)">
                <font-awesome-icon icon="play"/>
              </el-button>
            </template>
          </el-table-column>
        </data-tables>
      </div>
    </div>

    <CopyData @copied="onCopied" ref="copyDataRef" type="DataSourceConfig"/>
    <DataSourceConfigDialogRequest :key="`dataSourceConfigDialogRequest${dataSourceConfigDialogRequestKey}`"
                                   ref="dataSourceConfigDialogRequestRef"/>
  </div>
</template>

<script setup lang="ts">
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import {useDataSourceConfigStore} from "../../stores/data-source-config";
import {ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import {ref, nextTick, computed, onBeforeUnmount, provide, reactive} from "vue";

import HelperDataSourceConfig from "../../helpers/HelperDataSourceConfig";
import ExportImport from "../../components/ExportImport/ExportImport.vue";
import HelperContent from "../../helpers/HelperContent";
import CopyData from "../../components/CopyData/CopyData.vue";

import {useAutoSavingMixin} from "../../mixins/AutoSavingMixin";
import ViewsHelpersIndexName from "../../components/ViewsHelpers/ViewsHelpersIndexName.vue";
import DataSourceConfigDialogRequest
  from "../../components/DataSourceConfig/DataSourceConfigDialogRequest/DataSourceConfigDialogRequest.vue";
import type {DataSourceConfigDto} from "../../components/DataSourceConfig/DataSourceConfig";
import _ from "lodash";
import CyodaButton from "../../components/CyodaButton/CyodaButton.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useTableSaveStateMixin} from "@cyoda/ui-lib/src/mixins/TableSaveStateMixin";
import {useChainingConfigStore} from "../../stores/chaining-config";
import AIGenerate from "../../components/AIGenerate/AIGenerate.vue";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";
const isChatBotEnabled = HelperFeatureFlags.isChatBotEnabled();

// @TODO Mixins: AutoSavingMixin, IndexHistoryPageMixin
const {
  autoDataStorageKey,
  deleteAutoSaveRecordById,
  clearOldAutoSaveRecords,
  autoSaveRecordsForIndex,
  copyAutoSaveRecord
} = useAutoSavingMixin();
const router = useRouter();
const dataSourceConfigStore = useDataSourceConfigStore();
const platformMappingStore = usePlatformMappingStore();
const chainingConfigStore = useChainingConfigStore();

const tableData = computed(() => {
  const filter = form.filter.toLowerCase();
  return listConfigs.value.filter((el: DataSourceConfigDto) => {
    return !form.filter
      || el.name.toLowerCase().indexOf(filter) > -1
      || el.description.toLowerCase().indexOf(filter) > -1
      || el.endpoints.filter((el) => {
        return el.operation?.toLowerCase().indexOf(filter) > -1;
      }).length > 0;
  });
});

function getListAll() {
  return dataSourceConfigStore.getListAll();
}

function getListAllChainings() {
  return chainingConfigStore.getListAll();
}

function deleteById(id) {
  return dataSourceConfigStore.deleteById(id);
}

function getAvailableAuthType() {
  return dataSourceConfigStore.getAvailableAuthType();
}

function datasources() {
  return dataSourceConfigStore.datasources();
}

function getListAllDataMappings(value) {
  return platformMappingStore.getListAllDataMappings(value);
}

const copyDataRef = ref(null);

const dataSourceConfigDialogRequestRef = ref(null);

const isLoading = ref<boolean>(false);
let listConfigs = ref([]);
let listChainings = ref([]);
let multipleSelection = ref([]);
let authTypeOptions = ref([]);
let datasourcesWithParams = ref([]);
const dataSourceConfigDialogRequestKey = ref(0);

let listAllDataMappings = ref([]);

provide("getSelectedItems", multipleSelection);
provide("selectedItemsType", "connections");

let form = reactive({
  filter: "",
  currentPage: 1,
  pageSize: 10
});

const dataTableRef = ref(null);
const {onHeaderDragend} = useTableSaveStateMixin('dataSourceConfigCreationIndexTable', dataTableRef, form);

(async function () {
  autoDataStorageKey.value = `autoSave:${import.meta.env.VITE_APP_UI_VERSION}:dataSourceList`;
  clearOldAutoSaveRecords();

  await nextTick();

  loadData();
  eventBus.$on("closedImportExport:data-source-config", loadData);
})();

async function loadDatasourcesWithParams() {
  const {data} = await datasources();
  datasourcesWithParams.value = data;
}

onBeforeUnmount(() => {
  eventBus.$off("closedImportExport:data-source-config", loadData);
  eventBus.$off("dataSourceConfig:created", loadData);
});

async function loadData() {
  try {
    isLoading.value = true;
    await Promise.all([loadList(), loadDataMapping(), loadAvailableAuthType(), loadDatasourcesWithParams(), loadChainings()]);
  } finally {
    isLoading.value = false;
  }
}

async function loadAvailableAuthType() {
  const {data} = await getAvailableAuthType();
  authTypeOptions.value = HelperContent.transformEnumToOption(data);
}

async function loadList() {
  let {data} = await getListAll();
  data = _.orderBy(data, "lastUpdated", "desc");
  listConfigs.value = [...autoSaveRecordsForIndex.value, ...data];
}

async function loadChainings() {
  let {data} = await getListAllChainings();
  listChainings.value = data;
}

async function loadDataMapping() {
  const {data} = await getListAllDataMappings(false);
  listAllDataMappings.value = data;
}

function removeSymbolsForSearch(array: any[]) {
  return JSON.stringify(array).replaceAll('"', "").replaceAll(",", "").replaceAll(".", "").replaceAll("'", "");
}

function onAddNewConfiguration() {
  router.push("/data-mapper/data-source-config-creation/configuration");
}

function getDataMappingNameById(id: string) {
  const used = listAllDataMappings.value.find((el) => el.id === id);
  if (used) {
    return used.name;
  }
  return "";
}

function getChainingsNames(ids = []) {
  return ids.map((id) => {
    const chaining = listChainings.value.find((el) => el.id === id);
    return chaining?.name || null;
  }).filter((el) => el).join(', ');
}

function endpointMethodName(val: string) {
  return HelperDataSourceConfig.getNameFromEndpointMethodOptions(val);
}

function getAuthTypeName(val: string) {
  const used = authTypeOptions.value.find((el) => el.value === val);
  if (used && used.label) {
    return used.label;
  } else {
    return "-";
  }
}

function getEditLink(row: any) {
  if (row.virtual) {
    return `/data-mapper/data-source-config-creation/configuration/${row.virtual.id}?virtual=true`;
  }
  return `/data-mapper/data-source-config-creation/configuration/${row.id}`;
}

function onDelete(row: any) {
  ElMessageBox.confirm("Do you really want to remove row?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          isLoading.value = true;
          if (!row.id) {
            deleteAutoSaveRecordById(row.virtual.id);
          } else {
            await deleteById(row.id);
          }
          loadList();
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}

function onClickDeleteSelected() {
  ElMessageBox.confirm(`Do you really want to remove ${multipleSelection.value.length} row(s)?`, "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          isLoading.value = true;
          for (const row of multipleSelection.value) {
            if (!row.id) {
              deleteAutoSaveRecordById(row.virtual.id);
            } else {
              await deleteById(row.id);
            }
          }
          loadList();
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
}

function handleSelectionChange(val: any) {
  multipleSelection.value = val;
}

function onCopy(row: any) {
  if (row.virtual) {
    copyAutoSaveRecord(row);
    loadData();
    return;
  }
  copyDataRef.value.copy(row);
}

function onCopied() {
  loadData();
}

function onPlay(row) {
  dataSourceConfigDialogRequestKey.value += 1;
  setTimeout(() => {
    const dataSource = datasourcesWithParams.value.data_sources.find((el) => el.id === row.id);

    dataSourceConfigDialogRequestRef.value.openDialog(dataSource, row);
  }, 500);
}

function isVirtual(row) {
  return !row.id;
}

function getConnectionType(row) {
  return HelperDataSourceConfig.geConnectionType(row);
}
</script>

<style lang="scss">
.data-source-config-creation-index {
  h4 {
    font-size: 18px;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table {
    margin-top: 10px;
  }

  .export-import {
    margin-right: 10px;
  }

  .divider {
    margin-top: 40px;
  }

  h3 {
    margin: 10px 0;
    padding: 0 10px;
  }
}
</style>
