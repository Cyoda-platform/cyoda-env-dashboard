<template>
  <el-cascader popper-class="functional-mapping-search" filterable @change="onChange" :options="options" v-model="search" placeholder="Select" :filter-method="filterMethod" size="default">
    <template v-slot:default="{ data }">
      <div>{{ data.label }}</div>
      <div class="item-description" v-if="data.description">{{ data.description }}</div>
    </template>
    <template v-slot:suggestion="{ item }">
      <div>{{ item.text }}</div>
      <div class="item-description" v-if="item.data.description">{{ item.data.description }}</div>
    </template>
  </el-cascader>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import HelperFunctionalMapping from "../../../../helpers/HelperFunctionalMapping";

const emit = defineEmits(["change"]);
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
      value: "statements",
      children: HelperFunctionalMapping.getStatements().map((el) => {
        return {
          value: el.value,
          label: el.name
        };
      })
    },
    {
      label: "Expressions",
      value: "expressions",
      children: HelperFunctionalMapping.getExpressions().map((el) => {
        return {
          value: el.value,
          label: el.name
        };
      })
    },
    {
      label: "Functions",
      value: "functions",
      children: functionOptions.value
    },
    {
      label: "Transformers",
      value: "transformers",
      children: transformersOptions.value
    }
  ];
});
const functionOptions = computed(() => {
  const datas: any = HelperFunctionalMapping.getFunctions(props.listAllFunctions);
  return Object.keys(datas).map((key) => {
    return {
      label: key,
      children: datas[key].map((el) => {
        return {
          value: HelperFunctionalMapping.getFunctionName(el),
          label: el.name,
          description: el.description
        };
      })
    };
  });
});
const transformersOptions = computed(() => {
  const datas: any = HelperFunctionalMapping.getTransformers(props.listAllTransformers);

  return Object.keys(datas).map((key) => {
    return {
      label: key,
      children: datas[key].map((el) => {
        const title = el.transformerKey.split(".").pop().replace("$", " ").split(" ").join(" -> ");
        return {
          value: {
            name: HelperFunctionalMapping.getTransformerName(el),
            transformerKey: el.transformerKey
          },
          label: title,
          description: el.description
        };
      })
    };
  });
});

const search = ref<string>("");

function onChange(item) {
  emit("change", item);
}

function filterMethod(node, keyword) {
  return node.text.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || (node.data.description && node.data.description.toLowerCase().indexOf(keyword.toLowerCase()) > -1);
}
</script>

<style lang="scss">
.functional-mapping-search {
  .item-description {
    width: 400px;
    margin-top: 5px;
    color: #a0a0a1;
    font-size: 14px;
    white-space: pre-line;
  }

  .el-cascader__suggestion-item {
    display: block;
    height: auto !important;
    white-space: normal;
    line-height: normal;
    border-bottom: 1px solid #dfe6ec;
    padding: 10px;
  }

  .el-cascader-panel .el-scrollbar:nth-child(3) {
    .el-cascader-node {
      height: auto !important;
      white-space: normal;
      line-height: normal;
      padding: 10px 0;
      border-bottom: 1px solid #dfe6ec;
    }
  }
}
</style>
