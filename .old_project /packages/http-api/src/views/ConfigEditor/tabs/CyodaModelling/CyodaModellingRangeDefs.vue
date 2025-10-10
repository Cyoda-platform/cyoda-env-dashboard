<template>
  <div>
    <el-button :disabled="!configDefinition.requestClass" @click="onOpenDialog" type="primary">
      Add New Range Column Definition
      <font-awesome-icon icon="plus" />
    </el-button>

    <h2>Selected Range Column:</h2>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="fullPath" label="Path"> </el-table-column>
      <el-table-column label="Action" width="180">
        <template v-slot:default="scope">
          <el-button type="danger" @click="onRemove(scope.$index)">Remove</el-button>
        </template>
      </el-table-column>
    </el-table>
    <CyodaModellingPopUp @change="onChangeModellingPopUp" :onlyRange="true" :limit="1" :checked="checked" ref="cyodaModellingPopUpRef" :requestClass="configDefinition.requestClass" />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, computed } from "vue";

import type { ColDef, IDefinitionContent } from "@cyoda/ui-lib/src/types/types";
import CyodaModellingGroup from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingGroup.vue";
import CyodaModellingPopUp from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingPopUp.vue";

const emit = defineEmits(["changeConfigDefinitionColRanges", "changeConfigDefinitionColRanges"]);
const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  },
  configDefinitionColRanges: {
    default: () => {
      return [];
    }
  }
});
const tableData = computed(() => {
  return props.configDefinitionColRanges;
});
const checked = computed(() => {
  return props.configDefinitionColRanges;
});

const cyodaModellingPopUpRef = ref(null);

function onRemove() {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        emit("changeConfigDefinitionColRanges", []);
      }
    }
  });
}

function onOpenDialog() {
  cyodaModellingPopUpRef.value.dialogVisible = true;
}

function onChangeModellingPopUp(checkedDatas: ColDef[]) {
  emit("changeConfigDefinitionColRanges", checkedDatas);
}
</script>

<style lang="scss" scoped>
h2 {
  margin-top: 20px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    margin-bottom: 5px;
  }
}
</style>
