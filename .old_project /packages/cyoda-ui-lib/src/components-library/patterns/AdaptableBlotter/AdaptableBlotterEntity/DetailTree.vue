<template>
  <div>
    <div v-for="column in props.entity">
      <DetailTreeItem :isEditable="isEditable" :isShowEmpty="isShowEmpty" :id="id" :requestClass="requestClass" :column="column" v-if="isShowEmptyData(column)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DetailTreeItem from "./DetailTreeItem.vue";
import HelperFormat from "../../../../helpers/HelperFormat";
import { Column, Entity } from "../../../../types/types";

const props = defineProps({
  entity: {
    default: () => {
      return [];
    }
  },
  id: {
    default: ""
  },
  requestClass: {
    default: ""
  },
  isShowEmpty: {
    default: true
  },
  isEditable: {
    default: false
  }
});

function isShowEmptyData(column: Column) {
  if (column.type === "LEAF") {
    const value = HelperFormat.getValue(column.value);
    if (value === "-") {
      return props.isShowEmpty;
    }
  }
  return true;
}
</script>
