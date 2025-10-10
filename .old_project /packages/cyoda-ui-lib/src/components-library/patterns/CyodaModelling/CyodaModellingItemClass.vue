<template>
  <div v-show="isSearchCondition" v-loading="isLoading" :class="{ 'cyoda-modelling-item-class': true }">

    <span v-if="!reportingInfoRows || reportingInfoRows.length > 0" @click="onClick" :class="{'checked-path': getChecked}">
        <font-awesome-icon v-if="isShowGroup" :icon="['fas', 'caret-down']" />
        <font-awesome-icon v-else :icon="['fas', 'caret-right']" />
    </span>

    <span :class="{ 'checked-path': getChecked, name: true }">
      <el-link v-if="!reportingInfoRows || reportingInfoRows.length > 0" @click="onClick">
        {{ reportClassComputed }}
      </el-link>
      <el-link class="empty-link" v-else>
        {{ reportClassComputed }}
      </el-link>
    </span>

    <div v-show="isShowGroup">
      <template v-if="requestParam.types.length > 0 && onlyView === false">
        <CyodaModellingItemClassForm v-if="isShowGroup" class="types-field" :values="values" :types="requestParam.types" @change="onChangeForm" />
      </template>
      <CyodaModellingGroup :disablePreview="disablePreview" :onlyView="onlyView" :search="search" :onlyRange="onlyRange" :isOpenAllSelected="isOpenAllSelected" :isCondenseThePaths="isCondenseThePaths" :limit="limit" :checked="checked" :configDefinition="configDefinition" :requestClass="props.requestParam.requestClass" :reportInfoRows="reportingInfoRows" :parentColDef="parentColDef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModellingStore } from "@cyoda/ui-lib/src/stores/modelling";
import {ref, computed, watch, onBeforeUnmount, provide, nextTick, onMounted} from "vue";

import * as api from "../../../api/index";
import CyodaModellingItemClassForm from "./Forms/CyodaModellingItemClassForm.vue";
import HelperModelling from "../../../helpers/HelperModelling";
import eventBus from "../../../plugins/eventBus";
import CyodaModellingGroup from "./CyodaModellingGroup.vue";

const props = defineProps({
  requestParam: {
    default: () => {
      return {};
    }
  },
  type: {
    default: ""
  },
  configDefinition: {
    default: () => {
      return {};
    }
  },
  checked: {
    default: () => {
      return [];
    }
  },
  limit: {
    default: null
  },
  onlyRange: {
    default: false
  },
  isOpenAllSelected: {
    default: false
  },
  isCondenseThePaths: {
    default: false
  },
  search: {
    default: ""
  },
  parentColDef: {
    default: () => {
      return {};
    }
  },
  onlyView: {
    default: false
  },
  disablePreview: {
    default: false
  }
});
const modellingStore = useModellingStore();
const searchResult = computed(() => {
  return modellingStore.searchResult;
});
const classPath = computed(() => {
  const path: string[] = [];
  if (props.parentColDef.fullPath) {
    path.push(props.parentColDef.fullPath);
  }
  path.push(props.requestParam.columnPath + "@" + props.requestParam.reportClass.replace(/\./g, "#"));
  return path.join(".");
});
const getChecked = computed(() => {
  return props.checked.find((path) => {
    const selectedPathBySegments = path.fullPath.replace(/\.\[[^]]*\]/g, "").split(/@|\./);

    const fullPathOfRowSegments = classPath.value.replace(/\.\[[^]]*\]/g, "").split(/@|\./).filter((el)=>!el.includes('java#'));

    for (let i = 0; i < fullPathOfRowSegments.length; i++) {
      if (selectedPathBySegments[i] !== fullPathOfRowSegments[i]) {
        return false;
      }
    }
    return true;
  });
});
const reportClassComputed = computed(() => {
  if (props.isCondenseThePaths) {
    return props.requestParam.reportClassShort;
  } else {
    return props.requestParam.reportClass;
  }
});
const isSearchCondition = computed(() => {
  if (!props.search) {
    return true;
  }
  return searchResult.value.some((path: string) => {
    let result = false;
    if (path.indexOf("@") !== -1) {
      let compareString = classPath.value;
      if (compareString.indexOf("@") === -1) {
        compareString += "@";
      }
      result = path.indexOf(compareString) !== -1;
    } else {
      result = path === classPath.value;
    }
    if (result) {
      isShowGroup.value = true;
    }
    return result;
  });
});

const reportingInfoRows = ref(null);

const isShowGroup = ref<boolean>(false);
const isLoading = ref<boolean>(false);

let values = ref([]);

eventBus.$on("changedBaseColumnPath", changedBaseColumnPath);
fillForm();

onBeforeUnmount(() => {
  eventBus.$off("changedBaseColumnPath", changedBaseColumnPath);
});

function fillForm() {
  const checked = getChecked.value;
  if (props.requestParam.types.length > 0 && checked) {
    const selectedPathBySegments = checked.fullPath.replace(/\[|\]/g, "").split(/@|\./);
    const fullPathOfRowSegments = props.requestParam.columnPath.replace(/\[|\]/g, "").split(/@|\./);

    const result = selectedPathBySegments[fullPathOfRowSegments.length - 1];

    if (result && result.length > 0) {
      values.value.push(result);
    }
  } else {
    values.value = [];
  }
}

function changedBaseColumnPath(val: { old: string; new: string }) {
  if (reportingInfoRows.value) {
    reportingInfoRows.value.forEach((el) => {
      el.columnPath = el.columnPath.replace(val.old, val.new);
    });
  }
}

async function onChangeForm(form: string[]) {
  let oldVal = "";
  if (reportingInfoRows.value && reportingInfoRows.value.length > 0) {
    oldVal = reportingInfoRows.value[0].columnPath;
  }
  let columnPath = props.requestParam.baseColumnPath;
  if (form && form.length > 0) {
    form.forEach((el) => {
      columnPath += `.[${el}]`;
    });
  }
  isLoading.value = true;
  try {
    const { data } = await api.getReportingInfo(props.requestParam.requestClass, props.requestParam.reportClass, columnPath, props.onlyRange);
    reportingInfoRows.value = HelperModelling.sortData(HelperModelling.filterData(data));
    if (data.length > 0) {
      function prepareVal(val: string) {
        const vals = val.split(".");
        vals.pop();
        return vals.join(".");
      }

      const newVal = data[0].columnPath;
      const oldPath = prepareVal(oldVal);
      const newPath = prepareVal(newVal);
      eventBus.$emit("changedBaseColumnPath", {
        old: oldPath,
        new: newPath
      });
      props.checked.forEach((el) => {
        el.fullPath = el.fullPath.replace(oldPath, newPath);
      });
    }
  } finally {
    isLoading.value = false;
  }
}

async function onClick() {
  if (!reportingInfoRows.value) {
    isLoading.value = true;
    try {
      const { data } = await api.getReportingInfo(props.requestParam.requestClass, props.requestParam.reportClass, props.requestParam.columnPath, props.onlyRange);
      reportingInfoRows.value = HelperModelling.sortData(HelperModelling.filterData(data));
      eventBus.$emit("entityInfo:update");
    } finally {
      isLoading.value = false;
    }
  }
  isShowGroup.value = !isShowGroup.value;
}

function onCloseStreamGrid() {
  isStreamGridAvailable.value = false;
}

watch(
  () => props.isOpenAllSelected,
  (val: boolean) => {
    if (val && getChecked.value) {
      onClick();
    }
    if (!val && getChecked.value) {
      isShowGroup.value = false;
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.cyoda-modelling-item-class {
  font-size: 14px;
  line-height: 20px;
  position: relative;

  .no-child {
    margin-left: 17px;
  }

  > .icon {
    margin-right: 5px;
    position: absolute;
    left: 0;
    top: 5px;
  }

  form.types-field {
    margin-left: 35px;
    margin-top: 10px;
    margin-bottom: 0;
  }

  > .checked-path > svg {
    color: #409eff !important;
  }

  > .checked-path > a {
    color: #409eff !important;
  }

  .empty-link {
    color: #000 !important;
    cursor: text;
  }

  .empty-link:after {
    display: none !important;
  }
}
</style>
