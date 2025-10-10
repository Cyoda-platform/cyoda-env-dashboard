<template>
  <div class="config-editor">
    <ConfigEditorReportsStream ref="configEditorReportsStream" @change="onChangeConfigEditorStreamReports" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import ConfigEditorReportsDescription from "./ConfigEditor/ConfigEditorReportsDescription.vue";
import type { IDefinitionContentStream } from "@cyoda/ui-lib/src/types/types";
import HelperReportDefinition from "../helpers/HelperReportDefinition";
import ConfigEditorReportsStream from "./ConfigEditor/ConfigEditorReportsStream.vue";

let configDefinitionStreamReports = ref(HelperReportDefinition.reportSteamDefinition());

function onChangeConfigEditorStreamReports(configDefinition: IDefinitionContentStream) {
  configDefinitionStreamReports.value = configDefinition;
}
</script>
