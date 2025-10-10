<template>
  <el-form class="shards-detail-tab-pm-components-execution-monitors-filter" label-position="top"
           :model="form">
    <h3>Filter</h3>
    <el-row class="wrap-row" :gutter="20">
      <el-col :span="5">
        <el-form-item label="Filter by name">
          <el-input v-model="form.name" placeholder="Filter by name"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="Update Interval (seconds)">
          <el-input-number :min="1" v-model="form.updateInterval"
                           placeholder="Update Interval"></el-input-number>
        </el-form-item>
      </el-col>
      <el-col class="action-item" :span="4">
        <el-button type="primary" @click="onSubmit">Update</el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

const emit = defineEmits(["filter", "filter"]);

let form = ref({
  name: "",
  updateInterval: 2
});

function onSubmit() {
  emit("filter", form.value);
}

watch(
  () => form.value.name,
  () => {
    emit("filter", form.value);
  },
  {immediate: true}
);
</script>

<style lang="scss">
.shards-detail-tab-pm-components-execution-monitors-filter {
  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .wrap-row {
    position: relative;

    .action-item {
      padding-top: 22px;
    }
  }
}
</style>
