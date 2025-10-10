<template>
  <div class="config-editor-reports-filter">
    <h2>Filter</h2>
    <el-form
      label-position="top"
      label-width="auto"
      :model="form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Filter by state:">
            <el-select
              clearable
              filterable
              multiple
              v-model="form.states"
              placeholder="Select"
            >
              <el-option
                v-for="item in stateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Entity:">
            <el-select
              clearable
              filterable
              multiple
              v-model="form.entities"
              placeholder="Select"
            >
              <el-option
                v-for="item in entityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Author or Group:">
            <el-select
              clearable
              filterable
              multiple
              v-model="form.authors"
              placeholder="Select"
            >
              <el-option
                v-for="item in usersOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="By date and time:">
            <el-date-picker :shortcuts="times" style="width: 100%" v-model="form.time_custom" type="datetime"
                            placeholder="Select from date and time"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="Search:">
            <el-input v-model="form.search" placeholder="Search Report name and description here..."/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

import ListComponent from "@cyoda/ui-lib/src/components-library/elements/ListComponent/ListComponent.vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  usersOptions: {
    default: () => []
  },
  entityOptions: {
    default: () => []
  },
  stateOptions: {
    default: () => []
  },
});

const form = ref({
  status: [],
  authors: [],
  entities: [],
  time_custom: "",
  search: "",
})

emit('update:modelValue', form.value);

let times = [
  {
    text: "Past hour",
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 1000);
      return date;
    }
  },
  {
    text: "Past 24 hours",
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 24 * 1000);
      return date;
    }
  },
  {
    text: "Past week",
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 24 * 7 * 1000);
      return date;
    },
  },
  {
    text: "Past month",
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 24 * 30 * 1000);
      return date;
    },
  },
  {
    text: "Past year",
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 24 * 365 * 1000);
      return date;
    },
  }
];

watch(form, () => {
  emit('update:modelValue', form.value);
}, {deep: true})
</script>

<style lang="scss">
</style>
