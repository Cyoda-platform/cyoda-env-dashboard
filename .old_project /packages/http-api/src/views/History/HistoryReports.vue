<template>
  <div class="history-view-reports">
    <div class="history-report-quick-run-flex">
      <div class="history-report-quick-run">
        <HistoryReportQuickRun v-model="quickRunReport"/>
      </div>
      <div class="button-box">
        <el-divider direction="vertical"/>
        <el-tooltip :show-after="500" class="item" effect="dark"
                    content="Reset state: filters, table settings, etc."
                    placement="top">
          <el-button class="reset-button" @click="onResetState" type="primary">
            <font-awesome-icon :icon="['fas', 'arrows-rotate']"/>
            Reset state
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <el-divider/>
    <HistoryFilter v-model="filter" ref="historyFilterRef"/>
    <el-divider/>
    <HistorySetting :settings="settings"/>
    <div class="report-table">
      <div
        class="wrap-table"
        :class="{
              full: settings.displayGroupType === 'out'
            }"
      >
        <span class="label">Report</span>
        <HistoryTable @change="onChangeHistoryTable" @empty="onEmptyTable" :filter="filter" :settings="settings"/>
      </div>
      <div class="wrap-group" v-if="settings.displayGroupType === 'out'">
        <span class="label">Group</span>
        <ReportTableGroup ref="reportTableGroupRef" :displayGroupType="settings.displayGroupType"
                          :lazyLoading="settings.lazyLoading"
                          :configDefinition="configDefinition" :tableLinkGroup="tableLinkGroup"
                          :smallPagination="true"/>
      </div>
    </div>

    <div class="chart-builder flex">
      <ReportUISettings :reportDefinitionId="reportDefinition.id" :configDefinition="configDefinition"/>
    </div>

    <div v-if="isVisibleTables">
      <template v-if="settings.displayGroupType === 'out' && tableLinkRows">
        <ReportTableRows :lazyLoading="settings.lazyLoading" :configDefinition="configDefinition"
                         :tableLinkRows="tableLinkRows"/>
      </template>
      <template v-if="settings.displayGroupType === 'in'">
        <ReportTableGroup ref="reportTableGroupRef" :displayGroupType="settings.displayGroupType"
                          :lazyLoading="settings.lazyLoading"
                          :configDefinition="configDefinition" :tableLinkGroup="tableLinkGroup"/>
      </template>
    </div>

    <AdaptableBlotterEntity :reportDefinitionId="reportDefinition.id" :configDefinition="configDefinition"
                            :selectedRow="selectedRow"/>
    <AdaptableBlotterColumnCollections/>
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick, computed, watch, onBeforeUnmount, reactive} from "vue";

import HistoryFilter from "./HistoryFilter.vue";
import HistorySetting from "./HistorySetting.vue";
import HistoryTable from "./HistoryTable.vue";
import HelperReportDefinition from "../../helpers/HelperReportDefinition";
import type {IDefinitionContent, ReportGroup} from "@cyoda/ui-lib/src/types/types";
import ReportTableGroup from "../../components/ReportTable/ReportTableGroup.vue";
import AdaptableBlotterEntity
  from "@cyoda/ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity.vue";
import ReportTableRows from "../../components/ReportTable/ReportTableRows.vue";
import AdaptableBlotterColumnCollections
  from "@cyoda/ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterColumnCollections.vue";
import ReportUISettings from "../../components/ReportUISettings/ReportUISettings.vue";
import type {ReportHistoryData} from "./History.d.ts";
import type {ReportTableTableDataRow} from "../../components/ReportTable/ReportTable";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import HistoryReportQuickRun from "./HistoryReportQuickRun.vue";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";

const reportTableGroupRef = ref(null);
const storage = new HelperStorage();
const emit = defineEmits(["resetState"]);
const tableLinkGroup = computed(() => {
  if (reportDefinition.value.id && reportDefinition.value.groupingVersion) {
    return `/platform-api/reporting/report/${reportDefinition.value.id}/${reportDefinition.value.groupingVersion}/groups?page=0&size=1000`;
  }
  return "";
});

const filter = ref(storage.get(`historyReports:filterForm`, HelperReportDefinition.reportHistoryDefaultFilter()));
const historyFilterRef = ref(null);
const quickRunReport = ref(storage.get(`historyReports:quickRunReport`, null));

let settings = reactive({
  lazyLoading: true,
  displayGroupType: "in"
});

let reportDefinition = ref({});
let configDefinition = ref(HelperReportDefinition.reportDefinition());
let selectedRow: {
  [key: string]: string
} = ref({});
const groupId = ref<string>("");
const tableLinkRows = ref<string>("");
const isVisibleTables = ref<boolean>(true);

eventBus.$on("report-table-rows:row-click", onSelectedRow);
eventBus.$on("report-group-rows:row-click", onChangeHistoryGroups);

onBeforeUnmount(() => {
  eventBus.$off("report-table-rows:row-click", onSelectedRow);
  eventBus.$off("report-group-rows:row-click", onChangeHistoryGroups);
});

function onSelectedRow(val: {
  row: {
    [key: string]: string
  }
}) {
  selectedRow.value = val.row;
}

async function onChangeHistoryTable({
                                      reportDefinition: reportDefinitionValue,
                                      configDefinition: configDefinitionValue
                                    }: {
  reportDefinition: ReportHistoryData;
  configDefinition: IDefinitionContent
}) {
  reportDefinition.value = reportDefinitionValue;
  configDefinition.value = configDefinitionValue;
}

function onEmptyTable() {
  reportTableGroupRef.value.resetGroup();
}

async function onChangeHistoryGroups(row: ReportTableTableDataRow) {
  tableLinkRows.value = row._link_rows;
  reset();
}

watch(
  settings,
  () => {
    reset();
  },
  {deep: true}
);

watch(quickRunReport, () => {
  storage.set('historyReports:quickRunReport', quickRunReport.value);
})

async function reset() {
  isVisibleTables.value = false;
  await nextTick();

  isVisibleTables.value = true;
}

function onResetState() {
  historyFilterRef.value.resetForm();
  quickRunReport.value = null;
  storage.deleteByKey('configEditor:tab');
}
</script>

<style lang="scss">
.history-view-reports {
  .flex {
    display: flex;
    margin-bottom: 15px;
    align-items: flex-start;

    .search-toolbar {
      flex-basis: 300px;
      //width: 300px;
      margin-right: 15px;
      flex-grow: 0;
      flex-shrink: 0;
    }
  }

  .report-table {
    margin-bottom: 20px;
  }

  .container {
    display: flex;
    flex: 1;

    .wrap-history-filter {
      padding-right: 20px;
    }

    .wrap-history-setting {
      padding-left: 20px;
      margin-left: 20px;
      border-left: 1px solid #dcdfe6;
    }
  }

  .report-table {
    display: flex;

    .wrap-table {
      width: 100%;
    }

    .wrap-table.full {
      width: 60%;
    }

    .wrap-group {
      width: 40%;
      padding-left: 20px;
    }
  }

  .chart-builder {
    margin-bottom: 10px;

    &.flex {
      display: flex;
      justify-content: flex-end;

      > div {
        margin: 0 5px;
      }

      > div:last-child {
        margin-right: 0;
      }
    }
  }

  h1.label {
    font-size: 22px;
    margin-left: 0;
    padding-left: 0;
  }

  .history-report-quick-run-flex {
    display: flex;

    .history-report-quick-run {
      flex: 1;
    }

    .button-box {
      align-self: flex-end;
    }
  }
}
</style>
