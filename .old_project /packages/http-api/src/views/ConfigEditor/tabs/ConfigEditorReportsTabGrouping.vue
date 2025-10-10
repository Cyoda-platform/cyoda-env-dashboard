<template>
  <div class="config-editor-reports-tab-grouping">
    <el-form class="form-settings" :inline="true">
      <el-form-item label="Hierarchy Enable">
        <el-switch v-model="configDefinition.hierarhyEnable"> </el-switch>
      </el-form-item>
    </el-form>

    <el-divider></el-divider>

    <transfer filterable :titles="['Possible grouping values', 'Selected grouping values']" :data="optionsData" fieldKey="name" fieldLabel="name" :strLengthRight="40" v-model="configDefinition.grouping"> </transfer>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";

import ConfigEditorTransfer from "../ConfigEditorTransfer.vue";

const props = defineProps({
  cols: { default: () => [] },
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const optionsData = computed(() => {
  return props.cols.map((el) => {
    return {
      "@bean": el["@bean"],
      name: el.alias
    };
  });
});

watch(
  () => props.configDefinition.hierarhyEnable,
  (val: boolean) => {
    props.configDefinition.reportVersion = val ? 1 : 0;
  }
);
</script>

<style lang="scss">
.config-editor-reports-tab-grouping {
  .form-settings {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
