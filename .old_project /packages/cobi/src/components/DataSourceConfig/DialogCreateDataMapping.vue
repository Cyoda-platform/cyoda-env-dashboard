<template>
  <el-dialog :close-on-press-escape="false" append-to-body class="dialog-create-data-mapping"
             :close-on-click-modal="false" title="Data Mapping" v-model="dialogVisible" :fullscreen="true">
    <template #header>
      <div class="header-title" id="header-title"></div>
    </template>
    <DataMapperEdit action="create:popup" ref="dataMapperEditRef"/>
    <template #footer>
    <span class="dialog-footer action-footer">
      <portal-target name="data-mapper-edit-actions"></portal-target>
      <el-button class="close-btn" @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref} from "vue";

import DataMapperEdit from "@cyoda/cobi/src/views/DataMapper/DataMapperEdit.vue";

const dialogVisible = ref<boolean>(false);

const dataMapperEditRef = ref(null);

defineExpose({dialogVisible, dataMapperEditRef});
</script>

<style lang="scss">
.dialog-create-data-mapping {
  .vue-portal-target {
    display: inline-block;
    margin-right: 10px;

    :deep(.el-dropdown) {
      margin: 0 10px;
    }
  }

  .header-title {
    line-height: 24px;
    font-size: 18px;
    color: #303133;
  }

  .data-mapping-run-test-btn {
    margin: 0 12px;
  }

  .close-btn {
    margin-left: 12px;
  }
}
</style>
