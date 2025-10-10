<template>
  <el-dialog :close-on-click-modal="false" title="Blockly Tool" v-model="dialogVisible" width="90%">
    <div v-if="!isFinish" class="logs" v-loading="isLoading">
      <template v-for="log in logs">
        <div>{{ log }}</div>
      </template>
    </div>

    <div class="wrap-blockly">
      <ToolsFunctionalMapping ref="toolsFunctionalMappingRef" />
    </div>

    <el-alert v-if="error" :closable="false" title="Error" type="error" show-icon>
      {{ error }}
    </el-alert>

    <BlocklyResults v-show="isShowBlocklyResults" :diffsArray="diffsArray" />

    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Close</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../../stores/platform-mapping";
import { ref, nextTick, computed, onMounted } from "vue";

import ToolsFunctionalMapping from "./ToolsFunctionalMapping.vue";

import type { EntityMappingConfigDto, FunctionalMappingConfigDto, MappingConfigDto } from "../../../components/DataMapper/MappingConfigDto";
import BlocklyResults from "./BlocklyResults.vue";

const platformMappingStore = usePlatformMappingStore();
const isFinish = computed(() => {
  return taskDone.value === dataMappings.value.length;
});
const isShowBlocklyResults = computed(() => {
  return isFinish.value && dataMappings.value.length > 0;
});
function getListAllDataMappings() {
  return platformMappingStore.getListAllDataMappings();
}

const toolsFunctionalMappingRef = ref(null);

const dialogVisible = ref<boolean>(false);
let dataMappings = ref([]);
const isLoading = ref<boolean>(false);
let logs = ref([]);
let diffsArray = ref([]);
const taskDone = ref(0);
const error = ref(null);

onMounted(async () => {
  try {
    isLoading.value = true;
    const { data } = await getListAllDataMappings();
    dataMappings.value = data;
    logs.value.push("Got all data mappings configs");
    setTimeout(async () => {
      isLoading.value = false;
      if (!toolsFunctionalMappingRef.value) return;
      await toolsFunctionalMappingRef.value.initAllFunctions();
      await toolsFunctionalMappingRef.value.initListTransformers();
      await toolsFunctionalMappingRef.value.initListAllDictionaries();
      await nextTick();

      toolsFunctionalMappingRef.value.addBlockly();
      startCheck();
    }, 2000);
  } catch (e) {
    isLoading.value = false;
  }
});

async function startCheck() {
  logs.value.push("Start to check");
  for (const dataMapping of dataMappings.value) {
    const indexDataMapping = dataMappings.value.indexOf(dataMapping);
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (indexDataMapping > 0) logs.value.pop();
        taskDone.value = indexDataMapping + 1;
        logs.value.push(`Check ${indexDataMapping + 1} from ${dataMappings.value.length} and ${dataMapping.name}`);
        dataMapping.entityMappings.forEach((entityMapping) => {
          for (const functionalMapping of entityMapping.functionalMappings) {
            try {
              runBlocklyTransform(dataMapping, entityMapping, functionalMapping);
            } catch (e) {
              console.error(e);
              error.value = e;
            }
          }
        });
        resolve(true);
      }, 10);
    });
  }
}

function runBlocklyTransform(dataMapping: MappingConfigDto, entityMapping: EntityMappingConfigDto, functionalMapping: FunctionalMappingConfigDto) {
  const { generatedStatements, existStatements } = toolsFunctionalMappingRef.value.setContentToBlockly(JSON.parse(JSON.stringify(dataMapping)), JSON.parse(JSON.stringify(entityMapping)), JSON.parse(JSON.stringify(functionalMapping)));
  if (JSON.stringify(generatedStatements) !== JSON.stringify(existStatements)) {
    diffsArray.value.push({
      generatedStatements,
      existStatements,
      dataMappingName: dataMapping.name,
      dstPath: functionalMapping.dstPath
    });
  }
}

defineExpose({ dialogVisible });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrap-blockly {
  display: none;
}
</style>
