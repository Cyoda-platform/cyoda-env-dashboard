<template>
  <div class="data-source-config-connection-details">
    <div class="actions-connections">
      <el-button @click="addNewConnection" type="primary">
        Add New Connection
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>

    <el-table :data="dataSourceConfigDto.connections" stripe style="width: 100%">
      <el-table-column sortable prop="name" label="Name" />
      <el-table-column sortable prop="@bean" label="Type">
        <template v-slot:default="{ row }">
          {{ getType(row) }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="baseUrl" label="Base Url"> </el-table-column>
      <el-table-column sortable prop="authType" label="Auth Type">
        <template v-slot:default="{ row }">
          {{ getAuthTypeName(row.authType) }}
        </template>
      </el-table-column>
      <el-table-column width="150" label="Actions">
        <template v-slot:default="{ row }">
          <el-button @click="onEditConnection(row)" size="default" type="primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
          </el-button>
          <el-button @click="onDeleteConnection(row)" size="default" type="danger">
            <font-awesome-icon icon="trash"></font-awesome-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <DialogConnection :key="dialogConnectionKey" :dataSourceConfigDto="dataSourceConfigDto" ref="dialogConnectionRef" />
  </div>
</template>

<script setup lang="ts">
import { useDataSourceConfigStore } from "../../../../stores/data-source-config";
import { ElMessageBox } from "element-plus";
import { ref } from "vue";

import type { HttpConnectionDetailsDto, HttpEndpointDto, SqlConnectionDetailsDto, WorkflowConnectionDetailsDto } from "../../DataSourceConfig";
import DialogConnection from "../../DialogConnection/DialogConnection.vue";
import HelperContent from "../../../../helpers/HelperContent";

import HelperDataSourceConfig from "../../../../helpers/HelperDataSourceConfig";

const props = defineProps({
  dataSourceConfigDto: {
    default: () => {
      return {};
    }
  }
});
const dataSourceConfigStore = useDataSourceConfigStore();
function getAvailableAuthType() {
  return dataSourceConfigStore.getAvailableAuthType();
}

const dialogConnectionRef = ref(null);

const dialogConnectionKey = ref(0);

let authTypeOptions = ref([]);
loadAvailableAuthType();

function addNewConnection() {
  dialogConnectionKey.value += 1;
  setTimeout(() => {
    dialogConnectionRef.value.openDialogAndCreateNew();
  }, 200);
}

function onEditConnection(row: HttpEndpointDto) {
  dialogConnectionKey.value += 1;
  setTimeout(() => {
    dialogConnectionRef.value.openDialogAndEditRecord(row);
  }, 200);
}

function getType(row) {
  return HelperDataSourceConfig.geConnectionType(row);
}

function getAuthTypeName(val: string) {
  const used = authTypeOptions.value.find((el) => el.value === val);
  if (used && used.label) {
    return used.label;
  } else {
    return "-";
  }
}

async function loadAvailableAuthType() {
  const { data } = await getAvailableAuthType();
  authTypeOptions.value = HelperContent.transformEnumToOption(data);
}

function onDeleteConnection(row: HttpConnectionDetailsDto | SqlConnectionDetailsDto | WorkflowConnectionDetailsDto) {
  const index = props.dataSourceConfigDto.connections.indexOf(row);

  if (index !== undefined && props.dataSourceConfigDto.endpoints.find((el) => el.connectionIndex === index)) {
    ElMessageBox.alert("This connection was used in endpoint. Please remove this relation before delete", "Alert");
  } else {
    ElMessageBox.confirm("Do you really want to remove connection?", "Confirm!", {
      callback: async (action) => {
        if (action === "confirm") {
          const index = props.dataSourceConfigDto.connections.indexOf(row);
          if (index !== -1) {
            props.dataSourceConfigDto.connections.splice(index, 1);
          }
          props.dataSourceConfigDto.endpoints.forEach((endpoint) => {
            if (endpoint.connectionIndex > index) {
              endpoint.connectionIndex -= 1;
            }
          });
        }
      }
    });
  }
}
</script>

<style lang="scss">
.actions-connections {
  text-align: right;
  margin-bottom: 10px;
}
</style>
