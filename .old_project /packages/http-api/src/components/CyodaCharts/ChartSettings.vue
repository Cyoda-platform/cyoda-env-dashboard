<template>
  <el-form class="chart-settings" :rules="rules" ref="formRef" :model="settings" label-width="120px">
    <el-form-item prop="name" label="Name">
      <el-input class="name" v-model="settings.name"></el-input>
    </el-form-item>
    <el-form-item prop="chartType" label="Chart type">
      <el-select @change="onChangeChartType" v-model="settings.chartType" placeholder="Select">
        <el-option v-for="option in typesOptions" :key="option.value" :label="option.label" :value="option">
          <span style="float: left">{{ option.label }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">
            <font-awesome-icon :icon="option.icon" />
          </span>
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item prop="dataSource" label="Data Source">
      <el-select @change="onChangeDataSource" v-model="settings.dataSource" placeholder="Select">
        <el-option v-for="option in dataSourceOptions" :key="option.value" :label="option.label" :value="option.value"> </el-option>
      </el-select>
      <div class="rows-message" v-if="chartRows.length === 0">For Rows source, please, make sure you have several rows in report</div>
    </el-form-item>

    <el-form-item class="wrap-series" label="X-axis">
      <ChartSettingsColumnSelect :rootColumns="dataColumns" :childColumns="dataColumns" :isEnableChartLabel="false" :selectedDataColumn="settings.xAxis" @remove="onRemoveXAxis" />
    </el-form-item>

    <el-form-item prop="columns" class="wrap-series" label="Series">
      <ChartSettingsColumnSelect v-for="(selectedDataColumn, index) in settings.columns" :key="index" :settings="settings" :rootColumns="dataColumnsPossible" :childColumns="dataColumns" :selectedDataColumn="selectedDataColumn" @remove="onRemoveSeries(index)" />

      <el-select :disabled="settings.columns.length > 0 && !settings.chartType.multipleColumns" value-key="label" class="add-series-select" @change="onChangeSeries" v-model="series" placeholder="Add Series">
        <el-option v-for="dataColumn in dataColumnsPossible" :key="dataColumn.key" :label="dataColumn.label" :value="dataColumn">
          <span class="prepend-icon-chart">
            <font-awesome-icon :icon="dataColumn.icon" />
          </span>
          <span>{{ dataColumn.label }}</span>
        </el-option>
      </el-select>
    </el-form-item>

    <div v-if="dataColumnsPossible.length === 0" class="message series-message">Report not contains columns with type <strong>Number</strong>.</div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import axios from "@cyoda/ui-lib/src/plugins/axios";
import type { ReportGroup } from "@cyoda/ui-lib/src/types/types";

import ChartSettingsColumnSelect from "./ChartSettingsColumnSelect.vue";
import HelperCyodaChart from "../../helpers/HelperCyodaChart";
import HelperReportDefinition from "../../helpers/HelperReportDefinition";
import HelperReportTable from "../../helpers/HelperReportTable";
import type { ChartType, ColumnItem, IChartSettings, IChartSettingsColumn } from "./types";
import {useChartsDataStore} from "../../stores/charts-data";

const props = defineProps({
  settings: {
    default: () => {
      return {};
    }
  },
  tableLinkGroup: { default: "" },
  configDefinition: {
    default: () => {
      return {};
    }
  }
});
const chartsDataStore = useChartsDataStore();
const chartRows = computed(() => {
  return chartsDataStore.chartRows;
});
const dataColumnsPossible = computed(() => {
  return dataColumns.value.filter((el) => HelperCyodaChart.numberTypes.indexOf(el.type) !== -1);
});

const formRef = ref(null);

let dataColumns = ref([]);

const series = ref<string>("");
const emit=defineEmits(['changeSettings','changeDataSource']);

let rules = ref({
  name: [{ required: true, message: "Please input Name", trigger: "blur" }],
  chartType: [
    {
      required: true,
      message: "Please select Chart Type",
      trigger: "change"
    }
  ],
  dataSource: [
    {
      required: true,
      message: "Please select Data Source",
      trigger: "change"
    }
  ],
  columns: [{ required: true, message: "Please select Columns", trigger: "change" }]
});

let typesOptions = ref([
  {
    label: "Line",
    value: "LineChart",
    icon: "chart-line",
    trendline: true,
    addNewLabel: true,
    multipleColumns: true,
    hierarchy: false
  },
  {
    label: "Pie",
    value: "PieChart",
    icon: "chart-pie",
    trendline: false,
    addNewLabel: false,
    multipleColumns: false,
    hierarchy: true
  },
  {
    label: "Bar",
    value: "ColumnChart",
    icon: "chart-bar",
    trendline: true,
    addNewLabel: false,
    multipleColumns: true,
    hierarchy: false
  },
  {
    label: "Scatter",
    value: "ScatterChart",
    icon: "braille",
    trendline: true,
    addNewLabel: true,
    multipleColumns: true,
    hierarchy: false
  }
]);

let dataSourceOptions = ref([
  {
    label: "Groups summary",
    value: "group"
  },
  {
    label: "Rows",
    value: "row"
  }
]);

watch(
  () => props.settings.dataSource,
  async () => {
    if (props.settings.dataSource === "group") {
      dataColumns.value = await columnsGroup();
    }
    if (props.settings.dataSource === "row") {
      dataColumns.value = await columnsRow();
    }
  },
  { immediate: true }
);

watch(
  () => props.settings,
  () => {
    emit("changeSettings");
  },
  { deep: true }
);

async function columnsGroup() {
  const { data } = await axios.get<ReportGroup>(props.tableLinkGroup);
  if (data && data._embedded && data._embedded.wrappedEntityModels) {
    const columnsGroup = HelperReportTable.getHeaderHistoryGroupColumns(data);
    return columnsGroup.map((el) => {
      return {
        label: el.label,
        key: el.prop,
        prop: el.prop,
        type: "number",
        icon: HelperCyodaChart.getType("number"),
        trendline: false,
        trendlineType: "",
        isTrendlinePossible: HelperCyodaChart.checkTrendline("number")
      };
    });
  } else {
    return [];
  }
}

async function columnsRow() {
  const allCols = HelperReportDefinition.buildCols(props.configDefinition);
  const allColNames = props.configDefinition.columns.map((el) => el.name);
  const cols = allCols.filter((el) => {
    return allColNames.indexOf(el.alias) !== -1;
  });
  return cols.map((el) => {
    return {
      label: el.alias,
      key: el.alias,
      prop: el.alias,
      type: el.typeShort.toLowerCase(),
      icon: HelperCyodaChart.getType(el.typeShort.toLowerCase()),
      trendline: false,
      trendlineType: "",
      isTrendlinePossible: HelperCyodaChart.checkTrendline(el.typeShort.toLowerCase())
    };
  });
}

function onChangeSeries(val: ColumnItem) {
  const data: IChartSettingsColumn = {
    chartData: val,
    chartLabel: {} as ColumnItem,
    chartStyle: {
      borderColor: null,
      fill: "start",
      backgroundColor: null
    }
  };
  props.settings.columns.push(data);
  series.value = "";
}

function onChangeChartType(val: ChartType) {
  if (!val.multipleColumns) {
    props.settings.columns = props.settings.columns.slice(0, 1);
  }
}

function onRemoveSeries(index: number) {
  delete props.settings.columns.splice(index, 1);
}

function onRemoveXAxis() {
  props.settings.xAxis = {
    chartData: {} as ColumnItem,
    chartLabel: {} as ColumnItem
  };
}

function onChangeDataSource() {
  emit("changeDataSource");
}
</script>

<style lang="scss">
.chart-settings {
  .add-series-select .el-input {
    width: 195px;
  }

  .name.el-input {
    width: 195px;
  }

  .wrap-series {
    margin-top: 10px;
  }

  .wrap-series + .wrap-series {
    margin-top: -25px;
  }
}

.prepend-icon-chart {
  color: #8492a6;
  font-size: 13px;
  margin-right: 10px;
  width: 15px;
  display: inline-block;
}

.rows-message {
  color: rgba(255, 0, 0, 0.6);
}

.series-message {
  padding-left: 120px;
  margin-top: -10px;
  color: rgba(255, 0, 0, 0.6);
}
</style>
