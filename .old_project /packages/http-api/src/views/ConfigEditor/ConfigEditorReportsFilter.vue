<template>
  <div ref="rootRef" class="config-editor-reports-filter">
    <h2>Filter</h2>
    <el-form label-position="top" label-width="auto" :model="form">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="Author or Group:">
            <el-select clearable filterable multiple v-model="form.authors" placeholder="Select">
              <el-option v-for="item in usersOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Entity:">
            <el-select clearable filterable multiple v-model="form.entities" placeholder="Select">
              <el-option v-for="item in entityOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="By date and time:">
            <el-date-picker :shortcuts="times" style="width: 100%" @change="onChangeTimeCustom" v-model="form.time_custom" type="datetime" placeholder="Select from date and time"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="Search:">
            <el-input v-model="form.search" placeholder="Search Report name and description here..." />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts";
import { useUserStore } from "@cyoda/ui-lib/src/stores/user.ts";
import { useGlobalUiSettingsStore } from "@cyoda/ui-lib/src/stores/globalUiSettings";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  usersOptions: {
    default: () => []
  },
  entityOptions: {
    default: () => []
  },
  cacheKey: {
    default: null
  }
});
const rootRef = ref(null);

const storage = new HelperStorage();
const globalUiSettings = useGlobalUiSettingsStore();

const entityType = computed(() => {
  return globalUiSettings.entityType;
});

const defaultForm = {
  status: [],
  authors: [],
  times: [],
  entities: [],
  time_custom: "",
  search: "",
  entityType: "BUSINESS",
};
const form = ref(storage.get(props.cacheKey, JSON.parse(JSON.stringify(defaultForm))));
emit("update:modelValue", form.value);

watch(
  entityType,
  (value) => {
    form.value.entityType = value;
  },
  { immediate: true }
);

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
    }
  },
  {
    text: "Past month",
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 24 * 30 * 1000);
      return date;
    }
  },
  {
    text: "Past year",
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 24 * 365 * 1000);
      return date;
    }
  }
];

function onChangeTimeCustom() {
  form.value.times = [];
}

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm));
}

watch(
  form,
  () => {
    storage.set(props.cacheKey, form.value);
    emit("update:modelValue", form.value);
  },
  { deep: true }
);

defineExpose({ resetForm });
</script>

<style lang="scss"></style>
