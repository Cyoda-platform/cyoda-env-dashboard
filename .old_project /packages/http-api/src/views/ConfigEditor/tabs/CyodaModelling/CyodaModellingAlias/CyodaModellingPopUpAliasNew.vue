<template>
  <el-dialog :close-on-click-modal="false" class="cyoda-modelling-pop-up-alias-new" title="Columns"
             v-model="dialogVisible" width="90%" :append-to-body="true">
    <el-steps align-center :active="active" finish-status="success">
      <el-step
        :class="{
          selected: isEditEnable
        }"
        v-for="(step, index) in steps"
        @click.native="onClickStep(index)"
        :key="step"
        :title="step"
      />
    </el-steps>

    <div v-show="steps[active] === 'Entity'">
      <CyodaModellingAliasSettingsEntity :alias="alias"/>
    </div>

    <div v-show="steps[active] === 'Paths'">
      <div class="actions-settings">
        <CyodaModellingPopUpToggles @change="onChangeToggles"/>
        <CyodaModellingPopUpSearch @change="onChangeSearch"/>
      </div>
      <el-checkbox-group v-model="selected">
        <CyodaModellingGroup v-if="isVisibleGroup" :checked="selected" :isOpenAllSelected="isOpenAllSelected"
                             :isCondenseThePaths="isCondenseThePaths" :requestClass="alias.entityClass"
                             :reportInfoRows="reportingInfoRows" :relatedPaths="relatedPaths" :search="search"/>
      </el-checkbox-group>
    </div>

    <div v-show="steps[active] === 'Name'">
      <CyodaModellingAliasSettingsForm ref="cyodaModellingAliasSettingsFormRef" :aliasEditType="aliasEditType"
                                       :alias="alias"/>
    </div>

    <div v-show="steps[active] === 'Mappers'">
      <CyodaModellingPopUpAliasMappers :aliasDef="alias.aliasDef"/>
    </div>

    <div v-show="steps[active] === 'Config file'">
      <CyodaModellingAliasSettingsJson v-model:alias="alias"/>
    </div>

    <template #footer>
      <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button :disabled="active === 0" @click="onPrev">Previous step</el-button>
      <el-button :disabled="active === steps.length - 1" @click="onNext">Next step</el-button>
      <el-button type="primary" v-if="Object.keys(aliasEdit).length == 0"
                 :disabled="!alias.name || alias.aliasDef.aliasPaths.length === 0" @click="onAdd">Add</el-button>
      <el-button type="primary" v-if="Object.keys(aliasEdit).length > 0" :disabled="!alias.name" @click="onUpdate">Update</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ElNotification} from "element-plus";
import {ref, nextTick, computed, watch, onBeforeUnmount} from "vue";

import * as api from "@cyoda/ui-lib/src/api";
import type {
  CatalogItem,
  ColDef,
  IDefinitionContent,
  RelatedPath,
  ReportingInfoRow
} from "@cyoda/ui-lib/src/types/types";
import HelperModelling from "@cyoda/ui-lib/src/helpers/HelperModelling";
import CyodaModellingPopUpAliasMappers from "./CyodaModellingPopUpAliasMappers.vue";
import CyodaModellingAliasSettingsForm from "./CyodaModellingAliasSettingsForm.vue";
import CyodaModellingPopUpToggles
  from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingPopUpToggles.vue";
import CyodaModellingPopUpSearch
  from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingPopUpSearch.vue";
import CyodaModellingAliasSettingsEntity from "./CyodaModellingAliasSettingsEntity.vue";
import CyodaModellingAliasSettingsJson from "./CyodaModellingAliasSettingsJson.vue";
import HelperFormat from "@cyoda/cobi/src/helpers/HelperFormat";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import CyodaModellingGroup from "@cyoda/ui-lib/src/components-library/patterns/CyodaModelling/CyodaModellingGroup.vue";

const emit = defineEmits(["change", "update"]);
const props = defineProps({
  allowSelectEntity: {
    default: false
  },
  allowConfigFile: {
    default: true
  },
  configDefinition: {
    default: () => {
      return {};
    }
  },
  aliasEditType: {
    default: "catalog"
  },
  aliasEdit: {
    default: () => {
      return {
        entityClass: "",
        name: "",
        desc: "",
        aliasDef: {
          name: "",
          aliasPaths: {
            "@meta": "",
            value: []
          },
          aliasType: ""
        }
      };
    }
  }
});
const isEditEnable = computed(() => {
  return props.aliasEdit && Object.keys(props.aliasEdit).length > 0 && props.aliasEdit.entityClass;
});
const steps = computed(() => {
  const steps: string[] = [];
  if (props.allowSelectEntity) {
    steps.push("Entity");
  }
  steps.push("Paths");
  steps.push("Name");
  steps.push("Mappers");
  if (props.allowConfigFile) {
    steps.push("Config file");
  }

  return steps;
});

const cyodaModellingAliasSettingsFormRef = ref(null);

const active = ref(0);
const dialogVisible = ref<boolean>(false);
let defaultAlias = ref({
  entityClass: "",
  name: "",
  desc: "",
  aliasDef: {
    name: "",
    aliasPaths: {
      "@meta": "",
      value: []
    },
    aliasType: ""
  }
});

let alias = ref(JSON.parse(JSON.stringify(defaultAlias.value)));

let reportingInfoRows = ref([]);
const isVisibleGroup = ref<boolean>(false);
const isOpenAllSelected = ref<boolean>(false);
const isCondenseThePaths = ref<boolean>(false);
let selected = ref([]);
let relatedPaths = ref([]);
const search = ref<string>("");

function resetForm() {
  alias.value = JSON.parse(JSON.stringify(defaultAlias.value));
  selected.value = [];
}

watch(
  () => alias.value.entityClass,
  async (val: string, valOld: string) => {
    if (val) {
      const {data} = await api.getReportingInfo(val);
      reportingInfoRows.value = HelperModelling.sortData(HelperModelling.filterData(data));
      const {data: relatedData} = await api.getReportingRelatedPaths(val);
      relatedPaths.value = relatedData;
    }
    if (valOld && val !== valOld) {
      selected.value = [];
    }
  },
  {immediate: true}
);

watch(dialogVisible, async (val: boolean) => {
  if (val) {
    isVisibleGroup.value = false;
    await nextTick();

    isVisibleGroup.value = true;
  }
});

eventBus.$on("changedBaseColumnPath", changedBaseColumnPath);

onBeforeUnmount(() => {
  eventBus.$off("changedBaseColumnPath", changedBaseColumnPath);
});

function changedBaseColumnPath(val: {
  old: string;
  new: string
}) {
  if (selected.value.length > 0) {
    selected.value.forEach((el) => {
      el.fullPath = el.fullPath.replace(val.old, val.new);
      el.parts.value.forEach((elValue) => {
        elValue.path.replace(val.old, val.new);
      });
    });
  }
}

function onAdd() {
  cyodaModellingAliasSettingsFormRef.value.elFormRef.validate((valid) => {
    if (valid) {
      dialogVisible.value = false;
      emit("change", JSON.parse(JSON.stringify(alias.value)));
      resetForm();
    } else {
      ElNotification({type: "error", title: "Error", message: "Form have errors. Please check form."});
    }
  });
}

function onUpdate() {
  cyodaModellingAliasSettingsFormRef.value.elFormRef.validate((valid) => {
    if (valid) {
      dialogVisible.value = false;
      emit("update", JSON.parse(JSON.stringify(alias.value)));
      resetForm();
    } else {
      ElNotification({type: "error", title: "Error", message: "Form have errors. Please check form."});
    }
  });
}

async function onNext() {
  const stepName = steps.value[active.value];
  if (stepName === "Entity" && !alias.value.entityClass && props.allowSelectEntity) {
    ElNotification({type: "error", title: "Error", message: "Please select Entity"});
    return false;
  }
  if (stepName === "Paths") {
    if (selected.value.length === 0) {
      ElNotification({type: "error", title: "Error", message: "Please select minimum 1 path"});
      return false;
    }
  }
  if (stepName === "Mappers") {
    const notSelectedMapper = alias.value.aliasDef.aliasPaths.value.filter((el) => !el.mapperClass);
    if (notSelectedMapper.length > 0) {
      ElNotification({type: "error", title: "Error", message: "Please select for ALL paths mapper"});
      return false;
    }
    const validateResult = await validate();
    if (!validateResult) {
      return false;
    }
  }
  active.value += 1;
}

function onPrev() {
  active.value -= 1;
}

function onClickStep(index: number) {
  if (isEditEnable.value) {
    active.value = index;
  }
}

async function validate() {
  if (Object.keys(props.configDefinition).length === 0) {
    return true;
  }
  const configDefinition: IDefinitionContent = JSON.parse(JSON.stringify(props.configDefinition));
  configDefinition.aliasDefs = configDefinition.aliasDefs.filter((el) => el.name !== alias.value.name);
  configDefinition.aliasDefs.push(alias.value.aliasDef);
  configDefinition.condition = {
    "@bean": "com.cyoda.core.conditions.GroupCondition",
    operator: "AND"
  };
  return true;
}

function onChangeToggles({ isOpenAllSelected: isOpenAllSelectedProp = false, isCondenseThePaths: isCondenseThePathsProp = false }) {
  isOpenAllSelected.value = isOpenAllSelectedProp;
  isCondenseThePaths.value = isCondenseThePathsProp;
}

function onChangeSearch({input = ""}) {
  search.value = input;
}

watch(
  selected,
  () => {
    if (selected.value.length === 0) return {};
    const values = selected.value.map((el) => {
      const mapper = props.aliasEdit && props.aliasEdit.aliasDef && props.aliasEdit.aliasDef.aliasPaths && props.aliasEdit.aliasDef.aliasPaths.value && props.aliasEdit.aliasDef.aliasPaths.value.find((elAliasEdit) => elAliasEdit.colDef.fullPath === el.fullPath);
      return {
        colDef: el,
        mapperClass: (mapper && mapper.mapperClass) || "com.cyoda.core.reports.aliasmappers.BasicMapper",
        mapperParameters: mapper && mapper.mapperParameters
      };
    });
    alias.value.aliasDef.aliasPaths = {
      "@meta": "com.cyoda.core.reports.columndefs.ReportAliasPathDef[]",
      value: values
    };
    alias.value.aliasDef.aliasType = selected.value[0].colType;

    if (!alias.value.name) {
      const shortPath = HelperFormat.shortNamePath(selected.value[0].fullPath);
      alias.value.name = shortPath.replaceAll(".", ":");
    }
  },
  {immediate: true, deep: true}
);

watch(
  () => props.aliasEdit,
  () => {
    if (Object.keys(props.aliasEdit).length > 0) {
      selected.value = props.aliasEdit.aliasDef.aliasPaths.value.map((el) => el.colDef);
      alias.value = JSON.parse(JSON.stringify(props.aliasEdit));
    }
  },
  {immediate: true, deep: true}
);

defineExpose({dialogVisible, active, defaultAlias, alias, resetForm});
</script>

<style lang="scss">
.cyoda-modelling-pop-up-alias-new {
  .actions-settings {
    margin-top: 20px;
    text-align: right;
    margin-bottom: 20px;
  }

  .el-step.selected {
    cursor: pointer;
  }
}
</style>
