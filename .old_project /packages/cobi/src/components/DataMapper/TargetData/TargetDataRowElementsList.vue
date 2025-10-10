<template>
  <div class="target-data-row-elements-list">
    <TargetDataRow :reportInfoRow="reportInfoRow" :allDataRelations="allDataRelations" :findTargetPath="findTargetPath" :toggleExpand="toggleExpand" :selectedEntityMapping="selectedEntityMapping" :isBoldKey="true" :notExistRelations="notExistRelations">
      <template #actions="{ relationsForRemove }">
        <div class="pull-right"></div>
        <template v-if="assignMode === 'single'">
          <div class="btn-delete-element">
            <el-button size="default" @click="onDeleteElement($event, relationsForRemove)" type="danger">
              <font-awesome-icon icon="trash" />
            </el-button>
          </div>
        </template>
      </template>
    </TargetDataRow>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { computed } from "vue";
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
const emit=defineEmits(['delete']);

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
</script>
