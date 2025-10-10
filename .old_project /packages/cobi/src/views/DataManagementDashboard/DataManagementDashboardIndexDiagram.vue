<template>
  <div class="data-management-dashboard-index-diagram">
    <el-dialog :fullscreen="isFullscreen" :close-on-click-modal="false" title="Graph of Connection Execution steps"
               v-model="dialogVisible" width="70%">
      <el-form ref="formRef" :model="form" label-width="120px">
        <el-form-item label="Operation name">
          <el-select @change="onChangeOperationName" v-model="form.operationName" placeholder="Select">
            <el-option v-for="item in optionsOperations" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="isExistAnyErrorsByOperationName" class="wrap-errors">
        <el-alert :closable="false" title="Error" type="error" description="Configuration contains errors"
                  show-icon></el-alert>
      </div>

      <div class="container-cy">
        <div class="wrap-cy">
          <div id="cy"></div>
        </div>
        <div class="wrap-controls">
          <GSMapControls class="gs-map-controls" @fitGraph="fitGraph" @zoomIn="zoomIn" @zoomOut="zoomOut"
                         @panLeft="panLeft" @panRight="panRight" @panTop="panTop" @panBottom="panBottom"
                         @toggleFullscreen="toggleFullscreen" :isAvailbaleAddButton="false"
                         :isAvailbaleFullscreen="false" :isAvailbaleCreateTransition="false"
                         :isFullscreen="isFullscreen"/>
        </div>
      </div>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, watch, nextTick} from "vue";

import GSMapControls
  from "@cyoda/ui-lib/src/components-library/patterns/GraphicalStatemachineMapControls/GraphicalStatemachineMapControls";

import cytoscape from "cytoscape";
import {useDataSourceConfigStore} from "../../stores/data-source-config";

const dataSourceConfigStore = useDataSourceConfigStore();

const dialogVisible = ref<boolean>(false);
const selectedRow = ref(null);

const pipeline = ref(null);

const cy = ref(null);

const errorIndex = ref(0);
const isFullscreen = ref<boolean>(false);

let form = reactive({
  operationName: ""
});


const optionsOperations = computed(() => {
  if (!pipeline.value) return [];
  return Object.keys(pipeline.value.possiblePipelineByOperationName).map((key) => {
    return {
      label: key,
      value: key
    };
  });
});

watch(optionsOperations, () => {
  if (optionsOperations.value.length > 0 && !form.operationName) {
    form.operationName = optionsOperations.value[0].value;
    nextTick(()=>onChangeOperationName());
  }
})

const isExistAnyErrorsByOperationName = computed(() => {
  if (!pipeline.value || form.operationName) return false;
  return pipeline.value.existAnyErrorsByOperationName[form.operationName];
});

async function openDialog(row) {
  dialogVisible.value = true;
  isFullscreen.value = false;
  await loadData(row);
}

function getPipeline(id) {
  return dataSourceConfigStore.getPipeline(id);
}

async function loadData(row) {
  const {data} = await getPipeline(row.id);
  pipeline.value = data;
}

function onChangeOperationName() {
  const pipelineByOperationName = pipeline.value.possiblePipelineByOperationName[form.operationName];

  const elements = [];

  buildElements(elements, pipelineByOperationName);

  cy.value = cytoscape({
    container: document.getElementById("cy"),

    elements,

    style: [
      {
        selector: ".config-names",
        style: {
          label: "data(text)",
          height: "data(height)",
          width: "data(width)",
          "border-color": "#148751",
          "border-width": 2,

          shape: "round-rectangle",
          "background-color": "#fff",
          "text-color": "#ffffff",
          "text-wrap": "wrap",
          "font-size": 12,
          "text-halign": "center",
          "text-valign": "center",
          "font-weight": "500"
        }
      },
      {
        selector: ".operations",
        style: {
          label: "data(text)",
          height: "data(height)",
          width: "data(width)",
          "border-color": "#148751",
          "border-width": 2,

          shape: "round-rectangle",
          "background-color": "#fff",
          "text-color": "#ffffff",
          "text-wrap": "wrap",
          "font-size": 12,
          "text-halign": "center",
          "text-valign": "center",
          "font-weight": "500"
        }
      },
      {
        selector: ".consumers",
        style: {
          label: "data(text)",
          height: "data(height)",
          width: "data(width)",
          "border-color": "#148751",
          "border-width": 2,

          shape: "round-rectangle",
          "background-color": "#fff",
          "text-color": "#ffffff",
          "text-wrap": "wrap",
          "font-size": 12,
          "text-halign": "center",
          "text-valign": "center",
          "font-weight": "500"
        }
      },
      {
        selector: ".chainings",
        style: {
          label: "data(text)",
          height: "data(height)",
          width: "data(width)",
          "border-color": "#148751",
          "border-width": 2,

          shape: "round-rectangle",
          "background-color": "#fff",
          "text-color": "#ffffff",
          "text-wrap": "wrap",
          "font-size": 12,
          "text-halign": "center",
          "text-valign": "center",
          "font-weight": "500"
        }
      },
      {
        selector: ".error",
        style: {
          label: "data(text)",
          height: "data(height)",
          width: "data(width)",
          "border-color": "#fbc4c4",
          "border-width": 2,

          shape: "round-rectangle",
          "background-color": "#fef0f0",
          "text-color": "#ffffff",
          "text-wrap": "wrap",
          "font-size": 12,
          "text-halign": "center",
          "text-valign": "center",
          "font-weight": "500"
        }
      },
      {
        selector: "edge",
        style: {
          "line-style": "dashed",
          label: "data(title)",
          "text-background-color": "#f9fdfd",
          "text-background-opacity": 0.9,
          "line-color": "#F7AD11",
          "z-compound-depth": "bottom",
          width: 3,
          "target-arrow-shape": "triangle",
          "target-arrow-color": "#912624",
          "arrow-scale": 1.1,
          "curve-style": "bezier",
          "control-point-step-size": 240
        }
      }
    ],

    layout: {
      name: "breadthfirst",

      /*positions: {
          cn1: {
            x: 0,
            y: 0
          },
          o1: {
            x: 0,
            y: 80
          },
        },*/
      fit: true,
      padding: 10,
      avoidOverlap: false,
      directed: true,
      nodeDimensionsIncludeLabels: true
    }
  });
  cy.value.userZoomingEnabled(false);
  cy.value.nodes().ungrabify();
}

function buildElements(elements, pipelineByOperationName, index = 0) {
  let configName = `Data Source Config Name\n${pipelineByOperationName.dataSourceConfigName}`;
  if (pipelineByOperationName.chainingConfigName) configName = configName + `\nChaining Config Name: ${pipelineByOperationName.chainingConfigName}`;

  const configNameWidth = pipelineByOperationName.dataSourceConfigName.length * 10;
  elements.push({
    classes: "config-names",
    data: {
      id: `config-name${index}`,
      height: 40,
      width: configNameWidth > 170 ? configNameWidth : 170,
      text: configName
    }
  });

  const operationWidth = form.operationName.length * 10;
  elements.push({
    classes: "operations",
    data: {
      id: `operation${index}`,
      height: 40,
      width: operationWidth > 150 ? operationWidth : 150,
      text: `Operation Name\n${form.operationName}`
    }
  });

  elements.push({
    data: {id: `config-name${index}operation${index}`, source: `config-name${index}`, target: `operation${index}`}
  });

  if (pipelineByOperationName.dataSourceConsumer) {
    elements.push({
      classes: "consumers",
      data: {
        id: `consumer${index}`,
        height: 50,
        width: pipelineByOperationName.dataSourceConsumer.relatedClasses.join(" ").length * 20,
        text: "Consumer: " + pipelineByOperationName.dataSourceConsumer.configName + "\n" + `Related Classes: ${pipelineByOperationName.dataSourceConsumer.relatedClasses.join("\n")}`
      }
    });

    elements.push({
      data: {id: `operation${index}consumer${index}`, source: `operation${index}`, target: `consumer${index}`}
    });
  }

  if (pipelineByOperationName.chainings && pipelineByOperationName.chainings.length > 0) {
    const chaining = pipelineByOperationName.chainings[0];
    const chainingConfigWidth = chaining.chainingConfigName.length * 10;
    elements.push({
      classes: "chainings",
      data: {
        id: `chaining${index}`,
        height: 40,
        width: chainingConfigWidth > 150 ? chainingConfigWidth : 150,
        text: `Chaining Config Name:\n${chaining.chainingConfigName}`
      }
    });
    const source = pipelineByOperationName.dataSourceConsumer ? `consumer${index}` : `operation${index}`;
    elements.push({
      data: {id: `${source}chaining${index}`, source: source, target: `chaining${index}`}
    });

    if (chaining.configHasError) {
      let errorWidth = chaining.errorMessage.length * 10;
      let errorMessage = chaining.errorMessage;
      let lines = 2;
      if (errorWidth < 150) errorWidth = 150;
      if (errorWidth > 300) {
        errorWidth = 300;
        const parts = errorMessage.match(/.{1,35}/g);
        lines = parts.length;
        errorMessage = parts.join("\n");
      }
      const errorId = `error${errorIndex.value++}`;
      elements.push({
        classes: "error",
        data: {
          id: errorId,
          height: 20 * lines,
          width: errorWidth > 150 ? errorWidth : 150,
          text: `Error:\n${errorMessage}`
        }
      });

      elements.push({
        data: {id: `chaining${index}${errorId}`, source: `chaining${index}`, target: errorId}
      });
    }

    if (pipelineByOperationName.chainings[0].childPipeline) {
      elements.push({
        data: {
          id: `chaining${index}config-name${index + 1}`,
          source: `chaining${index}`,
          target: `config-name${index + 1}`
        }
      });
      buildElements(elements, pipelineByOperationName.chainings[0].childPipeline, index + 1);
    }
  }
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

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

defineExpose({dialogVisible, selectedRow, openDialog});
</script>

<style lang="scss">
.data-management-dashboard-index-diagram {
  .container-cy {
    display: flex;
  }

  .wrap-cy {
    flex-grow: 1;
    height: 500px;
    position: relative;
    overflow: hidden;
  }

  .wrap-controls {
    width: 150px;
    position: relative;
  }

  .gs-map-controls {
    position: absolute;
    right: 0;
    top: 0;
    border: 2px solid #f3f6ff;
    height: 300px;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  }

  #cy {
    height: 100%;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }

  .wrap-errors {
    margin-bottom: 15px;
  }
}
</style>
