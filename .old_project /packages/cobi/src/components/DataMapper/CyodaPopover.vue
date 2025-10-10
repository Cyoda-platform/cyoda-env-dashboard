<template>
  <div
    ref="rootRef"
    class="cyoda-popover el-popper el-popover"
    :x-placement="xPlacement"
    :class="{
      visible: isShow
    }"
  >
    <button @click="obButtonClose" type="button" aria-label="Close" class="el-dialog__headerbtn btn-close">
      <i class="el-dialog__close el-icon el-icon-close"></i>
    </button>
    <el-form :inline="true" :model="filterForm" class="demo-form-inline">
      <el-form-item label="Filter by Source">
        <el-input size="small" v-model="filterForm.srcColumnPath" placeholder="Filter by Source"></el-input>
      </el-form-item>
      <el-form-item label="Filter by Target">
        <el-input size="small" v-model="filterForm.dstColumnPath" placeholder="Filter by Target"></el-input>
      </el-form-item>
    </el-form>
    <data-tables
      :table-props="{
        border: true,
        maxHeight: 300
      }"
      :data="tableDataComputed"
      style="width: 100%"
    >
      <el-table-column show-overflow-tooltip prop="srcColumnPath" label="Source" width="400">
        <template v-slot="{ row }">
          <el-link @click="findSourcePath(row.srcColumnPath)">
            {{ shortNamePath(row.srcColumnPath) }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="dstColumnPath" label="Target" width="400">
        <template v-slot="{ row }">
          <el-link @click="findTargetPath(row.dstColumnPath)">
            {{ shortNamePath(row.dstColumnPath) }}
          </el-link>
        </template>
      </el-table-column>
    </data-tables>
    <div x-arrow="" class="popper__arrow"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch, onBeforeUnmount } from "vue";

import HelperFormat from "../../helpers/HelperFormat";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const rootRef=ref(null);
const filterTableDataBySrcColumnPath = computed(() => {
  return tableData.value.filter((el) => {
    return !filterForm.value.srcColumnPath || el.srcColumnPath.toLowerCase().indexOf(filterForm.value.srcColumnPath.toLowerCase()) > -1;
  });
});
const filterTableDataByDstColumnPath = computed(() => {
  return filterTableDataBySrcColumnPath.value.filter((el) => {
    return !filterForm.value.dstColumnPath || el.dstColumnPath.toLowerCase().indexOf(filterForm.value.dstColumnPath.toLowerCase()) > -1;
  });
});
const tableDataComputed = computed(() => {
  return filterTableDataByDstColumnPath.value;
});

const isShow = ref<boolean>(false);
const xPlacement = ref<string>("top");
const event = ref(null);
let tableData = ref([]);

let filterForm = ref({
  srcColumnPath: "",
  dstColumnPath: ""
});

let defaultForm = ref(JSON.parse(JSON.stringify(filterForm.value)));

onBeforeUnmount(() => {
  window.removeEventListener("mousedown", onDocumentClick);
});

function onDocumentClick(e) {
  if (!rootRef.value.contains(e.target) && !e.target.closest(".el-select-dropdown") && isShow.value) {
    isShow.value = false;
  }
}

function obButtonClose() {
  isShow.value = false;
}

function resetForm() {
  filterForm.value = JSON.parse(JSON.stringify(defaultForm.value));
}

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function findSourcePath(path) {
  eventBus.$emit("findSourcePath", path);
  isShow.value = false;
}

function findTargetPath(path) {
  eventBus.$emit("findTargetPath", path);
  isShow.value = false;
}

watch(
  event,
  async (event: MouseEvent) => {
    if (event) {
      xPlacement.value = "top";

      tableData.value = JSON.parse(event.target.closest("g").querySelector(".line").dataset.allRelationLinks);
      await nextTick();

      let top = event.clientY + window.scrollY - rootRef.value.offsetHeight - 10;
      if (top < 0) {
        xPlacement.value = "bottom";

        top = event.clientY + window.scrollY;
      }

      rootRef.value.style.top = top + "px";

      rootRef.value.style.left = event.clientX + window.scrollX - rootRef.value.offsetWidth / 2 + "px";
    }
  }
);

watch(
  isShow,
  (val) => {
    if (val) {
      window.addEventListener("mousedown", onDocumentClick);
    } else {
      resetForm();
    }
  }
);

defineExpose({ isShow, xPlacement, event, tableData });
</script>

<style scoped lang="scss">
.cyoda-popover {
  display: none;

  &.visible {
    display: block;
  }

  .popper__arrow {
    left: 50%;
    margin-left: -6px;
  }

  table {
    border-collapse: collapse;
    border: 1px solid #ebeef5;

    th {
      border-right: 1px solid #ebeef5;
      background-color: #4b5d7a !important;
      color: #fff !important;
      border-bottom: 1px solid #ebeef5;
      padding: 12px 5px;
      min-width: 0;
      box-sizing: border-box;
      vertical-align: middle;
      position: relative;
      text-align: left;
    }

    td {
      border-right: 1px solid #ebeef5;
      border-bottom: 1px solid #ebeef5;
      padding: 12px 5px;
    }
  }

  .btn-close {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  :deep(.el-form-item) {
    margin-bottom: 5px;
  }
}
</style>
