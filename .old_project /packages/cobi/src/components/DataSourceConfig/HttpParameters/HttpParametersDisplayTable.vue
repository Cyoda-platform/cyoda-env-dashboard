<template>
  <div class="http-parameters-display-table">
    <h2>Parameters</h2>
    <el-table v-if="parameters" :data="parameters" stripe style="width: 100%">
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="type" label="Type">
        <template v-slot:default="{ row }">
          {{ getParameterName(row.type) }}
        </template>
      </el-table-column>
      <el-table-column prop="required" label="Required">
        <template v-slot:default="{ row }">
          {{ row.required ? "Yes" : "No" }}
        </template>
      </el-table-column>
      <el-table-column prop="defaultValue" label="Default Value"></el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import HelperDataSourceConfig from "../../../helpers/HelperDataSourceConfig";

const props = defineProps({
  parameters: {
    default: () => {
      return [];
    }
  }
});

function getParameterName(val: string) {
  return HelperDataSourceConfig.getNameFromEndpointParameterTypeOptions(val);
}
</script>
