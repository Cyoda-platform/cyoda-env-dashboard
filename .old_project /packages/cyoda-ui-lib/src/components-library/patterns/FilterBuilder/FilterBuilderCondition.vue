<template>
  <div class="builder-condition-row">
    <el-row :gutter="20">
      <el-col
        :class="{
          'col-err': isExistErrorFieldName && props.showErrors
        }"
        :span="4"
      >
        <el-select size="large" :disabled="disableColumn || readOnly" filterable @change="onChangeFieldName" v-model="condition.fieldName" placeholder="Select">
          <el-option v-for="item in cols" :key="item.alias" :label="shortLabel(item.alias)" :value="item.alias"></el-option>
        </el-select>
      </el-col>
      <el-col
        :class="{
          'col-err': isExistErrorOperation && props.showErrors
        }"
        :span="4"
      >
        <el-select size="large" :disabled="readOnly" filterable @change="onChangeOperation" v-model="condition.operation" placeholder="Select">
          <el-option v-for="conditionType in conditionTypesFiltered" :key="conditionType.key" :label="conditionType.label" :value="conditionType.key"></el-option>
        </el-select>
      </el-col>
      <template v-if="selectedConditionType.isRange">
        <el-col :span="4">
          <component size="large" :disabled="readOnly" :is="componentParams.component" v-bind="componentParams.params" v-model="condition.from.value" />
        </el-col>
        <el-col :span="4">
          <component size="large" :disabled="readOnly" :is="componentParams.component" v-bind="componentParams.params" v-model="condition.to.value" />
        </el-col>
      </template>
      <template v-else>
        <el-col v-if="isChangedTypeCondition" :span="4">
          <component size="large" :disabled="readOnly" :is="componentParams.component" v-bind="componentParams.params" v-model="condition.lookback" />
        </el-col>
        <el-col v-else-if="condition.value && selectedConditionType.disableValueField !== true" :span="4">
          <component size="large" :disabled="readOnly" :is="componentParams.component" v-bind="componentParams.params" v-model="condition.value.value" />
        </el-col>
      </template>
      <el-col v-if="!disableRemove && !readOnly" :span="4">
        <el-button @click="onRemove" type="danger" circle>
          <font-awesome-icon icon="trash" />
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {ElMessageBox, ElInput, ElDatePicker, ElInputNumber} from "element-plus";
import { computed, watch } from "vue";

import HelperTypes from "../../../helpers/HelperTypes";
import HelperFormat from "../../../helpers/HelperFormat";
import DateTimePicker from "@cyoda/ui-lib/src/components-library/patterns/DateTimePicker/DateTimePicker.vue";
import SelectBoolean from "@cyoda/ui-lib/src/components-library/patterns/SelectBoolean/SelectBoolean.vue";
import eventBus from "../../../plugins/eventBus";

const props = defineProps({
  builderId: { default: "" },
  disableRemove: { default: false },
  disableColumn: { default: false },
  readOnly: { default: false },
  condition: {
    default: () => {
      return {};
    }
  },
  cols: {
    default: () => {
      return [];
    }
  },
  showErrors: { default: false },
  conditionTypes: {
    default: () => {
      return [
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.IEquals",
          key: "IEQUALS",
          label: "equals (disregard case)",
          types: ["String", "UUID"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.INotEquals",
          key: "INOT_EQUAL",
          label: "not equal (disregard case)",
          types: ["String", "UUID"]
        },
        {
          "@bean": "com.cyoda.core.conditions.queryable.Between",
          key: "BETWEEN",
          label: "between",
          types: HelperTypes.allTypes,
          isRange: true
        },
        {
          "@bean": "com.cyoda.core.conditions.queryable.BetweenInclusive",
          key: "BETWEEN_INCLUSIVE",
          label: "between (inclusive)",
          isRange: true,
          types: HelperTypes.allTypes,
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.IContains",
          key: "CONTAINS",
          label: "contains",
          types: ["String", "UUID"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.IStartsWith",
          key: "ISTARTS_WITH",
          label: "starts with",
          types: ["String"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.IEndsWith",
          key: "IENDS_WITH",
          label: "ends with",
          types: ["String"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.INotContains",
          key: "INOT_CONTAINS",
          label: "does not contain",
          types: ["String"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.INotStartsWith",
          key: "INOT_STARTS_WITH",
          label: "does not start with",
          types: ["String"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.NotEndsWith",
          key: "NOT_ENDS_WITH",
          label: "does not end with",
          types: ["String"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.INotEndsWith",
          key: "INOT_ENDS_WITH",
          label: "does not end with (case insensitive)",
          types: ["String"]
        },
        {
          "@bean": "",
          key: "",
          label: "matches other field (case insensitive)"
        },
        {
          "@bean": "",
          key: "",
          label: "differs from field (case insensitive)"
        },
        {
          "@bean": "com.cyoda.core.conditions.queryable.Equals",
          key: "EQUALS",
          label: "equals",
          types: [...HelperTypes.allTypes, "ByteBuffer", "Boolean"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.NotEquals",
          key: "NOT_EQUAL",
          label: "not equal",
          types: [...HelperTypes.allTypes, "Boolean"]
        },
        {
          "@bean": "com.cyoda.core.conditions.queryable.LessThan",
          key: "LESS_THAN",
          label: "less than",
          types: HelperTypes.datesNumbers
        },
        {
          "@bean": "com.cyoda.core.conditions.queryable.GreaterThan",
          key: "GREATER_THAN",
          label: "greater than",
          types: HelperTypes.datesNumbers
        },
        {
          "@bean": "com.cyoda.core.conditions.queryable.LessThanEquals",
          key: "LESS_OR_EQUAL",
          label: "less than or equal to",
          types: HelperTypes.datesNumbers
        },
        {
          "@bean": "com.cyoda.core.conditions.queryable.GreaterThanEquals",
          key: "GREATER_OR_EQUAL",
          label: "greater than or equal to",
          types: HelperTypes.datesNumbers
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.IsNull",
          key: "IS_NULL",
          label: "is null",
          types: [...HelperTypes.allTypes, "Boolean"],
          disableValueField: true
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.NotNull",
          key: "NOT_NULL",
          label: "is not null",
          types: [...HelperTypes.allTypes, "Boolean"],
          disableValueField: true
        },
        {
          "@bean": "",
          key: "",
          label: "matches other field"
        },
        {
          "@bean": "",
          key: "",
          label: "differs from field"
        },
        {
          "@bean": "",
          key: "",
          label: "greater than field"
        },
        {
          "@bean": "",
          key: "",
          label: "less than field"
        },
        {
          "@bean": "",
          key: "",
          label: "greater than or equal to field"
        },
        {
          "@bean": "",
          key: "",
          label: "less than or equal to field"
        },
        {
          "@bean": "com.cyoda.core.conditions.queryable.Like",
          key: "LIKE",
          label: "like",
          types: ["String"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.IsUnchanged",
          key: "IS_UNCHANGED",
          label: "IsUnchanged",
          types: [...HelperTypes.allTypes, "ByteBuffer", "Boolean"]
        },
        {
          "@bean": "com.cyoda.core.conditions.nonqueryable.IsChanged",
          key: "IS_CHANGED",
          label: "IsChanged",
          types: [...HelperTypes.allTypes, "ByteBuffer", "Boolean"]
        }
      ].filter((el) => el.key);
    }
  },
  conditionTypesKeysAvailable: { default: () => [] }
});
const conditionTypesComputed = computed(() => {
  if (props.conditionTypesKeysAvailable.length == 0) {
    return props.conditionTypes;
  }

  return props.conditionTypes.filter((el) => {
    return props.conditionTypesKeysAvailable.includes(el.key);
  });
});
const conditionTypesFiltered = computed(() => {
  let conditionTypes: any[] = [];
  if (props.conditionTypesKeysAvailable.length == 0) {
    conditionTypes = props.conditionTypes;
  } else {
    conditionTypes = props.conditionTypes.filter((el) => {
      return props.conditionTypesKeysAvailable.includes(el.key);
    });
  }

  const conditionTypesResult = conditionTypes.filter((el) => {
    if (el.key && el.types && el.types.indexOf(selectedType.value) !== -1) {
      return el;
    }
  });
  return conditionTypesResult.length > 0 ? conditionTypesResult : conditionTypes;
});
const selectedType = computed(() => {
  const fieldName = props.condition.fieldName;
  if (fieldName) {
    const alias = props.cols.find((el) => el.alias === fieldName);
    if (alias) {
      return alias.typeShort;
    }
  }
  return "String";
});
const seleсtedCol = computed(() => {
  const fieldName = props.condition.fieldName;
  if (fieldName) {
    return props.cols.find((el) => el.alias === fieldName);
  }
  return undefined;
});
const componentParams = computed(() => {
  if (isChangedTypeCondition.value) {
    return {
      component: ElInputNumber,
      params: {
        placeholder: "Please input"
      }
    };
  } else if (HelperTypes.numbersTypes.indexOf(selectedType.value) !== -1) {
    return {
      component: ElInputNumber,
      params: {
        placeholder: "Please input"
      }
    };
  } else if (selectedType.value === "LocalDate") {
    return {
      component: ElDatePicker,
      params: {
        placeholder: "Select date and time",
        format: "DD.MM.YYYY",
        valueFormat: "YYYY-MM-DD"
      }
    };
  } else if (selectedType.value === "LocalDateTime") {
    return {
      component: DateTimePicker,
      params: {
        includeTimeZone: false
      }
    };
  } else if (selectedType.value.indexOf("Date") !== -1) {
    return {
      component: DateTimePicker
    };
  } else if (selectedType.value === "Boolean") {
    return {
      component: SelectBoolean
    };
  } else {
    return {
      component: ElInput,
      params: {
        placeholder: "Please input"
      }
    };
  }
});
const isChangedTypeCondition = computed(() => {
  return ["IS_UNCHANGED", "IS_CHANGED"].includes(selectedConditionType.value.key);
});
const isExistErrorFieldName = computed(() => {
  return !props.condition.fieldName;
});
const isExistErrorOperation = computed(() => {
  return !props.condition.operation;
});
const isValidRegex = computed(() => {
  return true;
});
const selectedConditionType = computed(() => {
  const val = props.condition.operation;
  return props.conditionTypes.find((el) => el.key === val) || {};
});

function defaultValue() {
  const fieldName = props.condition.fieldName;
  const alias = props.cols.find((el) => el.alias === fieldName);
  return {
    "@type": (alias && alias.type) || "",
    value: ""
  };
}

function resetValues() {
  delete props.condition["value"];

  delete props.condition["from"];

  delete props.condition["to"];

  delete props.condition["lookback"];

  if (selectedConditionType.value.isRange) {
    props.condition["from"] = defaultValue();

    props.condition["to"] = defaultValue();
  } else if (selectedConditionType.value.disableValueField) {
    delete props.condition.value;
  } else if (isChangedTypeCondition.value) {
    props.condition["lookback"] = "0";

    props.condition["rangeField"] = "false";
  } else {
    props.condition["value"] = defaultValue();
  }
}

const emit = defineEmits(["remove"]);

function onRemove() {
  ElMessageBox.confirm("Do you really want to delete row?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        emit("remove");
      }
    }
  });
}

watch(
  () => props.cols,
  () => {
    if (props.cols.length > 0 && props.condition.fieldName) {
      const check = props.cols.find((el) => el.alias === props.condition.fieldName);
      if (!check) {
        emit("remove");
      }
    }
  }
);

function onChangeFieldName() {
  props.condition.operation = "";
  resetValues();
  eventBus.$emit(`validate${props.builderId}`);
}

function makeValueObject(attributeValue: "from" | "to" | "value") {
  if (attributeValue in props.condition) {
    if (typeof props.condition[attributeValue] !== "object" && seleсtedCol.value) {
      props.condition[attributeValue] = {
        "@type": seleсtedCol.value.type || "",
        value: props.condition[attributeValue]
      };
    }
  }
}

function clearNotValidFields() {
  const listValidFields = ["from", "to", "value", "@bean", "fieldName", "operation", "lookback", "rangeField"];
  const existFieldsValues = Object.keys(props.condition);
  existFieldsValues.forEach((el) => {
    if (!listValidFields.includes(el)) {
      delete (props.condition as any)[el];
    }
  });
}

watch(
  () => props.condition,
  () => {
    makeValueObject("from");
    makeValueObject("to");
    makeValueObject("value");
    clearNotValidFields();
  },
  { immediate: true }
);

function onChangeOperation() {
  const val = props.condition.operation;
  const conditionType = props.conditionTypes.find((el) => el.key === val);
  props.condition["@bean"] = (conditionType && conditionType["@bean"]) || "";

  if (val === "EQUALS") {
    props.condition["queryable"] = true;
  } else {
    delete props.condition["queryable"];
  }

  resetValues();
  eventBus.$emit(`validate${props.builderId}`);
}

function shortLabel(str: string) {
  return HelperFormat.shortNamePath(str);
}
</script>

<style lang="scss">
.builder-condition-row {
  margin-bottom: 10px;
  position: relative;

  &:before {
    content: "";
    height: calc(50% + 20px);
    border-color: #e0e0e0;
    border-style: dotted;
    border-width: 0 0 2px 2px;
    left: 10px;
    position: absolute;
    width: 10px;
    top: -18px;
  }

  &:after {
    height: 25px;
    top: calc(50% - 3px);
    content: "";
    border-color: #e0e0e0;
    border-style: dotted;
    border-width: 0 0 0 2px;
    width: 10px;
    left: 10px;
    position: absolute;
  }

  .error-validate {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 5px;
  }
}

.builder-condition-row.last::after {
  display: none;
}

.col-err {
  input {
    border-color: #f56c6c !important;

    &::-webkit-input-placeholder {
      /* Edge */
      color: #f56c6c;
    }

    &:-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: #f56c6c;
    }

    &::placeholder {
      color: #f56c6c;
    }
  }

  .el-select__caret {
    color: #f56c6c !important;
  }

  .el-select__wrapper {
    box-shadow: 0 0 0 1px #f56c6c inset !important;
  }
}
</style>
