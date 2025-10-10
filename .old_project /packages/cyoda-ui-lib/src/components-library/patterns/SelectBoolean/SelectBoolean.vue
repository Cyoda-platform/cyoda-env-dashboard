<template>
  <el-select v-bind="$attrs" @change="onChange" v-model="localValue" placeholder="Select">
    <el-option v-for="item in options" :key="item" :label="item.toString()" :value="item"> </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits(["input"]);
const props = defineProps({ value: { default: "" } });

let options = ref([true, false]);

const localValue = ref<string>("");

watch(
  () => props.value,
  () => {
    localValue.value = props.value;
  },
  { immediate: true }
);

function onChange(val: string) {
  emit("input", val);
}
</script>
