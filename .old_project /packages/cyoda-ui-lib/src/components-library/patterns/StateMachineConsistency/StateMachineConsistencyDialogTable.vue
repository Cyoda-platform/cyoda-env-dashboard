<template>
  <div>
    <div class="title">{{ title }}</div>
    <template v-for="(row, index) in rows">
      <StateMachineConsistencyDialogTableRow :row="row"/>
      <hr v-if="index + 1 < rows.length"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import StateMachineConsistencyDialogTableRow from "./StateMachineConsistencyDialogTableRow.vue";

defineProps({
  title: {
    default: "",
  },
  rows: {
    default: () => ([])
  }
});
</script>

<style scoped>
.title {
  margin-top: 30px;
  font-size: 22px;
  color: #000;
}
</style>
