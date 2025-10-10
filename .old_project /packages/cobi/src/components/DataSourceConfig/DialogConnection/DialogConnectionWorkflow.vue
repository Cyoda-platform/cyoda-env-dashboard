<template>
  <div class="dialog-connection-workflow">
    <el-form-item label="Name" prop="name">
      <el-input v-model.trim="connectionDetailsDto.name" />
    </el-form-item>

    <el-form-item label="Entity Class" prop="entityClass">
      <el-select v-model="connectionDetailsDto.entityClass" filterable placeholder="Please select">
        <el-option v-for="(item, index) in entityClassOptions" :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const props = defineProps({
  connectionDetailsDto: {
    default: () => {
      return {};
    }
  }
});

let entityClassOptions = ref([]);
loadDataClassOptions();

function getReportingFetchTypesRequest() {
  return api.getReportingFetchTypes();
}

async function loadDataClassOptions() {
  const { data } = await getReportingFetchTypesRequest();
  entityClassOptions.value = HelperEntities.getOptionsFromData(data);
}

defineExpose({ getReportingFetchTypesRequest });
</script>
