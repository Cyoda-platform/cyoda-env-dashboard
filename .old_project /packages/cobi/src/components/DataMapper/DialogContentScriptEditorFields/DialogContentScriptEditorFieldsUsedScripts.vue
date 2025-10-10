<template>
  <div class="code" :class="{ 'is-not-collapsed': !isCollapsed }">
    <div @click="onToggleCollapse" class="header">
      <div>Reusable code: {{ isCollapsed ? "Expand" : "Collapse" }}</div>
      <div>
        <font-awesome-icon icon="chevron-down"/>
      </div>
    </div>
    <el-collapse-transition>
      <div v-show="!isCollapsed" class="body">
        <CyodaEditor v-if="isEditorShow" @ready="onReadyEditor" v-model="code" language="js" :editable="false"
                    style="min-height: 100%"/>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";

import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";
import {useScriptsStore} from "../../../stores/scripts";

const emit = defineEmits(["scriptErrors"]);
const props = defineProps({
  script: {
    default: () => {
      return {};
    }
  }
});
const scriptsStore = useScriptsStore();
const code = computed(() => {
  let codeTxt = "";
  allUsedVersions.value.forEach((el) => {
    codeTxt += `// Script name: "${el.scriptName}" | Version: ${el.scriptVersion}\n`;
    codeTxt += `${el.script}\n`;
    codeTxt += `\n// --------------\n\n`;
  });
  return codeTxt;
});

function getVersion(el) {
  return scriptsStore.getVersion(el);
}

const isCollapsed = ref<boolean>(true);
const isEditorShow = ref<boolean>(false);

let allUsedVersions = ref([]);
let reusableScriptsErrors = ref([]);

function onToggleCollapse() {
  if (isCollapsed.value) {
    isEditorShow.value = true;
  } else {
    isCollapsed.value = true;
    setTimeout(() => {
      isEditorShow.value = false;
    }, 300);
  }
}

function onReadyEditor() {
  isCollapsed.value = false;
}

watch(
  () => props.script.reusableScripts,
  () => {
    loadScriptData();
  },
  {immediate: true}
);

async function loadScriptData() {
  allUsedVersions.value = [];
  const values: any[] = await Promise.allSettled(props.script.reusableScripts.map((el) => scriptsStore.getVersion(el)));
  values.forEach((data, index) => {
    if (data.status === "fulfilled") {
      allUsedVersions.value.push(data.value.data);
    } else {
      reusableScriptsErrors.value.push(props.script.reusableScripts[index]);
    }
  });

  emit("scriptErrors", reusableScriptsErrors.value);
}
</script>

<style scoped lang="scss">
.code {
  margin-bottom: 15px;
}

.header {
  display: flex;
  padding: 15px 20px;
  background-color: #909399;
  color: #fff;
  justify-content: space-between;
  font-weight: bold;
  cursor: pointer;
}

.body {
  padding: 15px;
  border: 2px solid #909399;
  color: #000;
}

.header svg {
  transition: all 0.5s;
}

.is-not-collapsed {
  .header svg {
    transform: rotate(-180deg);
  }
}
</style>
