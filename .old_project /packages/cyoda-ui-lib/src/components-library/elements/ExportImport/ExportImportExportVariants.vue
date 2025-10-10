<template>
  <!--  Show Export Options dialog -->
  <el-dialog :close-on-click-modal="false" title="Export Options" v-model="dialogVisible" width="500px">
    <el-radio-group v-model="form.exportFormat">
      <template v-for="exportFormat in exportFormats">
        <div class="wrap-option">
          <el-radio :label="exportFormat">{{ exportFormat.description }}</el-radio>
        </div>
      </template>
    </el-radio-group>
    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
      <el-button type="primary" @click="onExport">Export</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

const emit = defineEmits(["export"]);

const dialogVisible = ref<boolean>(false);
let exportFormats = ref([]);

let form = ref({
  exportFormat: {}
});

function onExport() {
  dialogVisible.value = false;
  emit("export", form.value.exportFormat);
}

watch(dialogVisible, (val) => {
  if (val) {
    form.value.exportFormat = exportFormats.value[0];
  }
});

defineExpose({dialogVisible, exportFormats});
</script>

<style scoped lang="scss">
.wrap-option {
  margin-bottom: 10px;
}
</style>
