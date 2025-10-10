<template>
  <div class="data-source-config-dialog-result-tabs">
    <div class="status"><strong>State:</strong> {{ result.state }}</div>
    <div v-if="requestId" class="request-uuid"><strong>Request UUID:</strong> <DataToClipboard :value="requestId" /></div>
    <el-divider />
    <el-tabs>
      <el-tab-pane label="Data" v-if="result.data && result.data.length > 0">
        <DataSourceConfigDialogResultTabsData :data="result.data" />
      </el-tab-pane>
      <el-tab-pane label="Errors" v-if="result.errors && result.errors.length > 0">
        <DataSourceConfigDialogResultTabsRaw :data="result.errors" />
      </el-tab-pane>
      <el-tab-pane label="Mapping Warnings" v-if="result.mappingWarnings && result.mappingWarnings.length > 0">
        <DataSourceConfigDialogResultTabsRaw :data="result.mappingWarnings" />
      </el-tab-pane>
      <el-tab-pane label="Mapping Statistics" v-if="result.mappingStatistics && result.mappingStatistics.length > 0">
        <DataSourceConfigDialogResultTabsStatistics :data="result.mappingStatistics" />
      </el-tab-pane>
      <el-tab-pane label="Requests Tree" v-if="result.requestsTree && Object.keys(result.requestsTree).length > 0">
        <DataSourceConfigDialogResultTabsRaw :data="result.requestsTree" />
      </el-tab-pane>
      <el-tab-pane label="JSON Response">
        <DataSourceConfigDialogResultTabsRawJSONResponse :data="result" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import DataSourceConfigDialogResultTabsRaw from "./DataSourceConfigDialogResultTabsRaw.vue";
import DataSourceConfigDialogResultTabsData from "./DataSourceConfigDialogResultTabsData.vue";
import DataSourceConfigDialogResultTabsStatistics from "./DataSourceConfigDialogResultTabsStatistics.vue";
import DataToClipboard from "../../../../DataToClipboard/DataToClipboard.vue";
import DataSourceConfigDialogResultTabsRawJSONResponse from "./DataSourceConfigDialogResultTabsRawJSONResponse.vue";

const props = defineProps({
  result: {
    default: () => {
      return {};
    }
  },
  requestId: {
    default: ""
  }
});
</script>

<style>
.request-uuid {
  margin-top: 5px;
}
</style>
