<template>
  <div>
    <el-dialog append-to-body :close-on-click-modal="false" :title="computedTitle" v-model="dialogVisible"
               class="adaptable-blotter-column-collections" width="600px">
      <div v-for="key in Object.keys(columnData.data)" class="sub-row">
        <div class="sub-row-title">{{ key }}</div>
        <div class="sub-row-value">{{ columnData.data[key] }}</div>
      </div>

      <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onBeforeUnmount} from "vue";
import eventBus from "../../../plugins/eventBus";

interface ColumnData {
  headerName: string;
  data: {
    [key: string]: string;
  };
}

const computedTitle = computed(() => {
  return `Column ${columnData.value.headerName}`;
});

const dialogVisible = ref<boolean>(false);

let columnData = ref({
  headerName: "",
  data: {}
});

eventBus.$on("column-collections:show-detail", showDetail);

onBeforeUnmount(() => {
  eventBus.$off("column-collections:show-detail", showDetail);
});

async function showDetail(data: ColumnData) {
  dialogVisible.value = true;
  columnData.value = data;
}

defineExpose({showDetail})
</script>

<style lang="scss" scoped>
.adaptable-blotter-column-collections {
  .sub-row {
    display: flex;
    margin-bottom: 10px;
    padding: 0;
    border: 1px solid #dfe6ec;

    .sub-row-title {
      background: #eef1f6;
      padding: 5px 10px;
      width: 200px;
      margin-right: 10px;
    }

    .sub-row-value {
      padding: 5px 10px;
    }
  }
}
</style>
