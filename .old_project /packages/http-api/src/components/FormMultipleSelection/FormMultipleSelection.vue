<template>
  <div v-loading="isLoading" class="cyoda-modelling-col-defs">
    <template v-for="item in listActions">
      <el-button @click="onClickButton(item.value)" :type="getType(item.value)">{{ item.label }}</el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

const emit = defineEmits(["action"]);
const props = defineProps({
  multipleSelection: {
    default: () => {
      return [];
    }
  },
  listActions: {
    default: () => {
      return [
        {
          label: "Delete",
          value: "delete"
        }
      ];
    }
  },
  isLoading: {
    default: false
  }
});

function onClickButton(action: string) {
  emit("action", action);
}

function getType(action: string) {
  if (action === "delete") {
    return "danger";
  } else {
    return "primary";
  }
}

watch(
  () => props.multipleSelection,
  (vals: Array<{ [key: string]: string }>) => {
    if (vals.length === 0) {
      props.isLoading = false;
    }
  },
  { immediate: true }
);
</script>
