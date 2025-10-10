<template>
  <div
    :key="cols"
    class="builder-condition-group"
    :class="{
      'wrap-actions': level > 0,
      first: level === 0
    }"
  >
    <div class="group-actions">
      <el-radio-group :disabled="readOnly" v-model="condition.operator">
        <el-radio-button v-for="groupConditionType in groupConditionTypes" :key="groupConditionType.key"
                         :label="groupConditionType.key">{{ groupConditionType.label }}
        </el-radio-button>
      </el-radio-group>

      <el-dropdown v-if="!readOnly" class="button-add" trigger="click">
        <el-button type="info" circle>
          <font-awesome-icon icon="plus"/>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click.native="onNewGroup">Add new group</el-dropdown-item>
            <el-dropdown-item @click.native="onNewCondition">Add new condition</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button class="button-delete" v-if="level > 0" @click="onRemoveGroup" type="danger" circle>
        <font-awesome-icon icon="trash"/>
      </el-button>
    </div>
    <component :level="level + 1" v-for="(childCondition, index) in condition.conditions" :readOnly="readOnly"
               :showErrors="showErrors" :builderId="builderId" :key="`${index}${level + 1}`"
               :class="{ 'inner-fields': true, last: !condition.conditions[index + 1] }"
               :is="getConditionComponent(index)" :condition="childCondition" :cols="cols"
               @remove="onRemove(index)"></component>
  </div>
</template>

<script setup lang="ts">
import {ElMessageBox} from "element-plus";
import {ref, watch} from "vue";

import HelperFilter from "./HelperFilter";
import FilterBuilderCondition from "./FilterBuilderCondition.vue";
import FilterBuilderGroup from "./FilterBuilderGroup.vue";

const props = defineProps({
  builderId: {default: ""},
  readOnly: {default: false},
  condition: {
    default: () => {
      return {};
    }
  },
  level: {
    default: 0
  },
  cols: {
    default: () => []
  },
  showErrors: {default: false}
});

let groupConditionTypes = ref([
  {
    "@bean": "com.cyoda.core.conditions.GroupCondition",
    key: "AND",
    label: "Match All"
  },
  {
    "@bean": "com.cyoda.core.conditions.GroupCondition",
    key: "OR",
    label: "Match Any"
  }
]);

function onNewGroup() {
  props.condition.conditions.push(HelperFilter.getGroup());
}

function onNewCondition() {
  let isExistGroupCondition = props.condition.conditions.findIndex((el) => {
    return el["@bean"].indexOf("GroupCondition") !== -1;
  });
  if (isExistGroupCondition !== -1) {
    props.condition.conditions.splice(isExistGroupCondition, 0, HelperFilter.getCondition());
  } else {
    props.condition.conditions.push(HelperFilter.getCondition());
  }
}

function onRemove(index: number) {
  props.condition.conditions.splice(index, 1);
}

const emit = defineEmits(["remove"]);

function onRemoveGroup(index: number) {
  ElMessageBox.confirm("Do you really want to delete group?", "Confirm!", {
    callback: async (action: string) => {
      if (action === "confirm") {
        emit("remove");
      }
    }
  });
}

function getConditionComponent(index: number) {
  if (isGroup(index)) {
    return FilterBuilderGroup;
  } else {
    return FilterBuilderCondition;
  }
}

function isGroup(index: number) {
  let condition = props.condition.conditions[index];
  if (condition) {
    if (condition["@bean"].indexOf("GroupCondition") !== -1) {
      return true;
    }
  }
  return false;
}

watch(() => props.cols, () => {
  const allFields = props.cols.map((el) => el.alias);
  props.condition.conditions = props.condition.conditions.filter((el, index) => {
    if (!isGroup(index)) {
      return allFields.includes(el.fieldName);
    }
    return true;
  });
});
</script>

<style lang="scss">
.builder-condition-group {
  position: relative;

  &:before {
    content: "";
    height: 40px;
    border-color: #e0e0e0;
    border-style: dotted;
    border-width: 0 0 2px 2px;
    left: 10px;
    position: absolute;
    width: 10px;
    top: -18px;
  }

  &:after {
    height: calc(100% - 17px);
    top: 17px;
    content: "";
    border-color: #e0e0e0;
    border-style: dotted;
    border-width: 0 0 0 2px;
    width: 10px;
    left: 10px;
    position: absolute;
  }

  &.first:before {
    display: none;
  }

  &.first:after {
    display: none;
  }

  .button-add {
    margin-left: 10px;
  }

  .button-delete {
    margin-left: 10px !important;
  }

  .wrap-actions,
  .inner-fields {
    padding-left: 20px;
  }

  .group-actions {
    margin-top: 20px;
    margin-bottom: 20px;

    /*&.first:before {*/
    /*  display: none;*/
    /*}*/
  }

  .builder-condition-group:last-child.wrap-actions.inner-fields:after {
    display: none;
  }

  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100% !important;
  }

  .el-select {
    width: 100% !important;
  }

  .el-input-number {
    width: 100% !important;
  }
}
</style>
