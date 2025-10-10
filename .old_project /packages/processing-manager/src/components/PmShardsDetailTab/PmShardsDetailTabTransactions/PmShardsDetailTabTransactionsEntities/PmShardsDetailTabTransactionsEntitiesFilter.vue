<template>
  <el-form class="pm-shards-detail-tab-transactions-entities-filter" label-position="top">
    <h3>Filter</h3>

    <el-row class="wrap-row" :gutter="20">
      <el-col :span="5">
        <el-form-item label="Entity class">
          <el-select filterable v-model="form.entityClass">
            <el-option v-for="entityClass in entityClassOptions" :key="entityClass.value" :label="entityClass.label" :value="entityClass.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="Entity ID">
          <el-input clearable v-model="form.id"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="Time From">
          <el-date-picker :value-format="dateFormat" :format="dateFormat" v-model="form.dateFrom" type="date" placeholder="Pick a day"> </el-date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="Time To">
          <el-date-picker :value-format="dateFormat" :format="dateFormat" v-model="form.dateTo" type="date" placeholder="Pick a day"> </el-date-picker>
        </el-form-item>
      </el-col>
      <el-col class="action-item" :span="4">
        <el-button :loading="isLoading" @click="onSubmit" type="primary">Load</el-button>
      </el-col>
    </el-row>
    <hr />
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";

import moment from "moment";
import {useProcessingStore} from "../../../../stores/processing";

const emit = defineEmits(["change", "change"]);
const props = defineProps({ isLoading: { default: false } });
const processingStore = useProcessingStore();
function entitiesListPossible() {
  return processingStore.entitiesListPossible();
}

let entityClassOptions = ref([]);

const dateFormat = ref<string>("YYYY-MM-DD");

(async function () {
  const { data } = await entitiesListPossible();

  form.value.entityClass = data[0];
  entityClassOptions.value = data.map((el: string) => ({
    label: el,
    value: el
  }));
  emit("change", form.value);
})();

let form = ref({
  entityClass: "",
  id: "",
  dateFrom: moment().subtract(1, "days").format("YYYY-MM-DD"),
  dateTo: moment().add(1, "day").format("YYYY-MM-DD")
});

function onSubmit() {
  if (form.value.entityClass) {
    emit("change", form.value);
  }
}
</script>

<style lang="scss">
.pm-shards-detail-tab-transactions-entities-filter {
  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .wrap-row {
    position: relative;

    .action-item {
      position: absolute;
      right: 0;
      bottom: 22px;
    }
  }
}
</style>
