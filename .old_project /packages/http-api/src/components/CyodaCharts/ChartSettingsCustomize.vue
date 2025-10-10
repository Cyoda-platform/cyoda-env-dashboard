<template>
  <el-form label-position="top" class="chart-settings-customize" ref="form" :model="settings">
    <h2>Series</h2>
    <div class="series-wrapper" v-for="col in settings.columns">
      <h3>{{ col.chartData.label }}</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Color">
            <el-color-picker v-model="col.chartStyle.borderColor"></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <el-divider />

    <h2>Colors</h2>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-form-item label="Background color">
          <el-color-picker v-model="settings.style.backgroundColor"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Border color">
          <el-color-picker v-model="settings.style.borderColor"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Vertical axis color">
          <el-color-picker v-model="settings.style.verticalAxisColor"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Horizontal axis color">
          <el-color-picker v-model="settings.style.horizontalAxisColor"></el-color-picker>
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider />

    <h2>Texts</h2>
    <el-row :gutter="20">
      <el-col :span="10">
        <el-form-item label="Title text">
          <el-input v-model="settings.options.title.text"></el-input>
        </el-form-item>
      </el-col>

      <el-col :span="10">
        <el-form-item label="Legend position">
          <el-select v-model="settings.options.legend.position" placeholder="Select">
            <el-option v-for="item in legendPositions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  settings: {
    default: () => {
      return {};
    }
  }
});

let legendPositions = ref([
  {
    value: "top",
    label: "Top"
  },
  {
    value: "left",
    label: "Left"
  },
  {
    value: "bottom",
    label: "Bottom"
  },
  {
    value: "right",
    label: "Right"
  }
]);
</script>

<style lang="scss">
.chart-settings-customize {
  .el-form-item__label {
    padding-bottom: 0;
  }

  .el-select {
    width: 100%;
  }
  .series-wrapper {
    margin-top: 15px;
  }
}
</style>
