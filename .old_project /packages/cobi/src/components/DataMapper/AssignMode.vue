<template>
  <el-popover placement="top-start" title="Assign Mode" width="200" :show-after="1000" trigger="hover">
    <div>
      <strong>M</strong>- multiple <br/>
      <strong>S</strong>- single
    </div>
    <template #reference>
      <div class="assign-mode">
        <template v-if="modelValue === 'single'">
          <div @click="changeAssignModeTo($event, 'multiple')" class="single-mode">S</div>
        </template>
        <template v-if="modelValue === 'multiple'">
          <div @click="changeAssignModeTo($event, 'single')" class="multiple-mode">M</div>
        </template>
      </div>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import {nextTick} from "vue";

import HelperContent from "../../helpers/HelperContent";
import HelperMapper from "../../helpers/HelperMapper";

import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import _ from "lodash";

const emit = defineEmits(["change", "update:modelValue"]);
const props = defineProps({
  allDataRelations: undefined,
  isRoot: {default: false},
  path: undefined,
  modelValue: {default: "multiple"},
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  }
});

async function changeAssignModeTo(event: any, mode: any) {
  event.stopPropagation();
  event.preventDefault();

  let pathIndex = "";
  if (mode === "multiple") {
    pathIndex = "*";
  } else if (mode === "single") {
    pathIndex = "0";
  }

  let existElements: any[] = [];
  if (props.isRoot) {
    existElements = props.allDataRelations;
  } else {
    existElements = props.allDataRelations.filter((el) => el.column.srcColumnPath.indexOf(props.path) == 0);
  }

  const allSelectedPaths = existElements.map((el) => el.column.srcColumnPath);

  const newSelectedPaths = getNewPathsForIndex(pathIndex, allSelectedPaths);

  HelperMapper.updateOldToNewFieldsInObj(props.selectedEntityMapping, allSelectedPaths, newSelectedPaths);

  emit("update:modelValue", mode);
  emit("change", mode);

  await nextTick();

  eventBus.$emit("updateRelations");
}

function getNewPathsForIndex(pathIndex, allSelectedPaths) {
  const isPolymorphicList = props.selectedEntityMapping.isPolymorphicList;
  let path = props.path || "";
  if (isPolymorphicList) {
    const paths = props.path.split("/");
    paths.pop();
    path = paths.join("/");
  }

  if (props.isRoot) {
    return allSelectedPaths.map((el) => {
      const temp = el.split('/');
      temp[0] = pathIndex;
      return temp.join('/');
    });
  }

  const newPartPath = `${path}/${pathIndex}/`;
  return allSelectedPaths.map((el) => {
    const reg = new RegExp(`${HelperContent.escapeRegExp(path)}\/(\\d+|\\*)?`);
    return el.replace(reg, newPartPath).replaceAll("//", "/").replaceAll(/\/+$/g, "");
  });
}
</script>

<style scoped lang="scss">
.assign-mode {
  div {
    font-weight: bold;
    text-decoration: underline;
    margin-right: 5px;
    padding: 2px 5px;
    opacity: 0.8;
    transition: all 0.5s;
    cursor: pointer;
    width: 24px;
  }

  div:hover {
    opacity: 1;
  }

  div.single-mode {
    color: #78a0ee;
  }

  div.multiple-mode {
    color: #e79494;
  }
}
</style>
