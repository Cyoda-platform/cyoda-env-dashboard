<template>
  <div class="reports-view">
    <div class="header">
      <h1 class="heading h1">Tableau</h1>
      <div>
        <div class="logout">
          {{ username }} |
          <LogOutButton />
        </div>
      </div>
    </div>

    <div class="container">
      <div class="wrap-history-filter">
        <HistoryFilter v-model="filter" />
      </div>
    </div>

    <div class="report-table">
      <div
        class="wrap-table"
        :class="{
          full: settings.displayGroupType === 'out'
        }"
      >
        <span class="label">Report</span>
        <HistoryTable @change="onChangeHistoryTable" :filter="filter" :settings="settings" />
      </div>

      <div class="wrap-group" v-if="settings.displayGroupType === 'out'">
        <span class="label">Group</span>
        <ReportTableGroup :displayGroupType="settings.displayGroupType" :lazyLoading="settings.lazyLoading" :configDefinition="configDefinition" :tableLinkGroup="tableLinkGroup" />
      </div>
    </div>
    <div v-if="isVisibleTables">
      <template v-if="settings.displayGroupType === 'out' && tableLinkRows">
        <ReportTableRows :lazyLoading="settings.lazyLoading" :configDefinition="configDefinition" :tableLinkRows="tableLinkRows" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { ref, nextTick, computed, watch, onBeforeUnmount } from "vue";

import HelperReportDefinition from "@cyoda/http-api/src/helpers/HelperReportDefinition";
import { ReportHistoryData } from "@cyoda/http-api/src/views/History/History";
import { IDefinitionContent } from "@cyoda/ui-lib/src/types/types";
import HistoryFilter from "@cyoda/http-api/src/views/History/HistoryFilter.vue";
import HistorySetting from "@cyoda/http-api/src/views/History/HistorySetting.vue";
import HistoryTable from "@/components/HistoryTable.vue";
import ReportTableGroup from "@cyoda/http-api/src/components/ReportTable/ReportTableGroup.vue";
import ReportTableRows from "@/components/ReportTable/ReportTableRows.vue";
import { ReportTableTableDataRow } from "@cyoda/http-api/src/components/ReportTable/ReportTable";
import LogOutButton from "@cyoda/ui-lib/src/components-library/patterns/LogOutButton/LogOutButton.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const authStore = useAuthStore();
const username = computed(() => {
  return authStore.username;
});
const tableLinkGroup = computed(() => {
  if (reportDefinition.value.id && reportDefinition.value.groupingVersion) {
    return `/platform-api/reporting/report/${reportDefinition.value.id}/${reportDefinition.value.groupingVersion}/groups?page=0&size=1000`;
  }
  return "";
});

let filter = ref(HelperReportDefinition.reportHistoryDefaultFilter());

let settings = ref({
  lazyLoading: false,
  displayGroupType: "out"
});

let reportDefinition = ref({});
let configDefinition = ref(HelperReportDefinition.reportDefinition());
const tableLinkRows = ref<string>("");
const isVisibleTables = ref<boolean>(true);

eventBus.$on("report-group-rows:row-click", onChangeHistoryGroups);

onBeforeUnmount(() => {
  eventBus.$off("report-group-rows:row-click", onChangeHistoryGroups);
});

async function onChangeHistoryTable({ reportDefinition, configDefinition }: { reportDefinition: ReportHistoryData; configDefinition: IDefinitionContent }) {
  reportDefinition.value = reportDefinition;
  configDefinition.value = configDefinition;
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
  { deep: true }
);

function reset() {
  isVisibleTables.value = false;
  await nextTick();

  isVisibleTables.value = true;
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.reports-view {
  padding: 16px;
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
    margin-left: 20px;
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
</style>
