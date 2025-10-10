<template>
  <div class="dialog-connection-sql">
    <el-form-item label="Name" prop="name">
      <el-input v-model.trim="connectionDetailsDto.name" />
    </el-form-item>

    <el-form-item label="JDBC Url" prop="jdbcUrl">
      <el-input v-model.trim="connectionDetailsDto.jdbcUrl" />
      <span class="hint">Example: jdbc:mysql://localhost:3306/my_database</span>
    </el-form-item>

    <el-form-item label="Username" prop="username">
      <el-input v-model.trim="connectionDetailsDto.username" />
    </el-form-item>

    <el-form-item label="Password" prop="password">
      <el-input v-model.trim="connectionDetailsDto.password" show-password />
    </el-form-item>

    <el-form-item label="Driver Class Name" prop="driverClassName">
      <el-input v-model.trim="connectionDetailsDto.driverClassName" />
      <span class="hint">Example: com.mysql.jdbc.Driver</span>
    </el-form-item>

    <div class="header-actions">
      <el-button @click="addConnectionProperties" type="primary">
        Add Connection Properties
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <table class="table table-headers">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(header, index) in connectionProperties" :key="index">
          <td>
            <el-input @change="onChangeConnectionProperties" placeholder="Please input key" v-model.trim="header.key"></el-input>
          </td>
          <td>
            <el-input @change="onChangeConnectionProperties" placeholder="Please input value" v-model.trim="header.value"></el-input>
          </td>
          <td class="action">
            <el-button size="default" @click="deleteHeader(index)" type="danger">
              <font-awesome-icon icon="trash" />
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useDataSourceConfigStore } from "../../../stores/data-source-config";
import { ElMessageBox } from "element-plus";
import { ref, watch } from "vue";

import HelperContent from "../../../helpers/HelperContent";

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

function getProxy() {
  return dataSourceConfigStore.getProxy();
}

let authTypeOptions = ref([]);
let proxyConfigurationOptions = ref([]);
loadAvailableAuthType();
loadProxy();

async function loadAvailableAuthType() {
  const { data } = await getAvailableAuthType();
  authTypeOptions.value = HelperContent.transformEnumToOption(data);
}

async function loadProxy() {
  const { data } = await getProxy();
  proxyConfigurationOptions.value = data.map((el: string) => {
    return {
      value: el,
      label: el
    };
  });
}

function addConnectionProperties() {
  connectionProperties.value.push({ key: "", value: "" });
}

function deleteHeader(index: number) {
  ElMessageBox.confirm("Do you really want to remove header?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        connectionProperties.value.splice(index, 1);

        onChangeConnectionProperties();
      }
    }
  });
}

let connectionProperties = ref([]);

function onChangeConnectionProperties() {
  props.connectionDetailsDto.connectionProperties = {};
  connectionProperties.value.forEach((el) => {
    props.connectionDetailsDto.connectionProperties[el.key] = el.value;
  });
}

watch(
  () => props.connectionDetailsDto.connectionProperties,
  (headers: any) => {
    if (connectionProperties.value.length === 0) {
      Object.keys(headers).forEach((el) => {
        connectionProperties.value.push({
          key: el,
          value: headers[el]
        });
      });
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.dialog-connection-sql {
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
        box-shadow: none !important;
        border-radius: 0;
        border: none;
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
}
</style>
