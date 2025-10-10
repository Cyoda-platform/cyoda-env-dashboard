<template>
  <div class="config-editor-reports-tab-filter-builder">
    <h2>Settings</h2>
    <el-form :model="form" label-position="top">
      <el-form-item label="Singleton Report">
        <el-switch v-model="configDefinition.singletonReport" />
      </el-form-item>
      <el-form-item label="As at">
        <DateTimePicker v-model="configDefinition.pointTime" />
      </el-form-item>
    </el-form>

    <el-divider></el-divider>

    <FilterBuilderGroup :showErrors="showErrors" :level="0" :cols="cols" :condition="configDefinition.condition" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, watch } from "vue";

import FilterBuilderGroup from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/FilterBuilderGroup.vue";
import HelperFilter from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/HelperFilter";
import DateTimePicker from "@cyoda/ui-lib/src/components-library/patterns/DateTimePicker/DateTimePicker.vue";

const props = defineProps({
  cols: { default: () => [] },
  showErrors: { default: false },
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const route = useRoute();

let form = ref({
  pointTime: ""
});

watch(
  () => props.configDefinition.condition,
  () => {
    if (props.configDefinition?.condition?.conditions?.length === 0 && route.query.isNew) {
      props.configDefinition.condition = HelperFilter.getGroup();
    }
  }
);
</script>

<style lang="scss">
.config-editor-reports-tab-filter-builder {
  h2 {
    margin-bottom: 15px;
  }

  .el-divider {
    margin-top: 5px;
  }

  .el-form--label-top .el-form-item__label {
    padding-bottom: 0;
  }
}
</style>
