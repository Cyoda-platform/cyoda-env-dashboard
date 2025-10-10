<template>
  <el-dialog :close-on-press-escape="false" append-to-body class="dialog-create-data-chaining" :close-on-click-modal="false" title="Chaining" v-model="dialogVisible" width="70%">
    <DataChainingEdit action="create:popup" ref="dataChainingEditRef" />
    <template #footer>
    <span class="dialog-footer">
      <portal-target name="data-chaining-edit-actions"></portal-target>
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import DataMapperEdit from "@cyoda/cobi/src/views/DataMapper/DataMapperEdit.vue";
import DataChainingEdit from "../../views/DataChaining/DataChainingEdit.vue";

const dialogVisible = ref<boolean>(false);

const dataChainingEditRef = ref(null);

defineExpose({ dialogVisible, dataChainingEditRef });
</script>

<style scoped lang="scss">
.vue-portal-target {
  display: inline-block;
  margin-right: 10px;
}
</style>
