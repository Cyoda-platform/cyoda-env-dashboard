<template>
  <el-input class="cyoda-modelling-pop-up-search" placeholder="Press / for search" v-model="form.input">
    <template slot="append">
      <font-awesome-icon icon="search" />
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { useModellingStore } from "@cyoda/ui-lib/src/stores/modelling";
import { ref, watch, onBeforeUnmount } from "vue";

import _ from "lodash";

const emit = defineEmits(["change"]);
const modellingStore = useModellingStore();

function clearSearch() {
  return modellingStore.clearSearch();
}

let form = ref({
  input: ""
});

const debounceChange = _.debounce(() => {
  if (form.value.input.length >= 2) {
    emit("change", form.value);
  } else {
    clear();
  }
}, 500);

watch(
  form,
  () => {
    debounceChange();
  },
  { deep: true }
);

function clear() {
  clearSearch();
  emit("change", { input: "" });
}

document.addEventListener("keyup", searchListener);

onBeforeUnmount(() => {
  document.removeEventListener("keyup", searchListener);
  clear();
});

function searchListener(event: KeyboardEvent) {
  const keyName = event.key;
  if (keyName === "/") {
    $el.querySelector("input")!.focus();
  }
}
</script>

<style lang="scss">
.cyoda-modelling-pop-up-search {
  max-width: 411px;

  svg {
    max-width: none;
    max-height: none;
  }
}
</style>
