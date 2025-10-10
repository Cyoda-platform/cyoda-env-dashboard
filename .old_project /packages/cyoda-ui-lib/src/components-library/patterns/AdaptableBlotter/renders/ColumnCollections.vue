<template>
  <span v-if="isVisible">
    <template v-if="typeof params.data[headerName] === 'string'">
      {{ params.data[headerName] }}
    </template>
    <template v-else-if="Array.isArray(params.data[headerName])">
      {{ params.data[headerName].join(", ") }}
    </template>
    <template v-else-if="typeof params.data[headerName] === 'object'">
      <el-link @click="onClick" type="primary">detail</el-link>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import eventBus from "../../../../plugins/eventBus";


const headerName = computed(() => {
    return params.colDef.headerName.split(".").shift()!;
  })
const isVisible = computed(() => {
    return params.data && !params.data._group && params.data[headerName.value];
  })

   function params!: {
    data: { [key: string]: string };
    colDef: {
      headerName: string;
    };
  };

function onClick() {
    const headerName = headerName.value;
    eventBus.$emit("column-collections:show-detail", {
      data: params.data[headerName],
      headerName: params.colDef.headerName
    });
  }
</script>
