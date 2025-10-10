<template>
  <el-form ref="elFormRef" :model="alias" :rules="rules" class="cyoda-modelling-alias-settings-entity" label-position="top" label-width="120px">
    <el-form-item label="Name" prop="name">
      <el-input @input="onInputFormName" v-model="alias.name"></el-input>
    </el-form-item>
    <el-form-item v-if="aliasEditType === 'catalog'" label="Description">
      <el-input type="textarea" v-model="alias.desc"></el-input>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import { ElForm } from "element-plus";
import * as api from "@cyoda/ui-lib/src/api";

const props = defineProps({
  alias: {
    default() {
      return {
        name: "",
        desc: ""
      };
    }
  },
  aliasEditType: {
    default: "catalog"
  }
});

const elFormRef = ref(null);

let rules = ref({
  name: [
    { required: true, message: "Please input Name", trigger: "blur" },
    { validator: checkUniqName, trigger: "blur" }
  ]
});

watch(
  () => props.alias.name,
  () => {
    props.alias.aliasDef.name = props.alias.name;
  },
  { immediate: true }
);

async function checkUniqName(rule: any, value: any, callback: any) {
  const { data } = await api.getAllCatalogItems();
  const allCatalogItems = data;
  const names = allCatalogItems
    .filter((el) => el.id !== props.alias.id)
    .map((el: any) => {
      return `${el.name}-${el.entityClass}`.toLowerCase();
    });
  const checkValue = `${value}-${props.alias.entityClass}`.toLowerCase();
  if (names.indexOf(checkValue) > -1) {
    return callback(new Error(`This name is not unique`));
  }
  callback();
}

function onInputFormName(value) {
  props.alias.name = value.replaceAll(".", ":");
}

defineExpose({elFormRef})
</script>

<style lang="scss">
.cyoda-modelling-alias-settings-entity {
  .el-form-item__label {
    padding-bottom: 0 !important;
  }
}
</style>
