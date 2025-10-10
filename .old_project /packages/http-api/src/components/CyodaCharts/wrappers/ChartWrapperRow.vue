<template>
  <div class="chart-wrapper-row">
    <ChartBase class="chart-base" :chartData="chartData" :settings="settings" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import ChartBase from "../charts/ChartBase.vue";

import moment from "moment";
import type { ChartDataHeader } from "../types";
import {useChartsDataStore} from "../../../stores/charts-data";

const props = defineProps({
  tableLinkGroup: { default: "" },
  settings: {
    default: () => {
      return {};
    }
  }
});
const chartsDataStore = useChartsDataStore();
const chartRows = computed(() => {
  return chartsDataStore.chartRows;
});
const chartDataHeaders = computed(() => {
  let headerRow: ChartDataHeader[] = [];
  if (Object.keys(props.settings.xAxis.chartData).length > 0) {
    headerRow.push({
      label: props.settings.xAxis.chartData.label,
      prop: props.settings.xAxis.chartData.prop
    });
  }
  props.settings.columns.forEach((column) => {
    headerRow.push({
      label: column.chartData.label,
      prop: column.chartData.prop
    });
    if (Object.keys(column.chartLabel).length > 0) {
      headerRow.push({
        label: { role: "annotation" },
        prop: column.chartLabel.prop
      });
    }
  });
  return headerRow;
});
const chartData = computed(() => {
  const table: string[][] = [];
  if (chartRows.value.length > 0) {
    chartDataHeaders.value.forEach((header) => {
      if (!table[0]) table[0] = [];

      table[0].push(header.label);
      if (header.chartLabel) {
        table[0].push({ role: "annotation" });
      }
    });

    chartRows.value.forEach((el: { [key: string]: string }, indexRow: number) => {
      chartDataHeaders.value.forEach((column, indexColumn) => {
        if (!table[indexRow + 1]) table[indexRow + 1] = [];
        const propName = column.prop.replace(".", "");
        if (props.settings.xAxis.chartData.type.indexOf("date") > -1 && column.prop === props.settings.xAxis.chartData.prop) {
          table[indexRow + 1][indexColumn] = moment(el[propName]).toDate();
        } else {
          table[indexRow + 1][indexColumn] = el[propName];
        }
      });
    });
  }
  return table;
});
</script>

<style lang="scss">
.chart-wrapper-row {
  .chart-base {
    min-height: 500px;
  }
}
</style>
