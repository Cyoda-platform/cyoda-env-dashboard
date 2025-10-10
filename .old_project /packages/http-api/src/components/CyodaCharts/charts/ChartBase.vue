<template>
  <GChart class="chart-base" ref="gChartRef" :type="chartType.value" :data="chartDataComputed" :options="chartOptions" :events="chartEvents" />
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from "vue";

import { GChart } from "vue-google-charts";

interface ChartOptionsComputed {
  title: string | null;
  hAxis: {
    title: string;
    baselineColor: string;
    format?: string;
  };
  vAxis: {
    baselineColor: string;
  };
  legend: {
    position: string;
  };
  trendlines: Array<{ [key: number]: { type: string } }>;
  backgroundColor: {
    fill: string;
    stroke: string;
    strokeWidth: string;
  };
  colors: string[];
}

interface ChartInstance {
  chartObject: {
    getSelection: () => Array<{ col: number; row: number }>;
  };
}

const emit = defineEmits(["changeGroups"]);
const props = defineProps({chartData: {
    default: () => {
      return [];
    }
  },
options: {
    default: () => {
      return {};
    }
  },
settings: {
    default: () => {
      return {};
    }
  }});
const chartType = computed(() => {
    return props.settings.chartType;
  })
const chartDataComputed = computed(() => {
    if (props.settings.chartType && props.settings.chartType.value === "PieChart") {
      for (const row of props.chartData) {
        for (const el of row) {

          const index = row.indexOf(el);
          if (index === 0) {
            row[index] = row[index].toString();
          } else if (index > 0 && typeof row[index] === "number" && row[index] < 0) {
            row[index] = 0;
          }
        }
      }
    }
    props.chartData.sort((a: number[] | string[], b: number[] | string[]) => {
      if (typeof a[0] === "number" && typeof b[0] === "number") {
        return a[0] - b[0];
      }
      return 1;
    });
    return props.chartData;
  })
const chartOptions = computed(() => {
    const chartOptions: ChartOptionsComputed = {
      title: props.settings.options.title.text || null,
      hAxis: {
        title: props.settings.xAxis.chartData.label || "",
        baselineColor: props.settings.style.verticalAxisColor || "black"
      },
      vAxis: {
        baselineColor: props.settings.style.horizontalAxisColor || "black"
      },
      legend: {
        position: props.settings.options.legend.position
      },
      trendlines: [],
      backgroundColor: {
        fill: props.settings.style.backgroundColor || "transparent",
        stroke: props.settings.style.borderColor || "transparent",
        strokeWidth: "4"
      },
      colors: JSON.parse(JSON.stringify(listOfColors.value))
    };

    props.settings.columns.forEach((column, index) => {
      if (column.chartStyle.borderColor) {
        chartOptions.colors[index] = column.chartStyle.borderColor;
      }
      if (column.chartData.trendline) {
        let options: { type: string } = {} as { type: string };
        if (column.chartData.trendlineType) {
          options.type = column.chartData.trendlineType;
        }
        chartOptions.trendlines[index] = options;
      }
    });
    if (props.settings.xAxis && props.settings.xAxis.chartData && props.settings.xAxis.chartData.type && props.settings.xAxis.chartData.type.indexOf("date") > -1) {
      chartOptions.hAxis.format = "dd/MM/yyyy";
    }
    return chartOptions;
  })
const styleComponent = computed(() => {
    return {
      backgroundColor: props.settings.style.backgroundColor || "transparent",
      border: `2px solid ${props.settings.style.borderColor || "transparent"}`
    };
  })

  const gChartRef = ref(null);








  let listOfColors = ref(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"]);

  let chartEvents = ref({
    select: () => {
      changeGroups(gChartRef.value)
    }
  })

  const isEnabled = ref<boolean>(true);







function changeGroups(chart: ChartInstance) {
    const sel = chart.chartObject.getSelection();
    if (sel && sel.length > 0) {
      const el = chartDataComputed.value[sel[0].row + 1];
      emit("changeGroups", el[el.length - 1]);
    }
  }




                            watch(() =>  props.options, async () => {

    isEnabled.value = false;
    await nextTick();

      isEnabled.value = true;

                            },  { deep: true, immediate: true });
</script>

<style lang="scss">
.action {
  text-align: right;
}
</style>
