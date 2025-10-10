<template>
  <div class="data-chaining-config-parameters">
    <div class="actions-parameters">
      <el-button :disabled="!chainingConfigDto.nextOperation" @click="addNewParameter" type="primary">
        Add New Parameter
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>

    <table class="table table-chaining-config">
      <thead>
        <tr>
          <th>Next Operation Parameter Name</th>
          <th>Source Relative Path</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(parameter, index) in chainingConfigDto.parameters" :key="index">
          <td class="td-name">
            <el-select filterable clearable v-model="parameter.nextOperationParameterName" placeholder="Select">
              <el-option v-for="item in nameOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </td>
          <td class="td-relative-path">
            <el-tree-select check-strictly placeholder="Please select" v-model="parameter.srcRelativePath" :data="optionsForMapping">
              <template #default="{ data: { labelShort, label } }">
                {{ labelShort || label }}
              </template>
            </el-tree-select>
          </td>
          <td class="action">
            <el-button @click="onDeleteParameter(index)" size="default" type="danger">
              <font-awesome-icon icon="trash"></font-awesome-icon>
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, computed } from "vue";

import HelperMapper from "../../../helpers/HelperMapper";
import _ from "lodash";
import HelperContent from "../../../helpers/HelperContent";

const props = defineProps({
  chainingConfigDto: {
    default: () => {
      return {};
    }
  },
  dataSourceConfigList: {
    default: () => {
      return [];
    }
  },
  dataMappingList: {
    default: () => {
      return {};
    }
  }
});
const nameOptions = computed(() => {
  const data: any[] = [];
  const dataSourceConfigDto = props.dataSourceConfigList.find((el) => el.id === props.chainingConfigDto.datasourceId);
  if (!dataSourceConfigDto) {
    return data;
  }

  const selectedEndpoint = dataSourceConfigDto.endpoints.find((el) => el.operation === props.chainingConfigDto.nextOperation);
  if (!selectedEndpoint) {
    return data;
  }

  selectedEndpoint.parameters.forEach((el) => {
    data.push({
      value: el.name,
      name: el.name
    });
  });

  return data;
});

const optionsForMapping = computed(() => {
  let options: any = [];
  const dataSourceConfigDto = props.dataSourceConfigList.find((el) => el.id === props.chainingConfigDto.datasourceId);
  if (!dataSourceConfigDto) {
    return options;
  }

  const id = Object.keys(props.chainingConfigDto.rootRelativePaths)[0];
  const dataMapping = props.dataMappingList.find((el) => el.id === id);
  const rootRelativePaths = Object.values(props.chainingConfigDto.rootRelativePaths)[0];

  if (!dataMapping || !rootRelativePaths || !id) {
    return options;
  }

  let sampleContent = HelperContent.getSourceData(dataMapping.sampleContent, dataMapping);
  const path = HelperMapper.transformPathToJs(rootRelativePaths);
  if (path) {
    sampleContent = _.get(sampleContent, path);
  }
  if (!sampleContent) {
    return options;
  }
  options = [
    {
      label: "/",
      labelShort: "/",
      value: "/",
      children: HelperMapper.relativePathOptions(sampleContent, "/", [], true)
    }
  ];
  return options;
});

let form = ref({
  nextOperationParameterName: "",
  srcRelativePath: null
});

function addNewParameter() {
  props.chainingConfigDto.parameters.push(JSON.parse(JSON.stringify(form.value)));
}

function onDeleteParameter(index: number) {
  ElMessageBox.confirm("Do you really want to remove parameter?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        if (index !== -1) {
          props.chainingConfigDto.parameters.splice(index, 1);
        }
      }
    }
  });
}
</script>

<style lang="scss">
.data-chaining-config-parameters {
  .actions-parameters {
    margin-bottom: 10px;
    text-align: right;
  }

  .td-name,
  .td-relative-path {
    width: 45%;
  }

  .table-chaining-config {
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
      .el-input__inner, .el-input__wrapper,
      .vue-treeselect__control, .el-select__wrapper {
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
