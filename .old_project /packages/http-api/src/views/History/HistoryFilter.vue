<template>
  <div class="history-filter">
    <h2>Filter</h2>
    <el-form label-position="top" label-width="auto" :model="form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Author or Group:">
            <el-select clearable filterable multiple v-model="form.authors" placeholder="Select">
              <el-option v-for="item in usersOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Filter by state:">
            <el-select clearable filterable multiple v-model="form.states" placeholder="Select">
              <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Types:">
            <el-select clearable filterable multiple v-model="form.types" placeholder="Select">
              <el-option v-for="item in reportTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="By date and time:">
            <el-date-picker :picker-options="pickerOptions" :shortcuts="times" style="width: 100%" @change="onChangeTimeCustom" v-model="form.time_custom" type="datetime" placeholder="Select from date and time"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { ref, computed, watch } from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import HelperReportDefinition from "../../helpers/HelperReportDefinition";
import type { GridConfigFieldsView, ReportingTypesEmbeddedStrings, User } from "@cyoda/ui-lib/src/types/types";
import _ from "lodash";
import HelperStorage from "@cyoda/cobi/src/helpers/HelperStorage";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts";
import { useUserStore } from "@cyoda/ui-lib/src/stores/user.ts";
import { useGlobalUiSettingsStore } from "@cyoda/ui-lib/src/stores/globalUiSettings";

const emit = defineEmits(["update:modelValue"]);
const storage = new HelperStorage();
const form = ref(storage.get(`historyReports:filterForm`, HelperReportDefinition.reportHistoryDefaultFilter()));

emit("update:modelValue", form.value);

const authStore = useAuthStore();
const globalUiSettings = useGlobalUiSettingsStore();

const username = computed(() => {
  return authStore.username;
});

const entityType = computed(() => {
  return globalUiSettings.entityType;
});

const usersOptions = computed(() => {
  let users = definitions.value
    .filter((report) => report.gridConfigFields.user)
    .map((report) => {
      return {
        value: report.gridConfigFields.user && report.gridConfigFields.user.username,
        label: report.gridConfigFields.user && report.gridConfigFields.user.username
      };
    });
  return _.uniqBy(users, "value");
});

const stateOptions = computed(() => {
  const statuses = ["running", "finished", "failed", "success", "canceled"];
  return statuses.map((el) => {
    return {
      value: el,
      label: capitalizeFirstLetter(el)
    };
  });
});

const reportTypesLoaded = ref<boolean>(false);

let reportTypes = ref([]);
let definitions = ref([]);

const pickerOptions = ref({
  disabledDate(time) {
    return time.getTime() > Date.now();
  }
});

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

(async function () {
  getReportTypes();
  loadDefinitions();
})();

async function loadDefinitions() {
  const params: api.IGetDefinitionsQueryParams = {
    fields: ["id", "description", "type", "userId", "creationDate"],
    size: 999
  };

  const { data } = await api.getDefinitions({ params });

  if (data) {
    definitions.value = (data._embedded && data._embedded.gridConfigFieldsViews) || [];

    const userIds = definitions.value.map((el) => el.gridConfigFields.userId);
    const { data: dataUsers } = await api.usersList(_.uniq(userIds));
    definitions.value = definitions.value.map((el) => {
      el.gridConfigFields.user = dataUsers.find((dataUser: User) => dataUser.userId === el.gridConfigFields.userId);
      return el;
    });
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function onChangeTimeCustom() {
  form.value.times = [];
}

async function getReportTypes() {
  try {
    reportTypesLoaded.value = true;
    const params: api.IGetReportTypesQueryParams = {
      size: 500
    };
    const { data } = await api.getReportTypes({ params });

    if (data._embedded && data._embedded.wrappedEntityModels) {
      reportTypes.value = data._embedded.wrappedEntityModels.map((item: ReportingTypesEmbeddedStrings) => {
        return { value: item.content, label: item.content };
      });
    } else {
      reportTypes.value = [];
    }
  } finally {
    reportTypesLoaded.value = false;
  }
}

function resetForm() {
  form.value = HelperReportDefinition.reportHistoryDefaultFilter();
}

watch(
  usersOptions,
  () => {
    if (usersOptions.value.length > 0 && form.value.authors.length === 0) {
      const userEl = usersOptions.value.find((el) => el.value === username.value);
      let user = (userEl && userEl.value) || usersOptions.value[0].value;
      form.value.authors.push(user);
    }
  },
  { immediate: true }
);

watch(
  form,
  () => {
    storage.set(`historyReports:filterForm`, form.value);
    emit("update:modelValue", form.value);
  },
  { deep: true }
);

watch(
  entityType,
  (value) => {
    form.value.entityType = value;
  },
  { immediate: true }
);

defineExpose({ resetForm });
</script>

<style lang="scss"></style>
