<template>
  <div class="data-source-config-endpoint-details">
    <div class="actions-endpoints">
      <el-button @click="addNewEndpoint" type="primary">
        Add New Endpoint
        <font-awesome-icon icon="plus"/>
      </el-button>
    </div>

    <CyodaDataTablesDraggable :animate="300" handle=".handle">
      <el-table :data="dataSourceConfigDto.endpoints" stripe style="width: 100%">
        <el-table-column label="" align="center" width="50">
          <font-awesome-icon class="handle" icon="align-justify"/>
        </el-table-column>
        <el-table-column sortable prop="@bean" label="Type">
          <template v-slot:default="{ row }">
            {{ endpointType(row) }}
          </template>
        </el-table-column>
        <el-table-column sortable :sort-by="(row)=> connectionName(row)" label="Connection Name">
          <template v-slot:default="{ row }">
            {{ connectionName(row) }}
          </template>
        </el-table-column>
        <el-table-column sortable prop="operation" label="Operation"></el-table-column>
        <el-table-column sortable prop="dataMappingConfigId" label="Data Mapping Config">
          <template #default="{ row }">
            {{ getDataMappingNameById(row.consumerConfig) }}
          </template>
        </el-table-column>
        <el-table-column prop="chaining" label="Chaining">
          <template #default="{ row }">
            {{ getChainingsNames(row.chainings) }}
          </template>
        </el-table-column>
        <el-table-column sortable prop="query" label="Query"></el-table-column>
        <el-table-column sortable prop="Method" label="method">
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
        <el-table-column width="150" label="Actions">
          <template v-slot:default="{ row }">
            <el-button @click="onEditEndpoint(row)" size="default" type="primary">
              <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
            </el-button>
            <el-button @click="onDeleteEndpoint(row)" size="default" type="danger">
              <font-awesome-icon icon="trash"></font-awesome-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </CyodaDataTablesDraggable>
    <DialogEndpoint :key="dialogEndpointKey" :dataSourceConfigDto="dataSourceConfigDto" ref="dialogEndpointRef"/>
  </div>
</template>

<script setup lang="ts">
import {usePlatformMappingStore} from "../../../../stores/platform-mapping";
import {ref} from "vue";

import type {HttpEndpointDto, SqlEndpointDto, WorkflowEndpointDto} from "../../DataSourceConfig";
import DialogEndpoint from "../../DialogEndpoint/DialogEndpoint.vue";

import HelperDataSourceConfig from "../../../../helpers/HelperDataSourceConfig";
import CyodaDataTablesDraggable
  from "@cyoda/ui-lib/src/components-library/elements/CyodaDataTables/CyodaDataTablesDraggable.vue";
import {ElMessageBox} from "element-plus";
import {useChainingConfigStore} from "../../../../stores/chaining-config";

const props = defineProps({
  dataSourceConfigDto: {
    default: () => {
      return {};
    }
  }
});
const platformMappingStore = usePlatformMappingStore();
const chainingConfigStore = useChainingConfigStore();

function getListAllDataMappings(value) {
  return platformMappingStore.getListAllDataMappings(value);
}

function getListAllChainings() {
  return chainingConfigStore.getListAll();
}

const dialogEndpointRef = ref(null);

const dialogEndpointKey = ref(0);

let listAllDataMappings = ref([]);

let listChainings = ref([]);

function addNewEndpoint() {
  dialogEndpointKey.value += 1;
  setTimeout(() => {
    dialogEndpointRef.value.openDialogAndCreateNew();
  }, 200);
}

function onEditEndpoint(row: HttpEndpointDto) {
  dialogEndpointKey.value += 1;
  setTimeout(() => {
    dialogEndpointRef.value.openDialogAndEditRecord(row);
  }, 200);
}

function onDeleteEndpoint(row: HttpEndpointDto) {
  ElMessageBox.confirm("Do you really want to remove endpoint?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const index = props.dataSourceConfigDto.endpoints.indexOf(row);
        if (index !== -1) {
          props.dataSourceConfigDto.endpoints.splice(index, 1);
        }
      }
    }
  });
}

function getDataMappingNameById(consumerConfig: any) {
  if (!consumerConfig) return "-";
  const used = listAllDataMappings.value.find((el) => el.id === consumerConfig.configId);
  if (used) {
    return used.name;
  }
  return "";
}

loadDataMapping();

async function loadDataMapping() {
  const {data} = await getListAllDataMappings(false);
  listAllDataMappings.value = data;
}

function getChainingsNames(ids = []) {
  return ids.map((id) => {
    const chaining = listChainings.value.find((el) => el.id === id);
    return chaining?.name || null;
  }).filter((el) => el).join(', ');
}

loadChainings();

async function loadChainings() {
  let {data} = await getListAllChainings();
  listChainings.value = data;
}

function endpointMethodName(val: string) {
  return HelperDataSourceConfig.getNameFromEndpointMethodOptions(val);
}

function endpointType(row) {
  return HelperDataSourceConfig.getEndpointType(row);
}

function connectionName(row: SqlEndpointDto | HttpEndpointDto | WorkflowEndpointDto) {
  return props.dataSourceConfigDto.connections[row.connectionIndex].name;
}
</script>

<style lang="scss">
.data-source-config-endpoint-details {
  .actions-endpoints {
    text-align: right;
    margin-bottom: 10px;
  }

  .handle {
    cursor: pointer;
  }
}
</style>
