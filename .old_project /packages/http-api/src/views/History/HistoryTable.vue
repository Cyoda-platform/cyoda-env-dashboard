<template>
  <div class="history-table">
    <el-table v-loading="reportHistoryLoaded" class="ab-style" border height="400" highlight-current-row
              :row-class-name="tableRowClassName" ref="tableReport" :data="tableDataComputed" @row-click="rowClick"
              size="small"
              style="width: 100%" :default-sort="{ prop: 'createDateTime', order: 'descending' }">
      <el-table-column prop="createDateTime" label="DateTime" sortable sort-by="createDateTimeMkTime" />
      <el-table-column prop="config" label="Config" />
      <el-table-column prop="entityClassNameLabel" label="Type" />
      <el-table-column prop="user" label="User" />
      <el-table-column prop="status" label="Status">
        <template #default="{row}">
          <template v-if="row.status === 'FAILED'">
            {{ row.status }}
            <font-awesome-icon class="download-icon" @click.stop.prevent="onDownloadReason(row)" icon="download" />
          </template>
          <template v-else>
            {{ row.status }}
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="execution" label="Execution" />
      <el-table-column prop="rows" label="Rows" />
      <el-table-column width="120" fixed="right" label="Action">
        <template v-slot:default="scope">
          <el-button type="primary" @click="openPopUpWindow(scope.row)" circle>
            <font-awesome-icon icon="info-circle" />
          </el-button>
          <el-button v-if="scope.row.hierarhyEnable && scope.row.regroupingPossible" type="primary"
                     @click="openPopUpWindowHierarhyEdit(scope.row)" circle>
            <font-awesome-icon icon="pencil-alt" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :close-on-click-modal="false" v-model="modalStatistics" width="800px" class="info-dialog">
      <template #header>
        {{ selectedRowInfoDialog.config }}<br />
        Id: {{ selectedRowInfoDialog.id }}
        <font-awesome-icon class="copy-icon" @click="onCopyId(selectedRowInfoDialog.id)" icon="copy" />
      </template>
      <el-tabs v-model="tabs" type="border-card">
        <el-tab-pane label="Group by">
          <template v-if="configDefinitionGroupingColumns.length>0">
            <ul>
              <li v-for="configGroup in configDefinitionGroupingColumns" :key="configGroup">
                {{ configGroup }}
              </li>
            </ul>
          </template>
          <template v-else>
            Grouping not in use
          </template>
        </el-tab-pane>
        <el-tab-pane label="Sort by">
          <template v-if="configSortArr.length>0">
            <ul>
              <li v-for="configSort in configSortArr" :key="configSort">
                {{ configSort }}
              </li>
            </ul>
          </template>
          <template v-else>
            Sorting not in use
          </template>
        </el-tab-pane>
        <el-tab-pane label="Conditions">
          <template v-if="configDefinition.condition.conditions.length>0">
          <pre class="conditions-pre language-javascript" v-for="condition in configDefinition.condition.conditions">
            <code class="language-javascript" v-html="formatCondition(condition)"></code>
          </pre>
          </template>
          <template v-else>
            Conditions not in use
          </template>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="modalStatistics = false">Ok</el-button>
      </span>
      </template>
    </el-dialog>

    <HistoryTableHierarhyEditPopUp @update="onUpdateEditPopUp" ref="historyTableHierarhyEditPopUpRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperReportDefinition from "../../helpers/HelperReportDefinition";
import moment from "moment";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import HistoryTableHierarhyEditPopUp from "./HistoryTableHierarhyEditPopUp.vue";

import _ from "lodash";
import type { ReportHistoryData } from "./History";
import { ElNotification, ElTableColumn } from "element-plus";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import { useChartsDataStore } from "../../stores/charts-data";
import FileSaver from "file-saver";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const emit = defineEmits(["change", "empty"]);
const props = defineProps({
  filter: { default: HelperReportDefinition.reportHistoryDefaultFilter() },
  settings: {
    default: () => {
      return {};
    }
  }
});
const chartsDataStore = useChartsDataStore();
const entityData = ref([]);

const tableData = computed(() => {
  return reportHistoryData.value.map((report) => {
    let configShortName: string = "";
    if (report.configName) {
      const reportName: string[] = report.configName.split("-");
      configShortName = reportName.length < 3 ? "ERROR: CAN'T GET CONFIG SHORTNAME" : reportName.slice(2).join("-");
    } else {
      configShortName = "-";
    }

    const createTime = moment(report.createTime);
    const finishTime = moment(report.finishTime);
    const d = moment.duration(finishTime.diff(createTime));

    const createTimeStr = createTime.format("YYYY.MM.DD HH:mm:ss");
    const executionStr = HelperFormat.getTimeFromMomentDuration(d) || "Not yet run";

    let reportFailedShards = null;
    if (report.reportFailedShards) {
      reportFailedShards = Object.values(report.reportFailedShards).map((el, index) => {
        return `${index + 1}) ${el}`;
      }).join("\n\n");
    }

    let entityClassNameLabel = report.type;

    if (HelperFeatureFlags.isUseModelsInfo()) {
      const entityRow = entityData.value.find(el => el.name.includes(report.type));
      if(entityRow) entityClassNameLabel += ` (${HelperEntities.entityTypeMapper(entityRow.type)})`;
    }

    return {
      id: report.id,
      groupingColumns: report.groupingColumns,
      groupingVersion: report.groupingVersion,
      title: `[${createTimeStr}] ${configShortName}`,
      createDateTime: createTimeStr,
      createDateTimeMkTime: createTime.format("x"),
      config: configShortName,

      type: report.type,
      entityClassNameLabel,

      user: report.user.username,
      status: report.status, reportFailedShards,
      execution: executionStr,
      rows: HelperFormat.number(report.totalRowsCount),
      totalRowsCount: report.totalRowsCount,
      hierarhyEnable: report.hierarhyEnable,
      regroupingPossible: report.regroupingPossible
    };
  });
});

const tableDataComputed = computed(() => {
    let tableDataTmp = JSON.parse(JSON.stringify(tableData.value));
    if (props.filter && props.filter.entityType && HelperFeatureFlags.isUseModelsInfo()) {
      const entitiesList = entityData.value.filter(el => el.type === props.filter.entityType).map((el) => el.name);
      tableDataTmp = tableDataTmp.filter((data) => {
        return entitiesList.some(el => el.includes(data.type));
      });
    }
    return tableDataTmp;
  })
;

async function loadEntities() {
  const { data } = await api.getReportingFetchTypes(true);
  entityData.value = data;
}

const configGroupArr = computed(() => {
  return configDefinition.value.grouping.map((el) => {
    return el.name;
  });
});
const configSortArr = computed(() => {
  return configDefinition.value.sorting.map((el) => {
    return el.column.name;
  });
});

function clearChartRows() {
  return chartsDataStore.clearChartRows();
}

const historyTableHierarhyEditPopUpRef = ref(null);

let reportHistoryData = ref([]);
let configDefinitionGroupingColumns = ref([]);
const reportHistoryLoaded = ref<boolean>(false);
const modalStatistics = ref<boolean>(false);
let selectedRowInfoDialog = ref({});
const tabs = ref<string>("0");
let configDefinition = ref(HelperReportDefinition.reportDefinition());

(async function() {
  loadHistory();
  loadEntities();
  eventBus.$on("updateHistory", loadHistory);
})();

onBeforeUnmount(() => {
  eventBus.$off("updateHistory", loadHistory);
});

async function loadHistory() {
  try {
    reportHistoryLoaded.value = true;

    let from = null;
    if (props.filter.time_custom) {
      from = moment(props.filter.time_custom).utcOffset("+0200").format("YYYY-MM-DD[T]HH:mm:ss.SSS");
    }
    const params: api.IGetHistoryQueryParams = {
      fields: [
        "id",
        "configName",
        "reportFailed",
        "createTime",
        "finishTime",
        "type",
        "status",
        "description",
        "userId",
        "totalRowsCount",
        "regroupingPossible",
        "reportFailedShards"
      ],

      filterByType: props.filter.types.length ? props.filter.types : null,
      from,
      to: null,
      running: props.filter.states.includes("running") ? "on" : null,
      finished: props.filter.states.includes("finished") ? "on" : null,
      success: props.filter.states.includes("success") ? "on" : null,
      failed: props.filter.states.includes("failed") ? "on" : null,
      canceled: props.filter.states.includes("canceled") ? "on" : null,
      size: 500,
      username: props.filter.authors.length > 0 ? props.filter.authors[0] : null
    };

    const { data } = await api.getReportHistory({ params });

    if (data._embedded && data._embedded.reportHistoryFieldsViews) {
      const reportHistoryDataValue = data._embedded.reportHistoryFieldsViews.map((el) => el.reportHistoryFields);
      const userIds = reportHistoryDataValue.map((el) => el.userId);
      const { data: dataUsers } = await api.usersList(_.uniq(userIds));
      reportHistoryData.value = reportHistoryDataValue.map((el) => {
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

async function openPopUpWindow(row: ReportHistoryData) {
  const configDefinitionValue = await getConfigDefinition(row.id);
  if (configDefinitionValue) {
    configDefinition.value = configDefinitionValue;
  }
  configDefinitionGroupingColumns.value = row.groupingColumns;
  selectedRowInfoDialog.value = row;
  modalStatistics.value = true;
  tabs.value = "0";
}

async function openPopUpWindowHierarhyEdit(row: ReportHistoryData) {
  historyTableHierarhyEditPopUpRef.value.configDefinitionId = row.id;
  historyTableHierarhyEditPopUpRef.value.groupingColumnsProp = row.groupingColumns;
  historyTableHierarhyEditPopUpRef.value.dialogVisible = true;
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

function onDownloadReason(row) {
  const file = new File([row.reportFailedShards], `fail_report_${row.config}_${row.type}.txt`, { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(file);
}

watch(
  () => props.filter,
  () => {
    loadHistory();
  },
  { deep: true }
);

watch(tableData, () => {
  if (tableData.value.length > 0) return;

  // Reset
  emit("empty");
});
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

  .download-icon {
    cursor: pointer;
    font-size: 16px;
    transition: 0.5s all;
    opacity: 0.8
  }

  .download-icon:hover {
    opacity: 1;
  }
}
</style>
