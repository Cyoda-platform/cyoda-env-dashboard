<template>
  <div class="dialog-connection-http">
    <el-tabs>
      <el-tab-pane label="Default">
        <el-form-item label="Name" prop="name">
          <el-input v-model.trim="connectionDetailsDto.name" />
        </el-form-item>

        <el-form-item label="Base Url" prop="baseUrl">
          <el-input v-model.trim="connectionDetailsDto.baseUrl" v-remove-slash />
          <span class="hint">Example: https://some_url.com/api</span>
        </el-form-item>

        <ProxyConfiguration :form="connectionDetailsDto" />

        <el-form-item label="Auth Type" prop="authType">
          <el-select v-model="connectionDetailsDto.authType" placeholder="Select">
            <el-option v-for="item in authTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>

        <DataSourceHeaders v-model:targetHeaders="connectionDetailsDto.headers" />
      </el-tab-pane>
      <el-tab-pane label="Preliminary auth steps">
        <h2 class="h-cyoda-title">Settings</h2>

        <el-form-item label="Name" prop="authConfig.name">
          <el-input v-model="connectionDetailsDto.authConfig.name" />
        </el-form-item>

        <el-form-item label="Number of retries" prop="authConfig.numOfRetries">
          <el-input-number :min="0" v-model="connectionDetailsDto.authConfig.numOfRetries" />
        </el-form-item>

        <h2 class="h-cyoda-title">Cache</h2>
        <el-form-item label="Persist Cache">
          <el-switch v-model="connectionDetailsDto.authConfig.cacheConfig.persistCache"></el-switch>
        </el-form-item>

        <el-form-item label="Ttl" prop="authConfig.cacheConfig.ttl">
          <el-input-number :step="1000" :min="0" v-model="connectionDetailsDto.authConfig.cacheConfig.ttl" />
          <div class="hint">Milliseconds</div>
        </el-form-item>

        <h2 class="h-cyoda-title">Operations</h2>
        <div class="actions-operations">
          <el-button @click="addOperation" type="primary">
            Add operation
            <font-awesome-icon icon="plus" />
          </el-button>
        </div>

        <el-table :data="connectionDetailsDto.authConfig.authOperationConfigs" stripe style="width: 100%">
          <el-table-column type="expand">
            <template v-slot:default="{ row }">
              <HttpParametersDisplayTable :parameters="row.parameters" />
            </template>
          </el-table-column>
          <el-table-column prop="authServiceName" label="Auth Service Name" />
          <el-table-column prop="baseUrl" label="Base Url" />
          <el-table-column prop="query" label="Query Path" />
          <el-table-column prop="query" label="Query Path" />
          <el-table-column prop="method" label="Method" />
          <el-table-column label="Actions">
            <template v-slot:default="{ row }">
              <el-button @click="onEditOperation(row)" size="default" type="primary">
                <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
              </el-button>
              <el-button @click="onDeleteOperation(row)" size="default" type="danger">
                <font-awesome-icon icon="trash"></font-awesome-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <DialogDataSourceAuthOperationConfig :key="dialogDataSourceAuthOperationConfigId" :connectionDetailsDto="connectionDetailsDto" ref="dialogDataSourceAuthOperationConfigRef" />
  </div>
</template>

<script setup lang="ts">
import { useDataSourceConfigStore } from "../../../stores/data-source-config";
import { ElMessageBox } from "element-plus";
import { ref } from "vue";

import type { HttpEndpointDto } from "../DataSourceConfig";

import HelperContent from "../../../helpers/HelperContent";
import DialogDataSourceAuthOperationConfig from "./DataSourceAuthOperationConfig/DialogDataSourceAuthOperationConfig.vue";
import DataSourceHeaders from "./DataSourceHeaders.vue";
import ProxyConfiguration from "../ProxyConfiguration/ProxyConfiguration.vue";
import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";
import HttpParametersDisplayTable from "../HttpParameters/HttpParametersDisplayTable.vue";

const props = defineProps({
  connectionDetailsDto: {
    default: () => {
      return {};
    }
  }
});
const dataSourceConfigStore = useDataSourceConfigStore();
function getAvailableAuthType() {
  return dataSourceConfigStore.getAvailableAuthType();
}

const dialogDataSourceAuthOperationConfigRef = ref(null);

let authTypeOptions = ref([]);
const dialogDataSourceAuthOperationConfigId = ref(0);
loadAvailableAuthType();

async function loadAvailableAuthType() {
  const { data } = await getAvailableAuthType();
  authTypeOptions.value = HelperContent.transformEnumToOption(data);
}

function addOperation() {
  dialogDataSourceAuthOperationConfigId.value += 1;
  setTimeout(() => {
    dialogDataSourceAuthOperationConfigRef.value.openDialogAndCreateNew();
  }, 300);
}

function getParameterName(val: string) {
  return HelperDataSourceConfig.getNameFromEndpointParameterTypeOptions(val);
}

function onEditOperation(row: HttpEndpointDto) {
  dialogDataSourceAuthOperationConfigId.value += 1;
  setTimeout(() => {
    dialogDataSourceAuthOperationConfigRef.value.openDialogAndEditRecord(row);
  }, 300);
}

function onDeleteOperation(row: HttpEndpointDto) {
  ElMessageBox.confirm("Do you really want to remove operation?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const index = props.connectionDetailsDto.authConfig.authOperationConfigs.indexOf(row);
        if (index !== -1) {
          props.connectionDetailsDto.authConfig.authOperationConfigs.splice(index, 1);
        }
      }
    }
  });
}
</script>

<style lang="scss">
.dialog-connection-http {
  .table-headers {
    width: 100%;
    border-collapse: collapse;

    td,
    th {
      border: 1px solid #dedede;
    }

    th {
      padding: 10px 20px;
      text-align: left;
      text-transform: uppercase;
    }

    td {
      .el-input__inner, .el-input__wrapper {
        border-radius: 0;
        border: none;
        box-shadow: none !important;
      }

      &.action {
        padding: 5px 10px;
      }
    }
  }

  .header-actions {
    margin-bottom: 10px;
    text-align: right;
  }

  .actions-operations {
    text-align: right;
    margin-bottom: 10px;
  }
}
</style>
