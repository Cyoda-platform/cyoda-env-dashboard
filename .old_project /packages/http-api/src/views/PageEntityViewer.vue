<template>
  <div v-loading="isLoading" class="page-entity-viewer">
    <div class="card">
      <div class="card-body">
        <h2>
          Selected Root Entity
          {{ requestClass ? HelperEntities.getShortNameOfEntity(requestClass) : "-" }}
        </h2>
        <div class="wrap-entity-select">
          <div class="select">
            <el-select v-model="requestClass" filterable placeholder="Entity Class">
              <el-option v-for="item in requestClassOptions" :key="item.value" :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
          </div>
          <div class="checkbox">
            <el-checkbox v-model="onlyDynamic">show only dynamic entities</el-checkbox>
            <el-popover placement="top-start" title="Info" width="350" trigger="hover">
              <template #default>
                For dinamic entities you can do reports. <br/>
                With non-dynamic entities this is imposible
              </template>
              <template #reference>
                <font-awesome-icon icon="info-circle"/>
              </template>
            </el-popover>
          </div>
        </div>

        <el-alert v-if="!onlyDynamic" :closable="false" title="Reports will not work for non-dynamic entities"
                  type="warning" effect="dark"></el-alert>

        <div class="wrap-entity-view-box">
          <div class="tools">
            <div class="buttons">
              <font-awesome-icon @click="onClickZoomOut" icon="search-plus"/>
              <font-awesome-icon @click="onClickZoomIn" icon="search-minus"/>
              <font-awesome-icon @click="onClickZoomRefresh" icon="sync-alt"/>
              <template v-if="zoom != 1">
                <span class="delimiter">|</span>
                Zoom {{ zoom }}
              </template>
            </div>
          </div>
          <div class="wrap-entity-view-box-inner" :style="styleComputed">
            <EntityViewer v-for="entity in entitys" ref="entityViewerRef" @loaded="onEntityViewerLoaded"
                          @resetRequestClass="onResetRequestClass" :data-info="JSON.stringify(entity)"
                          :requestClass="entity.to" :class="entity.to.split('.').pop()" :zoom="zoom" :entity="entity"
                          :data-name="entity.to.split('.').pop()" :key="entity.to"/>
            <svg v-if="entitys.length > 0" class="canvas" width="100%"></svg>
          </div>
        </div>
      </div>
    </div>
    <ConfigEditorReportsStreamGrid :title="streamGridAvailableTitle" v-if="isStreamGridAvailable"
                                   ref="configEditorReportsStreamGridRef"/>
  </div>
</template>

<script setup lang="ts">
import {useEntityViewerStore} from "@cyoda/ui-lib/src/stores/entity-viewer";
import {ref, nextTick, computed, watch, onBeforeUnmount, onMounted} from "vue";

import _ from "lodash";
import * as api from "@cyoda/ui-lib/src/api";
import EntityViewer from "../components/EntityViewer/EntityViewer.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import ConfigEditorReportsStreamGrid
  from "@cyoda/ui-lib/src/components-library/patterns/ConfigEditor/ConfigEditorReportsStreamGrid.vue";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import {useGlobalUiSettingsStore} from "@cyoda/ui-lib/src/stores/globalUiSettings";

const ENTITY_TYPE_KEY = "PageEntityViewer:entityType";
const helperStorage = new HelperStorage();
const configEditorReportsStreamGridRef = ref(null);
const streamGridAvailableTitle = ref<string>("");
const isStreamGridAvailable = ref<boolean>(false);
const entityViewerStore = useEntityViewerStore();
const globalUiSettings = useGlobalUiSettingsStore();

const entityType = computed(() => {
  return globalUiSettings.entityType;
});

const entitys = computed(() => {
  return entityViewerStore.entitys;
});
const requestClassOptions = computed(() => {
  return onlyDynamic.value ? requestClassOptionsDinamic.value : requestClassOptionsNonDinamic.value;
});
const styleComputed = computed(() => {
  return `zoom: ${zoom.value}`;
});

function addEntity(value) {
  return entityViewerStore.addEntity(value);
}

function clearEntities() {
  return entityViewerStore.clearEntities();
}

function setOnlyDynamic(value) {
  return entityViewerStore.setOnlyDynamic(value);
}

const entityViewerRef = ref(null);

const requestClass = ref<string>("");
let requestClassOptionsDinamic = ref([]);
let requestClassOptionsNonDinamic = ref([]);

const isLoading = ref<boolean>(false);
const zoom = ref(1);
const onlyDynamic = ref<boolean>(true);

onMounted(() => {
  loadDataClassOptions();
  eventBus.$on("streamGrid:open", streamGridOpen);
  eventBus.$on("entityInfo:update", onEntityViewerLoaded);
})

async function loadDataClassOptions() {
  isLoading.value = true;
  try {
    const {data} = await api.getReportingFetchTypes(onlyDynamic.value);
    const list = HelperEntities.getOptionsFromData(data, entityType.value);
    if (onlyDynamic.value) {
      requestClassOptionsDinamic.value = list;
    }
    if (!onlyDynamic.value && requestClassOptionsDinamic.value.length > 0) {
      requestClassOptionsNonDinamic.value = list.filter((el) => {
        const isExist = requestClassOptionsDinamic.value.find((elDinamic) => elDinamic.value === el.value);
        if (!isExist) {
          return el;
        }
      });
    }
  } finally {
    isLoading.value = false;
  }
}

onBeforeUnmount(() => {
  eventBus.$off("entityInfo:update", onEntityViewerLoaded);
  eventBus.$off("streamGrid:open", streamGridOpen);
  clearEntities();
});

watch(requestClass, (val: string) => {
  if (val) {
    clearEntities();
    addEntity({from: "", to: val});
  }
});

async function streamGridOpen({configDefinitionRequest, title}) {
  isStreamGridAvailable.value = true;
  await nextTick();

  configEditorReportsStreamGridRef.value.dialogVisible = true;
  configEditorReportsStreamGridRef.value.configDefinitionRequest = configDefinitionRequest;
  configEditorReportsStreamGridRef.value.onlyUniq = true;
  streamGridAvailableTitle.value = title;
  configEditorReportsStreamGridRef.value.loadPage();
}

async function onEntityViewerLoaded() {
  await nextTick();

  const allEntities: NodeListOf<HTMLElement> = document.querySelectorAll(".entity-viewer");
  const heights: number[] = [...allEntities].map((el) => el.offsetHeight);
  const maxHeight = Math.max(...heights);
  const boxInner: HTMLElement | null = document.querySelector(".wrap-entity-view-box-inner");
  const currentHeight = boxInner.offsetHeight - 300;
  if (currentHeight < maxHeight && boxInner) {
    boxInner.style.minHeight = `${maxHeight + 600}px`;
  }
}

function onResetRequestClass() {
  requestClass.value = "";
}

function onClickZoomIn() {
  if (zoom.value > 0.19) {
    zoom.value -= 0.1;
    zoom.value = _.floor(zoom.value, 1);
    reDrawLines();
  }
}

function onClickZoomOut() {
  if (zoom.value < 2) {
    zoom.value += 0.1;
    zoom.value = _.floor(zoom.value, 1);
    reDrawLines();
  }
}

function onClickZoomRefresh() {
  zoom.value = 1;
  reDrawLines();
}

async function reDrawLines() {
  await nextTick();
  if (entityViewerRef.value[0]) {
    entityViewerRef.value[0].drawLines();
  }
}

watch(
    () => [onlyDynamic.value, entityType.value],
    () => {
      setOnlyDynamic(onlyDynamic.value);
      loadDataClassOptions();
      clearEntities();
      requestClass.value = "";
      helperStorage.set(ENTITY_TYPE_KEY, entityType.value);
    }
);
</script>

<style lang="scss">
.page-entity-viewer {
  margin-top: 20px;

  svg.canvas {
    height: 1000px;
  }

  h2 {
    margin-top: 20px;
  }

  ul {
    list-style: none;
    margin: 0;

    li {
      margin-bottom: 2px;
      margin-top: 2px;
    }
  }

  .wrap-entity-select {
    display: flex;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px;

    .select {
      margin-right: 20px;

      .el-select {
        width: 400px;
      }
    }

    .checkbox {
      label {
        margin-right: 10px;
      }

      svg {
        color: #a7a7a7;
        cursor: pointer;
      }
    }

    .entity-type {
      margin-bottom: 0;
    }
  }

  .wrap-entity-view-box {
    margin-top: 30px;

    .inner-zoom {
      width: 100%;
    }

    .wrap-entity-view-box-inner {
      overflow: hidden;
      position: relative;
      width: 100%;
      min-height: 600px;
    }
  }

  .tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    flex-wrap: nowrap;
    flex-shrink: 0;
    height: 40px;
    border-bottom: 1px solid #dedede;
    margin-bottom: 15px;

    .buttons svg {
      margin-right: 15px;
      opacity: 0.5;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }

    .buttons .delimiter {
      margin-right: 15px;
    }
  }
}
</style>
