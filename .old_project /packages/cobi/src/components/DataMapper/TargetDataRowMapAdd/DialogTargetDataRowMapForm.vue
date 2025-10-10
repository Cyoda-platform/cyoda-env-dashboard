<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" title="Add New Element" v-model="dialogVisible" width="500px">
    <el-input @input="onChangeKey" placeholder="Please input" v-model="form.name"></el-input>
    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
      <el-button @click="onSave" type="primary">Apply</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import "prismjs/themes/prism.css";

const emit = defineEmits(["save"]);
const props = defineProps({
  allRequestParams: {
    default: () => {
      return [];
    }
  }
});

const dialogVisible = ref<boolean>(false);

let form = ref({
  name: null
});

function onSave() {
  emit("save", form.value.name);
  dialogVisible.value = false;
  form.value.name = null;
}

function onChangeKey(value) {
  form.value.name = form.value.name.replaceAll('*', '').replaceAll('.', '').replaceAll('&', '');
}

defineExpose({ dialogVisible, form });
</script>
