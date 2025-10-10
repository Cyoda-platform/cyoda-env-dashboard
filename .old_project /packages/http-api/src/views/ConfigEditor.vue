<template>
  <div class="config-editor">
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane name="reportConfig" label="Report Config">
        <ConfigEditorReports ref="configEditorReports" @resetState="onResetState"
                             @change="onChangeConfigEditorReports"/>
      </el-tab-pane>
      <el-tab-pane name="reports" label="Reports">
        <HistoryReports @resetState="onResetState" />
      </el-tab-pane>
    </el-tabs>
    <el-divider/>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

import ConfigEditorReports from "./ConfigEditor/ConfigEditorReports.vue";
import type {IDefinitionContent} from "@cyoda/ui-lib/src/types/types";
import HelperReportDefinition from "../helpers/HelperReportDefinition";
import HistoryReports from "./History/HistoryReports.vue";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";

const storage = new HelperStorage();
let configDefinition = ref(HelperReportDefinition.reportDefinition());
const activeName = ref(storage.get('configEditor:tab', 'reportConfig'));

function onResetState() {
  activeName.value = 'reportConfig';
}

function onChangeConfigEditorReports(configDefinition: IDefinitionContent) {
  configDefinition.value = configDefinition;
}

watch(activeName, () => {
  storage.set('configEditor:tab', activeName.value);
})
</script>
