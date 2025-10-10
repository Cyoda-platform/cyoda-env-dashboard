<template>
  <el-dialog :close-on-click-modal="false" class="composite-indexes-new" title="Create New Composite Indexes" v-model="dialogVisible" width="90%" v-loading="isLoadingForm" :append-to-body="true">
    <el-steps align-center :active="active" finish-status="success">
      <el-step v-for="step in steps" :key="step" :title="step" />
    </el-steps>

    <el-form class="el-form">
      <div v-if="steps[active] === 'Name'">
        <el-form-item label="Name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
      </div>

      <div v-if="steps[active] === 'Range Field'">
        <CyodaModellingRangeDefs :configDefinitionColRanges="configDefinitionColRanges" @changeConfigDefinitionColRanges="onChangeConfigDefinitionColRanges" :configDefinition="configDefinition" />
      </div>

      <div v-if="steps[active] === 'None Range Fields'">
        <CyodaModellingColDefs :configDefinition="configDefinition" />
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button :disabled="active === 0" @click="onPrev">Previous step</el-button>
      <el-button :disabled="active === steps.length - 1" @click="onNext">Next step</el-button>
      <el-button type="primary" :disabled="form.columns.length === 0" @click="onAdd">Add</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { ref, watch } from "vue";

import CyodaModellingRangeDefs from "../ConfigEditor/tabs/CyodaModelling/CyodaModellingRangeDefs.vue";
import CyodaModellingColDefs from "../ConfigEditor/tabs/CyodaModelling/CyodaModellingColDefs.vue";
import type { ColDef } from "@cyoda/ui-lib/src/types/types";

const emit = defineEmits(["created"]);
const props = defineProps({ entityClass: { default: "" } });

const dialogVisible = ref<boolean>(false);
const isLoadingForm = ref<boolean>(false);

const active = ref(0);
let configDefinitionColRanges = ref([]);

let steps = ref(["Name", "Range Field", "None Range Fields"]);

let defaultForm = ref({
  "@bean": "com.cyoda.core.model.index.dto.IndexParametersDefDto",
  entityClass: props.entityClass,
  name: "",
  rangeColPath: "",
  columns: []
});

let form = ref(JSON.parse(JSON.stringify(defaultForm.value)));

let configDefinitionDefault = ref({
  requestClass: props.entityClass,
  colDefs: []
});

let configDefinition = ref(JSON.parse(JSON.stringify(configDefinitionDefault.value)));

async function onNext() {
  const stepName = steps.value[active.value];
  if (stepName === "Name" && !form.value.name) {
    ElNotification({ type: "error", title: "Error", message: "Please enter name" });
    return false;
  } else if (stepName === "Range Field" && !form.value.rangeColPath) {
    ElNotification({ type: "error", title: "Error", message: "Please select rangeColPath" });
    return false;
  } else if (stepName === "None Range Fields" && form.value.columns.length === 0) {
    ElNotification({ type: "error", title: "Error", message: "Please select columns" });
    return false;
  }
  active.value += 1;
}

function onPrev() {
  active.value -= 1;
}

function onChangeConfigDefinitionColRanges(data: ColDef[]) {
  configDefinitionColRanges.value = data;
  form.value.rangeColPath = data.length > 0 ? data[0].fullPath : "";
}

watch(
  ()=> configDefinition.value.colDefs,
  (data: ColDef[]) => {
    form.value.columns = data.map((el) => el.fullPath);
  },
  { deep: true }
);

async function onAdd() {
  emit("created", form.value);
}

watch(dialogVisible, (val: boolean) => {
  if (val) {
    form.value = JSON.parse(JSON.stringify(defaultForm.value));
    configDefinition.value = JSON.parse(JSON.stringify(configDefinitionDefault.value));
    configDefinitionColRanges.value = [];
    active.value = 0;
  }
});

defineExpose({ dialogVisible, isLoadingForm });
</script>

<style lang="scss" scoped>
.composite-indexes-new {
  .el-form {
    margin-top: 15px;
  }
}
</style>
