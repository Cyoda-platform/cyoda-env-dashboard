<template>
  <div class="transformer-children-restriction">
    <div>
      <el-form-item :rules="rules" :label="capitalizeFirstLetter(parameter.name)" :prop="'transformer.children.' + indexChildren + '.parameters.' + indexParameter + '.value'">
        <template v-if="typeInput === 'el-select'">
          <el-select clearable filterable v-model="parameter.value" placeholder="Select">
            <el-option v-for="item in choiceOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </template>
        <template v-else-if="typeInput === 'el-input'">
          <el-input placeholder="Please input" :minlength="minlength" :maxlength="maxlength" v-model="parameter.value"> </el-input>
        </template>
        <template v-else-if="typeInput === 'el-input-number'">
          <el-input-number placeholder="Please input" :min="min" :max="max" :precision="precision" v-model="parameter.value"> </el-input-number>
        </template>
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  restrictions: {
    default: () => {
      return [];
    }
  },
  parameter: {
    default: () => {
      return {};
    }
  },
  indexParameter: {
    default: 0
  },
  indexChildren: {
    default: 0
  }
});
const typeInput = computed(() => {
  let typeInput = "el-input";
  props.restrictions.forEach((el) => {
    if (el.type == "STR_CHOICE") {
      typeInput = "el-select";
    } else if (el.type.indexOf("INT_") > -1 || el.type.indexOf("FLOAT_") > -1) {
      typeInput = "el-input-number";
    } else if (el.type.indexOf("STR_") > -1) {
      typeInput = "el-input";
    }
  });
  return typeInput;
});
const minlength = computed(() => {
  let minlength = null;
  props.restrictions.forEach((el: any) => {
    if (el.type == "STR_MIN_LEN") {
      minlength = el.parameter;
    }
  });
  return minlength;
});
const maxlength = computed(() => {
  let maxlength = null;
  props.restrictions.forEach((el) => {
    if (el.type == "STR_MAX_LEN") {
      maxlength = el.parameter;
    }
  });
  return maxlength;
});
const min = computed(() => {
  let min = -Infinity;
  props.restrictions.forEach((el: any) => {
    if (el.type === "INT_GT") {
      min = el.parameter + 1;
    } else if (el.type === "INT_GTE") {
      min = el.parameter;
    }
  });
  return min;
});
const max = computed(() => {
  let max = Infinity;
  props.restrictions.forEach((el: any) => {
    if (el.type === "INT_LT") {
      max = el.parameter - 1;
    } else if (el.type === "INT_LTE") {
      max = el.parameter;
    }
  });
  return max;
});
const precision = computed(() => {
  let precision: any = null;
  props.restrictions.forEach((el: any) => {
    if (el.type.indexOf("INT_") > -1) {
      precision = 0;
    }
  });
  return precision;
});
const choiceOptions = computed(() => {
  let choiceOptions: any[] = [];
  props.restrictions.forEach((el: any) => {
    if (el.type.indexOf("_CHOICE") > -1) {
      choiceOptions = el.parameter.map((elParam: any) => {
        return {
          value: elParam,
          label: elParam
        };
      });
    }
  });
  return choiceOptions;
});
const rules = computed(() => {
  const data = [{ required: true, message: "Please fill field", trigger: typeInput.value === "el-select" ? "change" : "blur" }];
  let rule: any = {};
  rule.message = "Value should be";
  if (minlength.value !== null || min.value !== -Infinity) {
    rule.min = minlength.value || min.value;
    rule.message += ` minimum ${rule.min}`;
  }
  if (maxlength.value !== null || max.value !== Infinity) {
    rule.max = maxlength.value || max.value;
    if (rule.min !== undefined) {
      rule.message += ` and`;
    }
    rule.message += ` maximum ${rule.max}`;
  }

  if (typeInput.value == "el-input-number") {
    if (precision.value == 0) {
      rule.type = "number";
    } else {
      rule.type = "float";
    }
  }

  if (rule.min !== undefined || rule.max !== undefined) {
    data.push(rule);
  }
  return data;
});

function capitalizeFirstLetter(string: any) {
  return (string.charAt(0).toUpperCase() + string.slice(1)).replace(".", " ");
}
</script>

<style lang="scss">
.transformer-children-restriction {
  label {
    display: block;
    margin-bottom: 5px;
    line-height: normal;
    padding-bottom: 0 !important;
  }
  .el-input-number {
    width: 100%;
  }
}
</style>
