<template>
  <div class="chart-wrapper-group">
    <div v-if="settings.chartType.hierarchy" class="actions">
      <el-button v-if="buttonBackLink.name" @click="onClickBack" type="info">
        <font-awesome-icon icon="chevron-left" />
        Back to {{ buttonBackLink.name }}
      </el-button>

      <div class="inner" v-if="false">
        <span
          :class="{
            exist: status.isAvailable === true
          }"
          >{{ status.text }}</span
        >
      </div>
    </div>
    <ChartBase @changeGroups="onChangeGroups" class="chart-base" :chartData="chartData" :settings="settings" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import axios from "@cyoda/ui-lib/src/plugins/axios";
import type { ReportGroup } from "@cyoda/ui-lib/src/types/types";
import ChartBase from "../charts/ChartBase.vue";
import type { ChartDataHeader, ChartLegendItem, ChartOptions } from "../types";

interface TableLink {
  name: string;
  link: string;
}

const props = defineProps({
  tableLinkGroup: { default: "" },
  settings: {
    default: () => {
      return {};
    }
  }
});
const options = computed(() => {
  let options: ChartOptions = {} as ChartOptions;
  if (Object.keys(groups.value).length > 0) {
    options = {
      maintainAspectRatio: false,
      responsive: true,
      legend: props.settings.options.legend,
      title: props.settings.options.title,
      animation: {
        duration: 0
      },
      scales: {
        yAxes: [
          {
            ticks: {
              fontColor: props.settings.style.verticalAxisColor || undefined
            }
          }
        ],
        xAxes: [
          {
            ticks: {
              fontColor: props.settings.style.horizontalAxisColor || undefined
            }
          }
        ]
      },
      plugins: {
        datalabels: {
          formatter(value, context) {
            if (context.dataset.chartLabel.length > 0) {
              return context.dataset.chartLabel[context.dataIndex];
            } else {
              return "";
            }
          }
        }
      },
      onClick: (e: Event, legendItem: ChartLegendItem[]) => {
        if (groups.value._embedded.wrappedEntityModels[0].content.isNext && legendItem.length > 0 && legendItem[0]._index >= 0) {
          const index = legendItem[0]._index;
          const groupHeaders = groups.value._embedded.wrappedEntityModels[index];
          const link = groupHeaders._links["/report/{id}/{grouping_version}/groups/{parent_group_json_base64}"].href;
          tableLinks.value.push({
            name: groupHeaders.content.groupValues.join(" | "),
            link
          });
        }
      }
    };
  }
  return options;
});
const chartDataHeaders = computed(() => {
  let headerRow: ChartDataHeader[] = [];
  if (Object.keys(props.settings.xAxis.chartData).length > 0) {
    headerRow.push({
      label: props.settings.xAxis.chartData.label,
      prop: props.settings.xAxis.chartData.prop
    });
  } else {
    headerRow.push({
      label: "Group",
      prop: "groupName"
    });
  }
  props.settings.columns.forEach((column) => {
    headerRow.push({
      label: column.chartData.label,
      prop: column.chartData.prop
    });
    if (Object.keys(column.chartLabel).length > 0) {
      headerRow.push({
        label: { type: "number", role: "annotation" },
        prop: column.chartLabel.prop
      });
    }
  });
  return headerRow;
});
const chartData = computed(() => {
  const table: string[][] | number[][] = [];
  if (groups.value && groups.value._embedded && groups.value._embedded.wrappedEntityModels.length > 0) {
    chartDataHeaders.value.forEach((header) => {
      if (!table[0]) table[0] = [];

      table[0].push(header.label);
      if (header.chartLabel) {
        table[0].push({ role: "annotation" });
      }
    });
    if (props.settings.chartType.hierarchy) {
      table[0].push("");
    }

    groups.value._embedded.wrappedEntityModels.forEach((el, indexRow: number) => {
      chartDataHeaders.value.forEach((column, indexColumn: number) => {
        if (!table[indexRow + 1]) table[indexRow + 1] = [];
        if (column.prop === "groupName") {
          table[indexRow + 1][indexColumn] = el.content.groupValues[0];
        } else {
          const aggregationName = Object.keys(el.content.summary[column.prop].values)[0];

          table[indexRow + 1][indexColumn] = el.summary[column.prop].values[aggregationName];
        }
      });
      const link = el._links["/report/{id}/{grouping_version}/groups/{parent_group_json_base64}"];
      if (props.settings.chartType.hierarchy) {
        table[indexRow + 1][chartDataHeaders.value.length] = (link && link.href) || "";
      }
    });
  }
  return table;
});
const buttonBackLink = computed(() => {
  if (tableLinks.value.length > 1) {
    return tableLinks.value[tableLinks.value.length - 2];
  } else {
    return {};
  }
});
const status = computed(() => {
  if (groups.value && groups.value._embedded && groups.value._embedded.wrappedEntityModels) {
    return {
      text: groups.value._embedded.wrappedEntityModels[0].content.isNext ? "Next level available" : "Finish",
      isAvailable: groups.value._embedded.wrappedEntityModels[0].content.isNext
    };
  }
  return {};
});

let groups = ref({});
let tableLinks = ref([]);

function onClickBack() {
  tableLinks.value.pop();
}

watch(
  () => props.tableLinkGroup,
  () => {
    if (props.tableLinkGroup) {
      tableLinks.value.push({
        name: "root",
        link: props.tableLinkGroup
      });
    }
  },
  { immediate: true }
);

async function onChangeGroups(link: string) {
  const isExist = tableLinks.value.find((el) => {
    return el.link === link;
  });
  if (!isExist && link) {
    const item = chartData.value.find((el) => el.indexOf(link) > -1);
    tableLinks.value.push({
      name: item[0],
      link
    });
  }
}

watch(
  tableLinks,
  async () => {
    if (tableLinks.value.length > 0) {
      const el = tableLinks.value[tableLinks.value.length - 1];
      const { data } = await axios.get<ReportGroup>(el.link);
      groups.value = data;
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.chart-wrapper-group {
  .actions {
    height: 40px;
    margin: 15px 0;
    position: relative;

    .inner {
      position: absolute;
      top: 0;
      right: 0;

      span {
        color: #747474;

        &.exist {
          color: rgba(0, 128, 0, 0.95);
        }
      }
    }
  }
}
</style>
