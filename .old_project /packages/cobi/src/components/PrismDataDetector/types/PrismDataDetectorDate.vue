<template>
  <div>
    <strong>Date: </strong> {{ dateValue }}<br />
    <strong>Time: </strong> {{ timeValue }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import moment from "moment";

const props = defineProps({
  value: {
    default: ""
  }
});

const dateValue = computed(() => {
  return moment(props.value).format("YYYY-MM-DD");
});
const timeValue = computed(() => {
  return moment(props.value).format("HH:mm:ss");
});
</script>
