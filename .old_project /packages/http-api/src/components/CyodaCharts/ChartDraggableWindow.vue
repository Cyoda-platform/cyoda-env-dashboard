<template>
  <div
    ref="rootRef"
    class="chart-window"
    :class="{
      maximize: chartWindowSettings.windowSettings.size === 'maximize',
      minimize: chartWindowSettings.windowSettings.size === 'minimize'
    }"
  >
    <div class="title">
      <div class="name">
        {{ chartWindowSettings.chartSettings.name || "-" }}
      </div>
      <div class="buttons">
        <font-awesome-icon @click="onMinimize" v-if="chartWindowSettings.windowSettings.size === 'maximize'"
                           icon="window-minimize"/>
        <font-awesome-icon @click="onMaximize" v-if="chartWindowSettings.windowSettings.size === 'minimize'"
                           icon="window-maximize"/>

        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <font-awesome-icon icon="ellipsis-v"/>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click.native="onEdit">Edit</el-dropdown-item>
              <el-dropdown-item @click.native="onDelete">Delete</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="body">
      <ChartWrapper :tableLinkGroup="tableLinkGroup" :settings="chartWindowSettings.chartSettings"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {nextTick, watch, onMounted, onBeforeUnmount} from "vue";

import ChartWrapper from "./wrappers/ChartWrapper.vue";

const props = defineProps({
  chartWindowSettings: {
    default: () => {
      return {};
    }
  },
  tableLinkGroup: {
    default: ""
  }
});

const emit=defineEmits(['delete', 'edit']);
const rootRef=ref(null);

onMounted(() => {
  $(rootRef.value).draggable({
    stop: () => {
      stopDrag();
    }
  });
  $(rootRef.value).resizable({
    helper: "ui-resizable-helper",
    handles: "n, e, s, w, ne, se, sw, nw",
    stop: () => {
      stopResizable();
    }
  });
  (rootRef.value as HTMLElement).style.top = "0px";
  (rootRef.value as HTMLElement).style.left = "0px";
  const size = props.chartWindowSettings.windowSettings.size;
  restoreHtmlParams(size);
  setChartHeight();
});

onBeforeUnmount(() => {
  $(rootRef.value).resizable("destroy");
  $(rootRef.value).draggable("destroy");
});

function onMinimize() {
  props.chartWindowSettings.windowSettings.size = "minimize";
  rememberHtmlParams("maximize");
  restoreHtmlParams("minimize");
  await nextTick();

  checkMinimizePositions();
}

function rememberHtmlParams(name: "maximize" | "minimize") {
  const height = (rootRef.value as HTMLElement).offsetHeight;
  const left = parseInt((rootRef.value as HTMLElement).style.left, 10);
  const top = parseInt((rootRef.value as HTMLElement).style.top, 10);
  const width = parseInt((rootRef.value as HTMLElement).offsetWidth.toString(), 10);

  props.chartWindowSettings.windowSettings.params[`height${name}`] = height;

  props.chartWindowSettings.windowSettings.params[`left${name}`] = left;

  props.chartWindowSettings.windowSettings.params[`top${name}`] = top;

  props.chartWindowSettings.windowSettings.params[`width${name}`] = width;
}

function restoreHtmlParams(name: "maximize" | "minimize") {
  const height = props.chartWindowSettings.windowSettings.params[`height${name}`];
  const left = props.chartWindowSettings.windowSettings.params[`left${name}`];
  const top = props.chartWindowSettings.windowSettings.params[`top${name}`];
  const width = props.chartWindowSettings.windowSettings.params[`width${name}`];
  if (height && left && top && width) {
    (rootRef.value as HTMLElement).style.height = `${height}px`;
    (rootRef.value as HTMLElement).style.left = `${left}px`;
    (rootRef.value as HTMLElement).style.top = `${top}px`;
    (rootRef.value as HTMLElement).style.width = `${width}px`;
  }
}

function onMaximize() {
  props.chartWindowSettings.windowSettings.size = "maximize";
  rememberHtmlParams("minimize");
  restoreHtmlParams("maximize");
}

function stopDrag() {
  checkMinimizePositions();
  const size = props.chartWindowSettings.windowSettings.size;
  rememberHtmlParams(size);
}

function stopResizable() {
  const size = props.chartWindowSettings.windowSettings.size;
  rememberHtmlParams(size);
  setChartHeight();
}

function setChartHeight() {
  const chartBaseBox: HTMLElement | null = rootRef.value.querySelector(".chart-base");
  if (chartBaseBox) {
    const chartWindowBox: HTMLElement | null = chartBaseBox.closest(".chart-window");
    if (chartWindowBox) {
      const height = chartWindowBox.offsetHeight - 100;
      chartBaseBox.style.height = `${height}px`;
    }
  }
  window.dispatchEvent(new Event("resize"));
}

function checkMinimizePositions() {
  const size = props.chartWindowSettings.windowSettings.size;
  if (size === "minimize") {
    const windowHeight = window.innerHeight;
    const top = parseInt((rootRef.value as HTMLElement).style.top, 10);
    const height = (rootRef.value as HTMLElement).offsetHeight;
    if (top + height > windowHeight) {
      (rootRef.value as HTMLElement).style.top = `${windowHeight - height}px`;
    }

    const windowWidth = window.innerWidth;
    const left = parseInt((rootRef.value as HTMLElement).style.left, 10);
    const width = (rootRef.value as HTMLElement).offsetWidth;
    if (left + width > windowWidth) {
      (rootRef.value as HTMLElement).style.left = `${windowWidth - width}px`;
    }
  }
}

function onDelete() {
  emit("delete");
}

function onEdit() {
  emit("edit");
}

watch(
  () => props.chartWindowSettings.windowSettings.size,
  (size: string) => {
    if (size === "minimize") {
      $(rootRef.value).resizable("option", "handles", "e, w");
    }
    if (size === "maximize") {
      $(rootRef.value).resizable("option", "handles", "n, e, s, w, ne, se, sw, nw");
    }
  }
);
</script>

<style lang="scss">
.chart-window {
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
  background-color: #fff;
  overflow: hidden;
  min-width: 100px;
  //width: 40%;
  position: absolute !important;

  &.minimize {
    height: 44px !important;
    position: fixed !important;
    //bottom: 0 !important;
    //top:auto !important;
  }

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    border-bottom: 1px solid #dedede;
    padding: 15px 10px 10px 10px;

    .buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    svg {
      transition: opacity 0.5s;
      opacity: 0.5;
      cursor: pointer;
      margin: 0 4px;

      &:hover {
        opacity: 1;
      }

      &.fa-window-minimize {
        border: 2px solid #000;
        padding: 2px;
      }
    }
  }

  .body {
    overflow: hidden;
    padding: 15px 10px 10px 10px;

    .actions {
      margin: 0;
    }
  }
}
</style>
