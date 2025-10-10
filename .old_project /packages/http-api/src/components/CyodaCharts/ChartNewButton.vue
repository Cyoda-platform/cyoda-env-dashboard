<template>
  <div>
    <div class="action">
      <el-button :disabled="!reportDefinitionId" @click="onOpen" type="primary">
        Add Chart
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <ChartPopUp @edit="onEditChartPopUp" @create="onCreateChartPopUp" :reportDefinitionId="reportDefinitionId" :configDefinition="configDefinition" :tableLinkGroup="tableLinkGroup" ref="chartPopUpRef" />
    <ChartDraggableWindow v-for="(chartWindowSettings, index) in allChartWindowSettings" @edit="onEditChartDraggableWindow(chartWindowSettings)" @delete="onDeleteChartDraggableWindow(index)" :key="index" :tableLinkGroup="tableLinkGroup" :chartWindowSettings="chartWindowSettings" />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, nextTick, computed, watch } from "vue";

import ChartPopUp from "./ChartPopUp.vue";
import ChartDraggableWindow from "./ChartDraggableWindow.vue";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import type { ChartSettings, ChartSettingsChart, IDefinitionContent } from "@cyoda/ui-lib/src/types/types";

const helperStorage = new HelperStorage();

const props = defineProps({
  tableLinkGroup: { default: "" },
  reportDefinitionId: { default: "" },
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const allChartWindowSettings = computed(() => {
  return allChartWindowSettingsStorage.value.filter((el) => el.chartSettings.reportDefinitionId === props.reportDefinitionId);
});

const chartPopUpRef = ref(null);

let editSettings = ref({});

let allChartWindowSettingsStorage = ref(helperStorage.get("allChartWindowSettings", []));

function onOpen() {
  chartPopUpRef.value.dialogVisible = true;
  chartPopUpRef.value.action = "create";
}

function onCreateChartPopUp(settings: ChartSettingsChart) {
  const chartWindowSettings: ChartSettings = {
    chartSettings: settings,
    windowSettings: {
      size: "maximize",
      params: {}
    }
  };
  allChartWindowSettingsStorage.value.push(chartWindowSettings);
}

function onEditChartPopUp(settings: ChartSettingsChart) {
  editSettings.value.chartSettings = settings;
}

function onEditChartDraggableWindow(settingsEdit: ChartSettings) {
  editSettings.value = settingsEdit;
  chartPopUpRef.value.dialogVisible = true;
  chartPopUpRef.value.action = "update";
  await nextTick();

  chartPopUpRef.value.settings = JSON.parse(JSON.stringify(settingsEdit.chartSettings));
}

function onDeleteChartDraggableWindow(index: number) {
  ElMessageBox.confirm("Do you really want to remove chart?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        delete allChartWindowSettingsStorage.value.splice(index, 1);
      }
    }
  });
}

watch(
  allChartWindowSettingsStorage,
  () => {
    helperStorage.set("allChartWindowSettings", JSON.parse(JSON.stringify(allChartWindowSettingsStorage.value)));
  },
  { deep: true }
);
</script>

<style lang="scss">
.action {
  text-align: right;
}
</style>
