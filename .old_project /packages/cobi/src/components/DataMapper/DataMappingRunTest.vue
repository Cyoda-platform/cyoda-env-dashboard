<template>
  <span>
    <el-dropdown v-loading="isLoadingTest" split-button :disabled="isDisableSave" trigger="click" @click="onRunTestStep" type="warning">
      Run Test
      <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click.native="onClickTestStepSettings">Settings</el-dropdown-item>
      </el-dropdown-menu>
      </template>
    </el-dropdown>

    <DryRunSettingsDialog ref="dryRunSettingsDialogRef" @run="onRunTestStep" :dataMappingConfigDto="dataMappingConfigDto"/>
    <DryRunResultDialog v-if="dryRunSettingsDialogRef" ref="dryRunResultDialogRef" :dryRunData="dryRunData"
                        :dataMappingConfigDtoTmp="dataMappingConfigDtoTmp" :dmtc="dryRunSettingsDialogRef.form"/>
    <SourceSelectDialog :key="sourceSelectDialogKey" @run="doDryRunRequest" ref="sourceSelectDialogRef"
                        :dataMappingConfigDto="dataMappingConfigDto"/>
  </span>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../stores/platform-mapping";
import {ElMessageBox, ElNotification} from "element-plus";
import { ref } from "vue";

import HelperMapper from "../../helpers/HelperMapper";
import SourceSelectDialog from "./DryRun/SourceSelectDialog.vue";
import DryRunSettingsDialog from "./DryRun/DryRunSettingsDialog.vue";
import DryRunResultDialog from "./DryRun/DryRunResultDialog.vue";

const props = defineProps({
  isDisableSave: {
    default: false
  },
  dataMappingConfigDto: {
    default: () => ({})
  },
  isValidJson: {
    default: true
  }
});
const platformMappingStore = usePlatformMappingStore();
function dryRun(value) {
  return platformMappingStore.dryRun(value);
}

const sourceSelectDialogRef = ref(null);

const dryRunSettingsDialogRef = ref(null);

const dryRunResultDialogRef = ref(null);

const isLoadingTest = ref<boolean>(false);
let dryRunData = ref({});
const sourceSelectDialogKey = ref(0);
let dataMappingConfigDtoTmp = ref({});
const emit=defineEmits(['success'])

async function doDryRunRequest(form) {
  try {
    isLoadingTest.value = true;
    const dataMappingConfigDto = JSON.parse(JSON.stringify(props.dataMappingConfigDto));
    dataMappingConfigDto.sampleContent = form.sampleContent;

    dataMappingConfigDtoTmp.value = dataMappingConfigDto;

    const { data } = await dryRun({
      "@bean": "com.cyoda.plugins.mapping.core.dtos.DataMappingDryRunConfigDto",
      dmc: HelperMapper.mappingConfigDtoConvertToBackend(dataMappingConfigDto),
      dmtc: dryRunSettingsDialogRef.value.form,
      requestFields: form.requestFields
    });
    dryRunData.value = data;
    checkOnWarns(data);
    dryRunResultDialogRef.value.dialogVisible = true;
    emit('success');
  } finally {
    isLoadingTest.value = false;
  }
}

function onClickTestStepSettings() {
  dryRunSettingsDialogRef.value.dialogVisible = true;
}

async function onRunTestStep() {
  if (!props.isValidJson) {
    ElNotification({ type: "error", title: "Error", message: "Blockly JSON is not valid" });
    return;
  }
  sourceSelectDialogKey .value += 1;
  setTimeout(() => {
    sourceSelectDialogRef.value.openDialog(props.dataMappingConfigDto.sampleContent);
  }, 250);
}

function checkOnWarns(data) {
  if (!data || !data.tracerEvents) return;
  const warns = data.tracerEvents.filter((el) => el.level === "WARN");
  if (warns.length === 0) return;
  const warnsTexts = warns.map((el, index) => `<strong>${index + 1})</strong> ${el.message}`);
  ElMessageBox.alert(warnsTexts.join("<br/> ------------------ <br/>"), "Warning!", { dangerouslyUseHTMLString: true, customClass: 'run-test-alert' });
}

defineExpose({ dataMappingConfigDtoTmp });
</script>

<style lang="scss">
.run-test-alert {
  .el-message-box__content {
    max-height: calc(100vh - 200px);
    overflow: auto;
  }
}
</style>
