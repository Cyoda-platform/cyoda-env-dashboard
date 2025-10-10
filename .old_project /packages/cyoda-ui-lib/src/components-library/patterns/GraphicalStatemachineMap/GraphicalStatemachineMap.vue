<template>
  <div class="graphical-statemachine-wrapper" :class="isFullscreen && 'fullscreen'" ref="wrapper">
    <div class="graphical-statemachine" :style="{'min-height': minHeight}">
      <div class="panel">
        <slot name="panel" :resetPositions="resetPositions" :toggleProcesses="toggleProcesses"
              :toggleCriteria="toggleCriteria" :toggleTitles="toggleTitles"
              :toggleListOfTransitions="toggleListOfTransitions" :toggleEdgesTitles="toggleEdgesTitles"
              :showProcesses="showProcesses" :showCriteria="showCriteria" :showTitles="showTitles"
              :showListOfTransitions="showListOfTransitions" :showEdgesTitles="showEdgesTitles"></slot>
        <div v-if="selected.id" class="selected">
          <slot name="selected" :selected="selected"></slot>
        </div>
      </div>
      <div class="graph-wrapper">
        <div class="map-controls">
          <slot name="map-controls" :fitGraph="fitGraph" :zoomIn="zoomIn" :zoomOut="zoomOut" :panLeft="panLeft"
                :panRight="panRight" :panTop="panTop" :panBottom="panBottom" :toggleFullscreen="toggleFullscreen"
                :createTransition="createTransition" :isFullscreen="isFullscreen"/>
        </div>
        <div class="map-legend">
          <slot name="map-legend"></slot>
        </div>
        <div class="wrap-map">
          <div
            class="gf-transitions-list"
            :class="{
              'is-activated-selected': selected.id
            }"
          >
            <slot name="gf-transitions-list" :showListOfTransitions="showListOfTransitions"/>
          </div>
          <figure>
            <div ref="containerRef" class="map-container"></div>
          </figure>
        </div>
      </div>
    </div>

    <!--    Transaction Dialog-->
    <el-dialog append-to-body :close-on-click-modal="false" title="Transition Actions"
               v-model="dialogVisibleTransaction" width="30%">
      <span>Please select action for transition {{ selected.title }}</span>
      <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="updateTransition">Edit</el-button>
        <el-button type="danger" @click="deleteTransition">Delete</el-button>
        <el-button @click="dialogVisibleTransaction = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ElMessageBox} from "element-plus";
import {ref, nextTick, computed, onMounted, onBeforeUnmount, watch} from "vue";

import cytoscape from "cytoscape";
import {style} from "./style";
import {fillPositionsMap, getCriteriaEles, getProcessesEles, getStatesTransitionsEles} from "./utils";
import {childrenLayout, coreLayout as coreLayoutSource} from "./layouts";
import {Criteria, PositionsMap, Process, Transition} from "../GraphicalStatemachine/types";
import GSPanel from "../GraphicalStatemachinePanel/GraphicalStatemachinePanel.vue";
import eventBus from "../../../plugins/eventBus";
import _ from "lodash";

const NONE_STATE_ID = "noneState";

document.fullscreenElement = document.fullscreenElement || document.mozFullscreenElement || document.msFullscreenElement || document.webkitFullscreenDocument;
document.exitFullscreen = document.exitFullscreen || document.mozExitFullscreen || document.msExitFullscreen || document.webkitExitFullscreen;

const emit = defineEmits(["updatePositionsMap"]);
const props = defineProps({
  processesList: {type: Array, required: true},
  criteriaList: {type: Array, required: true},
  transitionsList: {type: Array, required: true},
  positionsMap: {type: [Object, null], default: null},
  workflowId: {type: String, default: ""},
  isReadonly: {type: Boolean, default: false},
  minHeight: {type: String, default: '100vh'},
  currentState: {type: String, default: ''},
});

watch([
  () => props.processesList,
  () => props.criteriaList,
  () => props.workflowId,
  () => props.transitionsList,
], () => {
  resetPositions();
})
const coreLayout = computed(() => {
  return coreLayoutSource("breadthfirst");
})
const activeTransitions = computed(() => {
  return props.transitionsList.filter((t) => t.active);
})
const wrapperRef = ref(null);
const containerRef = ref(null);

const cy = ref(null);


const isInitialized = ref<boolean>(false);
let selected = ref({
  type: "",
  title: "",
  id: ""
});
const showProcesses = ref<boolean>(true);
const showCriteria = ref<boolean>(true);
const showTitles = ref<boolean>(true);
const showEdgesTitles = ref<boolean>(false);
const showListOfTransitions = ref<boolean>(false);
const isFullscreen = ref<boolean>(false);
const dialogVisibleTransaction = ref<boolean>(false);

onMounted(() => {
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
  document.addEventListener("mozfullscreenchange", onFullscreenChange);
  document.addEventListener("MSFullscreenChange", onFullscreenChange);
  eventBus.$on("graphicalStatemachine:resize", graphicalStatemachineResize);
  eventBus.$on("graphicalStatemachine:over-node", overNode);
  eventBus.$on("graphicalStatemachine:leave-node", leaveNode);
  eventBus.$on("graphicalStatemachine:hide-node", hideNode);
  eventBus.$on("graphicalStatemachine:show-node", showNode);
  init();
});

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
  document.removeEventListener("mozfullscreenchange", onFullscreenChange);
  document.removeEventListener("MSFullscreenChange", onFullscreenChange);
  eventBus.$off("graphicalStatemachine:resize", graphicalStatemachineResize);
  eventBus.$off("graphicalStatemachine:over-node", overNode);
  eventBus.$off("graphicalStatemachine:leave-node", leaveNode);
  eventBus.$off("graphicalStatemachine:hide-node", hideNode);
  eventBus.$off("graphicalStatemachine:show-node", showNode);
});

async function graphicalStatemachineResize(isSaveState: boolean = true) {
  await nextTick();

  resetPositions(isSaveState);

}


function addProcesses() {
  activeTransitions.value.forEach((transition) => {
    const transitionEdge = cy.value.getElementById(transition.id);
    const startStateEle = cy.value.getElementById(transition.startStateId);
    const endStateEle = cy.value.getElementById(transition.endStateId);
    const {source, parent, edge, children, position} = getProcessesEles({
      transition,
      endStateEle,
      transitionEdge,
      positionsMap: props.positionsMap,
      processesList: props.processesList
    });

    if (!parent || !children || !edge) {
      return;
    }

    const sourceEle = cy.value.add(source);
    const processesCompoundEle = cy.value.add(parent);
    cy.value.add(edge);
    cy.value.add(children);

    processesCompoundEle.children().layout(childrenLayout);
    processesCompoundEle.position(position);
    processesCompoundEle.position(onPositionChangeDebounced.value);
    const reposition = () => {
      const tEdge = cy.value.getElementById(transition.id);
      sourceEle.position(tEdge.targetEndpoint());
    };
    setTimeout(reposition, 0);
    endStateEle.position(reposition);
    startStateEle.position(reposition);
  });
}

function addCriteria() {
  activeTransitions.value.forEach((transition) => {
    if (!transition.criteriaIds.length) {
      return;
    }

    const edge = cy.value.getElementById(transition.id);
    const startStateEle = edge.source();
    const endStateEle = edge.target();
    const position = edge.midpoint();

    const {parent, children, criteriaCompoundEleId} = getCriteriaEles({
      transition,
      position,
      criteriaList: props.criteriaList
    });

    edge.data("compoundCriteria", criteriaCompoundEleId);
    const criteriaCompoundEle = cy.value.add(parent);
    cy.value.add(children);
    criteriaCompoundEle.children().layout(childrenLayout);

    setTimeout(() => {
      const e = cy.value.getElementById(transition.id);
      const p = e.midpoint();
      criteriaCompoundEle.position(p);
    }, 0);
    startStateEle.position(repositionCriteria);
    endStateEle.position(repositionCriteria);
  });
}

function repositionCriteria(e: any) {
  e.target.connectedEdges().forEach((edge: any) => {
    const compoundEle = cy.value.getElementById(edge.data("compoundCriteria"));
    if (!compoundEle) {
      return;
    }
    const position = edge.midpoint();
    compoundEle.position(position);
  });
}

async function init(savedPositions = null) {
  if (isInitialized.value) {
    return;
  }

  await nextTick();

  cy.value = cytoscape({
    container: containerRef.value,
    elements: getStatesTransitionsEles(activeTransitions.value, props.positionsMap, props.currentState),
    layout: coreLayout.value,
    style,
    zoom: 1,
    pan: {x: 0, y: 0},
    minZoom: 0.1,
    maxZoom: 4
  });

  addCriteria();
  addProcesses();

  const eles = cy.value.nodes();
  if (!props.positionsMap) {
    setPositions(eles);
  }

  if (savedPositions && false) {
    const newPositions = cy.value.json();

    newPositions.elements.edges.forEach((newPos) => {
      const oldEdge = savedPositions.elements.edges.find((oldPos) => oldPos.data.id === newPos.data.id);
      if (oldEdge) {
        newPos.position = oldEdge.position;
      }
    });

    newPositions.elements.nodes.forEach((newPos) => {
      const oldNode = savedPositions.elements.nodes.find((oldPos) => oldPos.data.id === newPos.data.id);
      if (oldNode) {
        newPos.position = oldNode.position;
      }
    });

    Object.keys(savedPositions).forEach((attr) => {
      if (attr !== "elements") {
        newPositions[attr] = savedPositions[attr];
      }
    });

    cy.value.json(newPositions);
  }

  if (props.isReadonly) {
    cy.value.nodes(".compound-processes").lock();
    cy.value.nodes(".node-state").lock();
  } else {
    cy.value.nodes(".compound-processes").unlock();
    cy.value.nodes(".node-state").unlock();

    eles.position(onPositionChangeDebounced.value);
    cy.value.on("select", onEleSelect);
  }

  cy.value.fit();
  cy.value.userZoomingEnabled(false);
  isInitialized.value = true;

  // showTitles
  cy.value.nodes().toggleClass("hide-titles", !showTitles.value);

  // showEdgesTitles
  cy.value.edges().toggleClass("hide-titles-edge", !showEdgesTitles.value);

  // showProcesses
  cy.value.nodes(".compound-processes").toggleClass("hidden", !showProcesses.value);
  cy.value.edges(".edge-process").toggleClass("hidden", !showProcesses.value);

  // showCriteria
  cy.value.nodes(".node-criteria").toggleClass("hidden", !showCriteria.value);
  cy.value.nodes(".compound-criteria").toggleClass("compound-criteria-hidden", !showCriteria.value);
}

function setPositions(eles: any) {
  const noneStateNode = eles.getElementById(NONE_STATE_ID);
  const boundingBox = cy.value.extent();
  noneStateNode.position({x: boundingBox.x1 - 200, y: boundingBox.h / 2 - 50});
  const subset = eles.filter((ele: any) => ele !== noneStateNode);
  subset.layout(coreLayout.value);
}

function resetPositions(isSaveState = false) {
  if (cy.value) {
    let positionsJson = null;
    if (isSaveState) {
      positionsJson = cy.value.json();
    }
    emit("updatePositionsMap", {workflowId: props.workflowId, positionsMap: null});
    cy.value.destroy();
    isInitialized.value = false;
    init(positionsJson);
  }
}


let onPositionChangeDebounced = ref(_.debounce(onPositionChange, 50, {leading: false, trailing: true}));

function onPositionChange() {
  const positionsMap = fillPositionsMap(cy.value.nodes(".node-state").positions(), {});
  fillPositionsMap(cy.value.nodes(".compound-processes").positions(), positionsMap);
  emit("updatePositionsMap", {workflowId: props.workflowId, positionsMap});
}

function onEleSelect(e: any) {
  if (props.isReadonly) return;
  e.target.unselect();
  const {type, title, fullTitle, entityId, persisted} = e.target.data();

  if (type === "state" || type === "process" || type === "criteria") {
    selected.value.type = type;
    selected.value.title = fullTitle || title;
    selected.value.id = entityId;
    selected.value.persisted = persisted;
    if (selected.value.title !== "None" && type == "state") {
      ElMessageBox.confirm(`Do you want edit ${type} ${selected.value.title}. Continue?`, "Confirm!", {
        callback: async (action) => {
          if (action === "confirm") {
            eventBus.$emit(`${type}:update`, {id: entityId, persisted});
          }
        }
      });
    }
    return;
  }

  if (type === "edge" || type === "edge-criteria-start" || type === "edge-criteria-end") {
    selected.value.type = "transition";
    selected.value.title = title;
    selected.value.id = entityId;
    selected.value.persisted = persisted;
    dialogVisibleTransaction.value = true;
    e.target.unselect();
  }
}

function updateTransition() {
  eventBus.$emit(`transition:update`, {id: selected.value.id, persisted: selected.value.persisted});
  dialogVisibleTransaction.value = false;
}

function deleteTransition() {
  ElMessageBox.confirm(`Do you want delete transition ${selected.value.title}. Continue?`, "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        eventBus.$emit(`transition:delete`, {id: selected.value.id, persisted: selected.value.persisted});
        dialogVisibleTransaction.value = false;
      }
    }
  });
}

function fitGraph() {
  cy.value.fit();
}

function zoomIn() {
  cy.value.zoom(cy.value.zoom() + 0.1);
}

function zoomOut() {
  cy.value.zoom(cy.value.zoom() - 0.1);
}

function panLeft() {
  cy.value.pan({x: cy.value.pan().x - 50});
}

function panRight() {
  cy.value.pan({x: cy.value.pan().x + 50});
}

function panTop() {
  cy.value.pan({y: cy.value.pan().y - 50});
}

function panBottom() {
  cy.value.pan({y: cy.value.pan().y + 50});
}

function toggleProcesses() {
  cy.value.nodes(".compound-processes").toggleClass("hidden");
  cy.value.edges(".edge-process").toggleClass("hidden");
  showProcesses.value = !showProcesses.value;
}

function toggleCriteria() {
  cy.value.nodes(".node-criteria").toggleClass("hidden");
  cy.value.nodes(".compound-criteria").toggleClass("compound-criteria-hidden");
  showCriteria.value = !showCriteria.value;
}

function toggleTitles() {
  cy.value.nodes().toggleClass("hide-titles");
  showTitles.value = !showTitles.value;
}

function toggleEdgesTitles(value = undefined) {
  cy.value.edges().toggleClass("hide-titles-edge", value);
  if (value === undefined) {
    showEdgesTitles.value = !showEdgesTitles.value;
  } else {
    showEdgesTitles.value = value;
  }
}

function toggleListOfTransitions() {
  showListOfTransitions.value = !showListOfTransitions.value;
  resetPositions(true);
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  const elem = wrapperRef.value;
  if (!elem) {
    return;
  }
  elem.requestFullscreen = elem.requestFullscreen || elem.mozRequestFullscreen || elem.msRequestFullscreen || elem.webkitRequestFullscreen;

  if (isFullscreen.value) {
    elem.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function createTransition() {
  eventBus.$emit("transition:create");
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

function overNode(id) {
  const nodes = cy.value.filter("node");
  nodes.forEach((el) => {
    el.style({
      opacity: 0.2
    });
    el.connectedEdges().forEach((elEdge) => {
      elEdge.style({
        opacity: 0.2
      });
    });
  });
  const edge = cy.value.getElementById(id);
  edge.style({
    opacity: 1
  });
  if (edge.source()) {
    edge.source().style({
      opacity: 1
    });
  }
  if (edge.target()) {
    edge.target().style({
      opacity: 1
    });
  }
}

function leaveNode() {
  const nodes = cy.value.filter("node");
  nodes.forEach((el) => {
    el.style({
      opacity: 1
    });
    el.connectedEdges().forEach((elEdge) => {
      elEdge.style({
        opacity: 1
      });
    });
  });
}

function hideNode(id) {
  const edge = cy.value.getElementById(id);
  edge.style({
    display: "none"
  });
}

function showNode(id) {
  const edge = cy.value.getElementById(id);
  edge.style({
    display: "element"
  });
}


defineExpose({cy, toggleEdgesTitles});
</script>

<style lang="scss" scoped>
.graphical-statemachine-wrapper {
  &.fullscreen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: rgb(255, 255, 255);
  }
}

.graphical-statemachine {
  border: 2px solid rgb(243, 246, 255);
  border-radius: 8px;
  //min-height: 100vh;
  //height: 500px;
  //height: 100vh;
  display: flex;
  flex-direction: column;

  > * {
    flex: 1 1 auto;
  }
}

.panel {
  flex: 0 0 auto;

  &:not(:empty) {
    padding: 8px;
    border-bottom: 2px solid rgb(243, 246, 255);
    position: relative;
    background: rgb(255, 255, 255);

    button {
      margin: 8px;
    }
  }
}

.selected {
  &:not(:empty) {
    position: absolute;
    top: 100%;
    left: 0;
    right: 110px;
    background: rgb(255, 255, 255);
    z-index: 100;
  }
}

.graph-wrapper {
  padding-bottom: 50px;
  display: flex;
  position: relative;
  background: rgb(255, 255, 255);

  > * {
    background: rgba(255, 255, 255, 0.7);
    flex: 1 1 auto;
    position: relative;
  }
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.map-controls {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;

  &:not(:empty) {
    border-left: 2px solid rgb(243, 246, 255);
    border-bottom: 2px solid rgb(243, 246, 255);
    border-bottom-left-radius: 8px;
  }
}

.wrap-map {
  display: flex;

  /*.is-activated-selected{*/
  /*  margin-top: 54px;*/
  /*}*/

  figure {
    flex-grow: 1;
    position: relative;
  }
}

.map-legend {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;

  &:not(:empty) {
    border-top: 2px solid rgb(243, 246, 255);
  }
}
</style>
