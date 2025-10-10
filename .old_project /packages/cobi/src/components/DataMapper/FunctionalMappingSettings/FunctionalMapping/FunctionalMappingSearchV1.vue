<template>
  <el-select popper-class="functional-mapping-search" filterable v-model="search" placeholder="Select">
    <el-option-group v-for="group in options" :key="group.label" :label="group.label">
      <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value">
        <template>
          <div>{{ item.label }}</div>
          <div class="item-description" v-if="item.description">{{ item.description }}</div>
        </template>
      </el-option>
    </el-option-group>
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import HelperFunctionalMapping from "../../../../helpers/HelperFunctionalMapping";

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
const options = computed(() => {
  return [
    {
      label: "Statements",
      options: HelperFunctionalMapping.getStatements()
    },
    {
      label: "Expressions",
      options: HelperFunctionalMapping.getExpressions()
    },
    {
      label: "Functions",
      options: functionOptions.value
    },
    {
      label: "Transformers",
      options: transformersOptions.value
    }
  ];
});
const functionOptions = computed(() => {
  return props.listAllFunctions.map((el: any) => {
    return {
      label: el.name,
      value: HelperFunctionalMapping.getFunctionName(el),
      description: el.description
    };
  });
});
const transformersOptions = computed(() => {
  return props.listAllTransformers.map((el: any) => {
    const titles = el.transformerKey.split(".").pop().replace("$", " ").split(" ").join(" -> ");
    return {
      label: titles,
      value: HelperFunctionalMapping.getTransformerName(el),
      description: el.description
    };
  });
});

const search = ref<string>("");
</script>

<style lang="scss">
.functional-mapping-search {
  .item-description {
    width: 400px;
    margin-top: 5px;
    color: #a0a0a1;
    font-size: 14px;
  }

  .el-select-dropdown__item {
    height: auto !important;
    white-space: normal;
    line-height: normal;
    padding: 10px 0;
    border-bottom: 1px solid #dfe6ec;
  }

  .el-select-group__title {
    background: #eef1f6;
    color: rgb(96, 98, 102);
    font-size: 14px;
    font-weight: 600;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .el-select-group__wrap {
    padding-bottom: 0 !important;
  }

  .el-select-group__wrap:not(:last-of-type)::after {
    display: none;
  }
}
</style>
