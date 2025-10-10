<template>
  <div class="body">
    <el-select v-model="value" placeholder="Select">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
    </el-select>
    <el-collapse-transition v-if="isAvailableChild">
      <DetailTree v-if="entity.length > 0" :isEditable="isEditable" :isShowEmpty="isShowEmpty" :id="id" :requestClass="requestClass" class="detail-tree" :entity="entity" />
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import * as api from "../../../../../api";
import HelperDetailEntity from "../../../../../helpers/HelperDetailEntity";
import DetailTree from "../DetailTree.vue";

const emit = defineEmits(["loading", "loading"]);
const props = defineProps({
  column: {
    default: () => {
      return {};
    }
  },
  subClass: {
    default: ""
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
const options = computed(() => {
  const options: Array<{ label: string; value: string }> = [];
  props.column.mapKeys!.forEach((el) => {
    options.push({
      label: el,
      value: el
    });
  });
  return options;
});
const columnPath = computed(() => {
  return `${props.column.columnInfo.columnPath}.[${value.value}]`;
});
const isAvailableChild = computed(() => {
  return entity.value.length > 0;
});

const value = ref<string>("");
let entity = ref([]);

async function request() {
  try {
    emit("loading", true);
    const { data } = await api.getEntityLoad(props.id, props.requestClass, props.subClass, columnPath.value);
    entity.value = HelperDetailEntity.filterData(data);
  } finally {
    emit("loading", false);
  }
}

watch(value, () => {
  request();
});
</script>

<style lang="scss" scoped>
.detail-tree {
  margin-top: 10px;
}
</style>
