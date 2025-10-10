<template>
  <div class="data-mapper-not-exist-relations">
    <el-alert class="alert-box" title="Error" type="error" :closable="false" show-icon> These relationships contains
      errors, please repair:
    </el-alert>
    <el-table style="width: 100%" :data="notExistRelations" class="table table-chaining-config">
      <el-table-column show-overflow-tooltip prop="column.srcColumnPath" label="Source Relative Path">
        <template v-slot:default="{ row }">
          <strong>{{ row.column.srcColumnPath }}</strong>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="column.dstColumnPath" label="Destination Path">
        <template v-slot:default="{ row }">
          {{ shortNamePath(row.column.dstColumnPath) }}
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="reason" label="Reason"></el-table-column>
      <el-table-column width="140px">
        <template v-slot:default="{ row }">
          <el-button @click="onDelete(row)" size="default" type="danger">
            <font-awesome-icon icon="trash"/>
          </el-button>
          <el-button v-if="canRepair(row)" @click="onRepair(row)" size="default" type="primary">
            <font-awesome-icon icon="screwdriver-wrench"/>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import {ref, onBeforeUnmount} from "vue";

import HelperFormat from "../../helpers/HelperFormat";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const emit = defineEmits(["delete"]);

const activeRelation = ref(null);

const props = defineProps({
  notExistRelations: {
    default: () => {
      return [];
    }
  }
});
eventBus.$on("findTargetPathReset", onFindTargetPathReset);
eventBus.$on("findSourcePathReset", onFindSourcePathReset);

onBeforeUnmount(() => {
  eventBus.$off("findTargetPathReset", onFindTargetPathReset);
  eventBus.$off("findSourcePathReset", onFindSourcePathReset);
});

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function onDelete(relation) {
  emit("delete", relation);
}

function onRepair(relation) {
  if (relation.isNotExistSrc) {
    eventBus.$emit("findTargetPath", relation.column.dstColumnPath);
  } else {
    eventBus.$emit("findSourcePath", relation.column.jsonPath);
  }
  activeRelation.value = relation;
}

function canRepair(relation) {
  const blackList = ['notExistScriptPaths'];
  return !blackList.includes(relation.typeError);
}

function onFindTargetPathReset() {
  setTimeout(() => {
    const targetRow = [...document.querySelector(".target-data-column").querySelectorAll(`[data-relation*="${encodeURIComponent(activeRelation.value.column.dstColumnPath)}"]`)]?.find((elHtml) => {
      return elHtml.dataset.relation.split(" ").indexOf(encodeURIComponent(activeRelation.value.column.dstColumnPath)) !== -1;
    });

    const targetCircle = targetRow ? targetRow.querySelector(".circle") : null;

    eventBus.$emit("startDragLine", {
      el: targetCircle,
      path: activeRelation.value.column.dstColumnPath,
      type: activeRelation.value.type,
      direction: "fromTarget",
      notExistRelation: activeRelation.value
    });
  }, 500);
}

function onFindSourcePathReset() {
  setTimeout(() => {
    const sourceRow = [...document.querySelector(".source-data-column").querySelectorAll(`[data-relation*="${encodeURIComponent(activeRelation.value.column.jsonPath)}"]`)]?.find((elHtml) => {
      return elHtml.dataset.relation.split(" ").indexOf(encodeURIComponent(activeRelation.value.column.jsonPath)) !== -1;
    });

    const sourceCircle = sourceRow ? sourceRow.querySelector(".circle") : null;

    eventBus.$emit("startDragLine", {
      el: sourceCircle,
      path: activeRelation.value.column.jsonPath,
      type: activeRelation.value.type,
      direction: "fromSource",
      notExistRelation: activeRelation.value
    });
  }, 500);
}
</script>

<style lang="scss">
.data-mapper-not-exist-relations {
  background-color: #fef0f0;

  .el-table__cell {
    background-color: #fef0f0;
  }

  table {
    margin-top: 15px;
    border-collapse: collapse;
  }

  .el-table__header-wrapper table,
  .el-table__body {
    margin-top: 0;
  }

  .el-table {
    background: unset;
    border: 1px solid #f56c6c;
  }

  .el-table__row {
    border-bottom: 1px solid #f56c6c;
  }
}
</style>
