<template>
  <div class="data-lineage-filter">
    <h3>Filter</h3>
    <el-form ref="form" label-position="top" label-width="120px">
      <el-form-item label="Start">
        <el-date-picker format="DD.MM.YYYY HH:mm:ss" v-model="filter.dateFrom" type="datetime" placeholder="Start"> </el-date-picker>
      </el-form-item>
      <el-form-item label="End">
        <el-date-picker format="DD.MM.YYYY HH:mm:ss" v-model="filter.dateTo" type="datetime" placeholder="End"> </el-date-picker>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Filter } from "./types";

const props = defineProps({
  filter: {
    default: () => {
      return {};
    }
  }
});
</script>

<style lang="scss">
.data-lineage-filter {
  h3 {
    margin-bottom: 10px;
  }

  .el-form-item__label {
    line-height: normal;
    padding-bottom: 0 !important;
    margin-bottom: 5px;
  }
}
</style>
