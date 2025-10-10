<template>
  <el-row>
    <el-col>
      <el-button :disabled="!form.entityClassName" @click="onOpenDialog" type="primary">
        Add New Range Column Definition
        <font-awesome-icon icon="plus"/>
      </el-button>

      <CyodaModellingPopUp @change="onChangeModellingPopUp" :onlyRange="true" :limit="1"
                           :checked="configDefinitionColRanges" ref="cyodaModellingPopUpRef"
                           :requestClass="form.entityClassName"/>
    </el-col>
    <el-col>
      <h2>Range Settings</h2>
      <el-form :inline="true">
        <el-form-item label="Range Order">
          <el-select v-model="form.rangeOrder" placeholder="Range Order" style="width: 100px">
            <el-option key="ASC" label="ASC" value="ASC"/>
            <el-option key="DESC" label="DESC" value="DESC"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="filter-builder-condition" v-if="Object.keys(form.rangeCondition).length > 0">
        <FilterBuilderCondition :disableRemove="true" :conditionTypesKeysAvailable="conditionTypesKeysAvailable"
                                :condition="form.rangeCondition" builderId="RangeCondition"
                                :disableColumn="true" :cols="colsRange"/>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import FilterBuilderCondition
  from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/FilterBuilderCondition.vue";
import CyodaModellingPopUp from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingPopUp.vue";
import HelperReportDefinition from "@cyoda/http-api/src/helpers/HelperReportDefinition";
import {computed, ref} from "vue";
import type {ColDef} from "@cyoda/ui-lib/src/types/types";
import HelperFilter from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/HelperFilter";

const conditionTypesKeysAvailable = HelperReportDefinition.rangeConditionTypes;

const props = defineProps({
  form: {},
})

const cyodaModellingPopUpRef = ref(null);
const configDefinitionColRanges = ref([]);

const colsRange = computed(() => {
  return configDefinitionColRanges.value.map((el) => {
    return {
      colType: "colDef",
      alias: el.fullPath,
      typeShort: el.colType.split(".").pop() || "",
      type: el.colType,
      "@bean": "com.cyoda.core.reports.columns.ReportSimpleColumn"
    };
  });
});


function onOpenDialog() {
  cyodaModellingPopUpRef.value.dialogVisible = true;
}

function onChangeModellingPopUp(data: ColDef[]) {
  configDefinitionColRanges.value = data;
  if (data && data.length > 0) {
    props.form.rangeCondition.fieldName = data[0].fullPath;
  } else {
    props.form.rangeCondition = HelperFilter.getCondition();
  }
}
</script>

<style scoped lang="scss">
.builder-condition-row {
  &::after, &::before {
    display: none;
  }
}
</style>
