<template>
  <div class="transfer-panel" :class="{ sort: enableSort }">
    <p class="transfer-panel__header">
      <el-checkbox :value="allChecked" @change="handleAllCheckedChange" :indeterminate="isIndeterminate">
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
    </p>

    <div class="transfer-panel__body">
      <el-input class="transfer-panel__filter" size="small" v-model="query" placeholder="Search">
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <vuescroll :ops="vueScrollOptions">
        <div class="transfer-panel__body-inner">
          <el-checkbox-group v-model="checked" class="transfer-panel__list">
            <draggable :disabled="enableSort == false" ghost-class="ghost" v-model="localData" @change="dragEnd" handle=".handle">
              <transition-group class="transition-group" tag="table" type="transition" name="flip-list">
                <tr v-for="item in localData" :key="getKey(item)" class="list-group-item">
                  <td>
                    <el-tooltip class="item" effect="dark" :disabled="strLength === 0 || getLabel(item).length <= strLength" :content="getLabel(item)" placement="top">
                      <el-checkbox :label="item" class="transfer-panel__item">
                        {{ strLength > 0 && getLabel(item).length > strLength ? `${getLabel(item).substring(0, strLength)}...` : getLabel(item) }}
                      </el-checkbox>
                    </el-tooltip>
                  </td>
                  <template v-if="enableSort">
                    <td>
                      <div class="custom-field">
                        <slot :item="item"></slot>
                      </div>
                    </td>
                  </template>
                  <td class="sort-cell">
                    <font-awesome-icon v-if="enableSort" class="handle" icon="align-justify" />
                  </td>
                </tr>
              </transition-group>
            </draggable>
          </el-checkbox-group>
          <p class="transfer-panel__empty" v-show="hasNoMatch">No Match</p>
          <p class="transfer-panel__empty" v-show="localData.length === 0 && !query.value">No Data</p>
        </div>
      </vuescroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, getCurrentInstance} from "vue";

import draggable from "vuedraggable";
import vuescroll from "vuescroll";
import _ from "lodash";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";

const props = defineProps({
  title: {
    default: ""
  },
  listData: {
    default: () => []
  },
  value: {
    default: () => []
  },
  enableSort: {
    default: false
  },
  fieldKey: {
    default: ""
  },
  fieldLabel: {
    default: ""
  },
  strLength: {
    default: 0
  }
});
const hasNoMatch = computed(() => {
  if (query.value && localData.value.length == 0) {
    return true;
  } else {
    return false;
  }
});
const isIndeterminate = computed(() => {
  return checked.value.length > 0 && checked.value.length !== localData.value.length;
});
const checkedSummary = computed(() => {
  return `${checked.value.length}/${localData.value.length}`;
});

const allChecked = ref<boolean>(false);
let checked = ref([]);
let localData = ref([]);
const query = ref<string>("");
const emit=defineEmits(['input']);

let vueScrollOptions = ref({
  vuescroll: {
    mode: "native"
  },
  bar: {
    keepShow: "none"
  }
});

function handleAllCheckedChange() {
  if (checked.value.length === 0) {
    checked.value = localData.value;
  } else {
    checked.value = [];
  }
}
function dragEnd() {
  const instance = getCurrentInstance();
  instance.parent.emit("input", localData.value);
}
function getKey(item) {
  return _.get(item, props.fieldKey);
}
function getLabel(item) {
  return HelperFormat.shortNamePath(_.get(item, props.fieldLabel));
}

watch(checked, () => {
  emit(
    "input",
    checked.value.filter((el) => el)
  );
  allChecked.value = localData.value.length > 0 && checked.value.length === localData.value.length;
});

watch(
  () => props.value,
  () => {
    if (props.value && checked.value.length != props.value.length) {
      checked.value = props.value;
    }
  }
);

watch(query, () => {
  checked.value = [];
  localData.value = props.listData;
  if (query.value) {
    localData.value = localData.value.filter((item) => {
      return _.get(item, props.fieldLabel).indexOf(query.value) !== -1;
    });
  }
});

watch(
  () => props.listData,
  () => {
    checked.value = [];
    localData.value = props.listData;
  }
);
</script>

<style lang="scss">
.transfer-panel {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  width: 400px;

  .transfer-panel__header {
    height: 40px;
    line-height: 40px;
    background: #f5f7fa;
    margin: 0;
    padding-left: 15px;
    border-bottom: 1px solid #ebeef5;

    .el-checkbox {
      position: relative;
      display: block;

      .el-checkbox__label span {
        position: absolute;
        right: 15px;
        color: #909399;
        font-size: 12px;
        font-weight: 400;
      }
    }
  }

  .transfer-panel__body-inner {
    height: 300px;
    /*padding-right: 15px;*/
  }

  .transfer-panel__body {
    padding-left: 15px;
    padding-right: 15px;
    margin-right: 5px;
    margin-bottom: 5px;
    margin-top: 15px;

    .el-checkbox-group {
      margin-top: 15px;
    }

    .transfer-panel__filter .el-input__inner {
      border-radius: 16px !important;
    }

    .list-group-item {
      font-size: 14px;

      label {
        display: block;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .list-group-item {
    align-items: center;
    position: relative;

    td {
      padding: 5px;
    }

    margin-bottom: -1px;
    background-color: #fff;
    white-space: nowrap;

    .sort-cell {
      width: 28px !important;
      text-align: right;
    }

    svg {
      width: 18px !important;
      height: 18px !important;
      min-width: 18px;
      cursor: move;
    }
  }

  .__panel {
    overflow: hidden !important;
  }

  &.sort .list-group-item {
    td {
      border-top: 1px solid #dcdfe6;
      border-bottom: 1px solid #dcdfe6;
      padding: 10px 5px;
    }
  }

  .flip-list-move {
    transition: transform 0.5s;
  }

  .no-move {
    transition: transform 0s;
  }

  .ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }

  .custom-field {
    text-align: right;
  }

  .__bar-is-vertical,
  .__bar-is-horizontal {
    background-color: #a3a3a3 !important;
  }

  .transfer-panel__empty {
    position: absolute;
    top: 50%;
    margin-top: -15px;
    height: 30px;
    text-align: center;
    right: 0;
    left: 0;
  }

  .__vuescroll.hasVBar {
    padding-bottom: 15px !important;
    padding-right: 15px !important;
    box-sizing: content-box !important;
  }

  .__rail-is-vertical {
    right: 0 !important;
  }

  .transition-group {
    width: 100%;
    border-collapse: collapse;
  }

  .el-checkbox-group {
    width: 100%;
  }
}
</style>
