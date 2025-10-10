<template>
  <div ref="rootRef" class="wrap-row target-data-row">
    <div
      @click="onToggleOpen($event)"
      @mouseover="onOverRow"
      @mouseleave="onLeaveRow"
      class="row"
      :class="[
        {
          selectable: isChildAvailable,
          'can-not-be-selected-by-relation': !canBeSelectedByRelation,

          'is-search-string': isSearchString,
          'is-hover-with-active-link': isHoverWithActiveLink
        }
      ]"
      :data-relation="isOpen ? '' : allRelationClasses.join(' ')"
    >
      <template v-if="isChildAvailable">
        <div class="icon" :class="{ 'is-open': isOpen }">
          <font-awesome-icon icon="chevron-right"/>
        </div>
      </template>

      <div class="wrap-key">
        <div class="key">
          <el-tooltip :show-after="1000" effect="dark" :content="reportInfoRow.columnPath" placement="top">
            <span :class="{ 'is-bold-key': isBoldKey }">
              {{ reportInfoRow.columnName }}
            </span>
          </el-tooltip>
          <el-popover v-if="isSelected && isFunctionalMapping && functionalMappingConfigRelations.length > 0"
                      placement="bottom" trigger="hover" title="Count relations">
            <div>
              <ol>
                <li v-for="(relation, index) in functionalMappingConfigRelations" :key="index">
                  {{ shortNamePath(relation.dstPath) }}
                </li>
              </ol>
            </div>
            <template #reference>
              <span class="functional_mapping_config_relations_length">({{
                  functionalMappingConfigRelations.length
                }})</span>
            </template>
          </el-popover>
        </div>

        <template v-if="isSelected && isColumnMapping">
          <ColumnMappingSettings v-if="isSelected" :columns="columnMappingRelations"
                                 :selectedEntityMapping="selectedEntityMapping"/>
          <ColumnMappingSetModes v-if="isColumnSetModesAvailable" :columns="columnMappingRelations"
                                 :selectedEntityMapping="selectedEntityMapping"/>
        </template>

        <template v-if="!isColumnMapping && !isChildAvailable">
          <FunctionalMappingSettings v-if="!isColumnMapping" :reportInfoRow="reportInfoRow"
                                     :functionalMappingConfig="functionalMappingConfig"
                                     :selectedEntityMapping="selectedEntityMapping"/>
          <FunctionalMappingSetModes v-if="isColumnSetModesAvailable && functionalMappingConfig"
                                     :functionalMappingConfig="functionalMappingConfig"
                                     :selectedEntityMapping="selectedEntityMapping"/>
        </template>

        <template v-if="isSelected || isSelectedMeta">
          <ColumnUniqueCheck :element="element" :selectedEntityMapping="selectedEntityMapping"/>
        </template>

        <template v-if="currentRelations.length === 0 && !isChildAvailable && type.value !== 'binary'">
          <MetaData :dstCyodaColumnPath="reportInfoRow.columnPath" :dstCyodaColumnPathType="reportInfoRow.clazzType"
                    :selectedEntityMapping="selectedEntityMapping"/>
        </template>

        <AssignModeTarget
          v-if="type === 'list' || type === 'map'"
          ref="assignModeTargetRef"
          @created="onCreatedAssignModeTarget"
          @changed="onChangedAssignModeTarget"
          v-model="assignMode"
          :selectedEntityMapping="selectedEntityMapping"
          :allDataRelations="allDataRelations"
          :reportInfoRow="reportInfoRow"
          :element="element"
          :isMapElement="isMapElement"
          :isMapElementEmbedded="isMapElementEmbedded"
          :allRequestParams="allRequestParams"
          :allElementsList="allElementsList"
          :allRequestParamsSelected="allRequestParamsSelected"
          :requestParamsComputed="requestParamsComputed"
        />
      </div>

      <slot name="actions" :relationsForRemove="relationsForRemove"></slot>
      <span class="type" :class="{ 'actions-exist': !!hasSlot('actions') }">
          {{ type }}
      </span>

      <el-popover popper-class="popover-actions" v-if="isShowCircle" placement="top-start" title="Actions" width="200"
                  trigger="click" v-model:visible="visibleTooltip">
        <div>
          <div class="action" v-if="isPathNotExist && !isChildAvailable">
            <el-button @click="onStartRepair" type="primary" link>Start Repair</el-button>
          </div>
          <div class="action" v-if="!isPathNotExist && !isChildAvailable">
            <el-button @click="onReAssign" type="primary" link>Reassign</el-button>
          </div>
          <div class="action" v-if="isCanBeDelete">
            <el-button @click="onDeleteRelation" type="primary" link>Delete</el-button>
          </div>
        </div>
        <template #reference>
          <div
            ref="circleRef"
            class="circle"
            :class="{
            'circle-can-be-selected': !isChildAvailable && canBeSelectedByRelation,
            selected: isSelected,
            'is-show-group-class': (!isOpen && allRelationClasses.length > 0 && !isSelected) || (countSelectedItems && isChildAvailable && !activeRelation),
            'functional-mapping': isFunctionalMapping,
            'default-cursor': isFunctionalMappingInner || relationsForRemove.length === 0,
            'column-mapping': isColumnMapping,
            'cobi-core-metadata': isCobiCoreMetadata,
            'path-not-exist': isPathNotExist && !isChildAvailable,
            'path-not-exist-child-available': isPathNotExist && isChildAvailable
          }"
          >
            <template v-if="!isOpen && countSelectedItems > 1">
              {{ countSelectedItems }}
            </template>
          </div>
        </template>
      </el-popover>
    </div>

    <div v-if="isChildAvailable && isOpen">
      <template v-if="element.type === 'EMBEDDED'">
        <div class="row-elements">
          <template v-if="requestParamsComputed.length > 0">
            <TargetDataRowElementsEmbedded
              v-for="(requestParam, index) in requestParamsComputed"
              @delete="onDeleteElementEmbedded(index, $event)"
              @edit="onEditElementEmbedded(index)"
              :key="requestParam.columnPath+requestParam.key"
              :index="index"
              :assignMode="assignMode"
              :selectedEntityMapping="selectedEntityMapping"
              :requestParam="requestParam"
              :canBeSelectedByRelation="canBeSelectedByRelation"
              :allDataRelations="allDataRelations"
              :toggleExpand="toggleExpand"
              :findTargetPath="findTargetPath"
              :notExistRelations="notExistRelations"
            />
          </template>
          <template v-else>
            <div class="row row-empty">Empty. Please add Elements</div>
          </template>
        </div>
      </template>
      <template v-if="isListElement">
        <div class="row-elements">
          <template v-if="allElementsList.length > 0">
            <TargetDataRowElementsList v-for="(elementsList, index) in allElementsList" :key="index"
                                       @delete="onDeleteElementList(index)" :allDataRelations="allDataRelations"
                                       :parentReportInfoRow="reportInfoRow" :toggleExpand="toggleExpand"
                                       :findTargetPath="findTargetPath" :selectedEntityMapping="selectedEntityMapping"
                                       :elementsList="elementsList" :assignMode="assignMode"
                                       :notExistRelations="notExistRelations"/>
          </template>
          <template v-else>
            <div class="row row-empty">Empty. Please add Elements</div>
          </template>
        </div>
      </template>
      <template v-if="isMapElement">
        <div class="row-elements">
          <template v-if="allElementsList.length > 0">
            <TargetDataRowElementsMap v-for="(elementsList, index) in allElementsList" :key="index"
                                      @delete="onDeleteElementList(index)" :allDataRelations="allDataRelations"
                                      :parentReportInfoRow="reportInfoRow" :toggleExpand="toggleExpand"
                                      :findTargetPath="findTargetPath" :selectedEntityMapping="selectedEntityMapping"
                                      :elementsList="elementsList" :assignMode="assignMode"
                                      :notExistRelations="notExistRelations"/>
          </template>
          <template v-else>
            <div class="row row-empty">Empty. Please add Elements</div>
          </template>
        </div>
      </template>
    </div>
    <TargetDataRowDialogNotExistRelations :notExistRelations="allNotExistRelations" @repair="onRepair"
                                          ref="targetDataRowDialogNotExistRelationsRef"/>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, nextTick, computed, watch, useSlots} from "vue";

import type {RequestParam} from "../../../types/types";
import HelperModelling from "../../../helpers/HelperModelling";
import TargetDataRowElementsEmbedded from "../../../components/DataMapper/TargetData/TargetDataRowElementsEmbedded.vue";
import TargetDataRowElementsList from "../../../components/DataMapper/TargetData/TargetDataRowElementsList.vue";
import ColumnMappingSettings from "../../../components/DataMapper/ColumnMappingSettings/ColumnMappingSettings.vue";

import AssignModeTarget from "../../../components/DataMapper/AssignModeTarget.vue";
import ColumnUniqueCheck from "../../../components/DataMapper/ColumnUniqueCheck/ColumnUniqueCheck.vue";
import MetaData from "../../../components/DataMapper/MetaData/MetaData.vue";
import HelperContent from "../../../helpers/HelperContent";
import FunctionalMappingSettings
  from "../../../components/DataMapper/FunctionalMappingSettings/FunctionalMappingSettings.vue";
import HelperFormat from "../../../helpers/HelperFormat";
import ColumnMappingSetModes from "../ColumnMappingSettings/ColumnMappingSetModes.vue";
import FunctionalMappingSetModes from "../FunctionalMappingSettings/FunctionalMappingSetModes.vue";
import TargetDataRowElementsMap from "./TargetDataRowElementsMap.vue";
import HelperMapper from "../../../helpers/HelperMapper";
import TargetDataRowDialogNotExistRelations from "./TargetDataRowDialogNotExistRelations.vue";
import {useHoverWithActiveLinkMixin} from "../../../mixins/HoverWithActiveLinkMixin";
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

// @TODO Mixins: HoverWithActiveLinkMixer
const props = defineProps({
  toggleExpand: undefined,
  findTargetPath: undefined,
  reportInfoRow: {
    default: () => {
      return {};
    }
  },
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  },
  allDataRelations: {
    default: () => {
      return [];
    }
  },
  isBoldKey: {
    default: false
  },
  notExistRelations: {default: () => []}
});
const platformMappingStore = usePlatformMappingStore();

const rootRef = ref();
const assignModeTargetRef = ref(null);

const activeRelation = computed(() => {
  return platformMappingStore.activeRelation;
});
const hoveredRelations = computed(() => {
  return platformMappingStore.hoveredRelations;
});
const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const isChildAvailable = computed(() => {
  return type.value === "embedded" || type.value === "list" || (type.value === "map" && assignMode.value === "single");
});
const allRequestParams = computed(() => {
  return HelperModelling.allRequestParams(props.reportInfoRow, props.selectedEntityMapping.entityClass);
});
const allRelationClasses = computed(() => {
  if (props.allDataRelations) {
    const relation = props.allDataRelations.filter((el) => {
      const isSelected = HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.reportInfoRow.columnPath, HelperModelling.REGEX_TARGET);
      return isSelected;
    });
    if (relation.length > 0) {
      return relation.map((el) => encodeURIComponent(el.column.dstColumnPath));
    }
  }
  return [];
});
const countSelectedItems = computed(() => {
  if (allRelationClasses.value.length === 0) return 0;
  const relationsCount = props.allDataRelations.filter((el) => {
    return HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.reportInfoRow.columnPath, HelperModelling.REGEX_TARGET);
  }).length;

  let count = relationsCount;
  if (activeRelation.value && activeRelation.value.column.dstColumnPath === props.reportInfoRow.columnPath) count -= 1;
  return count;
});
const isSelected = computed(() => {
  return !!props.allDataRelations.find((el) => el.column.dstColumnPath === props.reportInfoRow.columnPath);
});
const isSelectedMeta = computed(() => {
  return !!props.selectedEntityMapping.metadata.find((el) => el.dstCyodaColumnPath === props.reportInfoRow.columnPath);
});
const columnMappingRelation = computed(() => {
  const selected = props.selectedEntityMapping.columns.find((el) => el.dstCyodaColumnPath == props.reportInfoRow.columnPath);
  if (selected) {
    return selected;
  }
  return false;
});
const columnMappingRelations = computed(() => {
  const selected = props.selectedEntityMapping.columns.filter((el) => el.dstCyodaColumnPath == props.reportInfoRow.columnPath);
  if (selected) {
    return selected;
  }
  return false;
});
const currentRelations = computed(() => {
  return props.allDataRelations.filter((el) => {
    return HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.reportInfoRow.columnPath, HelperModelling.REGEX_TARGET);
  });
});
const isCanBeDelete = computed(() => {
  return allRelationClasses.value.length > 0 && !activeRelation.value && relationsForRemove.value.length > 0;
});
const relationsForRemove = computed(() => {
  return currentRelations.value.filter((el) => el.type !== "functionalMappingInner");
});
const canBeSelectedByRelation = computed(() => {
  if (activeRelation.value && activeRelation.value.column && activeRelation.value.column.srcColumnPath && activeRelation.value.type === "columnMapping") {
    const srcCountAsterisk = activeRelation.value.column.srcColumnPath.split("*").length;
    const dstCountAsterisk = props.reportInfoRow.columnPath.split("*").length;
    if (srcCountAsterisk !== dstCountAsterisk) {
      return false;
    }
  }
  return true;
});
const type = computed(() => {
  const type: any = props.reportInfoRow.clazzType || props.reportInfoRow.type;
  if (type == "[B") {
    return "binary";
  }
  return type.split(".").pop().toLowerCase();
});
const requestParamsComputed = computed(() => {
  if (assignMode.value === "single") {
    return allRequestParamsSelected.map((el, index) => requestParamBind(el, index));
  }
  return allRequestParams.value.map((el, index) => requestParamBind(el, index));
});
const isNotHovered = computed(() => {
  if (isOpen.value && hoveredRelations.value && hoveredRelations.value.length > 0) {
    return true;
  }
  if (hoveredRelations.value && hoveredRelations.value.length > 0) {
    return !hoveredRelations.value.find((el: any) => {
      return HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.reportInfoRow.columnPath, HelperModelling.REGEX_TARGET);
    });
  }
  return false;
});
const element = computed(() => {
  let element = props.reportInfoRow;
  if (element.elementType) {
    element = element.elementType;
  }
  if (element.elementInfo) {
    element = element.elementInfo;
  }
  return element;
});
const isFunctionalMapping = computed(() => {
  const relation = props.allDataRelations.find((el) => el.column.dstColumnPath === props.reportInfoRow.columnPath);
  return (relation && relation.type === "functionalMapping") || false;
});
const isFunctionalMappingInner = computed(() => {
  const relation = props.allDataRelations.find((el) => el.column.dstColumnPath === props.reportInfoRow.columnPath);
  return (relation && relation.type === "functionalMappingInner") || false;
});
const isColumnMapping = computed(() => {
  const relation = props.allDataRelations.find((el) => el.column.dstColumnPath === props.reportInfoRow.columnPath);
  return (relation && relation.type === "columnMapping") || false;
});
const isCobiCoreMetadata = computed(() => {
  const relation = props.allDataRelations.find((el) => el.column.dstColumnPath === props.reportInfoRow.columnPath);
  return (relation && relation.type === "cobiCoreMetadata") || false;
});
const functionalMappingConfig = computed(() => {
  return props.selectedEntityMapping.functionalMappings && props.selectedEntityMapping.functionalMappings.find((el) => el.dstPath === props.reportInfoRow.columnPath);
});
const functionalMappingConfigRelations = computed(() => {
  return (functionalMappingConfig.value && functionalMappingConfig.value.statements.filter((el: any) => el.type === "SET_DST_VALUE")) || [];
});
const isColumnSetModesAvailable = computed(() => {
  let starCount = 0;

  currentRelations.value.forEach((currentRelation) => {
    starCount += currentRelation.column.dstColumnPath
      .split("")
      .map((el) => el === "*")
      .filter((el) => el).length;
  });
  return starCount > 0;
});
const isPathNotExist = computed(() => {
  return HelperMapper.checkIfPathNotExist(currentRelations.value, props.notExistRelations);
});
const allNotExistRelations = computed(() => {
  return (props.notExistRelations && props.notExistRelations.filter((el: any) => el.column.dstColumnPath === props.reportInfoRow.columnPath)) || [];
});
const isMapElement = computed(() => {
  return type.value === "map" && element.value.type === "LEAF";
});
const isMapElementEmbedded = computed(() => {
  return type.value === "map" && element.value.type === "EMBEDDED";
});
const isListElement = computed(() => {
  return type.value === "list" && element.value.type === "LEAF";
});
const isEmbeddedElement = computed(() => {
  return type.value === "list" && element.value.type === "EMBEDDED";
});
const isShowCircle = computed(() => {
  if (isMapElement.value && activeRelation.value && activeRelation.value.type === "columnMapping") return false;
  return (countSelectedItems.value > 0 && !isOpen.value) || !!activeRelation.value;
});

function setHoveredRelations(columns) {
  return platformMappingStore.setHoveredRelations(columns);
}

const circleRef = ref(null);

const targetDataRowDialogNotExistRelationsRef = ref(null);

const isOpen = ref<boolean>(false);

const {
  startHoverWithActiveLink,
  stopHoverWithActiveLink,
  isHoverWithActiveLink
} = useHoverWithActiveLinkMixin(activeRelation, isOpen);

const isSearchString = ref<boolean>(false);

const assignMode = ref<string>("multiple");

let allRequestParamsSelected = reactive([]);
let allElementsList = reactive([]);
const visibleTooltip = ref<boolean>(false);
checkAssignMode();

function onToggleOpen(event: any) {
  if (activeRelation.value && (isPathNotExist.value || activeRelation.value.direction === "fromTarget")) {
    setTimeout(() => {
      visibleTooltip.value = false;
    }, 10);
    return;
  }

  if (isMapElement.value && assignMode.value === "multiple" && activeRelation.value && activeRelation.value.type === "columnMapping") {
    return false;
  }

  if (activeRelation.value) {
    endDragLine();
    return false;
  }
  if (!isChildAvailable.value || event.target.classList.contains("circle")) {
    return false;
  }
  isOpen.value = !isOpen.value;

  if (props.toggleExpand) {
    eventBus.$emit("toggleExpandReset");
  }
  if (props.findTargetPath) {
    eventBus.$emit("findTargetPathReset");
  }
}

function endDragLine() {
  if (!isChildAvailable.value && activeRelation.value && canBeSelectedByRelation.value) {
    let circle = rootRef.value.querySelector(".circle");
    eventBus.$emit("endDragLine", {
      el: circle,
      path: props.reportInfoRow.columnPath,
      srcPath: activeRelation.value.column.srcColumnPath,
      clazzType: props.reportInfoRow.clazzType || props.reportInfoRow.type
    });
    setTimeout(() => {
      visibleTooltip.value = false;
    }, 10)
  }
}

function onReAssign() {
  setTimeout(() => {
    visibleTooltip.value = false;
  }, 10)
  const relations = JSON.parse(JSON.stringify(currentRelations.value));
  relations.forEach((el) => {
    el.direction = "fromSource";
  });
  eventBus.$emit("reassignRelations", relations);
}

function onDeleteRelation() {
  if (isCanBeDelete.value) {
    visibleTooltip.value = false;
    eventBus.$emit("removeRelation", relationsForRemove.value);
  }
}

function onStartRepair() {
  visibleTooltip.value = false;
  if (allNotExistRelations.value.length === 1) {
    const relation = allNotExistRelations.value.find((el) => el.column.dstColumnPath === props.reportInfoRow.columnPath);
    startDragLine(relation);
  } else {
    targetDataRowDialogNotExistRelationsRef.value.dialogVisible = true;
  }
}

async function startDragLine(relation) {
  eventBus.$emit("startDragLine", {
    el: circleRef.value,
    path: relation.column.dstColumnPath,
    type: relation.type,
    direction: "fromTarget",
    clazzType: props.reportInfoRow.clazzType || props.reportInfoRow.type,
    notExistRelation: relation
  });
  await nextTick();

  eventBus.$emit("updateRelations");
}

function onRepair(relation) {
  startDragLine(relation);
}

function onDeleteElementEmbedded(index: number, relations) {
  allRequestParamsSelected.splice(index, 1);
  if (isMapElementEmbedded.value) {
    const relationsDelete = relations.filter((el) => el.type !== "functionalMappingInner");
    eventBus.$emit("deleteRelations", relationsDelete);
  }
}

function onEditElementEmbedded(index: number) {
  assignModeTargetRef.value.dialogAssignModeElementRef.editExist(allRequestParamsSelected[index]);
}

function onDeleteElementList(index: number) {
  allElementsList.splice(index, 1);
}

function requestParamBind(requestParam: RequestParam, index: number) {
  const requestParamNew = JSON.parse(JSON.stringify(requestParam));
  if (type.value == "list") {
    if (assignMode.value == "single") {
      requestParamNew.columnPath = `${requestParamNew.baseColumnPath}.[${index}]@${requestParamNew.reportClass.replace(/\./g, "#")}`;
    } else {
      requestParamNew.columnPath = `${requestParamNew.baseColumnPath}.[*]@${requestParamNew.reportClass.replace(/\./g, "#")}`;
    }
  }
  return requestParamNew;
}

function checkAssignMode() {
  if (isListElement.value || isEmbeddedElement.value || isMapElementEmbedded.value) {
    const allDataRelations = props.allDataRelations.filter((el) => el.type !== "functionalMappingInner");
    const allDataRelationsPaths = allDataRelations.map((el) => el.column.dstColumnPath);
    const metaPaths = props.selectedEntityMapping.metadata.map((el) => el.dstCyodaColumnPath);

    for (const path of [...allDataRelationsPaths, ...metaPaths]) {
      const pathStar = path.replace(/\[\d{1,}\]/g, "[*]");
      let reg = new RegExp(`${HelperContent.escapeRegExp(props.reportInfoRow.columnPath)}\\.\\[(\\d{1,})\\]`);

      if (isMapElementEmbedded.value) {
        reg = new RegExp(`${HelperContent.escapeRegExp(props.reportInfoRow.columnPath)}\\.\\[([^\\]]*)\\]@([^.]*)\\.`);
      }

      const matches = path.match(reg);

      if (matches && matches.length > 1) {
        assignMode.value = "single";
        if (isEmbeddedElement.value) {
          if (matches && matches.length > 0) {
            allRequestParams.value.forEach((el: any) => {
              const requestParamPathStar = el.columnPath.replace(/\[\d{1,}\]/g, "[*]");

              if (pathStar.indexOf(requestParamPathStar) === 0 && !allRequestParamsSelected[matches[1]]) {
                allRequestParamsSelected[matches[1]] = el;
              }
            });
          }
          for (let emptyIndex = 0; allRequestParamsSelected.length > emptyIndex; emptyIndex++) {
            if (!allRequestParamsSelected[emptyIndex]) {
              allRequestParamsSelected[emptyIndex] = allRequestParams.value[0];
            }
          }
        } else if (isListElement.value) {
          if (allElementsList.find((el) => el.index == "*")) {
            allElementsList = [];
          }
          allElementsList.push({
            index: allElementsList.length
          });
        } else if (isMapElementEmbedded.value) {
          const computedClass = matches[2].replaceAll('#', '.');
          const existRequestParam = allRequestParams.value.find((el) => {
            return el.reportClass === computedClass
          });
          if (!existRequestParam) continue;

          const computedPath = `${props.reportInfoRow.columnPath}.[${matches[1]}]@${matches[2]}`
          const isExistSelcted = allRequestParamsSelected.find((el) => {
            return el.reportClass === computedClass && el.columnPath === computedPath;
          });
          if (!isExistSelcted) {
            const existRequestParamTmp = JSON.parse(JSON.stringify(existRequestParam));
            existRequestParamTmp.columnPath = computedPath;
            existRequestParamTmp.key = matches[1];
            allRequestParamsSelected.push(existRequestParamTmp);
          }
        }
      }
    }
  } else if (isMapElement.value && allElementsList.length === 0) {
    const allSelectedPaths = props.allDataRelations
      .map((el) => {
        if (HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.reportInfoRow.columnPath, HelperModelling.REGEX_TARGET)) {
          return el.column.dstColumnPath;
        }
      })
      .filter((el) => el);

    allSelectedPaths.forEach((path) => {
      const reg = new RegExp(`${HelperContent.escapeRegExp(props.reportInfoRow.columnPath)}\\.\\[([^\\]]*)\\]`);
      const matches = path.match(reg);

      if (matches && !allElementsList.find((el) => el.index === matches[1])) {
        assignMode.value = "single";
        allElementsList.push({index: matches[1]});
      }
    });
  }

  if (isListElement.value && allElementsList.length === 0) {
    allElementsList.push({index: "*"});
  }
}

function onOverRow() {
  if (allRelationClasses.value.length > 0 && !isOpen.value) {
    const columns = props.allDataRelations.filter((el) => allRelationClasses.value.indexOf(el.column.dstColumnPath) > -1);
    setHoveredRelations(columns);
  }
  if (isChildAvailable.value) {
    startHoverWithActiveLink();
  }
}

function onLeaveRow() {
  stopHoverWithActiveLink();
  if (allRelationClasses.value.length > 0) {
    setHoveredRelations([]);
  }
}

const slots = useSlots();

function hasSlot(name) {
  // return !!$slots[name] || !!$scopedSlots[name];
  return !!slots[name];
}

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

async function onCreatedAssignModeTarget() {
  isOpen.value = true;
  await nextTick();

  eventBus.$emit("updateRelations");
}

async function onChangedAssignModeTarget() {
  await nextTick();

  checkAssignMode();
  eventBus.$emit("updateRelations");
}

watch(
  () => props.toggleExpand,
  () => {
    if (countSelectedItems.value > 0 && isChildAvailable.value && (props.toggleExpand === true || props.toggleExpand === false)) {
      isOpen.value = props.toggleExpand;
    }
  },
  {immediate: true}
);

watch(
  () => props.findTargetPath,
  async () => {
    if (!props.findTargetPath) return;
    const isElementIsSelected = HelperModelling.isElementIsSelected(props.findTargetPath, props.reportInfoRow.columnPath, HelperModelling.REGEX_TARGET);

    if (isElementIsSelected && element.value.type !== "LEAF" && props.findTargetPath) {
      isOpen.value = true;
    }

    if (props.findTargetPath === props.reportInfoRow.columnPath) {
      await nextTick();

      rootRef.value.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "center"
      });
      addFlashLight();
      eventBus.$emit("findTargetPathReset");
    }
  },
  {immediate: true}
);

function addFlashLight() {
  isSearchString.value = true;
  setTimeout(() => {
    isSearchString.value = false;
  }, 2000);
}

watch(
  isOpen,
  async () => {
    await nextTick();

    eventBus.$emit("updateRelations");
  }
);

watch(isMapElementEmbedded, (value) => {
  if (value) assignMode.value = "single";
}, {immediate: true});

watch(
  isChildAvailable,
  (value) => {
    if (!value) isOpen.value = false;
  }
);
</script>

<style lang="scss">
.target-data-row {
  //background-color: #fff;

  .row {
    position: relative;
    display: inline-flex;
    min-width: 100%;
    padding: 10px 10px 10px 30px;
    align-items: center;
    height: 40px;
    border-top: 1px solid #dedede;
    border-bottom: 1px solid #dedede;
    margin-bottom: -1px;

    &.selectable {
      .wrap-key {
        span {
          font-weight: bold;
        }
      }
    }

    .type {
      margin-left: auto;

      &.actions-exist {
        margin-left: 10px;
      }
    }

    .wrap-key {
      margin-right: 15px;
      //min-width: 200px;
      display: flex;
      align-items: center;
    }

    .icon {
      margin-right: 10px;
      transition: transform 0.5s;

      &.is-open {
        transform: rotate(90deg);
      }
    }

    .circle {
      position: absolute;
      left: -9px;
      min-width: 18px;
      white-space: nowrap;
      height: 18px;
      border-radius: 10px;
      top: 9px;
      border: 2px solid #858484;
      opacity: 0;
      transition: all 0.5s;
      background-color: #fff;
      font-size: 13px;
      text-align: center;
      line-height: 14px;

      &.selected {
        background-color: #858484;
        opacity: 1;
        cursor: pointer;
      }

      &.is-show-group-class {
        border: 2px dotted #858484;
        background-color: #fff;
        opacity: 1;
      }

      &.column-mapping {
        background-color: #67c23a;
        border-color: #67c23a;
      }

      &.functional-mapping {
        background-color: #e6a23c;
        border-color: #e6a23c;
      }

      &.cobi-core-metadata {
        background-color: #409eff;
        border-color: #409eff;
      }

      &.path-not-exist {
        background-color: #f56c6c !important;
        border-color: #f56c6c !important;
      }

      &.path-not-exist-child-available {
        border-color: #f56c6c !important;
      }
    }

    &.selectable {
      padding-left: 15px;

      &:hover {
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

      &:after {
        border-bottom: 1px solid transparent;
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

    &.is-not-hovered .circle {
      &.selected,
      &.is-show-group-class {
        opacity: 0.2;
      }
    }
  }

  .row-elements {
    margin-left: 15px;
  }

  .can-not-be-selected-by-relation {
    opacity: 0.5;

    .circle {
      display: none;

      &.selected,
      &.is-show-group-class {
        display: block;
      }
    }
  }

  .default-cursor {
    cursor: default !important;
  }

  .functional_mapping_config_relations_length {
    font-size: 12px;
    color: #9f9f9f;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      text-decoration: none;
    }
  }

  .is-search-string {
    animation: isSearchString 2s infinite;
    animation-iteration-count: 1;
  }

  .is-bold-key {
    font-weight: bold;
  }

  .pull-right {
    margin-left: auto;
  }
}

.popover-actions .action {
  padding: 10px 0;
}
</style>
