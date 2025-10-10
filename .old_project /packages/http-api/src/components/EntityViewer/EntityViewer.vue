<template>
  <div ref="rootRef" v-loading="isLoading" class="entity-viewer">
    <div class="header">
      <span>
        {{ HelperEntities.getShortNameOfEntity(requestClass) }}
      </span>
      <span class="wrap-icon">
        <font-awesome-icon @click="onClickTrash" icon="trash" />
      </span>
    </div>
    <div class="body">
      <CyodaModellingGroup :onlyView="true" :isCondenseThePaths="true" :requestClass="requestClass" :reportInfoRows="reportingInfoRows" :relatedPaths="relatedPaths" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {useEntityViewerStore} from "@cyoda/ui-lib/src/stores/entity-viewer";
import {ElMessageBox} from "element-plus";
import {ref, nextTick, onMounted} from "vue";
import {SVG} from "@svgdotjs/svg.js";
import CyodaModellingGroup from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingGroup.vue";

import HelperModelling from "@cyoda/ui-lib/src/helpers/HelperModelling";
import * as api from "@cyoda/ui-lib/src/api";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const rootRef=ref(null);
const props = defineProps({
  requestClass: {default: ""},
  entity: {
    default: () => {
      return {};
    }
  },
  positions: {
    default: () => {
      return {
        top: 0,
        left: 0
      };
    }
  },
  zoom: {
    default: 0
  }
});
const entityViewerStore = useEntityViewerStore();
const emit=defineEmits(['loaded','resetRequestClass'])

function removeEntity(entity) {
  return entityViewerStore.removeEntity(entity);
}


const isLoading = ref<boolean>(false);
let reportingInfoRows = ref([]);
let relatedPaths = ref([]);

async function drawLines() {
  try {
    resetCanvas();
  } catch (e) {
    return;
  }
  const svgBox = SVG().addTo(".wrap-entity-view-box-inner svg.canvas");
  await nextTick();

  const allRelatedFields = [...document.querySelectorAll('[class*="related-"]')];
  allRelatedFields.forEach((el) => {
    const parenteEntityViewer: HTMLElement | null = el.closest(".entity-viewer");
    const parenteEntityViewerName = parenteEntityViewer.dataset.name;
    const match = el.className.match(/related-([a-z]*)/i);
    if (match && match[1]) {
      const target: HTMLElement | null = document.querySelector(".wrap-entity-view-box-inner ." + match[1]);
      if (target) {
        const targetName = target.dataset.name;
        let x1;
        let y1;
        let x2;
        let y2;
        x1 = parenteEntityViewer.offsetLeft + parenteEntityViewer.offsetWidth;
        y1 = (el as HTMLElement).offsetTop + (el as HTMLElement).offsetHeight / 2 + parenteEntityViewer.offsetTop;
        x2 = target.offsetLeft;
        y2 = target.offsetTop + 5;
        const strokeParams = {
          color: "#5c5c5c",
          width: 2
        };
        if (parenteEntityViewer.offsetLeft > x2) {
          x1 = parenteEntityViewer.offsetLeft;
        }
        if (x1 > x2) {
          x2 += target.offsetWidth;
        }
        const className = `${parenteEntityViewerName}-${targetName}`;
        svgBox
          .circle(10)
          .move(x1 - 5, y1 - 5)
          .fill(strokeParams.color)
          .addClass(className);
        svgBox
          .circle(10)
          .move(x2 - 5, y2 - 5)
          .fill(strokeParams.color)
          .addClass(className);
        svgBox.line(x1, y1, x2, y2).stroke(strokeParams).addClass(className);
      }
    }

  });
}

onMounted(async () => {
  calculatePosition();
  $(rootRef.value).draggable({
    containment: "parent",
    drag: () => {
      drawLines();
    },
    start: () => {
      startDrag();
    },
    stop: () => {
      stopDrag();
    }
  });
});

(async function () {

  isLoading.value = true;
  try {
    await loadEntity();
  } finally {
    isLoading.value = false;
  }
  drawLines();
})()

function resetCanvas() {
  const svgBox: SVGAElement | null = document.querySelector(".wrap-entity-view-box-inner svg.canvas");
  while (svgBox.firstChild) svgBox.removeChild(svgBox.firstChild);
}

async function calculatePosition() {
  await nextTick();

  const allEntities = [...document.querySelectorAll(".entity-viewer")];
  const lastEntity = allEntities.pop();
  // @ts-ignore
  const lastEntityInfo = JSON.parse(lastEntity.dataset.info);
  if (!lastEntityInfo.from) return;
  const previousEntity: HTMLElement | null = document.querySelector(
    "." + HelperEntities.getShortNameOfEntity(lastEntityInfo.from)
  );
  const previousEntityCoord = getCoords(previousEntity);
  const previousEntityWidth = previousEntity.offsetWidth;
  let newCoordLeft = 0;
  let result = false;
  const tries = 100;
  let triesInterator = 0;
  do {
    triesInterator += 1;
    if (triesInterator > tries) result = true;
    newCoordLeft =
      previousEntityCoord.left + previousEntityWidth + 15 * triesInterator;
    const isFreeSpace = allEntities
      .filter((currentEntity) => {
        // @ts-ignore
        const currentEntityCoord = getCoords(currentEntity);
        return previousEntityCoord.top < currentEntityCoord.topEnd;
      })
      .every((currentEntity) => {
        // @ts-ignore
        const currentEntityCoord = getCoords(currentEntity);
        if (newCoordLeft > currentEntityCoord.leftEnd) {
          if (newCoordLeft - currentEntityCoord.leftEnd < 15) {
            newCoordLeft = currentEntityCoord.leftEnd + 15;
          }
          return true;
        }
        return false;
      });
    if (isFreeSpace) result = true;
  } while (result === false);
  // @ts-ignore
  lastEntity.style.left = `${newCoordLeft}px`;
  // @ts-ignore
  lastEntity.style.top = `${previousEntityCoord.top}px`;
}

function getCoords(elem: HTMLElement) {
  return {
    top: elem.offsetTop,
    topEnd: elem.offsetHeight + elem.offsetTop,
    left: elem.offsetLeft,
    leftEnd: elem.offsetWidth + elem.offsetLeft
  };
}

async function loadEntity() {
  const {data} = await api.getReportingInfo(props.requestClass, "", "", false);
  reportingInfoRows.value = HelperModelling.sortData(HelperModelling.filterData(data));
  const {data: relatedData} = await api.getReportingRelatedPaths(props.requestClass);
  relatedPaths.value = relatedData;
  emit("loaded");
}

function onClickTrash() {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        let allEntities = [...document.querySelectorAll(".entity-viewer")];
        if (allEntities.length === 1) {
          emit("resetRequestClass");
        }
        removeEntity(props.entity);
        await nextTick();

        drawLines();

      }
    }
  });
}

function startDrag() {
  let allEntities = [...document.querySelectorAll(".entity-viewer")];
  let allEntitiesFiltered = allEntities.filter((el) => {
    return el.className !== rootRef.value.className;
  });
  allEntitiesFiltered.forEach((el) => {
    el.classList.add("action-hover");
  });
}

function stopDrag() {
  const allEntities = [...document.querySelectorAll(".entity-viewer")];
  allEntities.forEach((el) => {
    el.classList.remove("action-hover");
  });
}

defineExpose({drawLines});
</script>

<style lang="scss">
.entity-viewer {
  cursor: move;
  transition: opacity 0.5s;
  background: #fff;
  min-height: 100px;
  position: absolute;
  border: 1px solid #000;
  display: inline-block;
  min-width: 200px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  .cyoda-modelling-item {
    margin: 2px 0;

    .item {
      padding-right: 0;
    }

    .inner {
      padding-right: 0;
    }
  }

  .header {
    background-color: #148751;
    color: #fff;
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;

    .wrap-icon {
      margin-left: 15px;

      svg {
        margin: 0 2px;
        cursor: pointer;
      }
    }
  }

  .body {
    padding: 5px 30px;
  }

  &.action-hover {
    opacity: 0.5;
  }
}
</style>
