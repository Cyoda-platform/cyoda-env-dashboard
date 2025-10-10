<template>
  <div class="transfer">
    <transfer-panel :strLength="strLengthLeft" :fieldKey="fieldKey" :fieldLabel="fieldLabel" :title="titles[0]"
                    v-model="leftDataSelected" :listData="leftData"/>

    <div class="transfer-buttons">
      <el-button :disabled="rightData.length === 0" type="primary" @click.native="addToLeft">
        <i class="el-icon-arrow-left"></i>
      </el-button>
      <el-button :disabled="leftData.length === 0" type="primary" @click.native="addToRight">
        <i class="el-icon-arrow-right"></i>
      </el-button>
    </div>

    <transfer-panel :strLength="strLengthRight" :fieldKey="fieldKey" :fieldLabel="fieldLabel" :enableSort="true"
                    :title="titles[1]" v-model="rightDataSelected" :listData="rightData">
      <template #default="{ item }">
        <span>
          <slot :item="item" name="custom-field"></slot>
        </span>
      </template>
    </transfer-panel>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";

import TransferPanel from "./TransferPanel.vue";
import _ from "lodash";

const emit = defineEmits(["input", "input", "input"]);
const props = defineProps({
  titles: {
    default: () => {
      return [];
    }
  },
  optionsData: {
    default: () => {
      return [];
    }
  },
  value: {
    default: () => {
      return [];
    }
  },
  fieldKey: {
    default: ""
  },
  fieldLabel: {
    default: ""
  },
  strLengthLeft: {
    default: 40
  },
  strLengthRight: {
    default: 0
  }
});
const leftData = computed(() => {
  let allData = JSON.parse(JSON.stringify(props.optionsData));
  props.value.forEach((val) => {
    allData = allData.filter((el) => {
      return _.get(val, props.fieldKey) !== _.get(el, props.fieldKey);
    });
  });
  return allData;
});
const rightData = computed(() => {
  return props.value;
});

let leftDataSelected = ref([]);
let rightDataSelected = ref([]);

function addToLeft() {
  let currentValue = JSON.parse(JSON.stringify(props.value));
  rightDataSelected.value.forEach((el) => {
    currentValue = currentValue.filter((val) => {
      return _.get(val, props.fieldKey) !== _.get(el, props.fieldKey);
    });
  });
  emit("input", currentValue);
  rightDataSelected.value = [];
}

function addToRight() {
  emit("input", props.value.concat(leftDataSelected.value));
  leftDataSelected.value = [];
}

watch(
  () => props.optionsData,
  (vals: any) => {
    if (props.value.length > 0) {
      const newValues = [];
      props.value.forEach((val) => {
        const checkExist = props.optionsData.find((el) => _.get(val, props.fieldKey) === _.get(el, props.fieldKey));
        if (checkExist) {
          newValues.push(val);
        }
      });
      emit("input", newValues);
    }
  }
);
</script>

<style lang="scss" scoped>
.transfer {
  display: flex;
  align-items: center;
}

.transfer-buttons {
  margin: 0 40px;
}
</style>
