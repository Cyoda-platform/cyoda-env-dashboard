<template>
  <data-tables
    :show-header="showHeader"
    :table-props="{
      border: true,
      size: 'mini',
      maxHeight: maxHeight
    }"
    :pagination-props="paginationProps"
    class="ab-style report-table-group"
    :data="tableData"
    ref="groupTableRef"
    size="small"
    @row-click="rowClick"
    :highlight-current-row="displayGroupType === 'out'"
    style="width: 100%"
    v-model:pageSize="form.pageSize"
    v-model:currentPage="form.currentPage"
  >
    <el-table-column v-if="tableData.length > 0 && (tableData[0].isNext || displayGroupType === 'in')" type="expand">
      <template #default="props">
        <ReportTableGroup v-if="props.row.isNext" :displayGroupType="displayGroupType" :lazyLoading="lazyLoading"
                          class="inner-group-table" :show-header="false" :configDefinition="configDefinition"
                          :tableLinkGroup="props.row._link_groups"/>
        <ReportTableRows v-else-if="displayGroupType === 'in'" :lazyLoading="lazyLoading"
                         :configDefinition="configDefinition" :tableLinkRows="props.row._link_rows"/>
      </template>
    </el-table-column>
    <el-table-column v-for="tableColumn in tableColumns" :key="tableColumn.label" :label="tableColumn.label"
                     :prop="tableColumn.prop" min-width="350px"></el-table-column>
  </data-tables>
</template>

<script setup lang="ts">
import {ref, computed, watch, onBeforeUnmount, reactive, onMounted} from "vue";

import axios from "@cyoda/ui-lib/src/plugins/axios";
import type {ReportGroup} from "@cyoda/ui-lib/src/types/types";
import ReportTableRows from "./ReportTableRows.vue";
import HelperReportTable from "../../helpers/HelperReportTable";
import type {ReportTableTableDataRow} from "./ReportTable";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";

const STORAGE_KEY = 'ReportTableGroup';

const helperStorage = new HelperStorage();
const form = reactive({
  currentPage: 1,
  pageSize: helperStorage.get(STORAGE_KEY, 5)
});

const props = defineProps({
  tableLinkGroup: {default: ""},
  showHeader: {default: true},
  displayGroupType: {default: ""},
  configDefinition: {
    default: () => {
      return {};
    }
  },
  lazyLoading: {default: false},
  smallPagination: {default: false},
});
const tableColumns = computed(() => {
  let columns: Array<{
    label: string;
    prop: string
  }> = [];
  if (Object.keys(groups.value).length > 0) {
    columns.push({
      label: "group",
      prop: "group"
    });
    columns = columns.concat(HelperReportTable.getHeaderHistoryGroupColumns(groups.value));
  }
  return columns;
});
const tableData = computed(() => {
  if (Object.keys(groups.value).length > 0) {
    return groups.value._embedded.wrappedEntityModels.slice(0, groups.value.page.size).map((el) => {
      let row = {
        group: `Group - ${el.content.groupValues.join(" | ")}`,
        _link_rows: el._links["/report/{id}/group_rows/{group_json_base64}"].href,
        _link_groups: (el._links["/report/{id}/{grouping_version}/groups/{parent_group_json_base64}"] && el._links["/report/{id}/{grouping_version}/groups/{parent_group_json_base64}"].href) || null,
        isNext: el.content.isNext
      };

      row = {
        ...row,
        ...HelperReportTable.getHeaderHistoryGroupSummaryData(el.content.summary)
      };
      return row;
    });
  } else {
    return [];
  }
});

const groupTableRef = ref(null);

let groups = ref({});

const paginationProps = computed(() => {
  let data = undefined;
  if (props.smallPagination) {
    data = {
      small: false,
      layout: 'pager'
    }
  }
  return data;
});

async function loadGroups(link: string) {
  const {data} = await axios.get<ReportGroup>(link);
  groups.value = data;
}

eventBus.$on("report-group-rows:row-click", onSelectedRow);

onBeforeUnmount(() => {
  eventBus.$off("report-group-rows:row-click", onSelectedRow);
});

function onSelectedRow() {
  groupTableRef.value.elTableRef.setCurrentRow();
}

watch(
  () => props.tableLinkGroup,
  (val: string) => {
    if (val) {
      loadGroups(val);
    }
  },
  {immediate: true}
);

async function rowClick(row: ReportTableTableDataRow) {
  if (!row.isNext && props.displayGroupType === "out") {
    eventBus.$emit("report-group-rows:row-click", JSON.parse(JSON.stringify(row)));
    groupTableRef.value.elTableRef.setCurrentRow(row);
  }
}

const maxHeight = ref(500);
onMounted(() => {
  resize();
})

function resize() {
  const headerHeight = document.querySelector('header.sticky')?.clientHeight || 0;
  let height = window.innerHeight - headerHeight - 100;
  if (height < 150) height = 200;
  maxHeight.value = height;
}

window.addEventListener('resize', resize);

function resetGroup(){
  groups.value={};
}

defineExpose({resetGroup});
</script>
