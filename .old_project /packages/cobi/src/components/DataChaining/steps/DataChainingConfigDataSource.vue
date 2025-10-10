<template>
  <div class="data-mapper-default-settings">
    <el-form-item label="Datasource" prop="datasourceId">
      <el-select @change="onChangeDatasourceId" clearable filterable v-model="chainingConfigDto.datasourceId"
                 placeholder="Select">
        <el-option v-for="item in dataSourceConfigList" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="Next Operation" prop="operation">
      <el-select :disabled="!chainingConfigDto.datasourceId" filterable v-model="chainingConfigDto.nextOperation"
                 placeholder="Select">
        <el-option v-for="item in operationOptions" :key="item.value" :label="item.label"
                   :value="item.value"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";

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
  }
});

const operationOptions = computed(() => {
  const dataSourceConfigDto = props.dataSourceConfigList.find((el) => el.id === props.chainingConfigDto.datasourceId);

  if (!dataSourceConfigDto) {
    return [];
  }

  return dataSourceConfigDto.endpoints.map((el) => {
    return {
      label: el.operation,
      value: el.operation
    };
  });
});

function onChangeDatasourceId() {
  props.chainingConfigDto.nextOperation = "";
  props.chainingConfigDto.parameters = [];
}
</script>
