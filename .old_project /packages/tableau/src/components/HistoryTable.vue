<template>
  <div class="history-table">
    <el-table v-loading="reportHistoryLoaded" class="ab-style" border height="250" highlight-current-row :row-class-name="tableRowClassName" ref="tableReport" :data="tableData" @row-click="rowClick" size="small" style="width: 100%" :default-sort="{ prop: 'createDateTime', order: 'descending' }">
      <el-table-column prop="createDateTime" label="DateTime" sortable sort-by="createDateTimeMkTime" width="150" />
      <el-table-column prop="config" label="Config" />
      <el-table-column width="200" prop="type" label="Type" />
      <el-table-column width="200" prop="user" label="User" />
      <el-table-column width="150" prop="status" label="Status" />
      <el-table-column width="150" prop="execution" label="Execution" />
      <el-table-column width="150" prop="rows" label="Rows" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperReportDefinition from "@cyoda/http-api/src/helpers/HelperReportDefinition";
import moment from "moment";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import { IDefinitionContent, ReportHistoryFields } from "@cyoda/ui-lib/src/types/types";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

import _ from "lodash";
import { HistoryFilter, HistorySettings, ReportHistoryData } from "@cyoda/http-api/src/views/History/History";
import {ElNotification, ElTableColumn} from "element-plus";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useChartsDataStore} from "@cyoda/http-api/src/stores/charts-data";

const emit = defineEmits(["change"]);
const props = defineProps({
  filter: { default: HelperReportDefinition.reportHistoryDefaultFilter() },
  settings: {
    default: () => {
      return {};
    }
  }
});
const chartsDataStore = useChartsDataStore();
const tableData = computed(() => {
  return reportHistoryData.value.map((report) => {
    const reportName: string[] = report.configName.split("-");
    const configShortName: string = reportName.length < 3 ? 'ERROR: CAN"T GET CONFIG SHORTNAME' : reportName.slice(2).join("-");

    const createTime = moment(report.createTime);
    const finishTime = moment(report.finishTime);
    const d = moment.duration(finishTime.diff(createTime));

    const createTimeStr = createTime.format("YYYY.MM.DD HH:mm:ss");
    const executionStr = HelperFormat.getTimeFromMomentDuration(d) || "Not yet run";

    return {
      id: report.id,
      groupingColumns: report.groupingColumns,
      groupingVersion: report.groupingVersion,
      title: `[${createTimeStr}] ${configShortName}`,
      createDateTime: createTimeStr,
      createDateTimeMkTime: createTime.format("x"),
      config: configShortName,

      type: report.type,

      user: report.user.username,
      status: report.status,
      execution: executionStr,
      rows: HelperFormat.number(report.totalRowsCount),
      totalRowsCount: report.totalRowsCount,
      hierarhyEnable: report.hierarhyEnable,
      regroupingPossible: report.regroupingPossible
    };
  });
});
function clearChartRows() {
  return chartsDataStore.clearChartRows();
}

let reportHistoryData = ref([]);
let configDefinitionGroupingColumns = ref([]);
const reportHistoryLoaded = ref<boolean>(false);
const modalStatistics = ref<boolean>(false);
let selectedRowInfoDialog = ref({});
const tabs = ref<string>("0");
let configDefinition = ref(HelperReportDefinition.reportDefinition());

(async function () {
  loadHistory();
  eventBus.$on("updateHistory", loadHistory);
})();

onBeforeUnmount(() => {
  eventBus.$off("updateHistory", loadHistory);
});

async function loadHistory() {
  try {
    reportHistoryLoaded.value = true;

    let to = props.filter.dates.to ? props.filter.dates.to : null;
    if (to) {
      to = moment(to).format("YYYY-MM-DD") + "T23:59:59.000Z";
    }
    const params: api.IGetHistoryQueryParams = {
      fields: ["id", "configName", "reportFailed", "createTime", "finishTime", "type", "status", "description", "userId", "totalRowsCount", "regroupingPossible"],
      sorting: ["-createTime"],
      filterByType: props.filter.types.length ? props.filter.types : null,
      from: props.filter.dates.from ? props.filter.dates.from : null,
      to,
      running: props.filter.states.running ? "on" : null,
      finished: props.filter.states.finished ? "on" : null,
      success: props.filter.states.success ? "on" : null,
      failed: props.filter.states.failed ? "on" : null,
      canceled: props.filter.states.canceled ? "on" : null,
      size: 500
    };

    const { data } = await api.getReportHistory({ params });

    if (data._embedded && data._embedded.reportHistoryFieldsViews) {
      const reportHistoryData = data._embedded.reportHistoryFieldsViews.map((el) => el.reportHistoryFields);
      const userIds = reportHistoryData.map((el) => el.userId);
      const { data: dataUsers } = await api.usersList(_.uniq(userIds));
      reportHistoryData.value = reportHistoryData
        .filter((el) => !el.hierarhyEnable)
        .map((el) => {
          el.user = dataUsers.find((dataUser) => dataUser.userId === el.userId);
          return el;
        });
    } else {
      reportHistoryData.value = [];
    }
  } finally {
    reportHistoryLoaded.value = false;
  }
}

async function rowClick(row: ReportHistoryData, column: ElTableColumn) {
  if (column.label !== "Action") {
    if (parseInt(row.rows, 10) === 0) {
      ElNotification({
        title: "Warning",
        message: "Data cannot be loaded, because report have 0 rows",
        type: "warning"
      });
      return;
    }
    if (isDisabledRow()) {
      ElNotification({
        title: "Warning",
        message: "Sorry, this functionality not available for hierarchy report",
        type: "warning"
      });
      return;
    }
    const configDefinition = await getConfigDefinition(row.id);
    clearChartRows();
    emit("change", {
      configDefinition,
      reportDefinition: row
    });
  }
}

async function getConfigDefinition(id: string) {
  const { data } = await api.getConfig(id);
  return data.content;
}

function formatCondition(condition: string) {
  return Prism.highlight(JSON.stringify(condition), Prism.languages.javascript, "javascript");
}

function tableRowClassName() {
  if (isDisabledRow()) {
    return "row-disabled";
  }
  return "";
}

function isDisabledRow() {
  return false;
}

function onUpdateEditPopUp() {
  loadHistory();
}

function onCopyId(id: string) {
  navigator.clipboard.writeText(id).then(
    () => {
      ElNotification({
        title: "Success",
        message: "Id was copied to memory",
        type: "success"
      });
    },
    () => {
      ElNotification({
        title: "Success",
        message: "Operation can not be completed",
        type: "warning"
      });
    }
  );
}

watch(
  () => props.filter,
  () => {
    loadHistory();
  },
  { deep: true }
);
</script>

<style lang="scss">
.history-table {
  .conditions-pre,
  code {
    /*height: auto;*/
    /*width: 100%;*/
    /*visibility: visible;*/
    /*resize: none;*/
    white-space: pre-wrap !important;
  }

  .info-dialog {
    ul {
      li {
        margin-bottom: 5px;
      }
    }
  }

  .row-disabled td {
    opacity: 0.5;
    background-color: transparent !important;
    /*&:last-child{*/
    /*  opacity: 1;*/
    /*}*/
  }

  .copy-icon {
    opacity: 0.5;
    transition: opacity 0.5s;
    cursor: pointer;
  }

  .copy-icon:hover {
    opacity: 1;
  }
}
</style>
