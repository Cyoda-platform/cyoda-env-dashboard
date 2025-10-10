<template>
  <div ref="rootRef" class="wrap-row source-data-row">
    <div
      @mouseover="onOverRow"
      @mouseleave="onLeaveRow"
      @click="onToggleOpen($event)"
      class="row"
      :class="[
        {
          'is-show-value': isShowValue,

          selectable: !isShowValue,
          'have-relation': currentRelations,
          'is-partial-match': !isOpen && allRelationClasses.length > 0 && !isSelected,
          'is-opacity': isOpacity,
          'is-search-string': isSearchString,
          'is-hover-with-active-link': isHoverWithActiveLink,
          'can-not-be-selected-by-relation': !canBeSelectedByRelation
        }
      ]"
      :data-relation="isOpen ? '' : allRelationClasses.join(' ')"
      :data-pathComputed="pathComputed"
    >
      <template v-if="!isShowValue">
        <div v-if="parentTypeOfData === 'array' && selectedEntityMapping.isPolymorphicList">
          <AssignMode @change="onChangeAssignMode" :selectedEntityMapping="selectedEntityMapping" v-model="assignMode"
                      :allDataRelations="allDataRelations" :path="pathComputed"/>
        </div>
        <div class="icon" :class="{ 'is-open': isOpen && isShowSourceData }">
          <font-awesome-icon icon="chevron-right"/>
        </div>
      </template>
      <template v-else>
        <font-awesome-icon
          @click="onClickToScript"
          :icon="['fab', 'js']"
          class="settings"
          :class="{
            error: !isExistInScripts,
            success: isExistInScripts
          }"
        />
      </template>

      <div class="key">
        <el-tooltip popper-class="key-tooltip" :show-after="1000" effect="dark" :content="pathComputed" placement="top">
          <span
            :class="{
              'single-mode': assignMode === 'single',
              'multiple-mode': assignMode === 'multiple'
            }"
          >
            {{ localIndexKey }}
          </span>
        </el-tooltip>
      </div>

      <div v-if="typeOfData === 'array' && !selectedEntityMapping.isPolymorphicList">
        <AssignMode @change="onChangeAssignMode" class="polymorphic-list-am"
                    :selectedEntityMapping="selectedEntityMapping" v-model="assignMode"
                    :allDataRelations="allDataRelations" :path="pathComputed"/>
      </div>

      <font-awesome-icon
        v-if="isShowToggleJs" @click.stop="onClickToggleToScript"
        class="settings"
        :icon="['fab', 'js']"
        :class="{
            error: !isAllToScriptExists,
            success: isAllToScriptExists
          }"
      />

      <div class="pull-right"></div>
      <el-button v-if="isShowparentPolymorphicIndex" @click="clickOpenDialogIndex" class="btn-edit-index" size="small"
                 type="primary">
        <font-awesome-icon icon="edit"/>
      </el-button>

      <template v-if="isShowValue">
        <template v-if="isEllipsisActive">
          <el-tooltip :show-after="300" effect="dark" :content="value.toString()" placement="top">
            <div class="value inner">
              {{ value }}
            </div>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="value">
            {{ value }}
          </div>
        </template>
      </template>
      <div class="type">{{ typeOfData }}</div>
      <el-popover popper-class="popover-actions"
                  v-if="isShowValue || (!isOpen && allRelationClasses.length > 0 && !isSelected)" placement="top-start"
                  title="Actions" width="200" trigger="click" :disabled="disabledTooltip"
                  v-model:visible="visibleTooltip">
        <div>
          <div class="action" v-if="isShowValue">
            <el-button @click="onStartDragLine($event, 'columnMapping')" type="primary" link>Column Mapping</el-button>
          </div>

          <div class="action" v-if="isShowValue">
            <el-button @click="onStartDragLine($event, 'functionalMapping')" type="primary" link>Functional Mapping
            </el-button>
          </div>

          <div class="action" v-if="isPathNotExist && allRelationClasses.length > 0">
            <el-button @click="onStartRepair" type="primary" link>Start Repair</el-button>
          </div>

          <div class="action" v-if="allRelationClasses.length > 0 && !isPathNotExist && isShowValue">
            <el-button @click="onReAssign" type="primary" link>Reassign</el-button>
          </div>

          <div class="action" v-if="allRelationClasses.length > 0 && !activeRelation">
            <el-button @click="onDeleteRelation" type="primary" link>Delete</el-button>
          </div>
        </div>
        <template #reference>
          <div
            :class="{
            selected: isSelected || visibleTooltip,
            'functional-mapping': isFunctionalMapping,
            'column-mapping': isColumnMapping,
            'path-not-exist': isPathNotExist
          }"
            class="circle"
          >
            <template v-if="allRelationClasses.length > 1">{{ allRelationClasses.length }}</template>
          </div>
        </template>
      </el-popover>
    </div>
    <div v-show="isShowSourceData">
      <SourceData
        v-if="isOpen"
        ref="sourceDataRef"
        class="source-data"
        :class="{
        'source-data-array': parentTypeOfData === 'array'
      }"
        :findSourcePath="findSourcePath"
        :toggleExpand="toggleExpand"
        :assignMode="assignMode"
        :allDataRelations="allDataRelations"
        :parentPath="pathComputed"
        :jsonParentPath="jsonPathComputed"
        :parentTypeOfData="typeOfData"
        :level="level + 1"
        :selectedEntityMapping="selectedEntityMapping"
        :data="value"
        :notExistRelations="notExistRelations"
      />
    </div>
    <SourceDataRowIndexDialog v-if="selectedEntityMapping.isPolymorphicList" @save="onSaveIndexKey"
                              ref="sourceDataRowIndexDialogRef"/>
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick, computed, watch, onMounted} from "vue";

import AssignMode from "../../../components/DataMapper/AssignMode.vue";

import HelperModelling from "../../../helpers/HelperModelling";
import HelperMapper from "../../../helpers/HelperMapper";
import HelperContent from "../../../helpers/HelperContent";

import {useHoverWithActiveLinkMixin} from "../../../mixins/HoverWithActiveLinkMixin";
import SourceDataRowIndexDialog from "./SourceDataRowIndexDialog.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import SourceData from "./SourceData.vue";

// @TODO Mixins: HoverWithActiveLinkMixer
const props = defineProps({
  toggleExpand: undefined,
  findSourcePath: undefined,
  value: undefined,
  allDataRelations: undefined,
  rowKey: undefined,
  jsonKey: undefined,
  level: undefined,
  parentTypeOfData: undefined,
  parentPath: {default: ""},
  jsonParentPath: {default: ""},
  notExistRelations: {default: () => []},
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  }
});

const rootRef = ref(null);
const sourceDataRef = ref(null);
const platformMappingStore = usePlatformMappingStore();

const isShowSourceData = ref(true);

const activeRelation = computed(() => {
  return platformMappingStore.activeRelation;
});
const hoveredRelations = computed(() => {
  return platformMappingStore.hoveredRelations;
});
const typeContent = computed(() => {
  return platformMappingStore.typeContent;
});
const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const canBeSelectedByRelation = computed(() => {
  if (activeRelation.value && activeRelation.value.column.dstColumnPath && activeRelation.value.type === "columnMapping") {
    const srcCountAsterisk = activeRelation.value.column.dstColumnPath.split("*").length;
    const dstCountAsterisk = pathComputed.value.split("*").length;
    if (srcCountAsterisk !== dstCountAsterisk) {
      return false;
    }
  }
  return true;
});

const typeOfData = computed(() => {
  return HelperMapper.getTypeOfData(props.value, props.rowKey, dataType.value);
});
const isShowValue = computed(() => {
  if (typeOfData.value === "object" || typeOfData.value === "array") {
    return false;
  }
  return true;
});
const pathComputed = computed(() => {
  return HelperMapper.computePathByKey(localIndexKey.value, props.parentPath, props.parentTypeOfData, dataType.value);
});
const jsonPathComputed = computed(() => {
  return HelperMapper.computePathByKey(props.jsonKey, props.jsonParentPath, props.parentTypeOfData, dataType.value);
});
const pathComputedClass = computed(() => {
  return pathComputed.value;
});
const isNotHovered = computed(() => {
  if (isOpen.value && hoveredRelations.value && hoveredRelations.value.length > 0) {
    return true;
  }
  if (hoveredRelations.value && hoveredRelations.value.length > 0) {
    return !hoveredRelations.value.find((el: any) => {
      return HelperModelling.isElementIsSelected(el.column.jsonPath, pathComputed.value, HelperModelling.REGEX_SOURCE);
    });
  }
  return false;
});
const isSelected = computed(() => {
  return currentRelations.value && currentRelations.value.length > 0;
});

const currentRelations = computed(() => {
  if (["array", "object"].indexOf(typeOfData.value) > -1) {
    return [];
  }
  return props.allDataRelations.filter((el) => el.type !== 'cobiJsPaths').filter((el) => el.column.jsonPath == jsonPathComputed.value);
});

const getAllSelectedRelations = computed(() => {
  const relations: any[] = [];
  if (typeOfData.value === "object" || typeOfData.value == "array") {
    props.allDataRelations.filter((el) => el.type !== 'cobiJsPaths').forEach((el) => {
      const isSelected = el.column.jsonPath && el.column.jsonPath.indexOf(jsonPathComputed.value) === 0;
      if (isSelected) {
        relations.push(el);
      }
    });
  } else if (currentRelations.value) {
    currentRelations.value.forEach((el: any) => {
      relations.push(el);
    });
  }
  return relations;
});

const allRelationClasses = computed(() => {
  return getAllSelectedRelations.value.map((el: any) => encodeURIComponent(el.column.jsonPath));
});
const isFunctionalMapping = computed(() => {
  return !!currentRelations.value.find((el) => el.type === "functionalMapping");
});
const isColumnMapping = computed(() => {
  return !!currentRelations.value.find((el) => el.type === "columnMapping");
});
const isPathNotExist = computed(() => {
  return HelperMapper.checkIfPathNotExist(getAllSelectedRelations.value, props.notExistRelations);
});

function setHoveredRelations(columns) {
  return platformMappingStore.setHoveredRelations(columns);
}

const sourceDataRowIndexDialogRef = ref(null);

const isOpen = ref<boolean>(false);
const isEllipsisActive = ref<boolean>(false);
const isOpacity = ref<boolean>(false);
const assignMode = ref<string>("single");
const visibleTooltip = ref<boolean>(false);
const disabledTooltip = ref<boolean>(false);
const isSearchString = ref<boolean>(false);
const {
  startHoverWithActiveLink,
  stopHoverWithActiveLink,
  isHoverWithActiveLink
} = useHoverWithActiveLinkMixin(activeRelation, isOpen);
let localIndexKey = ref(props.selectedEntityMapping.isPolymorphicList ? props.jsonKey : props.rowKey);

const isShowparentPolymorphicIndex = computed(() => {
  return props.parentTypeOfData === 'array' && assignMode.value === 'single' && props.selectedEntityMapping.isPolymorphicList;
})

async function onToggleOpen(event: any) {
  if (activeRelation.value && activeRelation.value.direction === "fromSource") {
    setTimeout(() => {
      visibleTooltip.value = false;
    }, 10)
    return;
  }

  if (activeRelation.value && activeRelation.value.direction === "fromTarget" && !canBeSelectedByRelation.value) {
    setTimeout(() => {
      visibleTooltip.value = false;
    }, 10)
  }

  if (activeRelation.value && isShowValue.value && activeRelation.value.direction !== "fromSource") {
    setTimeout(() => {
      visibleTooltip.value = false;
    }, 10)
    endDragLine();
    return false;
  }
  if (isShowValue.value || event?.target.classList.contains("circle")) {
    return false;
  }
  isOpen.value = !isOpen.value;
  eventBus.$emit("toggleExpandReset");
  eventBus.$emit("findSourcePathReset");
  await nextTick();

  eventBus.$emit("updateRelations");
}

function endDragLine() {
  if (isShowValue.value && canBeSelectedByRelation.value) {
    let circle = rootRef.value.querySelector(".circle");
    eventBus.$emit("endDragLine", {
      el: circle,
      path: activeRelation.value.column.dstColumnPath,
      srcPath: pathComputed.value,
      jsonPath: jsonPathComputed.value,
      clazzType: activeRelation.value.clazzType
    });
  }
}

checkAssignMode();

onMounted(() => {
  const $valBox = rootRef.value.querySelector ? rootRef.value.querySelector(".value") : null;
  if ($valBox) {
    isEllipsisActive.value = isEllipsisActiveCheck($valBox);
  }
});

function isEllipsisActiveCheck(e: any) {
  return e.offsetWidth < e.scrollWidth;
}

function onStartDragLine(event: any, type) {
  if (isShowValue.value) {
    visibleTooltip.value = false;
    eventBus.$emit("startDragLine", {
      el: rootRef.value.querySelector(".circle"),
      path: pathComputed.value,
      jsonPath: jsonPathComputed.value,
      type
    });
  }
}

function onDeleteRelation() {
  if (allRelationClasses.value.length > 0) {
    visibleTooltip.value = false;
    eventBus.$emit("removeRelation", getAllSelectedRelations.value);
  }
}

function onStartRepair() {
  visibleTooltip.value = false;
  if (getAllSelectedRelations.value.length === 1) {
    const relation = getAllSelectedRelations.value.find((el) => el.column.jsonPath === jsonPathComputed.value);
    eventBus.$emit("startDragLine", {
      el: rootRef.value.querySelector(".circle"),
      path: relation.column.jsonPath,
      type: relation.type,
      direction: "fromSource",
      notExistRelation: relation
    });
  }
}

function checkAssignMode() {
  if (props.selectedEntityMapping.isPolymorphicList) {
    if (props.parentTypeOfData === "array" && allRelationClasses.value.length) {
      for (const el of props.allDataRelations) {
        const pathsSectionsIndex = props.parentPath.split("/").length;
        const indexOfRow = el.column.jsonPath.split("/")[pathsSectionsIndex];
        const path = el.column.srcColumnPath;
        const regIndex = new RegExp(`${HelperContent.escapeRegExp(props.parentPath)}\/(\\d{1,})`);
        const regStar = new RegExp(`${HelperContent.escapeRegExp(props.parentPath)}\/(\\*)`);
        const matchesIndex = path.match(regIndex);
        const matchesStar = path.match(regStar);
        if (indexOfRow !== props.jsonKey) continue;
        if (matchesIndex && matchesIndex.length > 1) {
          assignMode.value = "single";
          localIndexKey.value = matchesIndex[1];
          break;
        } else if (matchesStar && matchesStar.length > 1) {
          assignMode.value = "multiple";
          localIndexKey.value = "*";
          break;
        }
      }
    }
  } else {
    if (typeOfData.value === "array") {
      for (const el of props.allDataRelations) {
        const path = el.column.srcColumnPath;
        const regIndex = new RegExp(`${HelperContent.escapeRegExp(pathComputed.value)}\/(\\d{1,})`);
        const regStar = new RegExp(`${HelperContent.escapeRegExp(pathComputed.value)}\/(\\*)`);
        const matchesIndex = path.match(regIndex);
        const matchesStar = path.match(regStar);
        if (matchesIndex && matchesIndex.length > 1) {
          assignMode.value = "single";
          break;
        } else if (matchesStar && matchesStar.length > 1) {
          assignMode.value = "multiple";
          break;
        }
      }
    }
  }
}

function onOverRow() {
  if (allRelationClasses.value.length > 0 && !isOpen.value) {
    const columns = props.allDataRelations.filter((el) => allRelationClasses.value.indexOf(el.column.jsonPath) > -1);
    setHoveredRelations(columns);
  }
  if (!isShowValue.value) {
    startHoverWithActiveLink();
  }
}

function onLeaveRow() {
  if (allRelationClasses.value.length > 0) {
    setHoveredRelations([]);
  }
  stopHoverWithActiveLink();
}

function addFlashLight() {
  isSearchString.value = true;
  setTimeout(() => {
    isSearchString.value = false;
  }, 2000);
}

function onClickToScript() {
  const dataForSrcPath = {
    pathComputedSrcPath: pathComputed.value,
    jsonPathComputedSrcPath: jsonPathComputed.value
  }
  if (isExistInScripts.value) {
    HelperMapper.removeFromScripts(props.selectedEntityMapping, dataForSrcPath);
  } else {
    HelperMapper.addToScripts(props.selectedEntityMapping, dataForSrcPath)
  }
}

async function onClickToggleToScript() {
  isOpenBefore.value = isOpen.value;
  if(!isOpen.value) {
    isShowSourceData.value = false;
  }
  await openHandler(true);
  await HelperMapper.toggleToScript(sourceDataRef.value, !isAllToScriptExists.value);
  isOpen.value = isOpenBefore.value;
  await nextTick();
  isShowSourceData.value = true;
}

const dataForToggleJs = computed(() => {
  const data = [];
  Object.keys(props.value).forEach((key) => {
    const typeOfData = HelperMapper.getTypeOfData(props.value[key], props.rowKey);
    if (!['object', 'array'].includes(typeOfData)) {
      data.push({
        pathComputedSrcPath: HelperMapper.computePathByKey(key, pathComputed.value, props.parentTypeOfData, dataType.value),
        jsonPathComputedSrcPath: HelperMapper.computePathByKey(key, jsonPathComputed.value, props.parentTypeOfData, dataType.value),
      })
    }
  });
  return data;
})

const isAllToScriptExists = computed(() => {
  return HelperMapper.isAllToScriptExists(props.selectedEntityMapping, dataForToggleJs.value);
})

const isShowToggleJs = computed(() => {
  return typeOfData.value === 'object' && dataForToggleJs.value.length > 0;
});

const isExistInScripts = computed(() => {
  return props.selectedEntityMapping.script.inputSrcPaths.includes(pathComputed.value);
})

function onReAssign() {
  setTimeout(() => {
    visibleTooltip.value = false;
  }, 10);
  const relations = JSON.parse(JSON.stringify(currentRelations.value));
  relations.forEach((el) => {
    el.direction = "fromTarget";
  });
  eventBus.$emit("reassignRelations", relations);
}

watch(
  () => props.toggleExpand,
  () => {
    if ((props.toggleExpand === true || props.toggleExpand === false) && !isShowValue.value && allRelationClasses.value.length > 0) {
      isOpen.value = props.toggleExpand;
    }
  },
  {immediate: true}
);

watch(
  () => props.findSourcePath,
  async () => {
    if (!props.findSourcePath) return;
    const isElementIsSelected = HelperModelling.isElementIsSelected(props.findSourcePath, pathComputed.value, HelperModelling.REGEX_SOURCE);
    if (isElementIsSelected && !isShowValue.value && props.findSourcePath) {
      isOpen.value = true;

      await nextTick();

      eventBus.$emit("updateRelations");
    }

    if (props.findSourcePath === pathComputed.value) {
      await nextTick();

      rootRef.value.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "center"
      });
      addFlashLight();
      eventBus.$emit("findSourcePathReset");
    }
  },
  {immediate: true}
);

function clickOpenDialogIndex(e) {
  e.stopPropagation();
  sourceDataRowIndexDialogRef.value.openForm(localIndexKey.value);
}

function onChangeAssignMode() {
  if (props.parentTypeOfData !== "array") return;

  if (assignMode.value === "multiple") {
    localIndexKey.value = "*";
  } else {
    localIndexKey.value = props.jsonKey;
  }
}

function onSaveIndexKey(value) {
  localIndexKey.value = value;
}

watch(
  pathComputed,
  (valueNew, valueOld) => {
    if (allRelationClasses.value.length > 0) {
      const existElements = props.allDataRelations.filter((el) => el.column.srcColumnPath.indexOf(valueOld) == 0);
      const allSelectedPaths = existElements.map((el) => el.column.srcColumnPath);

      const newSelectedPaths = allSelectedPaths.map((el) => {
        return el.replace(valueOld, valueNew);
      });

      HelperMapper.updateOldToNewFieldsInObj(props.selectedEntityMapping, allSelectedPaths, newSelectedPaths);
    }
  }
);

// Scripts toggle with child
const isOpenBefore = ref(false);

async function openHandler(isOpenValue) {
  if (isShowValue.value || event?.target.classList.contains("circle")) {
    return false;
  }
  if (isOpenValue) {
    isOpenBefore.value = isOpen.value;
    isShowSourceData.value = false;
  }
  isOpen.value = isOpenValue;
  await nextTick();
}

async function isShowSourceDataHandler(isShowSourceValue) {
  isShowSourceData.value = isShowSourceValue;
  if (isShowSourceValue) {
    isOpen.value = isOpenBefore.value;
    isOpenBefore.value = false;
  }
}

function scriptsHandler(isAddToScript) {
  const dataForSrcPath = {
    pathComputedSrcPath: pathComputed.value,
    jsonPathComputedSrcPath: jsonPathComputed.value
  }
  if (!isAddToScript) {
    HelperMapper.removeFromScripts(props.selectedEntityMapping, dataForSrcPath);
  } else {
    HelperMapper.addToScripts(props.selectedEntityMapping, dataForSrcPath)
  }
}

defineExpose({scriptsHandler, openHandler, sourceDataRef, isShowSourceDataHandler});

// End scripts toggle with child
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.source-data-row {
  .row {
    display: flex;
    padding: 10px;
    border-top: 1px solid #dedede;
    align-items: center;
    transition: all 0.5s;

    &.is-opacity {
      opacity: 0.5;
    }

    .key {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value {
      min-width: 100px;
      text-align: right;
      padding: 0 15px;
      color: #9f9f9f;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.inner {
        text-decoration: underline;
        cursor: pointer;
      }
    }

    .icon {
      margin-right: 10px;
      transition: all 0.5s;

      &.is-open {
        transform: rotate(90deg);
      }
    }

    &.is-show-value {
      padding-left: 0;
    }

    &.selectable {
      &:after {
        border-bottom: 1px solid transparent;
      }
    }

    &.selectable:hover {
      cursor: pointer;
      position: relative;

      &:after {
        content: " ";
        position: absolute;
        bottom: -1px;
        left: 0;
        border-color: #dedede;
        width: 100%;
        transition: all 0.5s;
      }
    }
  }

  .source-data {
    margin-left: 15px;
  }

  .source-data.source-data-array {
    margin-left: 30px;
  }

  .row {
    position: relative;
    height: 40px;

    .circle {
      position: absolute;
      right: -17px;
      min-width: 17px;
      white-space: nowrap;
      height: 18px;
      border-radius: 0 10px 10px 0;
      top: 9px;
      opacity: 0;
      transition: all 0.5s;
      background-color: #858484;
      border: 2px solid #858484;
      font-size: 13px;
      text-align: center;
      line-height: 14px;

      &.selected {
        opacity: 1;
        cursor: pointer;
      }

      &.column-mapping {
        background-color: #67c23a;
        border-color: #67c23a;
      }

      &.functional-mapping {
        background-color: #e6a23c;
        border-color: #e6a23c;
      }

      &.path-not-exist {
        background-color: #f56c6c !important;
        border-color: #f56c6c !important;
      }
    }

    &.is-partial-match {
      .circle {
        border: 2px dotted #858484;
        background-color: #fff;
        opacity: 1;
      }
    }

    &:hover {
      .circle {
        opacity: 1;
      }
    }

    &.selectable .key span {
      font-weight: bold;
    }

    &.is-not-hovered .circle.selected {
      opacity: 0.2;
    }

    &.is-search-string {
      animation: isSearchString 2s infinite;
      animation-iteration-count: 1;
    }

    .pull-right {
      margin-left: auto;
    }

    .btn-edit-index {
      margin-right: 10px;
    }
  }

  .polymorphic-list-am {
    .single-mode,
    .multiple-mode {
      margin-left: 10px;
    }
  }

  .can-not-be-selected-by-relation {
    opacity: 0.5;

    &:not(.have-relation).circle {
      display: none;

      &.selected,
      &.is-show-group-class {
        display: block;
      }
    }
  }

  .settings {
    opacity: 0.6;
    cursor: pointer;
    transition: all 0.5s;
    margin-left: 10px;
    margin-right: 7px;

    &:hover {
      opacity: 1;
    }

    &.success {
      color: #67c23a;
    }

    &.error {
      color: #f56c6c;
    }
  }
}

.key-tooltip .popper__arrow {
  left: 10% !important;
}

.popover-actions .action {
  padding: 10px 0;
}
</style>
