<template>
  <div class="chart-settings-column">
    <div class="wrap-selected-columns">
      <div class="selected-columns">
        <span v-if="Object.keys(selectedDataColumn.chartData).length > 0" class="prepend-icon-chart">
          <font-awesome-icon :icon="selectedDataColumn.chartData.icon"/>
        </span>
        <span>
          <el-select value-key="label" filterable size="small" v-model="selectedDataColumn.chartData"
                     placeholder="Select">
            <el-option v-for="dataColumn in rootColumns" :key="dataColumn.key" :label="dataColumn.label"
                       :value="dataColumn">
              <span class="prepend-icon-chart">
                <font-awesome-icon :icon="dataColumn.icon"/>
              </span>
              <span>{{ dataColumn.label }}</span>
            </el-option>
          </el-select>
        </span>

        <el-dropdown v-if="Object.keys(selectedDataColumn.chartData).length > 0" trigger="click" class="append-icon">
          <span class="el-dropdown-link">
            <font-awesome-icon icon="ellipsis-v"/>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click.native="onRemoveSeries()">Remove</el-dropdown-item>
              <el-dropdown-item v-if="Object.keys(selectedDataColumn.chartLabel).length > 0 && isEnableChartLabel"
                                @click.native="onRemoveChartLabel(selectedDataColumn)">Remove labels
              </el-dropdown-item>
              <el-dropdown-item
                v-if="Object.keys(selectedDataColumn.chartLabel).length === 0 && isEnableChartLabel && settings.chartType.addNewLabel"
                @click.native="onAddChartLabel(selectedDataColumn)">Add labels
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-if="isEnableChartLabel && settings.xAxis.chartData.isTrendlinePossible" class="wrap-trendline">
        <el-checkbox v-model="selectedDataColumn.chartData.trendline" label="Trendline"></el-checkbox>
        <el-select class="trendline-type" clearable value-key="label" filterable size="small"
                   v-model="selectedDataColumn.chartData.trendlineType" placeholder="Trendline Type">
          <el-option v-for="item in trendlineTypeOptions" :key="item.value" :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
      </div>
    </div>

    <!--    ChartLabel-->
    <div v-if="isEnableChartLabel && Object.keys(selectedDataColumn.chartLabel).length > 0 && childColumns.length > 0"
         class="wrap-label">
      <span class="column-inner-label">Label</span>
      <div class="selected-columns inner">
        <span class="prepend-icon-chart">
          <font-awesome-icon :icon="selectedDataColumn.chartLabel.icon"/>
        </span>
        <span>
          <el-select value-key="label" filterable v-model="selectedDataColumn.chartLabel" placeholder="Select">
            <el-option v-for="dataColumn in childColumns" :key="dataColumn.key" :label="dataColumn.label"
                       :value="dataColumn">
              <span class="prepend-icon-chart">
                <font-awesome-icon :icon="dataColumn.icon"/>
              </span>
              <span>{{ dataColumn.label }}</span>
            </el-option>
          </el-select>
        </span>
        <span @click="onRemoveChartLabel(selectedDataColumn)" class="append-icon">
          <font-awesome-icon icon="times-circle"/>
        </span>
      </div>
    </div>
    <!--    End ChartLabel-->
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

import type {ColumnItem, IChartSettingsColumn} from "./types";

const emit=defineEmits(['remove']);
const props = defineProps({
  rootColumns: {
    default: () => {
      return [];
    }
  },
  childColumns: {
    default: () => {
      return [];
    }
  },
  isEnableChartLabel: {
    default: true
  },
  selectedDataColumn: {
    default: () => {
      return {};
    }
  },
  settings: {
    default: () => {
      return {};
    }
  }
});

let trendlineTypeOptions = ref([
  {
    label: "Exponential",
    value: "exponential"
  },
  {
    label: "Polynomial",
    value: "polynomial"
  }
]);

function onRemoveSeries() {
  emit("remove");
}

function onRemoveChartLabel(column: IChartSettingsColumn) {
  column.chartLabel = {} as ColumnItem;
}

function onAddChartLabel(column: IChartSettingsColumn) {
  column.chartLabel = props.childColumns[0];
}
</script>

<style lang="scss">
.chart-settings-column {
  .selected-columns {
    height: 36px;
    padding: 5px 10px;
    border-radius: 15px;
    background: #f1f3f4;
    display: flex;
    align-items: center;
    width: 200px;
    margin-bottom: 15px;
    margin-top: 5px;
    color: #424242;

    .el-input__inner {
      border: none;
      background: transparent;
      padding: 0;
      font-size: 14px;
    }

    .el-input__suffix {
      display: none;
    }
  }

  .wrap-selected-columns {
    display: flex;
  }

  .wrap-trendline {
    margin-left: 15px;
    padding-top: 3px;
  }

  .wrap-label {
    margin-left: 30px;
    margin-bottom: 15px;
    margin-top: -10px;
    line-height: normal;
  }

  .selected-columns.inner {
    margin: 0;
  }

  .column-inner-label {
    color: #80868b;
    font-weight: bold;
  }

  .append-icon {
    margin-left: auto;
    opacity: 0.6;
    cursor: pointer;

    .el-dropdown-link {
      text-align: center;
      width: 15px;
      display: inline-block;
    }
  }

  .append-icon:hover {
    opacity: 1;
  }

  .trendline-type {
    margin-left: 15px;
  }
}
</style>
