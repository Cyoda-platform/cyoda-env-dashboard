<template>
  <div class="assign-mode-target">
    <div>
      <el-popover v-if="!isMapElementEmbedded" placement="top-start" title="Assign Mode" width="200" :show-after="1000" trigger="hover">
        <div>
          <strong>M</strong>- multiple <br/>
          <strong>S</strong>- single
        </div>
        <template #reference>
          <div class="assign-mode">
            <template v-if="modelValue === 'single'">
              <div
                @click="changeAssignModeTo($event, 'multiple')"
                class="single-mode"
                :class="{
                  'assign-mode-disabled': activeRelation
                }"
              >
                S
              </div>
            </template>
            <template v-if="modelValue === 'multiple'">
              <div
                @click="changeAssignModeTo($event, 'single')"
                class="multiple-mode"
                :class="{
                  'assign-mode-disabled': activeRelation
                }"
              >
                M
              </div>
            </template>
          </div>
        </template>
      </el-popover>
    </div>
    <div v-if="modelValue === 'single'">
      <el-button @click="onAddNewElement" :disabled="activeRelation" size="default" type="primary">
        <font-awesome-icon icon="plus"/>
      </el-button>
    </div>
    <DialogAssignModeElement
      ref="dialogAssignModeElementRef"
      :element="element"
      @save="onSaveDialog"
      @edit="onEditDialog"
      :allRequestParams="allRequestParams"
      :requestParamsComputed="requestParamsComputed"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick, computed} from "vue";

import DialogAssignModeElement from "../../components/DataMapper/DialogAssignModeElement.vue";
import HelperModelling from "../../helpers/HelperModelling";
import HelperContent from "../../helpers/HelperContent";
import HelperMapper from "../../helpers/HelperMapper";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {usePlatformMappingStore} from "../../stores/platform-mapping";

const emit = defineEmits(["input", "changed", "created"]);
const props = defineProps({
  path: undefined,
  allRequestParams: {
    default: () => {
      return [];
    }
  },
  element: {
    default: () => {
      return {};
    }
  },
  allRequestParamsSelected: {
    default: () => {
      return [];
    }
  },
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  },
  allElementsList: {
    default: () => {
      return [];
    }
  },
  allDataRelations: {
    default: () => {
      return [];
    }
  },
  reportInfoRow: {
    default: () => {
      return {};
    }
  },
  modelValue: {default: "multiple"},
  isMapElement: {default: false},
  isMapElementEmbedded: {default: false},
  requestParamsComputed: {default: () => []},
});

const platformMappingStore = usePlatformMappingStore();
const activeRelation = computed(() => {
  return platformMappingStore.activeRelation;
});

const dialogAssignModeElementRef = ref(null);

async function changeAssignModeTo(event: any, mode: any) {
  event.stopPropagation();
  event.preventDefault();

  if (activeRelation.value && activeRelation.value.direction === "fromTarget") {
    return;
  }

  props.allRequestParamsSelected.length = 0;
  props.allElementsList.length = 0;
  let pathIndex = "";
  if (mode === "multiple") {
    pathIndex = "*";
  } else if (mode === "single") {
    pathIndex = props.isMapElement ? "key0" : "0";
  }

  props.allElementsList.push({index: pathIndex});

  const allSelectedPaths = props.allDataRelations
    .map((el) => {
      if (HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.reportInfoRow.columnPath, HelperModelling.REGEX_TARGET)) {
        return el.column.dstColumnPath;
      }
    })
    .filter((el) => el);

  props.selectedEntityMapping.metadata
    .filter((el) => el)
    .forEach((el) => {
      allSelectedPaths.push(el.dstCyodaColumnPath);
    });

  let newSelectedPaths = [];
  if (allSelectedPaths.length > 0) {
    const newPartPath = `${props.reportInfoRow.columnPath}.[${pathIndex}]`;
    if (props.isMapElement) {
      if (mode === "single") {
        allSelectedPaths.forEach(() => {
          newSelectedPaths.push(newPartPath);
        });
      } else if (mode === "multiple") {
        allSelectedPaths.forEach(() => {
          newSelectedPaths.push(props.reportInfoRow.columnPath);
        });
      }
    } else {
      newSelectedPaths = allSelectedPaths.map((el) => {
        const reg = new RegExp(`${HelperContent.escapeRegExp(props.reportInfoRow.columnPath)}\\.\\[[^.]+\\]`);
        return el.replace(reg, newPartPath);
      });
    }

    HelperMapper.updateOldToNewFieldsInObj(props.selectedEntityMapping, allSelectedPaths, newSelectedPaths);
  }

  emit("update:modelValue", mode);
  emit("changed");
  await nextTick();

  eventBus.$emit("updateRelations");
}

function deleteAllMeta() {
  props.selectedEntityMapping.metadata = props.selectedEntityMapping.metadata.filter((elMeta) => {
    return elMeta.dstCyodaColumnPath.indexOf(props.reportInfoRow.columnPath) !== 0;
  });
}

function onAddNewElement(event: any) {
  event.stopPropagation();
  event.preventDefault();
  if (props.element.type == "EMBEDDED") {
    dialogAssignModeElementRef.value.createNew();
  } else if (props.element.type == "LEAF") {
    let length = props.allElementsList.length - 1;
    let key = null;
    const existValues = props.allElementsList.map(el => el.index);
    do {
      length += 1;
      key = props.isMapElement ? `key${length}` : length;
    } while (existValues.includes(key))
    props.allElementsList.push({
      index: key
    });
    emit("created");
  }
}

function onSaveDialog(data: any) {
  props.allRequestParamsSelected.push(data);
  emit("created");
}

async function onEditDialog({oldPartColumnName, newPartColumnName}) {
  const allSelectedPaths = props.allDataRelations
    .map((el) => {
      if (HelperModelling.isElementIsSelected(el.column.dstColumnPath, oldPartColumnName, HelperModelling.REGEX_TARGET)) {
        return el.column.dstColumnPath;
      }
    })
    .filter((el) => el);

  if (allSelectedPaths.length === 0) return;
  let newSelectedPaths = allSelectedPaths.map((el) => {
    return el.replace(oldPartColumnName, newPartColumnName);
  });

  HelperMapper.updateOldToNewFieldsInObj(props.selectedEntityMapping, allSelectedPaths, newSelectedPaths);
  props.allRequestParamsSelected.forEach((el) => {
    el.columnPath=el.columnPath.replace(oldPartColumnName, newPartColumnName);
  })

  await nextTick();

  eventBus.$emit("updateRelations");
}

defineExpose({dialogAssignModeElementRef});
</script>

<style scoped lang="scss">
.assign-mode-target {
  display: flex;
  align-items: center;

  button {
    margin-left: 10px;
  }

  .assign-mode {
    div {
      font-weight: bold;
      text-decoration: underline;
      margin-left: 10px;
      padding: 2px 5px;
      opacity: 0.8;
      transition: all 0.5s;
      cursor: pointer;
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

    .assign-mode-disabled {
      opacity: 0.4 !important;
    }
  }
}
</style>
