<template>
  <el-dialog
    v-model="dialogVisible"
    :title="computedTitle"
    width="80%"
  >
    <ReportTableGroup
      v-if="configDefinition"
      displayGroupType="in"
      :lazyLoading="false"
      :configDefinition="configDefinition"
      :tableLinkGroup="tableLinkGroup"/>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
          Close
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import ReportTableGroup from "../../components/ReportTable/ReportTableGroup.vue";

const dialogVisible = ref(false);
const reportDefinition = ref(null);
const configDefinition = ref(null);

function openDialog(reportDefinitionData, configDefinitionData) {
  dialogVisible.value = true;
  reportDefinition.value = reportDefinitionData;
  configDefinition.value = configDefinitionData
}

const tableLinkGroup = computed(() => {
  if (reportDefinition.value.id && reportDefinition.value.groupingVersion) {
    return `/platform-api/reporting/report/${reportDefinition.value.id}/${reportDefinition.value.groupingVersion}/groups?page=0&size=1000`;
  }
  return "";
});

const computedTitle = computed(() => {
  if (!reportDefinition.value) return;
  const reportName = reportDefinition.value.configName.split('-');
  const name = reportName.length < 3 ? 'ERROR: CAN"T GET CONFIG SHORTNAME' : reportName.slice(2).join("-");
  return `Report: ${name}`;
});

defineExpose({openDialog})
</script>

<style scoped lang="scss">

</style>
