<template>
  <div class="config-editor-reports-stream-grid-delete-actions">
    <div class="actions-btns">
      <el-button v-show="multipleSelection.length > 0 && !isRemoveAll" :loading="isLoading" @click="onRemoveSelected" type="danger">
        Remove Selected
        <font-awesome-icon icon="trash" />
      </el-button>

      <el-button @click="onRemoveAll" v-if="multipleSelection.length > 0 && isRemoveAll" :loading="isLoading" type="danger">
        Remove All
        <font-awesome-icon icon="trash" />
      </el-button>
    </div>

    <el-alert v-if="isTableSelectAll" :closable="false" class="alert-delete" type="info" show-icon>
      <template v-slot:title>
        <span v-if="!isRemoveAll"> All {{ rowsToDelete }} rows on props.page are selected. </span>
        <span v-else> All pages was selected </span>

        <template v-if="isRemoveAll">
          <el-link @click="onClearToRemoveAll" type="primary">Clear All</el-link>
        </template>
        <template v-else-if="canDeleteAll">
          <el-link @click="onSelectToRemoveAll" type="primary">Select all rows on all pages</el-link>
        </template>
      </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ElNotification, ElMessageBox } from "element-plus";
import { ref, computed } from "vue";

import { IDefinitionContentStreamRequest } from "../../../types/types";
import { deleteEntityByIds, platformApiStreamDataDelete } from "../../../api";

const emit = defineEmits(["refresh", "refresh", "clearMultipleSelection"]);
const props = defineProps({
  pageSize: { default: 0 },
  page: { default: 0 },
  tableData: {
    default: () => {
      return [];
    }
  },
  isTableSelectAll: { default: false },
  configDefinitionRequest: { default: false },
  multipleSelection: {
    default() {
      return [];
    }
  }
});
const rowsToDelete = computed(() => {
  return props.tableData.length;
});
const canDeleteAll = computed(() => {
  return props.tableData.length === props.pageSize || props.page > 0;
});

const isRemoveAll = ref<boolean>(false);

const isLoading = ref<boolean>(false);

function onSelectToRemoveAll() {
  isRemoveAll.value = true;
}

function onClearToRemoveAll() {
  isRemoveAll.value = false;
  emit("clearMultipleSelection");
}

function onRemoveSelected() {
  ElMessageBox.confirm("Do you really want to delete selected rows?", "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        const ids: string[] = props.multipleSelection.map((el) => el.id);

        isLoading.value = true;
        await deleteEntityByIds(props.configDefinitionRequest.sdDef.requestClass, ids);
        isLoading.value = false;

        ElNotification({
          title: "Success",
          message: "Records was deleted",
          type: "success"
        });

        emit("refresh", true);
      }
    }
  });
}

function onRemoveAll() {
  ElMessageBox.confirm("Do you really want to delete all?", "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        isLoading.value = true;
        await platformApiStreamDataDelete(props.configDefinitionRequest);
        isLoading.value = false;

        onClearToRemoveAll();
        ElNotification({
          title: "Success",
          message: "Records was deleted",
          type: "success"
        });

        emit("refresh", true);
      }
    }
  });
}
</script>

<style lang="scss">
.config-editor-reports-stream-grid-delete-actions {
  .actions-btns {
    text-align: right;
    margin-bottom: 15px;
  }

  .alert-delete {
    margin-bottom: 15px;

    .el-alert__title {
      display: flex;
      align-items: center;

      span {
        margin-right: 5px;
      }
    }
  }
}
</style>
