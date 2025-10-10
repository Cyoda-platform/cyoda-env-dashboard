<template>
  <div class="section">
    <div class="transformer-name">
      <span>
        <CyodaMark :search="search">
          {{ nameComputed }}
        </CyodaMark>
      </span>
      <el-button v-if="isShowUseBtn" @click="onClickUse" type="primary">
        Use
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <div class="description">
      <CyodaMark :search="search">
        {{ transformerDesc.description }}
      </CyodaMark>
    </div>
    <div v-if="transformerDesc.requiredParameters.length > 0" class="arguments">
      <div class="parameters-title">Parameters</div>
      <el-table size="small" :data="transformerDesc.requiredParameters" border style="width: 100%">
        <el-table-column prop="name" label="Name"></el-table-column>
        <el-table-column prop="type" label="Type"></el-table-column>
      </el-table>
    </div>
    <el-divider></el-divider>

    <BlocklyExample v-if="example" :listAllFunctions="listAllFunctions" :listAllTransformers="listAllTransformers" :name="transformerDesc.name" :example="example" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import HelperFunctionalMapping from "../../../../../helpers/HelperFunctionalMapping";
import BlocklyExample from "./BlocklyExample.vue";
import CyodaMark from "@cyoda/ui-lib/src/components-library/elements/CyodaMark/CyodaMark.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  isShowUseBtn: {
    default: true
  },
  transformerDesc: {
    default: () => {
      return {};
    }
  },
  listAllExamplesTransformers: {
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
  search: {
    default: ""
  }
});

const nameComputed = computed(() => {
  let inTypeName = getNameType(props.transformerDesc.inType);
  let outTypeName = getNameType(props.transformerDesc.outType);
  const key = props.transformerDesc.transformerKey.split('$').pop();
  return `${key}: ${inTypeName} -> ${outTypeName}`;
})

function getNameType(type) {
  let name = type.split(".").pop();
  if (name === '[B') name = "Bytes";
  return name;
}

const example = computed(() => {
  return false;
});

function onClickUse() {
  const function_name = HelperFunctionalMapping.getTransformerName(props.transformerDesc);
  eventBus.$emit("functionalMapping:use", { name: function_name, transformerKey: props.transformerDesc.transformerKey });
}
</script>

<style scoped lang="scss">
.section {
  margin-bottom: 10px;

  .transformer-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    word-break: break-all;
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
</style>
