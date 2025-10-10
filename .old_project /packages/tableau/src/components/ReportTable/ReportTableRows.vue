<template>
  <div></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import axios from "@cyoda/ui-lib/src/plugins/axios";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import { IDefinitionContent, ReportingReportRows } from "@cyoda/ui-lib/src/types/types";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

interface TableDataRow {
  [p: string]: string;
}

interface QueryInfo {
  filters: string[];
  page: number;
  pageSize: number;
  type: string;
}

const props = defineProps({
  tableLinkRows: { default: "" },
  lazyLoading: { default: false },
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const componentParams = computed(() => {
  if (props.lazyLoading) {
    return {
      component: "data-tables-server",
      params: {
        total: totalElements.value,
        loading: isLoadingDataTablesServer.value
      }
    };
  } else {
    return {
      component: "data-tables"
    };
  }
});

let tableData = ref([]);
let tableColumns = ref([]);
const totalElements = ref(0);
const pageSize = ref(10);
const isLoadingDataTables = ref<boolean>(false);
const isLoadingDataTablesServer = ref<boolean>(false);
const myConnector = ref(null);

async function loadRows(link: string) {
  const { data } = await axios.get(link);
  return data;
}

function setTableColumns() {
  if (props.configDefinition && props.configDefinition.columns) {
    tableColumns.value = props.configDefinition.columns.map((el) => {
      const name = HelperFormat.shortNamePath(el.name);
      return {
        label: name,
        prop: getFieldName(name)
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

  if (field.indexOf('_["#') > -1) {
    field = field.replace(/\[("|")(.*)("|")\]/, (match, ...args) => {
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
    tableData.value = reportRows.map((el) => HelperFormat.flatTableRow(el.content));
  }
}

async function rowClick(row: TableDataRow) {
  eventBus.$emit("report-table-rows:row-click", {
    row: JSON.parse(JSON.stringify(row))
  });
}

function onClickColumnCollections(prop: string, row: TableDataRow) {
  const headerName: string = prop.split(".").shift()!;
  if (headerName) {
    eventBus.$emit("column-collections:show-detail", {
      data: row[headerName],
      headerName: prop
    });
  }
}

async function loadData(queryInfo: QueryInfo) {
  pageSize.value = queryInfo.pageSize;
  isLoadingDataTablesServer.value = true;
  const data = await loadRows(`${props.tableLinkRows}?size=${queryInfo.pageSize}&page=${queryInfo.page - 1}`);
  isLoadingDataTablesServer.value = false;
  if (queryInfo.type === "init") {
    totalElements.value = data.page.totalElements;
    setTableColumns();
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
      setTableColumns();
      setTableData(data);
    }
  },
  { immediate: true }
);

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

watch(tableData, () => {
  const tableauColumns = tableColumns.value.map((el) => {
    return {
      id: el.prop,
      alias: el.label,
      dataType: (window as any).tableau.dataTypeEnum.string
    };
  });

  const connectionData = {
    tableauColumns,
    tableauData: tableData.value,
    tableauTableAlias: props.configDefinition.description
  };

  (window as any).tableau.connectionData = JSON.stringify(connectionData);
  (window as any).tableau.connectionName = props.configDefinition.description;
  (window as any).tableau.submit();
});
</script>
