<template>
  <el-form label-position="top" label-width="120px">
    <el-form-item label="Entity Class">
      <el-select class="full-width" v-model="alias.entityClass" filterable placeholder="Entity Class" clearable>
        <el-option v-for="item in requestClassOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const props = defineProps({
  alias: {
    default() {
      return {
        entityClass: ""
      };
    }
  }
});

const isLoading = ref<boolean>(false);
let requestClassOptions = ref([]);

loadEntities();

async function loadEntities() {
  try {
    isLoading.value = true;
    const { data } = await api.getReportingFetchTypes();
    requestClassOptions.value = HelperEntities.getOptionsFromData(data);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss">
.full-width {
  width: 100%;
}
</style>
