<template>
  <el-drawer z-index="6001" append-to-body title="Documentation" size="40%" class="function-description-search-by-class-name-dialog" v-model="dialogVisible">
    <template v-if="type === 'function'">
      <FunctionDescriptionSection :functionDesc="functionDesc" />
    </template>

    <template v-if="type === 'transformer'">
      <TransformerDescriptionSection :transformerDesc="functionDesc" />
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";

import FunctionDescriptionSection from "./FunctionDescriptionSection.vue";
import TransformerDescriptionSection from "./TransformerDescriptionSection.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  listAllFunctions: {
    default: () => {
      return [];
    }
  },
  listAllTransformers: {
    default: () => {
      return [];
    }
  }
});
const functionDesc = computed(() => {
  let functionDesc: any = null;
  if (type.value === "function") {
    functionDesc = props.listAllFunctions.find((el: any) => {
      return el.functionClass === functionClassSearch.value;
    });
  } else if (type.value === "transformer") {
    functionDesc = props.listAllTransformers.find((el: any) => {
      return el.transformerKey === functionClassSearch.value;
    });
  }
  return functionDesc;
});

const dialogVisible = ref<boolean>(false);
const functionClassSearch = ref(null);
const type = ref(null);
eventBus.$on("functionDescriptionDialog:search", searchByFunctionClass);

onBeforeUnmount(() => {
  eventBus.$off("functionDescriptionDialog:search", searchByFunctionClass);
});

function searchByFunctionClass({ functionClass, type: typeValue }) {
  functionClassSearch.value = functionClass;
  type.value = typeValue;
  dialogVisible.value = true;
}

defineExpose({ dialogVisible });
</script>

<style lang="scss">
.function-description-search-by-class-name-dialog {
  .section {
    margin-bottom: 10px;

    .name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .description {
      margin-bottom: 15px;
    }

    .parameters-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 5px;
    }
  }

  //h2 {

  //}

  .block {
    padding: 10px;
    border: 1px solid #eee;
    margin-bottom: 20px;
  }

  .el-collapse-item__header {
    background-color: #eee;
    padding: 5px 10px;
    border-bottom: 1px solid #dedede;
    font-size: 16px;
  }
}
</style>
