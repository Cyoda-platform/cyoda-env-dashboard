<template>
  <el-tree-select
    v-bind="$attrs"
    lazy
    :load="loadRelationOptions"
    placeholder="Please select"
    v-model="localValue"
    :cacheData="cacheData"
    :props="settings"
    :key="props.entityClass"
    :disabled="!props.entityClass"
    @change="onChange">
    <template #default="{ data }">
      {{ data.labelNode }}
    </template>
  </el-tree-select>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperModelling from "../../helpers/HelperModelling";
import HelperFormat from "../../helpers/HelperFormat";

const emit = defineEmits(["input"]);
const props = defineProps({
  entityClass: {
    default: ""
  },
  relationValue: {
    default: null
  }
});

const relationOptions = ref(null);

const cacheData = []
const localValue=ref(props.relationValue);

const settings = {
  label: 'label',
  children: 'children',
  isLeaf: 'isLeaf',
}

async function loadRelationOptions(node, resolve) {
  if (node.isLeaf || !props.entityClass) return resolve([])
  if (node.data.children && node.data.children.length>0) return resolve(node.data.children)
  if (!node.data.value) {
    let { data } = await api.getReportingInfo(props.entityClass);
    resolve(buildOptions(data));
  } else if (node.data.info) {
    let { data } = await api.getReportingInfo(props.entityClass, node.data.info.reportClass, node.data.info.columnPath);
    resolve(buildOptions(data));
  }
}

function buildOptions(data: any) {
  return HelperModelling.sortData(HelperModelling.filterData(data)).map((row) => {
    const item: any = {
      label: shortNamePath(row.columnPath),
      labelNode: row.columnName,
      value: row.columnPath,
      isDisabled: !HelperModelling.rowCanBeSelected(row),
      isLeaf: true,
    };
    if (HelperModelling.isChildAvailable(row)) {
      const classes = HelperModelling.allRequestParams(row, props.entityClass);
      item.isLeaf = false;
      item.children = [];
      classes.forEach((rowClass) => {
        const itemClass = {
          label: shortNamePath(`${rowClass.reportClass}${rowClass.columnPath}`),
          labelNode: rowClass.reportClassShort,
          value: `${rowClass.reportClass}${rowClass.columnPath}`,
          isDisabled: true,
          info: rowClass
        };
        item.children.push(itemClass);
      });
    }
    return item;
  });
}

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function onChange(val: string) {
  emit("input", val);
}

watch(
  () => props.entityClass,
  () => {
    relationOptions.value = null;
  },
  { immediate: true }
);
</script>
