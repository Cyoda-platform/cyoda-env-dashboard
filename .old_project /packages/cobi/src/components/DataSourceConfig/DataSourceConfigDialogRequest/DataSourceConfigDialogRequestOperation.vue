<template>
  <div class="data-source-config-dialog-request-operation">
    <div class="title-client-data">
      <h4>Request Fields</h4>
      <el-button @click="onAddRequestFields" type="primary">
        Add
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th class="td-name">Name</th>
          <th>Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in requestFieldsArr" :key="index">
          <template v-if="row.isCustom">
            <td>
              <el-input @change="onChangeClientData" v-model="row.key" />
            </td>
          </template>
          <template v-else>
            <td class="td-mapping">
              {{ row.key }}
            </td>
          </template>
          <td>
            <el-input @change="onChangeRequestFields" v-model="row.value" />
          </td>
          <td class="action">
            <el-button v-if="row.isCustom" size="default" @click="deleteRequestField(index)" type="danger">
              <font-awesome-icon icon="trash" />
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>

    <el-divider />
    <div class="title-client-data">
      <h4>Client Data</h4>
      <el-button @click="onAddClientData" type="primary">
        Add
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in clientDataArr" :key="index">
          <td>
            <el-input @change="onChangeClientData" v-model="row.key" />
          </td>
          <td>
            <el-input @change="onChangeClientData" v-model="row.value" />
          </td>
          <td class="action">
            <el-button size="default" @click="deleteClientData(index)" type="danger">
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

const props = defineProps({
  dataSourceOperation: {
    default: () => {
      return {};
    }
  },
  activeRequestFields: {
    default: () => {
      return {};
    }
  },
  index: { default: 0 }
});
const dataSourceConfigStore = useDataSourceConfigStore();
function verifyTemplateCalc() {
  return dataSourceConfigStore.verifyTemplateCalc();
}

function getAvailableAuthType() {
  return dataSourceConfigStore.getAvailableAuthType();
}

let requestFieldsArr = ref([]);
let clientDataArr = ref([]);

watch(
  () => props.dataSourceOperation.request_fields,
  () => {
    if (requestFieldsArr.value.length === 0) {
      const originalKeys = Object.keys(props.activeRequestFields);
      Object.keys(props.dataSourceOperation.request_fields).forEach((key) => {
        requestFieldsArr.value.push({
          key,
          value: props.dataSourceOperation.request_fields[key] || "",
          isCustom: !originalKeys.includes(key)
        });
      });
    }
  },
  { immediate: true }
);

watch(
  () => props.dataSourceOperation.clientData,
  () => {
    if (clientDataArr.value.length === 0) {
      Object.keys(props.dataSourceOperation.clientData).forEach((key) => {
        clientDataArr.value.push({
          key,
          value: props.dataSourceOperation.clientData[key] || ""
        });
      });
    }
  },
  { immediate: true }
);

function onChangeRequestFields() {
  props.dataSourceOperation.request_fields = {};
  requestFieldsArr.value.forEach((el) => {
    props.dataSourceOperation.request_fields[el.key] = el.value;
  });
}
function onChangeClientData() {
  props.dataSourceOperation.clientData = {};
  clientDataArr.value.forEach((el) => {
    props.dataSourceOperation.clientData[el.key] = el.value;
  });
}
function onAddRequestFields() {
  requestFieldsArr.value.push({
    key: "",
    value: "",
    isCustom: true
  });
}
function onAddClientData() {
  clientDataArr.value.push({
    key: "",
    value: ""
  });
}
function deleteRequestField(index) {
  ElMessageBox.confirm("Do you really want to remove row?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        requestFieldsArr.value.splice(index, 1);

        onChangeRequestFields();
      }
    }
  });
}
function deleteClientData(index) {
  ElMessageBox.confirm("Do you really want to remove row?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        clientDataArr.value.splice(index, 1);

        onChangeClientData();
      }
    }
  });
}
</script>

<style lang="scss">
.data-source-config-dialog-request-operation {
  .title {
    font-size: 18px;
    margin-bottom: 10px;

    span {
      font-weight: bold;
    }
  }

  .table {
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

  .actions {
    margin-bottom: 10px;
    text-align: right;
  }

  .td-mapping {
    background-color: #f5f7fa;
    padding-left: 15px;
  }

  .title-client-data {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .td-name {
    width: 40%;
  }
}
</style>
