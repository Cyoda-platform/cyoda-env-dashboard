<template>
  <div class="cyoda-modelling-col-defs">
    <el-button :disabled="!configDefinition.requestClass || readOnly" @click="onOpenDialog" type="primary">
      Add New Column Definition
      <font-awesome-icon icon="plus"/>
    </el-button>

    <h2>Selected Columns:</h2>
    <el-table ref="multipleTableRef" :data="tableData" @selection-change="handleSelectionChange" style="width: 100%">
      <el-table-column class-name="cell-selection" type="selection" width="55"></el-table-column>
      <el-table-column prop="fullPath" label="Path"></el-table-column>
      <el-table-column label="Action" width="180">
        <template v-slot:default="scope">
          <el-button :disabled="readOnly" type="danger" @click="onRemove(scope.$index)">Remove</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="form-multiple-selection" v-if="multipleSelection.length > 0">
      <FormMultipleSelection :multipleSelection="multipleSelection" @action="onAction"/>
    </div>
    <CyodaModellingPopUp @change="onChangeModellingPopUp" :checked="checked" ref="cyodaModellingPopUpRef"
                         :requestClass="configDefinition.requestClass"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import type {ColDef, IDefinitionContent} from "@cyoda/ui-lib/src/types/types";
import CyodaModellingGroup from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingGroup.vue";
import CyodaModellingPopUp from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingPopUp.vue";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import FormMultipleSelection from "../../../../components/FormMultipleSelection/FormMultipleSelection.vue";
import {ElMessageBox, ElTable} from "element-plus";
import HelperReportDefinition from "../../../../helpers/HelperReportDefinition";

interface MultipleSelection {
  fullPath: string;
}

const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  },
  readOnly: {default: false}
});
const tableData = computed(() => {
  return (
    (props.configDefinition.colDefs &&
      props.configDefinition.colDefs.map((el) => {
        return {
          fullPath: HelperFormat.shortNamePath(el.fullPath)
        };
      })) ||
    []
  );
});
const checked = computed(() => {
  return JSON.parse(JSON.stringify(props.configDefinition.colDefs));
});

const cyodaModellingPopUpRef = ref(null);

const multipleTableRef = ref(null);

let multipleSelection = ref([]);

function onRemove(index: number) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        const colDef = props.configDefinition.colDefs[index];
        HelperReportDefinition.deletePathFromFields(props.configDefinition, colDef.fullPath);
        props.configDefinition.colDefs.splice(index, 1);
      }
    }
  });
}

function onOpenDialog() {
  cyodaModellingPopUpRef.value.dialogVisible = true;
}

function onChangeModellingPopUp(checkedDatas: ColDef[]) {
  props.configDefinition.colDefs = JSON.parse(JSON.stringify(checkedDatas));
}

function handleSelectionChange(val: MultipleSelection[]) {
  multipleSelection.value = val;
}

function onAction(actionMultipleSelection: string) {
  if (actionMultipleSelection === "delete") {
    ElMessageBox.confirm(`Do you really want to remove ${multipleSelection.value.length} records?`, "Confirm!", {
      callback: async (action: string) => {
        if (action === "confirm") {
          multipleSelection.value.forEach((el) => {
            const index = tableData.value.indexOf(el);
            props.configDefinition.colDefs.splice(index, 1);
          });
          multipleTableRef.value.clearSelection();
        }
      }
    });
  }
}
</script>

<style lang="scss">
.cyoda-modelling-col-defs {
  h2 {
    margin-top: 20px;
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      margin-bottom: 5px;
    }
  }

  .cell-selection {
    padding-left: 10px;
  }

  .form-multiple-selection {
    margin-top: 15px;
  }
}
</style>
