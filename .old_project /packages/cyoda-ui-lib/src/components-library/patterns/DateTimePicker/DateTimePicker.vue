<template>
  <el-date-picker @change="onChange" v-model="localValue" :disabled="disabled" type="datetime" format="DD.MM.YYYY HH:mm:ss" placeholder="Select date and time"> </el-date-picker>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import moment from "moment";

const emit = defineEmits(["input", "change"]);
const props = defineProps({ modelValue: { default: "" }, disabled: { default: false }, includeTimeZone: { default: true } });

const localValue = ref<string>("");

watch(
  () => props.modelValue,
  () => {
    localValue.value = props.modelValue ? moment(props.modelValue) : "";
  },
  { immediate: true }
);

function onChange(val: string) {
  const includeTimeZone = props.includeTimeZone ? "Z" : "";
  const time = val ? moment(val).format(`YYYY-MM-DD[T]HH:mm:ss.SSS${includeTimeZone}`) : "";
  emit("update:modelValue", time);
  emit("change", time);
}
</script>
