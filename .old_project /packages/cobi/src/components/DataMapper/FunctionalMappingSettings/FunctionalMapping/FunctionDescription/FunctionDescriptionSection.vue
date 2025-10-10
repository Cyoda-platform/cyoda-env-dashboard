<template>
  <div class="section">
    <div class="function-name">
      <span>
        <CyodaMark :search="search">
          {{ functionDesc.name }}
        </CyodaMark>
      </span>
      <el-button @click="onClickUse" type="primary">
        Use
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <div class="description">
      <CyodaMark :search="search">
        {{ functionDesc.description }}
      </CyodaMark>
    </div>
    <div class="arguments">
      <div class="parameters-title">Parameters</div>
      <el-table size="small" :data="functionDesc.args" border style="width: 100%">
        <el-table-column prop="name" label="Name"></el-table-column>
        <el-table-column prop="description" label="Description"></el-table-column>
      </el-table>
    </div>
    <el-divider></el-divider>

    <BlocklyExample v-if="example" :listAllFunctions="listAllFunctions" :listAllTransformers="listAllTransformers" :listAllDictionaries="listAllDictionaries" :name="functionDesc.name" :example="example" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import BlocklyExample from "./BlocklyExample.vue";
import HelperFunctionalMapping from "../../../../../helpers/HelperFunctionalMapping";
import CyodaMark from "@cyoda/ui-lib/src/components-library/elements/CyodaMark/CyodaMark.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  functionDesc: {
    default: () => {
      return {};
    }
  },
  listAllExamplesFunctions: {
    default: () => {
      return [];
    }
  },
  listAllFunctions: {
    default: () => {
      return [];
    }
  },
  listAllTransformers: {
    default: () => {
      return [];
    }
  },
  listAllDictionaries: {
    default: () => {
      return [];
    }
  },
  search: {
    default: ""
  }
});
const example = computed(() => {
  return props.listAllExamplesFunctions.find((el) => el.type.toLowerCase() === props.functionDesc.name.toLowerCase());
});

function onClickUse() {
  const function_name = HelperFunctionalMapping.getFunctionName(props.functionDesc);
  eventBus.$emit("functionalMapping:use", function_name);
}
</script>

<style scoped lang="scss">
.section {
  margin-bottom: 10px;

  .function-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
  }

  .description {
    margin-bottom: 15px;
    white-space: pre-line;
  }

  .parameters-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
  }
}
</style>
