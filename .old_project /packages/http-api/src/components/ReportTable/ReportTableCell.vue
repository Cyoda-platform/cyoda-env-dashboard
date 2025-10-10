<template>
  <div>
    <template v-if="typeof row[prop] === 'string'">
      {{ row[prop] }}
    </template>
    <template v-else-if="Array.isArray(row[prop]) && typeof row[prop][0] === 'string'">
      {{ row[prop].join(", ") }}
    </template>
    <template v-else-if="typeof row[prop] === 'object'">
      <el-link @click="onClickColumnCollections" type="primary">detail</el-link>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  row: {
    default: () => {
    }
  }, prop: {default: ""}
});

const emit = defineEmits(['showDetails']);

function onClickColumnCollections() {
  const headerName: string = props.prop.split(".").shift()!;
  if (headerName) {
    emit("showDetails", {
      data: props.row[headerName],
      headerName: props.prop
    });
  }
}
</script>
