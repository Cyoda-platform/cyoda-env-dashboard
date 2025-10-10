<template>
  <div class="history-report-quick-run">
    <h2>Run Report</h2>
    <div class="inner">
      <div class="select">
        <el-select v-model="selectedConfig" clearable value-key="id" filterable
                   placeholder="Select">
          <el-option
            v-for="item in optionsConfigs"
            :key="item.id"
            :label="item.name"
            :value="item">
          </el-option>
        </el-select>
      </div>
      <div class="actions">
        <el-tooltip :show-after="500" class="item" effect="dark" content="Run configuration"
                    placement="top">
          <el-dropdown trigger="click" v-if="!isRunningReport" :disabled="!selectedConfig" split-button type="primary"
                       @click="onRunReport(false)">
            <font-awesome-icon icon="play"/>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click.native="onRunReport(true)">Run and show Result</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip :show-after="500" class="item" effect="dark" content="Edit configuration"
                    placement="top">
          <el-button :disabled="!selectedConfig || isRunningReport" @click="onEditReport"
                     type="primary">
            <font-awesome-icon icon="pencil-alt"/>
          </el-button>
        </el-tooltip>
        <el-tooltip :show-after="500" class="item" effect="dark" content="Cancel report creation"
                    placement="top">
          <el-button v-if="isRunningReport" @click="onCancelReport" type="danger">
            <font-awesome-icon icon="stop"/>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <HistoryReportQuickRunPopUp ref="historyReportQuickRunPopUpRef"/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch, onBeforeUnmount} from "vue";
import * as api from "@cyoda/ui-lib/src/api";
import {useRouter} from "vue-router";
import {useReportsStore} from "../../stores/reports";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import HistoryReportQuickRunPopUp from "./HistoryReportQuickRunPopUp.vue";
import {ElNotification} from "element-plus";
import axios from "@cyoda/ui-lib/src/plugins/axios";

const emit = defineEmits(["update:modelValue"]);
const historyReportQuickRunPopUpRef = ref(null);

const props = defineProps({
  modelValue: null,
})


eventBus.$on('lastReport', showQuickResult);

onBeforeUnmount(() => {
  eventBus.$off('lastReport', showQuickResult);
})

async function showQuickResult(params) {
  if (!isShowResult) return;
  const {data: reportDefinitionData} = await axios.get(params.linkStats);

  if (parseInt(reportDefinitionData.content.totalRowsCount, 10) === 0) {
    ElNotification({
      title: "Warning",
      message: "Data cannot be loaded, because report have 0 rows",
      type: "warning"
    });
    return;
  }

  const {data: configDefinition} = await api.getConfig(params.reportId);
  historyReportQuickRunPopUpRef.value.openDialog(reportDefinitionData.content, configDefinition.content);
}

const selectedConfig = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  }
})

const definitions = ref<any[]>([]);
const router = useRouter();
const reportsStore = useReportsStore();
let isShowResult = false;

const isRunningReport = computed(() => {
  return reportsStore.runningReports.find((el) => el.configName === selectedConfig.value?.id);
})


onMounted(() => {
  eventBus.$on('updateDefinitions', loadDefinitions);
  loadDefinitions();
})

onUnmounted(() => {
  eventBus.$off('updateDefinitions', loadDefinitions);
});

async function loadDefinitions() {
  const params: api.IGetDefinitionsQueryParams = {
    fields: ["id", "description", "type", "userId", "creationDate"],
    size: 999
  };

  const {data} = await api.getDefinitions({params});

  if (data) {
    definitions.value = (data._embedded && data._embedded.gridConfigFieldsViews) || [];
  }
}

const optionsConfigs = computed(() => {
  return definitions.value.map((report) => {
    const name = report.gridConfigFields.id.split("-").slice(2).join("-");
    return {
      id: report.gridConfigFields.id,
      groupingVersion: report.gridConfigFields.groupingVersion,
      name: name,
      entity: report.gridConfigFields.type,
    };
  });
});


function onEditReport() {
  router.push(`/http-api/config-editor-simple/${encodeURIComponent(selectedConfig.value?.id)}`);
}

async function onRunReport(isShowResultValue = false) {
  isShowResult = isShowResultValue;
  reportsStore.runReport(selectedConfig.value?.id, true);
}

function onCancelReport() {
  if(!isRunningReport.value) return;
  return reportsStore.cancelReport(isRunningReport.value);
}

watch(optionsConfigs, () => {
  if (optionsConfigs.value.length > 0 && selectedConfig.value) {
    const isExist = optionsConfigs.value.some((el) => el.id === selectedConfig.value?.id);
    if (!isExist) emit("update:modelValue", null);
  }
}, {immediate: true})

</script>

<style scoped lang="scss">
.history-report-quick-run .inner {
  display: flex;
  gap: 10px;
  align-items: center;

  .select {
    flex: 1;
  }

  .actions {
    margin: 0;
    flex-wrap: nowrap;
    display: flex;

    button {
      margin: 0 3px;
    }
  }
}
</style>
