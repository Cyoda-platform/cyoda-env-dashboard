<template>
  <div ref="rootRef" class="cyoda-mark">
    <slot ref="instance" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from "vue";

import Mark from "mark.js";

const props = defineProps({ search: { default: "" } });
const rootRef=ref(null);

const instance = ref(null);
const intervalId = ref(null);

onMounted(() => {
  instance.value = new Mark(rootRef.value);
});

onBeforeUnmount(() => {
  instance.value = null;
});

async function worker() {
  if (!instance.value) return;
  instance.value.unmark();

  if (!props.search) return;
  await nextTick();

  instance.value.mark(props.search);
}

watch(
  () => props.search,
  () => {
    if (intervalId.value) clearTimeout(intervalId.value);
    intervalId.value = setTimeout(worker, 250);
  },
  { immediate: true }
);
</script>

<style lang="scss">
.cyoda-mark {
  .mark {
    background: orange;
    color: black;
  }
}
</style>
