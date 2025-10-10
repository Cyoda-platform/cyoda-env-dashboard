<template>
  <div>
    <el-dialog appendToBody title="Confirm" v-model="dialogVisible" width="400px">
      Please confirm restore from history
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Close</el-button>
          <el-button type="warning" @click="showChanges">Show Changes</el-button>
          <el-button type="primary" @click="applyChanges">Apply</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const dialogVisible = ref<boolean>(false);
const emit = defineEmits(['setNewConfig', 'showChanges']);

function applyChanges() {
  emit("setNewConfig");
  dialogVisible.value = false;
}

function showChanges() {
  emit("showChanges");
}

defineExpose({dialogVisible});
</script>
