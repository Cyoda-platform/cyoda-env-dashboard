<template>
  <div class="target-data-row-elements-list">
    <TargetDataRow :reportInfoRow="reportInfoRow" :allDataRelations="allDataRelations" :findTargetPath="findTargetPath" :toggleExpand="toggleExpand" :selectedEntityMapping="selectedEntityMapping" :isBoldKey="true" :notExistRelations="notExistRelations">
      <template #actions="{ relationsForRemove }">
        <div class="pull-right"></div>
        <div class="target-data-row-elements-list-buttons">
          <el-button size="default" @click="onEditElement($event)" type="primary">
            <font-awesome-icon icon="pencil" />
          </el-button>
          <el-button size="default" @click="onDeleteElement($event, relationsForRemove)" type="danger">
            <font-awesome-icon icon="trash" />
          </el-button>
        </div>
      </template>
    </TargetDataRow>

    <DialogTargetDataRowMapForm @save="onSaveNewKey" ref="dialogTargetDataRowMapFormRef" />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, computed } from "vue";

import DialogTargetDataRowMapForm from "../TargetDataRowMapAdd/DialogTargetDataRowMapForm.vue";
import HelperMapper from "../../../helpers/HelperMapper";
import TargetDataRow from "./TargetDataRow.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  allDataRelations: undefined,
  toggleExpand: undefined,
  findTargetPath: undefined,
  elementsList: undefined,
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  },
  parentReportInfoRow: {
    default: () => {
      return {};
    }
  },
  assignMode: { default: "multiple" },
  notExistRelations: { default: () => [] }
});
const reportInfoRow = computed(() => {
  return {
    columnName: props.elementsList.index,
    columnPath: columnPath.value,
    type: element.value.type,
    clazzType: element.value.clazzType,
    decision: null
  };
});
const columnPath = computed(() => {
  return `${props.parentReportInfoRow.columnPath}.[${props.elementsList.index}]`;
});
const element = computed(() => {
  let element = props.parentReportInfoRow;
  if (element.elementType) {
    element = element.elementType;
  }
  if (element.elementInfo) {
    element = element.elementInfo;
  }
  return element;
});

const dialogTargetDataRowMapFormRef = ref(null);
const emit=defineEmits(['emit']);

function onDeleteElement(event: any, relationsForRemove: any) {
  event.stopPropagation();
  event.preventDefault();
  ElMessageBox.confirm(`Do you really want to delete element.value. Continue?`, "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        if (relationsForRemove.length > 0) {
          eventBus.$emit("deleteRelations", relationsForRemove);
        }
        emit("delete");
      }
    }
  });
}
function onEditElement(event: any) {
  event.stopPropagation();
  event.preventDefault();
  dialogTargetDataRowMapFormRef.value.form.name = props.elementsList.index;
  dialogTargetDataRowMapFormRef.value.dialogVisible = true;
}

function onSaveNewKey(newKey) {
  const oldPath = columnPath.value;
  props.elementsList.index = newKey;
  const newPath = columnPath.value;

  HelperMapper.updateOldToNewFieldsInObj(props.selectedEntityMapping, [oldPath], [newPath]);
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.target-data-row-elements-list-buttons {
  white-space: nowrap;

  button + button {
    margin-left: 10px;
  }
}
</style>
