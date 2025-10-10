<template>
  <div class="target-data-row-map-add">
    <el-button @click="onAddNewElement" size="default" type="primary">
      <font-awesome-icon icon="plus" />
    </el-button>
    <DialogTargetDataRowMapForm @save="onSave" ref="dialogTargetDataRowMapFormRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import DialogTargetDataRowMapForm from "./DialogTargetDataRowMapForm.vue";
const props = defineProps({
  allElementsList: {
    default: () => {
      return [];
    }
  }
});

const dialogTargetDataRowMapFormRef = ref(null);

function onAddNewElement(event: any) {
  event.stopPropagation();
  event.preventDefault();

  dialogTargetDataRowMapFormRef.value.dialogVisible = true;
}

function onSave(name) {
  props.allElementsList.push({ index: name });
}
</script>

<style scoped lang="scss">
.target-data-row-map-add {
  margin-left: 15px;
}
</style>
