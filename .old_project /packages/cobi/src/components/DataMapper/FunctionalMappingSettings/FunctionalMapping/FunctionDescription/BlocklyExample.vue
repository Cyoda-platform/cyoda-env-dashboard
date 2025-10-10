<template>
  <div ref="rootRef" class="blockly-example">
    <div class="example-title">Example</div>
    <div :class="blocklyClassName" class="blockly-box"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";

import * as Blockly from "blockly/core";
import BlocklyGenerator from "../generators/blockly_generator";

const props = defineProps({
  name: {
    default: ""
  },
  example: {
    default: () => {
      return {};
    }
  },
  listAllFunctions: {
    default: () => {
      return [];
    }
  },
  listAllTransformers: {
    default: () => {
      return [];
    }
  },
  listAllDictionaries: {
    default: () => {
      return [];
    }
  }
});
const rootRef=ref(null);
const blocklyClassName = computed(() => {
  return `blocklyDiv_${props.name}`;
});
const thisRef = ref(null);

const workspace = ref(null);

let options = reactive({
  readOnly: true,
  grid: {
    spacing: 25,
    length: 3,
    colour: "#ccc"
  }
});

onMounted(() => {
  const box=rootRef.value.querySelector(`.${blocklyClassName.value}`);
  workspace.value = Blockly.inject(box, options);

  try {
    const xml = getExampleXml();

    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace.value);

    new ResizeObserver(detectResizeFunctionalMapping).observe(rootRef.value);
  } catch (e) {
    if (e.message.indexOf("Unknown block type") > -1) {
      workspace.value.clear();
    }
    console.error(e);
  }
});
function detectResizeFunctionalMapping() {
  const blocklyBoxEl = document.querySelector(".blockly-box");

  if (workspace.value && blocklyBoxEl) {
    const height = blocklyBoxEl.offsetHeight;
    if (height === 200) {
      Blockly.svgResize(workspace.value);
    }
  }
}
function getExampleXml() {
  const generator = new BlocklyGenerator();

  generator.setAllFunctions(props.listAllFunctions);
  generator.setAllTransformers(props.listAllTransformers);
  generator.setAllDictionaries(props.listAllDictionaries);

  let xml = '<xml xmlns="https://developers.google.com/blockly/xml">';
  const statements = JSON.parse(JSON.stringify(props.example.code.statements));

  statements.forEach((statement, index) => {
    if (statements[index + 1]) {
      generator.buildStatementTree(statement, statements[index + 1]);
    }
  });
  const newSatementTree = statements[0];

  xml += generator.runVariables(statements);
  xml += generator.buildStatement(newSatementTree);

  xml += "</xml>";
  return xml;
}

defineExpose({ workspace });
</script>

<style scoped lang="scss">
.blockly-box {
  height: 200px;
  width: 100%;
  text-align: left;
}

.example-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}
</style>
