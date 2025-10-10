<template>
  <el-dialog append-to-body :close-on-click-modal="false" title="Data" v-model="dialogVisible" width="80%">
    <el-alert v-if="isExistErrors" class="alert-box" title="Errors" type="error" :closable="false" show-icon>
      Tracer Events contain errors.
      <el-link @click="openErrors" type="danger">Open</el-link>
    </el-alert>
    <el-tabs v-model="activeTab">
      <el-tab-pane v-if="isUseModelsInfo" label="Mapped data" name="mappedData">
        <pre class="prism-detect-mappedData" :class="codeObjMappedData.class"><code :class="codeObjMappedData.class"
                                                               v-html="codeObjMappedData.code"></code></pre>
        <PrismDataDetector targetClass=".prism-detect-mappedData"/>
      </el-tab-pane>
      <el-tab-pane label="Entities" name="entities">
        <pre class="prism-detect" :class="codeObj.class"><code :class="codeObj.class"
                                                               v-html="codeObj.code"></code></pre>
        <PrismDataDetector targetClass=".prism-detect"/>
      </el-tab-pane>
      <el-tab-pane label="Parse Statistic" name="parse-statistic">
        <DryRunResultParseStatistics :data="dryRunData.parseStatistic"/>
      </el-tab-pane>
      <el-tab-pane label="Tracer Events" name="tracer-events">
        <DryRunResultTracerEvents ref="dryRunResultTracerEventsRef" :data="dryRunData.tracerEvents"/>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";

import "prismjs/themes/prism.css";

import beautify from "js-beautify";
import Prism from "prismjs";
import DryRunResultParseStatistics from "./DryRunResultParseStatistics.vue";
import DryRunResultTracerEvents from "./DryRunResultTracerEvents.vue";
import PrismDataDetector from "../../PrismDataDetector/PrismDataDetector.vue";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags";

const props = defineProps({
  dryRunData: {
    default: () => {
      return {};
    }
  }
});

const isUseModelsInfo = computed(() => {
  return HelperFeatureFlags.isUseModelsInfo();
})

const activeTab = ref(isUseModelsInfo.value ? 'mappedData' : 'entities');

const codeObj = computed(() => {
  const data = beautify.js(JSON.stringify(props.dryRunData.entities || {}).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
  return {
    class: "language-javascript",
    code: Prism.highlight(data, Prism.languages.javascript, "javascript")
  };
});

const codeObjMappedData = computed(() => {
  const data = beautify.js(JSON.stringify(props.dryRunData.mappedData || {}).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
  return {
    class: "language-javascript",
    code: Prism.highlight(data, Prism.languages.javascript, "javascript")
  };
});

const dryRunResultTracerEventsRef = ref(null);
const dialogVisible = ref<boolean>(false);

const isExistErrors = computed(() => {
  if (!props.dryRunData?.tracerEvents) return false;
  return props.dryRunData.tracerEvents.some((el) => el.level === 'ERROR');
})

function openErrors() {
  dryRunResultTracerEventsRef.value.form.filter = 'ERROR';
  activeTab.value = "tracer-events";
}

defineExpose({dialogVisible});

watch(dialogVisible, () => {
  if (!dialogVisible.value) reset()
})

function reset() {
  activeTab.value = isUseModelsInfo.value ? 'mappedData' : 'entities';
}
</script>

<style scoped lang="scss">
.alert-box {
  margin-bottom: 15px;
}
</style>
