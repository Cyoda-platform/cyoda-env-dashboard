<template>
  <el-form class="modelling-item-class-form" label-position="top" label-width="100px">
    <div class="flex">
      <div class="inner-field-type" v-for="(type, index) in types">
        <el-input size="small" :placeholder="type" v-mask="getMask(type)" v-model="form[index]"></el-input>
      </div>
      <div v-if="isAvailableSubmit" class="wrap-btn">
        <el-button size="small" type="primary" @click="onSubmit">Apply</el-button>
      </div>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits(["change", "change"]);
const props = defineProps({
  isAvailableSubmit: { default: true },
  types: {
    default() {
      return [];
    }
  },
  values: {
    default() {
      return [];
    }
  }
});

let inputMaskInt = ref({
  rightAlign: false,
  regex: "[0-9*]+",
  placeholder: ""
});

let inputMaskString = ref({
  rightAlign: false,
  regex: ".*",
  placeholder: ""
});

let form = ref([]);

function getMask(type: string) {
  if (type === "Integer") {
    return inputMaskInt.value;
  } else if (type === "String") {
    return inputMaskString.value;
  }
}

watch(
  form,
  () => {
    if (!props.isAvailableSubmit) {
      emit("change", form.value);
    }
  },
  { deep: true }
);

function onSubmit() {
  const formData = JSON.parse(JSON.stringify(form.value));
  formData.forEach((el: any, index: any) => {
    if (form[index] === "") {
      form[index] = "*";
    }
  });
  emit("change", formData);
}

watch(
  () => props.values,
  () => {
    if (props.values.length > 0) {
      props.values.forEach((el: any, index: any) => {
        form.value[index] = el || "";
      });
      onSubmit();
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.modelling-item-class-form {
  //margin-top: 5px;
  //margin-bottom: 5px;
  /*.wrap-btn {*/
  /*  margin-top: 18px;*/
  /*}*/

  .inner-field-type {
    margin-right: 10px;

    span {
      color: rgb(96, 98, 102);
      font-size: 14px;
    }
  }

  .el-form {
    margin-top: 5px;
    margin-bottom: 10px;
  }

  .flex {
    display: flex;
  }
}
</style>
