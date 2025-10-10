<template>
  <div class="drawer-history-compare">
    <el-dialog appendToBody title="Compare with current version" v-model="dialogVisible" width="80%">
      <CyodaEditor :old-string="oldString" :new-string="newString" :diff="true" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Close</el-button>
          <el-button type="primary" @click="applyChanges">Apply</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import HelperContent from "../../helpers/HelperContent";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

const props = defineProps({
  oldVal: {
    default: ""
  },
  newVal: {
    default: ""
  }
});
const oldString = computed(() => {
  return HelperContent.prettyContent(JSON.stringify(props.oldVal));
});
const newString = computed(() => {
  return HelperContent.prettyContent(JSON.stringify(props.newVal));
});

const dialogVisible = ref<boolean>(false);
const emit=defineEmits(['setNewConfig']);

function applyChanges() {
  emit("setNewConfig");
  dialogVisible.value = false;
}

defineExpose({ dialogVisible });
</script>
