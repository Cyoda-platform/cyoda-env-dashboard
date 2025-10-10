<template>
  <div class="data-mapper" :class="{ 'is-active-drag': activeLine }">
    <ActiveRelationInformation/>
    <template v-if="isSaveButtonTouched && listOfNotCorrectRelations.length > 0">
      <el-alert class="alert-box" title="Error" type="error" :closable="false" show-icon>
        Please open relation and fix error for:
        <ol>
          <li v-for="(relation, index) in listOfNotCorrectRelations" :key="index" class="error-transform">
            <template v-if="relation.type === 'columnMapping'">
              {{ relation.column.srcColumnPath }} -> {{ shortNamePath(relation.column.dstCyodaColumnPath) }} output type
              must be {{ relation.column.dstCyodaColumnPathType.split(".").pop() }}
              <ColumnMappingSettings ref="columnMappingSettings" :column="relation.el.column"/>
            </template>
            <template v-else-if="relation.type === 'functionalMapping'">
              Error in Functional Mapping for target field "{{ shortNamePath(relation.el.dstPath) }}"
              <FunctionalMappingSettings :functionalMappingConfig="relation.el"/>
            </template>
          </li>
        </ol>
      </el-alert>
    </template>

    <template v-if="notExistRelations && notExistRelations.length > 0">
      <DataMapperNotExistRelations @delete="deleteRelation" :notExistRelations="notExistRelations"/>
    </template>

    <el-divider class="divider"/>
    <div class="body">
      <div class="mapping-navigaton">
        <div v-if="false" class="legend">
          <div class="box column-mapping"><span>Column Mapping</span> <span class="line"></span></div>
          <div class="box functional-mapping"><span>Functional Mapping</span> <span class="line"></span></div>
          <div class="box functional-mapping-inner"><span>Functional Mapping Dst Path</span> <span class="line"></span>
          </div>
        </div>
        <div ref="actionsRef" class="mapping-navigaton-actions">
          <div>
            <el-button @click="expandAll" type="success">
              Expand All
              <font-awesome-icon icon="chevron-down"/>
            </el-button>
          </div>
          <div>
            <el-button @click="collapseAll" type="success">
              Collapse All
              <font-awesome-icon icon="chevron-up"/>
            </el-button>
          </div>
          <div>
            <NavigationEntity ref="navigationEntityRef" @change="onEntityMappingChangeNavigation"
                              :dataMappingConfigDto="dataMappingConfigDto"/>
          </div>
          <div v-if="selectedEntityMapping">
            <el-button @click="editEntity(selectedEntityMapping)" type="primary">
              <font-awesome-icon icon="pencil-alt"/>
            </el-button>
          </div>
          <template v-if="isCanBeUploadedFile">
            <div>
              <el-button :disabled="isDisableDeleteEntity" @click="deleteEntity(selectedEntityMapping)" type="danger">
                <font-awesome-icon icon="trash"/>
              </el-button>
            </div>
            <div class="wrap-add-entity">
              <el-button @click="onAddEntity" type="primary">Add Entity</el-button>
            </div>
            <div class="wrap-search-path">
              <el-button @click="onSearchPaths" type="primary">
                <font-awesome-icon icon="magnifying-glass"/>
              </el-button>
            </div>
            <div v-if="!isVirtual && dataMappingConfigDto.id" class="wrap-history">
              <CyodaHistory :dataDto="dataMappingConfigDto" :getHistory="getHistory"
                            :getHistoryByTimeUid="getHistoryByTimeUid"/>
            </div>
          </template>
        </div>
      </div>
      <div class="flex">
        <div class="col-data col-data-source col-data-source-header">
          <div class="wrap-title">
            <h2>Source</h2>
            <template v-if="isRootElementIsArray">
              <AssignMode v-model="assignMode" :allDataRelations="allDataRelationsCurrent"
                          :selectedEntityMapping="selectedEntityMapping" :isRoot="true"/>
            </template>
            <template v-if="isShowToggleJs">
              <font-awesome-icon
                @click="onClickToggleToScript"
                class="settings-data-mapper"
                :icon="['fab', 'js']"
                :class="{
                    error: !isAllToScriptExists,
                    success: isAllToScriptExists
                  }"
              />
            </template>
          </div>
          <div v-if="dataMappingConfigDto.sampleContent">
            <span v-if="isCanBeUploadedFile">
            <el-tooltip :show-after="500" class="item" effect="dark" content="Edit content" placement="top">
              <el-button size="default" @click="onClickOpenFile" type="primary">
                <font-awesome-icon icon="file-code"/>
              </el-button>
            </el-tooltip>

            <el-tooltip :show-after="500" class="item" effect="dark" content="Upload new file" placement="top">
              <el-button size="default" @click="onUploadFileSample">
                <font-awesome-icon icon="upload"/>
              </el-button>
            </el-tooltip>

            <el-tooltip v-if="dataMappingConfigDto.dataType === 'CSV'" :show-after="500" class="item" effect="dark"
                        content="Csv Settings" placement="top">
              <el-button size="default" @click="onEditSettingsCsv">
                <font-awesome-icon :icon="['fas', 'file-csv']"/>
              </el-button>
            </el-tooltip>
            </span>

            <el-tooltip :show-after="500" class="item" effect="dark" content="Edit script file" placement="top">
              <el-button class="edit-script-file" size="default"
                         @click="onClickOpenScriptEditor" type="success">
                <font-awesome-icon :icon="['fab', 'js']"/>
              </el-button>
            </el-tooltip>
          </div>
        </div>
        <div v-if="selectedEntityMapping" class="col-data col-data-target">
          <h2>Target</h2>
          <h2 class="col-data-target-entity-title">
            <small>Entity:</small>
            <el-badge :hidden="!isFilterEnabled" value="Filter" type="warning">
              &nbsp;{{ entityClassNameTitle }}
            </el-badge>
          </h2>
        </div>
      </div>
      <div ref="canvasRef" class="content"
           @mousemove="onMouseMoveThrottle($event)">
        <div class="flex">
          <div class="col-data source-data-column">
            <div class="sticky">
              <template v-if="sourceDataComputed && Object.keys(sourceDataComputed).length > 0">
                <SourceData :key="updateSourceDataKey" :allDataRelations="allDataRelationsCurrent"
                            :toggleExpand="toggleExpand"
                            :findSourcePath="findSourcePath" :parentTypeOfData="isRootElementIsArray ? 'array' : null"
                            :level="0" :assignMode="assignMode" :data="sourceDataComputed"
                            ref="sourceDataRef"
                            :selectedEntityMapping="selectedEntityMapping" :notExistRelations="notExistRelations"/>
              </template>
              <template v-else>
                <el-empty>
                  <template #description>
                    Data not found. Perhaps an incorrect path to the data is specified in the
                    <strong>Source Relative Root Path</strong> field. Please change the value.
                  </template>
                  <el-button @click="editEntity(selectedEntityMapping)" type="primary">
                    Entity Settings
                    <font-awesome-icon icon="pencil-alt"/>
                  </el-button>
                </el-empty>
              </template>
              <MetaParams v-if="metaParams && metaParams.length > 0" :metaParams="metaParams"
                          :allDataRelations="allDataRelationsCurrent" :selectedEntityMapping="selectedEntityMapping"
              />
              <div class="empty"></div>
            </div>
          </div>
          <svg
            id="canvas"
            width="100%"
            height="100%"
            :class="{
              'active-relation': activeRelation
            }"
          ></svg>
          <div class="col-data target-data-column">
            <TargetData v-if="selectedEntityMapping" :key="selectedEntityMapping.id.uiId"
                        v-loading="isLoadingTargetData"
                        :allDataRelations="allDataRelationsCurrent" :toggleExpand="toggleExpand"
                        :findTargetPath="findTargetPath" :noneMappingFields="noneMappingFields" class="target-data"
                        @loaded="onLoadedTargetData" :selectedEntityMapping="selectedEntityMapping"
                        :notExistRelations="notExistRelations"/>
          </div>
        </div>
      </div>
    </div>
    <DialogDeleteRelations ref="dialogDeleteRelationsRef" @delete="onDeleteRelationDialog"
                           @deleteList="onDeleteRelationsListDialog"
                           :selectedDataRelations="selectedDataRelationsForRemove"/>
    <DialogContentEditor @beforeSave="onBeforeSaveDialogContentEditor" ref="dialogContentEditorRef"/>
    <DialogContentScriptEditor ref="dialogContentScriptEditorRef" :chatBotId="chatBotId"/>
    <DialogUploadFile @save="onSaveDialogUploadFile" @openCSVSettings="openCSVSettings"
                      :dataMappingConfigDto="dataMappingConfigDto" ref="dialogUploadFileRef"/>

    <DialogCSVSettings @save="saveCSVSettings" ref="dialogCSVSettingsRef"/>

    <DialogEntityMapping :dataMappingConfigDto="dataMappingConfigDto" @save="onSaveEntity" @edit="onEditEntity"
                         :sourceData="sourceData" :noneMappingFields="noneMappingFields" ref="dialogEntityMappingRef"/>

    <DialogSearchPaths :selectedEntityMapping="selectedEntityMapping" :allDataRelations="allDataRelationsCurrent"
                       ref="dialogSearchPathsRef"/>

    <CyodaPopover ref="cyodaPopoverRef"/>
  </div>
</template>

<script setup lang="ts">
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import {ElNotification, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {
  ref,
  nextTick,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance, reactive
} from "vue";

import SourceData from "./SourceData/SourceData.vue";
import TargetData from "./TargetData/TargetData.vue";
import {SVG} from "@svgdotjs/svg.js";
import DialogDeleteRelations from "./DialogDeleteRelations.vue";
import _ from "lodash";

import DialogUploadFile from "../../components/DataMapper/DialogUploadFile.vue";
import HelperContent from "../../helpers/HelperContent";
import DialogContentEditor from "../../components/DataMapper/DialogContentEditor.vue";
import DialogContentScriptEditor from "../../components/DataMapper/DialogContentScriptEditor.vue";
import HelperMapper from "../../helpers/HelperMapper";
import HelperFormat from "../../helpers/HelperFormat";
import AssignMode from "../../components/DataMapper/AssignMode.vue";
import ColumnMappingSettings from "../../components/DataMapper/ColumnMappingSettings/ColumnMappingSettings.vue";
import FunctionalMappingSettings
  from "../../components/DataMapper/FunctionalMappingSettings/FunctionalMappingSettings.vue";
import DialogEntityMapping from "../../components/DataMapper/DialogEntityMapping.vue";
import NavigationEntity from "../../components/DataMapper/NavigationEntity.vue";
import type {
  ColumnMappingConfigDto,
  EntityMappingConfigDto,
  MappingConfigDto
} from "../../components/DataMapper/MappingConfigDto";
import ActiveRelationInformation from "../../components/DataMapper/ActiveRelationInformation.vue";
import CyodaPopover from "./CyodaPopover.vue";
import DialogCSVSettings from "./DialogCSVSettings.vue";
import DataMapperNotExistRelations from "./DataMapperNotExistRelations.vue";
import MetaParams from "./MetaParams/MetaParams.vue";
import DialogSearchPaths from "./DialogSearchPaths.vue";
import CyodaHistory from "../CyodaHistory/CyodaHistory.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useChatbotStore} from "@cyoda/ui-lib/src/stores/chatbot";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const actionsRef = ref(null);
const canvasRef = ref(null);
const updateSourceDataKey = ref(0);
const sourceDataRef = ref(null);

const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  },
  action: {default: null},
  isSaveButtonTouched: {
    default: false
  },
  sourceData: undefined,
  noneMappingFields: {default: () => []},
  isChatBotReady: {
    default: false
  },
  chatBotId: {
    default: null
  },
});
const route = useRoute();
const platformMappingStore = usePlatformMappingStore();
const {getHistory, getHistoryByTimeUid} = platformMappingStore;
const listAllTransformers = computed(() => {
  return platformMappingStore.listAllTransformers;
});
const activeRelation = computed(() => {
  return platformMappingStore.activeRelation;
});
const hoveredRelations = computed(() => {
  return platformMappingStore.hoveredRelations;
});
const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const reassignRelation = computed(() => {
  return platformMappingStore.reassignRelation;
});
const sourceDataComputed = computed(() => {
  return sourceDataComputedFn(sourceDataComputedRoot.value, selectedEntityMapping.value, props.dataMappingConfigDto);
});
const sourceDataComputedRoot = computed(() => {
  if (selectedEntityMapping.value.isPolymorphicList) {
    return JSON.parse(JSON.stringify(props.sourceData));
  }
  return HelperMapper.addMissingFieldsToAllObjects(JSON.parse(JSON.stringify(props.sourceData)));
});
const isRootElementIsArray = computed(() => {
  return Array.isArray(sourceDataComputed.value);
});
const allDataRelations = computed(() => {
  return HelperMapper.allDataRelations(props.dataMappingConfigDto, activeRelation.value);
});
const isVirtual = computed(() => {
  return route.query.virtual === "true";
});
const allDataRelationsCurrent = computed(() => {
  return HelperMapper.getAllDataRelationsForSelectedEntity(allDataRelations.value, selectedEntityMapping.value);
});
const listOfNotCorrectRelations = computed(() => {
  const columnMappingErrors = allDataRelations.value
    .map((el) => {
      if (HelperMapper.isColumnHaveTransformError(el.column, listAllTransformers.value)) {
        return {
          type: "columnMapping",
          el
        };
      }
    })
    .filter((el) => el);

  const functionalMappingErrors = selectedEntityMapping.value.functionalMappings
    .map((el) => {
      if (HelperMapper.isFunctionalMappingRelationHaveError(el)) {
        return {
          type: "functionalMapping",
          el
        };
      }
    })
    .filter((el) => el);
  return [...columnMappingErrors, ...functionalMappingErrors];
});
const selectedEntityMapping = computed(() => {
  return props.dataMappingConfigDto.entityMappings[selectedEntityMappingIndex.value];
});

const entityClassNameTitle = computed(() => {
  return HelperEntities.getShortNameOfEntity(selectedEntityMapping.value.entityClass);
});

const isChatBotEnabled = computed(() => {
  return HelperFeatureFlags.isChatBotEnabled();
})

const isFilterEnabled = computed(() => {
  return selectedEntityMapping.value.entityFilter && selectedEntityMapping.value.entityFilter.conditions.length > 0;
});
const isDisableDeleteEntity = computed(() => {
  return selectedEntityMappingIndex.value == 0;
});
const isCanBeUploadedFile = computed(() => {
  return HelperMapper.isCanBeUploadedFile(dataType.value);
});
const notExistRelations = computed(() => {
  return HelperContent.getNotExistRelations(
    allDataRelationsCurrent.value,
    sourceDataComputedRoot.value,
    selectedEntityMapping.value,
    props.dataMappingConfigDto,
    notExistPaths.value,
  );
});

function getListAllTransformers() {
  return platformMappingStore.getListAllTransformers();
}

function setActiveRelation(value) {
  return platformMappingStore.setActiveRelation(value);
}

function setReassignRelation(value) {
  return platformMappingStore.setReassignRelation(value);
}

function setSourceDataComputed(val) {
  return platformMappingStore.setSourceDataComputed(val);
}

function setHoveredRelations(relations) {
  return platformMappingStore.setHoveredRelations(relations);
}

function getListAllCobiMetaParams() {
  return platformMappingStore.getListAllCobiMetaParams();
}

// function getHistory() {
//   return platformMappingStore.getHistory;
// }
//
// function getHistoryByTimeUid() {
//   return platformMappingStore.getHistoryByTimeUid;
// }
const asRef = ref(null);

const dialogDeleteRelationsRef = ref(null);

const dialogEntityMappingRef = ref(null);

const dialogUploadFileRef = ref(null);

const dialogContentEditorRef = ref(null);

const dialogContentScriptEditorRef = ref(null);

const navigationEntityRef = ref(null);

const cyodaPopoverRef = ref(null);

const dialogCSVSettingsRef = ref(null);

const dialogSearchPathsRef = ref(null);
const notExistPaths = ref([]);

const selectedEntityMappingIndex = ref(0);
const activeLine = ref(null);
const activeSvgBox = ref(null);
const startEl = ref(null);
const requestClass = ref<string>("");
const assignMode = ref<string>("multiple");
const toggleExpand = ref(null);
const findSourcePath = ref(null);
const findTargetPath = ref(null);
let metaParams = ref([]);
const chatbotStore = useChatbotStore();
const isLoadingTargetData = ref(false);

const isPolymorphicList = ref<boolean>(false);

const updateRelationsTimeout = ref(null);
const applyHoverRelationsTimeout = ref(null);

let selectedDataRelationsForRemove = ref([]);

function onClickOpenFile() {
  dialogContentEditorRef.value.content = HelperContent.prettyContent(props.dataMappingConfigDto.sampleContent);
  dialogContentEditorRef.value.dialogVisible = true;
}

function onClickOpenScriptEditor() {
  dialogContentScriptEditorRef.value.openDialog(selectedEntityMapping.value, props.dataMappingConfigDto, selectedEntityMappingIndex.value);
}

async function onBeforeSaveDialogContentEditor(content: any) {
  if (props.dataMappingConfigDto.dataType === "CSV" && props.dataMappingConfigDto.parserParameters.withHeader) {
    const newSourceData = HelperContent.parseCsv(props.dataMappingConfigDto, content);
    const oldSourceData = HelperContent.parseCsv(props.dataMappingConfigDto);
    const newSourceDataHeaders = Object.keys(newSourceData[0]);
    const oldSourceDataHeaders = Object.keys(oldSourceData[0]);

    const mapHeaders = {};
    props.dataMappingConfigDto.parserParameters.headers.forEach((el, index) => {
      mapHeaders[el] = oldSourceDataHeaders[index];
    });

    const newParserParametersHeaders = {};
    newSourceDataHeaders.forEach((el) => {
      if (mapHeaders[el]) {
        newParserParametersHeaders[el] = mapHeaders[el];
      } else {
        newParserParametersHeaders[el] = el;
      }
    });
    props.dataMappingConfigDto.parserParameters.headers = Object.values(newParserParametersHeaders);
  }

  props.dataMappingConfigDto.sampleContent = HelperContent.compactContent(content, props.dataMappingConfigDto);
  dialogContentEditorRef.value.dialogVisible = false;
  dialogContentEditorRef.value.content = "";
  await nextTick();

  updateRelations();
}

function sourceDataComputedFn(sourceData, selectedEntityMapping, dataMappingConfigDto) {
  if (selectedEntityMapping) {
    const path = HelperMapper.transformPathToJs(HelperMapper.getFullPathForEntity(selectedEntityMapping, dataMappingConfigDto));
    if (path) {
      sourceData = HelperMapper.transformDataForSeveralSrcRelativeRootPath(selectedEntityMapping, dataMappingConfigDto, sourceData);
      return _.get(sourceData, path) || {};
    }
  }
  return sourceData;
}

loadListTransformers();
loadMetaParams();
eventBus.$on("startDragLine", startDragLine);
eventBus.$on("endDragLine", endDragLine);
eventBus.$on("removeRelation", removeRelation);
eventBus.$on("updateRelations", updateRelations);
eventBus.$on("removeRelationsForNestedPaths", removeRelationsForNestedPaths);

eventBus.$on("deleteAllRelations", deleteAllRelations);
eventBus.$on("stopRelation", stopRelation);
eventBus.$on("deleteRelations", deleteRelations);
eventBus.$on("toggleExpandReset", toggleExpandReset);

eventBus.$on("findSourcePath", findSourcePathFn);
eventBus.$on("findSourcePathReset", findSourcePathReset);
eventBus.$on("findTargetPath", findTargetPathFn);
eventBus.$on("findTargetPathReset", findTargetPathReset);
eventBus.$on("reassignRelations", reassignRelations);
eventBus.$on("restoreContent", onClickOpenFile);
eventBus.$on("clearAllNotExistRelations", clearAllNotExistRelations);
eventBus.$on("updateSourceDataKey", updateSourceDataKeyFn);

validatePaths();

async function validatePaths() {
  const dstColumnPaths = allDataRelations.value.filter((el) => el.column).map((el) => el.column.dstColumnPath);
  const {data} = await platformMappingStore.validatePaths(selectedEntityMapping.value.entityClass, dstColumnPaths);
  notExistPaths.value = data.notExistPaths;
}

let scrollEl: any = null;
if (props.action === "create:popup") {
  scrollEl = document.querySelector(".dialog-create-data-mapping");
} else {
  scrollEl = window;
}
const onMouseMoveThrottle = _.throttle(onMouseMove);
const onDocumentScrollThrottle = _.throttle(onDocumentScroll);

scrollEl.addEventListener("scroll", onDocumentScrollThrottle, {passive: true});
setActiveRelation(null);
checkAssignMode();

onMounted(() => {
  document.addEventListener("click", documentClick);
  if (canvasRef.value) new ResizeObserver(onResizeCanvas).observe(canvasRef.value);
});

async function loadMetaParams() {
  const {data} = await getListAllCobiMetaParams();
  metaParams.value = data;
}

onBeforeUnmount(() => {
  eventBus.$off("startDragLine", startDragLine);
  eventBus.$off("endDragLine", endDragLine);
  eventBus.$off("removeRelation", removeRelation);
  eventBus.$off("updateRelations", updateRelations);
  eventBus.$off("removeRelationsForNestedPaths", removeRelationsForNestedPaths);
  eventBus.$off("deleteAllRelations", deleteAllRelations);
  eventBus.$off("deleteRelations", deleteRelations);
  eventBus.$off("toggleExpandReset", toggleExpandReset);
  eventBus.$off("findSourcePath", findSourcePathFn);
  eventBus.$off("findSourcePathReset", findSourcePathReset);
  eventBus.$off("findTargetPathPath", findTargetPathFn);
  eventBus.$off("findTargetPathReset", findTargetPathReset);
  eventBus.$off("reassignRelations", reassignRelations);
  eventBus.$off("restoreContent", onClickOpenFile);
  eventBus.$off("clearAllNotExistRelations", clearAllNotExistRelations);
  eventBus.$off("updateSourceDataKey", updateSourceDataKeyFn);
  window.removeEventListener("scroll", onDocumentScrollThrottle);
  document.removeEventListener("click", documentClick);
});

function documentClick(event) {
  if (!actionsRef.value.contains(event.target) && toggleExpand.value) {
    toggleExpand.value = null;
  }
}

async function loadListTransformers() {
  getListAllTransformers();
}

function startDragLine({
                         el,
                         path,
                         jsonPath,
                         type,
                         direction = "fromSource",
                         clazzType = null,
                         notExistRelation = null
                       }: {
  el: any;
  path: string;
  jsonPath: string;
  type: string;
  direction: "fromSource" | "fromTarget";
  clazzType: null | string;
  notExistRelation: any
}) {
  activeSvgBox.value = makeSvgBox();
  activeLine.value = makeNewLine(type);
  activeLine.value.attr("data-active-relation", "true");
  activeSvgBox.value.add(activeLine.value);
  setStartPoint(el, activeLine.value, direction);
  startEl.value = el;
  let column = {
    srcColumnPath: path,
    dstColumnPath: "",
    jsonPath
  };
  if (direction === "fromTarget") {
    column = {
      srcColumnPath: "",
      jsonPath: "",
      dstColumnPath: path
    };
  }
  setActiveRelation({
    column,
    type,
    direction,
    clazzType,
    notExistRelation,
    jsonPath
  });
}

function makeSvgBox() {
  return SVG().addTo("#canvas").group();
}

function makeNewLine(type: null | string = null, width = 2) {
  let stroke = HelperMapper.COLOR_RELATION_DEFAULT;
  if (type === "columnMapping") {
    stroke = HelperMapper.COLOR_RELATION_COLUMN_MAPPING;
  } else if (type === "functionalMapping") {
    stroke = HelperMapper.COLOR_RELATION_FUNCTIONAL_MAPPING;
  } else if (type === "cobiCoreMetadata") {
    stroke = HelperMapper.COLOR_RELATION_CORE_METADATA;
  }
  return SVG().path().attr("stroke-width", width).attr("stroke", stroke).attr("stroke-miterlimit", 10).attr("pointer-events", "stroke").attr("fill", "transparent").addClass(`line type-${type}`);
}

function getInvisibleLineFromActiveLine(activeLine: any) {
  return activeLine.node.closest("g").querySelector(".invisible-line");
}

function makeInvisibleLineForLine() {
  let invisibleLine = makeNewLine(null, 10);
  invisibleLine.attr("visibility", "hidden");
  invisibleLine.attr("class", "invisible-line");
  return invisibleLine;
}

function addEventListenerForInvisibleLine(invisibleLine) {
  SVG(invisibleLine).on("click", (e) => {
    if (activeRelation.value) return;

    cyodaPopoverRef.value.event = e;
    cyodaPopoverRef.value.isShow = true;
  });

  SVG(invisibleLine).on("mouseover", function () {
    if (activeRelation.value) return;

    const line = this.node.closest("g").querySelector(".line");
    const allRelationLinks = JSON.parse(line.dataset.allRelationLinks);

    const relations = allDataRelationsCurrent.value.filter((el) => {
      return allRelationLinks.find((relationLink) => {
        return el.column.srcColumnPath === relationLink.srcColumnPath && el.column.dstColumnPath === relationLink.dstColumnPath;
      });
    });
    setHoveredRelations(relations);
  });
  SVG(invisibleLine).on("mouseleave", () => {
    if (activeRelation.value) return;
    setHoveredRelations([]);
  });
}

function setStartPoint(el: any, activeLine: any, direction = "fromSource") {
  const canvasPos = document.getElementById("canvas").getBoundingClientRect();
  const circlePosition = el.getBoundingClientRect();
  const circleHeight = el.offsetHeight / 2 + 1;
  const x1 = direction === "fromTarget" ? circlePosition.left - canvasPos.left : circlePosition.right - canvasPos.left;
  activeLine.attr("x1", x1).attr("y1", circlePosition.top + circleHeight - canvasPos.top);
}

async function endDragLine({el, path, srcPath, clazzType, jsonPath}: {
  el: any;
  path: string;
  srcPath: string;
  clazzType: string;
  jsonPath: string
}) {
  if (reassignRelation.value) {
    if (reassignRelation.value.direction === "fromSource") {
      HelperMapper.updateOldToNewFieldsInObj(selectedEntityMapping.value, [reassignRelation.value.column.dstColumnPath], [path]);
    } else {
      HelperMapper.updateOldToNewFieldsInObj(selectedEntityMapping.value, [reassignRelation.value.column.srcColumnPath], [srcPath]);
      HelperMapper.updateOldJsonPathsToNewFieldsInObj(selectedEntityMapping.value, [reassignRelation.value.column.jsonPath], [jsonPath]);
    }
    setReassignRelation(null);

    activeLine.value = null;
    activeSvgBox.value = null;
    startEl.value = null;
    setActiveRelation(null);
    await nextTick();

    updateRelations();

    return;
  }
  setEndPoint(el, activeLine.value);
  let invisibleLine = makeInvisibleLineForLine();
  activeSvgBox.value.add(invisibleLine);
  invisibleLine.attr("d", activeLine.value.attr("d"));

  if (activeRelation.value && activeRelation.value.notExistRelation) {
    if (activeRelation.value.notExistRelation.isNotExistSrc) {
      HelperMapper.updateOldToNewFieldsInObj(selectedEntityMapping.value, [activeRelation.value.notExistRelation.column.srcColumnPath], [srcPath], ["dstCyodaColumnPath", "dstColumnPath", "jsonPath"]);
      const exist = selectedEntityMapping.value.cobiPathsRelations.find((el) => {
        return el.srcColumnPath === srcPath && el.dstColumnPath === activeRelation.value.notExistRelation.column.dstColumnPath;
      });
      if (exist) exist.jsonPath = jsonPath;
    } else {
      HelperMapper.updateOldToNewFieldsInObj(selectedEntityMapping.value, [activeRelation.value.notExistRelation.column.dstColumnPath], [path]);
    }

    activeLine.value = null;
    activeSvgBox.value = null;
    startEl.value = null;
    setActiveRelation(null);
    updateRelations();
    return;
  }

  if (activeRelation.value.type === "columnMapping") {
    const isExistColumn = selectedEntityMapping.value.columns.find((el) => el.dstCyodaColumnPath == path && el.srcColumnPath == srcPath);
    if (isExistColumn) {
      try {
        await warningMessageForExistRelations(() => {
          deleteRelationByColumn(isExistColumn);
        });
      } catch (e) {
        return;
      }

      await nextTick();

      updateRelations();
    }

    if (selectedEntityMapping.value.cobiCoreMetadata.length > 0) {
      selectedEntityMapping.value.cobiCoreMetadata = selectedEntityMapping.value.cobiCoreMetadata.filter((el) => el.dstCyodaColumnPath !== path);
      await nextTick();

      updateRelations();
    }

    const functionalMappings = selectedEntityMapping.value.functionalMappings.filter((el) => el.dstPath == path);
    if (functionalMappings.length > 0) {
      try {
        await warningMessageForExistRelations(() => {
          functionalMappings.forEach((functionalMapping) => {
            selectedEntityMapping.value.functionalMappings = selectedEntityMapping.value.functionalMappings.filter((el) => el !== functionalMapping);
          });
        });
      } catch (e) {
        return;
      }
      await nextTick();

      updateRelations();
    }
    const columnMapping: ColumnMappingConfigDto = reactive({
      srcColumnPath: activeRelation.value.column.srcColumnPath,
      dstCyodaColumnPath: path,
      dstCyodaColumnPathType: clazzType,
      dstCollectionElementSetModes: [],
      transformer: {
        type: "COMPOSITE",
        children: []
      }
    });
    addAutomaticTransformers(columnMapping);
    selectedEntityMapping.value.columns.push(columnMapping);
  } else if (activeRelation.value.type === "functionalMapping") {
    const isExistColumns = selectedEntityMapping.value.columns.filter((el) => el.dstCyodaColumnPath == path);
    if (isExistColumns.length > 0) {
      try {
        await warningMessageForExistRelations(() => {
          isExistColumns.forEach((isExistColumn) => deleteRelationByColumn(isExistColumn));
        });
      } catch (e) {
        return;
      }
      await nextTick();

      updateRelations();
    }

    let metaPaths = selectedEntityMapping.value.cobiCoreMetadata.filter((el) => el.dstCyodaColumnPath === path).map((el) => el.name);
    if (metaPaths.length > 0) {
      selectedEntityMapping.value.cobiCoreMetadata = selectedEntityMapping.value.cobiCoreMetadata.filter((el) => !metaPaths.includes(el.name));
      await nextTick();

      updateRelations();
    }

    const isExistColumnFunctionalMapping = selectedEntityMapping.value.functionalMappings.find((el) => el.dstPath == path && el.srcPaths.includes(srcPath));
    if (isExistColumnFunctionalMapping) {
      try {
        await warningMessageForExistRelations(() => {
          deleteRelationByColumn(isExistColumnFunctionalMapping);
        });
      } catch (e) {
        return;
      }
      await nextTick();

      updateRelations();
    }

    let functionalMapping = selectedEntityMapping.value.functionalMappings.find((el) => el.dstPath === path);
    if (functionalMapping) {
      if (!functionalMapping.srcPaths.includes(activeRelation.value.column.srcColumnPath)) {
        functionalMapping.srcPaths.push(activeRelation.value.column.srcColumnPath);
      }
    } else {
      functionalMapping = {
        "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto",
        srcPaths: [activeRelation.value.column.srcColumnPath],
        name: null,
        statements: [],
        dstPath: path,
        collectElemsSetModes: [],
        metaPaths: []
      };

      selectedEntityMapping.value.functionalMappings.push(functionalMapping);
    }
  } else if (activeRelation.value.type === "cobiCoreMetadata") {
    if (!selectedEntityMapping.value.cobiCoreMetadata) selectedEntityMapping.value.cobiCoreMetadata = [];

    if (selectedEntityMapping.value.columns.length > 0) {
      selectedEntityMapping.value.columns = selectedEntityMapping.value.columns.filter((el) => el.dstCyodaColumnPath !== path);
      await nextTick();

      updateRelations();
    }

    let functionalMapping = selectedEntityMapping.value.functionalMappings.find((el) => el.dstPath === path);

    if (functionalMapping) {
      selectedEntityMapping.value.functionalMappings = selectedEntityMapping.value.functionalMappings.filter((el) => el.dstPath !== path);
      await nextTick();

      updateRelations();
    }

    const isExistColumns = selectedEntityMapping.value.cobiCoreMetadata.filter((el) => el.dstCyodaColumnPath === path);

    if (isExistColumns.length > 0) {
      selectedEntityMapping.value.cobiCoreMetadata = selectedEntityMapping.value.cobiCoreMetadata.filter((el) => el.dstCyodaColumnPath !== path);
      await nextTick();

      updateRelations();
    }

    const cobiCoreMetadata = {
      name: activeRelation.value.column.srcColumnPath,
      dstCyodaColumnPath: path
    };
    selectedEntityMapping.value.cobiCoreMetadata.push(cobiCoreMetadata);
  }

  const isExistCobiPathsRelation = selectedEntityMapping.value.cobiPathsRelations.find((el) => {
    return el.srcColumnPath === activeRelation.value.column.srcColumnPath && el.dstColumnPath === path;
  });

  if (!isExistCobiPathsRelation) {
    selectedEntityMapping.value.cobiPathsRelations.push({
      jsonPath: activeRelation.value.jsonPath,
      srcColumnPath: activeRelation.value.column.srcColumnPath,
      dstColumnPath: path
    });
  }

  setRelationToLink(
    {
      srcColumnPath: activeRelation.value.column.srcColumnPath,
      dstColumnPath: path
    },
    activeLine.value
  );
  setAllRelationsToLink(
    {
      srcColumnPath: activeRelation.value.column.srcColumnPath,
      dstColumnPath: path
    },
    activeLine.value
  );

  addEventListenerForInvisibleLine(invisibleLine);

  activeLine.value = null;
  activeSvgBox.value = null;
  startEl.value = null;
  setActiveRelation(null);
}


const computedId = computed(() => {
  return props.dataMappingConfigDto.virtual?.id || props.dataMappingConfigDto.id;
})

async function addAutomaticTransformers(column: ColumnMappingConfigDto) {
  const data = HelperMapper.getValueFromSourceData(sourceDataComputed.value, column.srcColumnPath, dataType.value);
  const srcColumnPathType = HelperMapper.getTypeOfData(data);

  const dstCyodaColumnPathShort = column.dstCyodaColumnPathType.split(".").pop().toLowerCase();

  const isEnumField = column.dstCyodaColumnPathType.indexOf("java.") === -1;
  if (dataType.value == "BINARY_DOC" && column.srcColumnPath === "content") {
    addTransformerByName(column, "ValueTransformer$NoTransform");
  } else if (isEnumField) {
    addTransformerByName(column, "SourceObjectValueTransformer$ToString");
    addTransformerByName(column, "StringValueTransformer$Trim");
    addTransformerByName(column, "StringValueTransformer$ToUpperCase");
    const enumName = column.dstCyodaColumnPathType.split(".").pop();
    if (enumName) {
      addTransformerByName(column, enumName);
    }
    return;
  } else if (srcColumnPathType == "string" && dstCyodaColumnPathShort === "string") {
    addTransformerByName(column, "SourceObjectValueTransformer$ToString");
    addTransformerByName(column, "StringValueTransformer$Trim");
  } else if (computedId.value && isChatBotEnabled.value && props.isChatBotReady) {
    try {
      isLoadingTargetData.value = true;
      const {data} = await chatbotStore.getMappingsAiChat({
        question: JSON.stringify({
          "srcColumnPath": column.srcColumnPath,
          "dstCyodaColumnPath": column.dstCyodaColumnPath,
          "dstCyodaColumnPathType": column.dstCyodaColumnPathType
        }),
        return_object: 'transformers',
        chat_id: computedId.value,
      });
      if (data.transformer) {
        column.transformer = data.transformer;
      }
    } finally {
      isLoadingTargetData.value = false;
    }
  }

}

async function warningMessageForExistRelations(callback: any) {
  try {
    await ElMessageBox.confirm("Adding a new mapping to an already mapped field will remove the existing mapping. Do you want continue?", "Warning", {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      type: "warning"
    });
    callback();
  } catch (err) {
    activeLine.value = null;
    activeSvgBox.value = null;
    startEl.value = null;
    setActiveRelation(null);
    await nextTick();

    updateRelations();

    throw new Error(err);
  }
}

async function addTransformerByName(column: ColumnMappingConfigDto, name: string) {
  const transformer = listAllTransformers.value.find((el: any) => {
    return el.transformerKey.indexOf(name) !== -1;
  });
  if (transformer) {
    await nextTick();

    column.transformer.children.push({
      type: "SINGLE",
      transformerKey: transformer.transformerKey,
      parameters: []
    });
  }
  return null;
}

function setEndPoint(el: any, activeLine: any, relation: any = null) {
  const canvasPos = document.getElementById("canvas").getBoundingClientRect();
  const circlePosition = el.getBoundingClientRect();
  const circleHeight = el.offsetHeight / 2 + 1;
  let curve: any = null;
  if (relation && relation.type === "functionalMappingInner") {
    curve = HelperMapper.curvedHorizontalSmall(activeLine.attr("x1"), activeLine.attr("y1"), circlePosition.left - canvasPos.left, circlePosition.top - canvasPos.top + circleHeight);
  } else {
    curve = HelperMapper.curvedHorizontal(activeLine.attr("x1"), activeLine.attr("y1"), circlePosition.left - canvasPos.left, circlePosition.top - canvasPos.top + circleHeight);
  }
  activeLine.attr("d", curve);
}

function onMouseUp(event: any) {
  if (!event.target.classList.contains("circle-can-be-selected")) {
    stopRelation();
  }
}

function stopRelation() {
  activeLine.value = null;
  activeSvgBox.value = null;
  startEl.value = null;
  setActiveRelation(null);
  setReassignRelation(null);
  updateRelations();
}

function onClickBox(event: any) {
  if (!event.target.classList.contains("circle-can-be-selected") && activeLine.value) {
    activeLine.value = null;
    activeSvgBox.value = null;
    startEl.value = null;
    setActiveRelation(null);
    updateRelations();
  }
}

function onDocumentScroll() {
  updateRelations(true);
}

function onMouseMove(event: any) {
  if (activeLine.value) {
    if (event.clientY < 10) {
      window.scroll(0, window.scrollY - 10);
    }
    if (window.innerHeight - event.y < 10) {
      window.scroll(0, window.scrollY + 10);
    }
    const canvasPosition = (document as any).querySelector("#canvas").getBoundingClientRect();
    const scroll = document.documentElement.scrollTop;
    setStartPoint(startEl.value, activeLine.value, activeRelation.value.direction);
    let curve = null;
    let windowScroll = window.pageXOffset || document.documentElement.scrollLeft;
    if (activeRelation.value && activeRelation.value.direction === "fromTarget") {
      curve = HelperMapper.curvedHorizontal(event.pageX - canvasPosition.left - windowScroll, event.pageY - canvasPosition.top - scroll, activeLine.value.attr("x1"), activeLine.value.attr("y1"));
    } else {
      curve = HelperMapper.curvedHorizontal(activeLine.value.attr("x1"), activeLine.value.attr("y1"), event.pageX - canvasPosition.left - windowScroll, event.pageY - canvasPosition.top - scroll);
    }
    activeLine.value.attr("d", curve);
  }
}

const scrollTimeOutId = ref(null);

function updateRelations(remove = true) {
  document.body.classList.add("scroll");
  if (scrollTimeOutId.value) clearTimeout(scrollTimeOutId.value);
  scrollTimeOutId.value = setTimeout(() => {
    document.body.classList.remove("scroll");
  }, 1000);
  if (updateRelationsTimeout.value) clearTimeout(updateRelationsTimeout.value);
  updateRelationsTimeout.value = setTimeout(() => {
    const canvas = document.getElementById("canvas");
    if (!canvas) return false;
    if (remove) {
      const svgs = [...canvas.querySelectorAll("svg")];
      if (svgs) {
        for (const el of svgs) {
          if (activeLine.value && el.querySelector("path") && (el as any).querySelector("path").dataset.activeRelation) {
            continue;
          } else {
            el.remove();
          }
        }
      }
    }
    const allExistDataRelations: any = [];
    _.chunk(allDataRelationsCurrent.value, 10).forEach((chunk) => {
      setTimeout(() => {
        chunk.forEach((el: any) => {
          if (el.column.srcColumnPath && el.column.dstColumnPath) {
            let sourceRow = null;
            if (el.type == "functionalMappingInner") {
              sourceRow = [...document.querySelector(".target-data-column").querySelectorAll(`[data-relation*="${encodeURIComponent(el.column.jsonPath)}"]`)]?.find((elHtml) => {
                return elHtml.dataset.relation.split(" ").indexOf(encodeURIComponent(el.column.jsonPath)) !== -1;
              });
            } else {
              sourceRow = [...document.querySelector(".source-data-column").querySelectorAll(`[data-relation*="${encodeURIComponent(el.column.jsonPath)}"]`)]?.find((elHtml) => {
                return elHtml.dataset.relation.split(" ").indexOf(encodeURIComponent(el.column.jsonPath)) !== -1;
              });
            }

            const targetRow = [...document.querySelector(".target-data-column").querySelectorAll(`[data-relation*="${encodeURIComponent(el.column.dstColumnPath)}"]`)]?.find((elHtml) => {
              return elHtml.dataset.relation.split(" ").indexOf(encodeURIComponent(el.column.dstColumnPath)) !== -1;
            });

            const sourceCircle = sourceRow ? sourceRow.querySelector(".circle") : null;
            const targetCircle = targetRow ? targetRow.querySelector(".circle") : null;
            const isExistRelation = allExistDataRelations.find((el) => el.sourceCircle == sourceCircle && el.targetCircle == targetCircle);
            if (sourceCircle && targetCircle && !isExistRelation) {
              let activeLine: any = null;
              let activeInvisibleLine: any = null;
              let activeSvgBox: any = null;
              if (remove) {
                activeSvgBox = makeSvgBox();
                activeLine = makeNewLine(el.type);

                const isNotExistRelation = HelperMapper.checkIfPathNotExist([el], notExistRelations.value);
                if (isNotExistRelation) {
                  activeLine.attr("stroke", HelperMapper.COLOR_RELATION_NOT_EXIST);
                }

                activeInvisibleLine = makeInvisibleLineForLine();
                activeSvgBox.add(activeLine);
                activeSvgBox.add(activeInvisibleLine);
                addEventListenerForInvisibleLine(activeInvisibleLine);
              } else {
                const path = [el.column.jsonPath, el.column.dstColumnPath].join("-");
                activeLine = SVG(`[data-relationLink="${path}"]`);
                if (!activeLine) return false;
                activeLine.attr("x1", 10);
                activeInvisibleLine = SVG(getInvisibleLineFromActiveLine(activeLine));
                clearAllRelationsToLink(activeLine);
              }
              setStartPoint(sourceCircle, activeLine);
              setEndPoint(targetCircle, activeLine, el);
              activeInvisibleLine.attr("d", activeLine.attr("d"));
              setRelationToLink(el.column, activeLine);
              setAllRelationsToLink(el.column, activeLine);
              applyHoverRelations();
              if (startEl.value && activeLine.value) {
                setStartPoint(startEl.value, activeLine.value);
              }
              allExistDataRelations.push({sourceCircle, targetCircle, activeLine});
            } else {
              if (isExistRelation && isExistRelation.activeLine) {
                setAllRelationsToLink(el.column, isExistRelation.activeLine);
              }
            }
          }
        });
      });
    }, 10);
    document.body.classList.remove("scroll");
  }, 100);
}

function setRelationToLink(el: any, activeLine: any) {
  const paths = [el.srcColumnPath, el.dstColumnPath];
  activeLine.node.dataset.relationLink = paths.join("-");
}

function setAllRelationsToLink(el: any, activeLine: any) {
  let allRelationLinks: any = [];
  if (activeLine.node.dataset.allRelationLinks) {
    allRelationLinks = JSON.parse(activeLine.node.dataset.allRelationLinks);
  }
  allRelationLinks.push({srcColumnPath: el.srcColumnPath, dstColumnPath: el.dstColumnPath});
  activeLine.node.dataset.allRelationLinks = JSON.stringify(allRelationLinks);
}

function clearAllRelationsToLink(activeLine: any) {
  activeLine.node.dataset.allRelationLinks = "";
}

function removeRelation(dataRelations: any) {
  if (dataRelations.length > 1) {
    selectedDataRelationsForRemove.value = dataRelations;
    dialogDeleteRelationsRef.value.dialogVisible = true;
  } else {
    ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
      callback: async (action) => {
        if (action === "confirm") {
          deleteRelation(dataRelations[0]);
        }
      }
    });
  }
}

function clearAllNotExistRelations() {
  notExistRelations.value.forEach((relation) => deleteRelation(relation))
}

function updateSourceDataKeyFn() {
  updateSourceDataKey.value += 1;
}

function deleteRelation(relation) {
  if (relation.type == "columnMapping") {
    selectedEntityMapping.value.columns = selectedEntityMapping.value.columns.filter((el) => {
      return !(el.srcColumnPath === relation.column.srcColumnPath && el.dstCyodaColumnPath === relation.column.dstColumnPath);
    });
  } else if (relation.type == "functionalMapping") {
    const functionalMappings = selectedEntityMapping.value.functionalMappings.find((el) => el.dstPath === relation.column.dstColumnPath && el.srcPaths.includes(relation.column.srcColumnPath));
    if (functionalMappings && functionalMappings.srcPaths.length > 1) {
      functionalMappings.srcPaths = functionalMappings.srcPaths.filter((el) => el != relation.column.srcColumnPath);
    } else {
      selectedEntityMapping.value.functionalMappings = selectedEntityMapping.value.functionalMappings.filter((el) => el != functionalMappings);
    }
  } else if (relation.type == "cobiCoreMetadata") {
    selectedEntityMapping.value.cobiCoreMetadata = selectedEntityMapping.value.cobiCoreMetadata.filter((el) => {
      return !(el.name === relation.column.srcColumnPath && el.dstCyodaColumnPath === relation.column.dstColumnPath);
    });
  } else if (relation.typeError == "notExistScriptPaths") {
    selectedEntityMapping.value.script.inputSrcPaths = selectedEntityMapping.value.script.inputSrcPaths.filter((el) => {
      return el !== relation.column.jsonPath;
    });
  }
  selectedEntityMapping.value.cobiPathsRelations = selectedEntityMapping.value.cobiPathsRelations.filter((el) => {
    return !(el.srcColumnPath === relation.column.srcColumnPath && el.dstColumnPath === relation.column.dstColumnPath);
  });
  updateRelations();
}

function deleteAllRelations() {
  selectedEntityMapping.value.columns = [];
  selectedEntityMapping.value.functionalMappings = [];
  updateRelations();
}

function onDeleteRelationDialog(column: any) {
  selectedDataRelationsForRemove.value = selectedDataRelationsForRemove.value.filter((el) => el !== column);
  deleteRelation(column);
  updateRelations();
}

function onDeleteRelationsListDialog(columns) {
  selectedDataRelationsForRemove.value = [];
  columns.forEach((column) => {
    deleteRelation(column);
  });
  updateRelations();
}

function deleteRelations(columns) {
  columns.forEach((column) => {
    deleteRelation(column);
  });
  updateRelations();
}

function deleteRelationByColumn(column: any) {
  props.dataMappingConfigDto.entityMappings.forEach((entityMapping: any) => {
    entityMapping.columns = entityMapping.columns.filter((el: any) => {
      return el.srcColumnPath !== column.srcColumnPath;
    });

    const listToDeleteFunctionalMappings: any[] = [];
    entityMapping.functionalMappings.forEach((el: any) => {
      el.srcPaths = el.srcPaths.filter((path) => path !== column.srcColumnPath);
      if (el.srcPaths.length == 0) {
        listToDeleteFunctionalMappings.push(el);
      }
    });

    if (listToDeleteFunctionalMappings.length > 0) {
      listToDeleteFunctionalMappings.forEach((functionalMapping) => {
        entityMapping.functionalMappings = entityMapping.functionalMappings.filter((el) => el !== functionalMapping);
      });
    }

    entityMapping.cobiCoreMetadata = entityMapping.cobiCoreMetadata.filter((el: any) => {
      return el.srcColumnPath !== column.srcColumnPath;
    });
  });

  selectedEntityMapping.value.cobiPathsRelations = selectedEntityMapping.value.cobiPathsRelations.filter((el) => {
    return !(el.srcColumnPath === column.srcColumnPath && el.dstColumnPath === column.dstCyodaColumnPath);
  });
}

async function onLoadedTargetData() {
  await nextTick();

  updateRelations();
}

function onResizeCanvas() {
  updateRelations();
}

function removeRelationsForNestedPaths({path}: any) {
  const entityMapping = selectedEntityMapping.value;
  if (entityMapping) {
    entityMapping.columns = entityMapping.columns.filter((el: any) => el.srcColumnPath.indexOf(path) !== 0 && el.dstCyodaColumnPath.indexOf(path) !== 0);
    updateRelations();
  }
}

function onUploadFileSample() {
  dialogUploadFileRef.value.dialogVisible = true;
}

function onEditSettingsCsv() {
  dialogCSVSettingsRef.value.dataMappingConfigDto = JSON.parse(JSON.stringify(props.dataMappingConfigDto));
  dialogCSVSettingsRef.value.fileUploadType = "replace";

  dialogCSVSettingsRef.value.dialogVisible = true;
}

function onSaveDialogUploadFile({content, fileUploadType}: {
  content: string;
  fileUploadType: "replace" | "merge"
}) {
  return new Promise((resolve) => {
    if (props.dataMappingConfigDto.sampleContent && fileUploadType === "replace") {
      const dataType = props.dataMappingConfigDto.dataType;
      const entityMapping: EntityMappingConfigDto = props.dataMappingConfigDto.entityMappings[0];

      const dataMappingConfigDto = props.dataMappingConfigDto;
      dataMappingConfigDto.sampleContent = HelperContent.compactContent(content, dataMappingConfigDto);

      const sourceData = HelperContent.getSourceData(dataMappingConfigDto.sampleContent, dataMappingConfigDto);
      const testData = sourceDataComputedFn(sourceData, entityMapping, dataMappingConfigDto);

      if (!testData) {
        if (dataType === "CSV") {
          entityMapping.entityRelationConfigs[0].srcRelativeRootPath = "root:/*";
        } else {
          entityMapping.entityRelationConfigs[0].srcRelativeRootPath = "root:/";
        }
      }
      resolve(true);
    } else {
      props.dataMappingConfigDto.sampleContent = HelperContent.compactContent(content, props.dataMappingConfigDto);
      resolve(true);
    }
  });
}

const instance = getCurrentInstance();

function openCSVSettings({content, fileUploadType}) {
  dialogCSVSettingsRef.value.dataMappingConfigDto = JSON.parse(JSON.stringify(instance.parent.exposed.dataMappingConfigDtoDefault.value));
  dialogCSVSettingsRef.value.dataMappingConfigDto.sampleContent = content;
  dialogCSVSettingsRef.value.fileUploadType = fileUploadType;

  dialogCSVSettingsRef.value.dialogVisible = true;
}

async function saveCSVSettings({dataMappingConfigDto, fileUploadType}: {
  dataMappingConfigDto: MappingConfigDto;
  fileUploadType: "replace" | "merge"
}) {
  if (fileUploadType === "merge") {
    const sampleContentOrigin = HelperContent.parseCsv(props.dataMappingConfigDto);
    const sampleContent = HelperContent.parseCsv(dataMappingConfigDto);
    const content = _.merge(sampleContent, sampleContentOrigin);
    dataMappingConfigDto.sampleContent = HelperContent.stringifyCsv(dataMappingConfigDto, content);
  }
  await onSaveDialogUploadFile({
    content: dataMappingConfigDto.sampleContent,
    fileUploadType
  });
  props.dataMappingConfigDto.parserParameters = JSON.parse(JSON.stringify(dataMappingConfigDto.parserParameters));
  await nextTick();

  updateRelations();
}

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function onAddEntity() {
  dialogEntityMappingRef.value.createNew();
}

function onSearchPaths() {
  dialogSearchPathsRef.value.dialogVisible = true;
}

function editEntity(entityMapping: any) {
  dialogEntityMappingRef.value.editEntity(entityMapping);
}

function onSaveEntity(data: any) {
  props.dataMappingConfigDto.entityMappings.push(data);
  navigationEntityRef.value.onNextEntity();
}

async function onEditEntity({data, index}: any) {
  props.dataMappingConfigDto.entityMappings[index] = data;

  await nextTick();
  updateRelations();
}

function deleteEntity() {
  const findParent = props.dataMappingConfigDto.entityMappings.find((entityMapping) => {
    const ids = entityMapping.entityRelationConfigs.map((entityRelationConfig) => entityRelationConfig.parentId && entityRelationConfig.parentId.uiId).filter((uiId) => uiId);
    return ids.includes(selectedEntityMapping.value.id.uiId);
  });
  if (findParent) {
    ElNotification({
      type: "error",
      title: "Error",

      message: `You can not delete "${HelperEntities.getShortNameOfEntity(selectedEntityMapping.value.entityClass)}" becouse the Entity Mapping "${HelperEntities.getShortNameOfEntity(findParent.entityClass)}" have dependency. Please change "${HelperEntities.getShortNameOfEntity(findParent.entityClass)}" first`
    });
  } else {
    ElMessageBox.confirm("Do you really want to remove this Entity?", "Confirm!", {
      callback: async (action) => {
        if (action === "confirm") {
          props.dataMappingConfigDto.entityMappings.splice(navigationEntityRef.value.index, 1);

          navigationEntityRef.value.onPrevEntity();
        }
      }
    });
  }
}

async function onEntityMappingChangeNavigation(index: number) {
  selectedEntityMappingIndex.value = index;
  await nextTick();

  updateRelations();
}

function uniqueCheckExist() {
  if (selectedEntityMapping.value) {
    const columnPathsForUniqueCheck = selectedEntityMapping.value.columnPathsForUniqueCheck;
    if (columnPathsForUniqueCheck && columnPathsForUniqueCheck.length > 0) {
      JSON.parse(JSON.stringify(columnPathsForUniqueCheck)).forEach((path: any, uniqueCheckIndex: number) => {
        const isExist = allDataRelationsCurrent.value.find((el) => el.column && el.column.dstColumnPath === path);
        const isExistMetaPath = selectedEntityMapping.value.metadata.find((el) => el.dstCyodaColumnPath === path);
        if (!isExist && !isExistMetaPath) {
          delete columnPathsForUniqueCheck[uniqueCheckIndex];
        }
      });
    }
  }
}

watch(
  selectedEntityMapping.value.columns,
  () => {
    uniqueCheckExist();
  },
  {immediate: true}
);

watch(
  () => selectedEntityMapping.value.functionalMappings,
  () => {
    uniqueCheckExist();
    if (selectedEntityMapping.value) {
      const metadata = selectedEntityMapping.value.metadata;
      if (metadata && metadata.length > 0) {
        JSON.parse(JSON.stringify(metadata)).forEach((el: any, metadataIndex: number) => {
          const isExist = selectedEntityMapping.value.functionalMappings.find((column) => column.dstPath === el.dstCyodaColumnPath);
          if (isExist) {
            metadata.splice(metadataIndex, 1);
          }
        });
      }
    }
  },
  {immediate: true}
);

watch(
  () => selectedEntityMapping.value.isPolymorphicList,
  () => {
    HelperMapper.changeIsPolymorphicList(selectedEntityMapping.value, props.dataMappingConfigDto);
  }
);

watch(
  hoveredRelations,
  () => {
    applyHoverRelations();
  }
);

watch(
  sourceDataComputed,
  (val: any) => {
    setSourceDataComputed(val);
  },
  {immediate: true}
);

function applyHoverRelations() {
  if (applyHoverRelationsTimeout.value) clearTimeout(applyHoverRelationsTimeout.value);
  applyHoverRelationsTimeout.value = setTimeout(() => {
    const columns = hoveredRelations.value;
    const canvas = document.querySelector("#canvas");
    const allSelectedPaths = columns.map((el: any) => {
      return [el.column.srcColumnPath, el.column.dstColumnPath].join("-");
    });
    if (canvas) {
      const svgs = [...canvas.querySelectorAll("path.line.not-hovered")];
      if (svgs) {
        svgs.forEach((svg) => {
          svg.classList.remove("not-hovered");
        });
      }

      if (columns && columns.length > 0) {
        const svgs = [...canvas.querySelectorAll("path.line")];
        svgs.forEach((svg) => {
          if (allSelectedPaths.indexOf((svg as any).dataset.relationLink) == -1) {
            svg.classList.add("not-hovered");
          }
        });
      }
    }
  }, 10);
}

function checkAssignMode() {
  if (isRootElementIsArray.value) {
    for (const el of allDataRelations.value) {
      const pathMatch = el.column.srcColumnPath.match(/^\d{1,}/);
      if (pathMatch) {
        assignMode.value = "single";
        break;
      }
    }
  }
}

async function expandAll() {
  toggleExpand.value = true;
  await nextTick();

  updateRelations();
}

async function collapseAll() {
  toggleExpand.value = false;
  await nextTick();

  updateRelations();
}

function toggleExpandReset() {
  toggleExpand.value = null;
}

function findSourcePathFn(path) {
  findSourcePath.value = path;
}

function findSourcePathReset() {
  findSourcePath.value = null;
}

function findTargetPathFn(path) {
  findTargetPath.value = path;
}

function findTargetPathReset() {
  findTargetPath.value = null;
}

function reassignRelations(relations) {
  onStartReassign(relations[0]);
}

function onStartReassign(relation) {
  let circle = null;
  let path = null;
  let row = null;
  if (relation.direction === "fromTarget") {
    path = relation.column.dstColumnPath;
    row = [...document.querySelector(".target-data-column").querySelectorAll(`[data-relation*="${encodeURIComponent(path)}"]`)]?.find((elHtml) => {
      return elHtml.dataset.relation.split(" ").indexOf(encodeURIComponent(path)) !== -1;
    });
  } else {
    const jsonPath = relation.column.jsonPath;
    path = relation.column.srcColumnPath;
    row = [...document.querySelector(".source-data-column").querySelectorAll(`[data-relation*="${encodeURIComponent(jsonPath)}"]`)]?.find((elHtml) => {
      return elHtml.dataset.relation.split(" ").indexOf(encodeURIComponent(jsonPath)) !== -1;
    });
  }

  circle = row ? row.querySelector(".circle") : null;

  setTimeout(async () => {
    eventBus.$emit("startDragLine", {
      el: circle,
      path,
      type: relation.type,
      clazzType: relation.clazzType,
      direction: relation.direction
    });
    setReassignRelation(relation);
    await nextTick();

    eventBus.$emit("updateRelations");
  }, 100);
}

async function onClickToggleToScript() {
  HelperMapper.toggleToScript(sourceDataRef.value, !isAllToScriptExists.value);
}

const isAllToScriptExists = computed(() => {
  return HelperMapper.isAllToScriptExists(selectedEntityMapping.value, dataForToggleJs.value);
})

const isShowToggleJs = computed(() => {
  return dataForToggleJs.value.length > 0
});

const dataForToggleJs = computed(() => {
  const data = [];
  Object.keys(sourceDataComputed.value).forEach((key) => {
    const typeOfData = HelperMapper.getTypeOfData(sourceDataComputed.value[key]);
    if (!['object', 'array'].includes(typeOfData)) {
      const path = isRootElementIsArray.value && assignMode.value === 'multiple' ? '*' : key;
      data.push({
        pathComputedSrcPath: path,
        jsonPathComputedSrcPath: path,
      })
    }
  });
  return _.uniqBy(data, 'pathComputedSrcPath');
})

defineExpose({
  onStartReassign,
  listOfNotCorrectRelations,
  notExistRelations,
  clearAllNotExistRelations,
  selectedEntityMapping,
  sourceDataComputed,
});
</script>

<style lang="scss">
.data-mapper {
  .col-data-source-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .wrap-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .assign-mode {
      position: relative;
      top: 2px;
    }
  }

  .actions {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .left,
    .right {
      width: 35%;
    }

    .el-select {
      width: 100%;
    }

    .inline button {
      //margin-left: 10px;
    }

    h4 {
      margin-bottom: 10px;
    }
  }

  h1 {
    text-align: center;
  }

  h2 {
    margin-top: 0;
  }

  .body {
    margin-top: 20px;
  }

  .content {
    position: relative;

    #canvas {
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      background: #dedddd;

      .invisible-line {
        cursor: pointer;
      }

      &.active-relation .invisible-line {
        cursor: unset;
      }
    }

    .flex {
      position: relative;
      z-index: 2;
      left: 0;
      top: 0;
      width: 100%;
    }
  }

  &.is-active-drag {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .flex {
    display: flex;
    justify-content: space-between;

    &.margin {
      margin-bottom: 5px;
    }

    .col-data {
      width: 35%;
      //z-index: 100;

      &.source-data-column {
        position: relative;
        z-index: 100;
        background: #fff;
        //opacity: 0.5;
        > div {
          position: sticky;
          transform: translateZ(0);
          top: 0;
          flex-grow: 1;
        }
      }

      .row {
        background: #fff;
        position: relative;
        z-index: 100;
      }

      .source-data-row {
        z-index: 200 !important;
      }

      h2 {
        padding: 5px 10px;
        text-align: left;
        background: #fff;
        margin-bottom: 0;
      }
    }

    //.col-middle{

    //}
  }

  .col-data-target {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &.padding {
      padding: 0 10px;
    }
  }

  .label-entity,
  .file_type {
    font-weight: bold;
    margin-bottom: 5px;
    display: block;
  }

  .alert-box {
    margin-bottom: 10px !important;

    ol {
      padding-left: 15px;
      margin-top: 10px;
    }

    .error-transform {
      .column-settings .settings {
        position: relative;
        top: 1px;
        font-size: 16px;
      }
    }
  }

  .wrap-add-entity {
    text-align: right;
  }

  .header-column {
    background: #fff;
    margin-top: 20px;

    .flex {
      padding: 0 10px;
      padding-bottom: 10px;
    }
  }

  .mapping-navigaton {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    margin-bottom: 10px;

    .mapping-navigaton-actions {
      display: flex;
      margin-left: auto;

      button {
        margin-left: 10px;
      }
    }

    .legend {
      display: flex;

      .box {
        display: flex;
        align-items: center;
        margin-right: 10px;
      }

      span.line {
        display: inline-block;
        height: 4px;
        width: 40px;
        border-radius: 5px;
        margin: 0 10px;
      }

      .column-mapping .line {
        background-color: #67c23a;
      }

      .functional-mapping .line {
        background-color: #e6a23c;
      }

      .functional-mapping-inner .line {
        background-color: #858484;
      }

      .path-not-exist .line {
        background-color: #f56c6c;
      }
    }
  }

  path {
    opacity: 1;
    transition: opacity 0.5s;

    &.not-hovered {
      opacity: 0.2;
    }
  }

  .divider {
    margin: 10px 0;
    margin-bottom: -10px;
  }

  .col-data-target-entity-title {
    display: flex;
    align-items: center;

    button {
      margin-left: 10px;
    }
  }

  .edit-script-file {
    margin-left: 10px;
  }

  .settings-data-mapper {
    opacity: 0.6;
    cursor: pointer;
    transition: all 0.5s;

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
</style>
