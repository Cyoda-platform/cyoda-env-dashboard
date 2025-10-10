<template>
  <div class="data-management-dashboard-index">
    <div class="card">
      <div class="card-body">
        <div class="flex">
          <div>
            <h4>List of runnable data source connections</h4>
          </div>
        </div>
      </div>

      <el-row class="row-filter" :gutter="20">
        <el-col :span="12">
          <el-input placeholder="Filter" v-model="form.filter"></el-input>
        </el-col>
      </el-row>

      <data-tables
        ref="dataTableRef"
        @headerDragend="onHeaderDragend"
        :pageSize="10"
        :pagination-props="{ pageSizes: [5, 10, 20, 50] }"
        :table-props="{
          border: true
        }"
        v-loading="isLoading"
        class="table"
        border
        :data="tableData"
        :default-sort="{ prop: 'lastUpdated', order: 'descending' }"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
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
        <el-table-column sortable prop="name" label="Name"></el-table-column>
        <el-table-column sortable prop="description" label="Description"></el-table-column>
        <el-table-column sortable prop="lastUpdated" label="Updated at">
          <template v-slot:default="{ row }">
            <span v-if="row.id">
              {{ $filters.mktimeToDateTime(row.lastUpdated) }}
            </span>
            <span v-else> - </span>
          </template>
        </el-table-column>
        <el-table-column width="150px" label="Actions">
          <template v-slot:default="{ row }">
            <el-button size="default" type="success" @click="onPlay(row)">
              <font-awesome-icon icon="play"/>
            </el-button>
            <el-button size="default" type="success" @click="onOpenDiagram(row)">
              <font-awesome-icon icon="diagram-project"/>
            </el-button>
          </template>
        </el-table-column>
      </data-tables>

      <el-divider/>

      <el-row class="list-connection-executions">
        <el-col :span="24">
          <h4>List of Connection Executions</h4>
        </el-col>
      </el-row>

      <DataSourceConfigDataImports/>
      <DataSourceConfigDialogRequest :key="`dataSourceConfigDialogRequest${dataSourceConfigDialogRequestKey}`"
                                     ref="dataSourceConfigDialogRequestRef"/>
      <DataManagementDashboardIndexDiagram :key="indexDiagramKey" ref="dataManagementDashboardIndexDiagramRef"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import {useDataSourceConfigStore} from "../../stores/data-source-config";
import {ref, computed, onBeforeUnmount} from "vue";

import DataSourceConfigDataImports
  from "../../components/DataSourceConfig/DataSourceConfigDataImports/DataSourceConfigDataImports.vue";

import DataSourceConfigDialogRequest
  from "../../components/DataSourceConfig/DataSourceConfigDialogRequest/DataSourceConfigDialogRequest.vue";
import HelperContent from "../../helpers/HelperContent";
import HelperDataSourceConfig from "../../helpers/HelperDataSourceConfig";
import DataManagementDashboardIndexDiagram from "./DataManagementDashboardIndexDiagram.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useTableSaveStateMixin} from "@cyoda/ui-lib/src/mixins/TableSaveStateMixin";

const dataSourceConfigStore = useDataSourceConfigStore();
const platformMappingStore = usePlatformMappingStore();
const tableData = computed(() => {
  const filter = form.value.filter.toLowerCase();
  return listConfigs.value.filter((el: any) => {
    return !form.value.filter || el.name.toLowerCase().indexOf(filter) > -1 || el.description.toLowerCase().indexOf(filter) > -1 || removeSymbolsForSearch(el.connections).toLowerCase().indexOf(filter) > -1 || removeSymbolsForSearch(el.endpoints).toLowerCase().indexOf(filter) > -1;
  });
});

function getListAll() {
  return dataSourceConfigStore.getListAll();
}

function datasources() {
  return dataSourceConfigStore.datasources();
}

function getAvailableAuthType() {
  return dataSourceConfigStore.getAvailableAuthType();
}

function getListAllDataMappings(value) {
  return platformMappingStore.getListAllDataMappings(value);
}

const dataSourceConfigDialogRequestRef = ref(null);

const dataManagementDashboardIndexDiagramRef = ref(null);

const dataTableRef = ref(null);
const {onHeaderDragend} = useTableSaveStateMixin('dataManagementDashboardIndexTable', dataTableRef);
const isLoading = ref<boolean>(false);
let listConfigs = ref([]);
const dataSourceConfigDialogRequestKey = ref(0);
const indexDiagramKey = ref(0);
let datasourcesWithParams = ref([]);
let authTypeOptions = ref([]);
let listAllDataMappings = ref([]);

let form = ref({
  filter: ""
});

(async function () {
  await loadDataMapping();
  loadDatasourcesWithParams();
  loadData();
  loadAvailableAuthType();
  eventBus.$on("dataSourceConfig:created", loadData);
})();

async function loadData() {
  try {
    isLoading.value = true;
    const {data} = await getListAll();
    listConfigs.value = data;
  } finally {
    isLoading.value = false;
  }
}

async function loadAvailableAuthType() {
  const {data} = await getAvailableAuthType();
  authTypeOptions.value = HelperContent.transformEnumToOption(data);
}

async function loadDatasourcesWithParams() {
  const {data} = await datasources();
  datasourcesWithParams.value = data;
}

function onPlay(row) {
  dataSourceConfigDialogRequestKey.value += 1;
  setTimeout(() => {
    const dataSource = datasourcesWithParams.value.data_sources.find((el) => el.id === row.id);
    const dataSourceConfigDto = listConfigs.value.find((el) => el.id === row.id);

    dataSourceConfigDialogRequestRef.value.openDialog(dataSource, dataSourceConfigDto);
  }, 500);
}

function onOpenDiagram(row) {
  indexDiagramKey.value += 1;
  setTimeout(() => {
    dataManagementDashboardIndexDiagramRef.value.openDialog(row);
  }, 300);
}

onBeforeUnmount(() => {
  eventBus.$off("dataSourceConfig:created", loadData);
});

async function loadDataMapping() {
  const {data} = await getListAllDataMappings(false);
  listAllDataMappings.value = data;
}

function getAuthTypeName(val: string) {
  const used = authTypeOptions.value.find((el) => el.value === val);
  if (used && used.label) {
    return used.label;
  } else {
    return "-";
  }
}

function endpointMethodName(val: string) {
  return HelperDataSourceConfig.getNameFromEndpointMethodOptions(val);
}

function getDataMappingNameById(id: string) {
  const used = listAllDataMappings.value.find((el) => el.id === id);
  if (used) {
    return used.name;
  }
  return "";
}

function getConnectionType(row) {
  return HelperDataSourceConfig.geConnectionType(row);
}

function removeSymbolsForSearch(array: any[]) {
  return JSON.stringify(array).replaceAll('"', "").replaceAll(",", "").replaceAll(".", "").replaceAll("'", "");
}
</script>

<style lang="scss">
.data-management-dashboard-index {
  h4 {
    font-size: 18px;
  }

  .configurations-row {
    margin: 20px 0;
  }

  .row-filter {
    margin: 10px 0;
  }

  .list-connection-executions {
    margin-bottom: 10px;
  }
}
</style>
