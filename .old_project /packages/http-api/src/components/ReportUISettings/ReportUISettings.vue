<template>
  <div v-if="isNeedToShow">
    <div class="action">
      <el-button @click="onOpen" type="success">
        {{ nameButton }}
        <font-awesome-icon icon="cogs" />
      </el-button>
    </div>
    <ReportUISettingsPopUp :idFieldList="idFieldList" :storedSettings="storedSettings" :reportDefinitionId="reportDefinitionId" :configDefinition="configDefinition" ref="reportUISettingsPopUpRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import ReportUISettingsPopUp from "./ReportUISettingsPopUp.vue";
import {useReportsStore} from "../../stores/reports";

const props = defineProps({
  configDefinition: {
    default: () => {
      return {};
    }
  },
  reportDefinitionId: {
    default: ""
  }
});
const reportsStore = useReportsStore();
const reportsSettings = computed(() => {
  return reportsStore.reportsSettings;
});
const getStoredSettings = computed(() => {
  return reportsStore.getStoredSettings;
});
const isNeedToShow = computed(() => {
  return props.reportDefinitionId && !idFieldList.value.find((el) => el.value === "id");
});
const nameButton = computed(() => {
  if (storedSettings.value && storedSettings.value.settings.idField) {
    return "Settings *";
  } else {
    return "Settings";
  }
});
const storedSettings = computed(() => {
  return getStoredSettings.value(props.reportDefinitionId);
});
const idFieldList = computed(() => {
  return (
    (props.configDefinition &&
      props.configDefinition.columns.map((el) => {
        return {
          value: el.name,
          label: el.name
        };
      })) ||
    []
  );
});

const reportUISettingsPopUpRef = ref(null);

function onOpen() {
  reportUISettingsPopUpRef.value.dialogVisible = true;
}
</script>
