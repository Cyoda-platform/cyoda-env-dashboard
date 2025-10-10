<template>
  <div ref="rootRef">
    <component
      :table-props="{
      border: true,
      size: 'mini',
      maxHeight: maxHeight
    }"
      :is="componentParams.component"
      v-bind="componentParams.params"
      @query-change="loadData"
      class="ab-style"
      v-loading="isLoadingDataTables.value"
      :data="tableData"
      ref="tableRef"
      border
      @row-dblclick="rowClick"
      :remote="props.lazyLoading"
      style="width: 100%"
      v-model:pageSize="form.pageSize"
      v-model:currentPage="form.currentPage"
    >
      <el-table-column v-for="tableColumn in tableColumns" :key="tableColumn.label" :label="tableColumn.label"
                       :prop="tableColumn.prop" :sortable="tableColumn.sortable" min-width="200px">
        <template #default="{ row }">
          <!--        Collections -->
          <ReportTableCell v-if="isVisibleCollections(tableColumn.prop, row)" :row="row"
                           :prop="getHeaderName(tableColumn.prop)"/>
          <span v-else>
          {{ row[tableColumn.prop] }}
        </span>
        </template>
      </el-table-column>
    </component>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, reactive, onMounted} from "vue";

import axios from "@cyoda/ui-lib/src/plugins/axios";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";

import type {ReportingReportRows} from "@cyoda/ui-lib/src/types/types";

import ReportTableCell from "@cyoda/http-api/src/components/ReportTable/ReportTableCell.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useChartsDataStore} from "../../stores/charts-data";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";
import {flatten} from 'flat';
import _ from "lodash";

interface TableDataRow {
  [p: string]: string;
}

interface QueryInfo {
  filters: string[];
  page: number;
  pageSize: number;
  sort: object;
  type: string;
}

const STORAGE_KEY = 'ReportTableRows';

const props = defineProps({
  tableLinkRows: {default: ""},
  lazyLoading: {default: false},
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const chartsDataStore = useChartsDataStore();

const rootRef = ref(null);

const helperStorage = new HelperStorage();
const form = reactive({
  currentPage: 1,
  pageSize: helperStorage.get(STORAGE_KEY, 5)
});

const componentParams = computed(() => {
  if (props.lazyLoading) {
    return {
      component: "data-tables",
      params: {
        paginationProps: {
          pageSizes: [5, 10, 20, 50],
          total: totalElements.value,
        },
        loading: isLoadingDataTablesServer.value
      }
    };
  } else {
    return {
      component: "data-tables"
    };
  }
});

function addChartRows(rows) {
  return chartsDataStore.addChartRows(rows);
}

let tableData = ref([]);
let tableColumns = ref([]);
const totalElements = ref(0);
const pageSize = ref(10);
const isLoadingDataTables = ref<boolean>(false);
const isLoadingDataTablesServer = ref<boolean>(false);

async function loadRows(link: string) {
  const {data} = await axios.get(link);
  return data;
}

function getAllPosibleColumns(rows) {
  let cols = [];

  rows.forEach(row => {
    const newCols = Object.keys(flatten(row));
    newCols.forEach((newColum)=>{
      if(!cols.includes(newColum)) {
        cols.push(newColum);
      }
    })
  });

  return cols;
}

function setTableColumns(data: any[]) {
  if (Object.keys(data).length > 0) {
    const reportRows = data._embedded.reportRows;
    let columns = getAllPosibleColumns(reportRows);
    tableColumns.value = columns.map((el) => {
      return {
        label: el,
        prop: el,
        sortable: !props.lazyLoading
      };
    });
  } else if (props.configDefinition && props.configDefinition.columns) {
    tableColumns.value = props.configDefinition.columns.map((el) => {
      const name = HelperFormat.shortNamePath(el.name);
      return {
        label: name,
        prop: getFieldName(name),
        sortable: !props.lazyLoading
      };
    });
  } else {
    tableColumns.value = [];
  }
}

function getFieldName(name: string) {
  let field = name.replace(/\./g, "_");
  if (field.indexOf("*") > -1) {
    const fields = field.split("_[");
    field = fields[0];
  }

  if (field.indexOf("_['#") > -1) {
    field = field.replace(/\[('|")(.*)('|")\]/, (match, ...args) => {
      return args[1];
    });
  }
  return field;
}

function setTableData(data: ReportingReportRows) {
  if (Object.keys(data).length > 0) {
    let reportRows = data._embedded.reportRows;
    if (props.lazyLoading) {
      reportRows = reportRows.slice(0, pageSize.value);
    }
    tableData.value = reportRows.map((el) => flatten(el));

    // const rows =
    //   (data._embedded &&
    //     data._embedded.reportRows &&
    //     data._embedded.reportRows.slice(0, data.page.size).map((el) => {
    //       return HelperFormat.flatTableRow(el);
    //     })) ||
    //   [];
    // addChartRows(rows);
  }
}

async function rowClick(row: TableDataRow) {
  eventBus.$emit("report-table-rows:row-click", {
    row: JSON.parse(JSON.stringify(row))
  });
}

async function loadData(queryInfo: QueryInfo) {
  if (!props.lazyLoading) return;
  pageSize.value = queryInfo.pageSize;
  isLoadingDataTablesServer.value = true;
  const data = await loadRows(`${props.tableLinkRows}?size=${queryInfo.pageSize}&page=${queryInfo.page - 1}`);
  isLoadingDataTablesServer.value = false;
  if (queryInfo.type === "init") {
    totalElements.value = data.page.totalElements;
    setTableColumns(data);
  }
  setTableData(data);
}

watch(
  () => props.lazyLoading,
  async () => {
    if (!props.lazyLoading && props.tableLinkRows) {
      isLoadingDataTables.value = true;
      const data = await loadRows(`${props.tableLinkRows}?size=100000`);
      isLoadingDataTables.value = false;
      setTableColumns(data);
      setTableData(data);
    }
  },
  {immediate: true}
);

watch(
  () => form.pageSize,
  (value) => {
    helperStorage.set(STORAGE_KEY, value);
  }
)

function isVisibleCollections(prop: string, row: TableDataRow) {
  if (prop.split(".").pop() === "[*]") {
    const headerName = getHeaderName(prop);
    return row[headerName];
  } else {
    return false;
  }
}

function getHeaderName(prop: string) {
  return prop.split(".").shift()!;
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
</script>
