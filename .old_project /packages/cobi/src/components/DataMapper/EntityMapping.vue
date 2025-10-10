<template>
  <div class="entity-mapping">
    <el-form ref="formRef" :model="entityMapping" :rules="rules" label-width="240px">
      <el-form-item v-if="noneMappingFields && noneMappingFields.length > 0" label="Hide non-mapping COBI fields?">
        <el-switch v-model="entityMapping.isShowNoneMappingFields"></el-switch>
      </el-form-item>
      <el-form-item v-if="isShowIsPolymorphicList" label="Is Polymorphic List?">
        <el-switch v-model="entityMapping.isPolymorphicList"></el-switch>
      </el-form-item>

      <el-form-item label="Name" prop="name">
        <el-input placeholder="Name" v-model="entityMapping.name"></el-input>
      </el-form-item>

      <el-form-item label="Entity Class" prop="entityClass">
        <el-select :disabled="action === 'popup:edit'" clearable v-loading="isLoadingEntities"
                   v-model="entityMapping.entityClass" filterable placeholder="Please select">
          <el-option v-for="(item, index) in requestClassOptionsComputed" :key="index" :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
      </el-form-item>

      <div v-for="(entityRelationConfig, index) in entityMapping.entityRelationConfigs">
        <h2 v-if="!isFirst" style="margin-bottom: 10px">{{ index + 1 }}) Relation Config</h2>

        <template v-if="isCanBeUploadedFile">
          <template v-if="!isFirst">
            <EntityMappingParentConfig :entityMapping="entityMapping" :dataMappingConfigDto="dataMappingConfigDto"
                                       :entityRelationConfig="entityRelationConfig"/>
          </template>

          <el-form-item
            v-if="!isDisabled"
            label="Source Relative Root Path"
            :prop="'entityRelationConfigs.' + index + '.srcRelativeRootPath'"
            :rules="{
              required: true,
              message: 'Please select Source Relative Root Path',
              trigger: 'change'
            }"
          >
            <el-tree-select check-strictly placeholder="Please select"
                            v-model="entityRelationConfig.srcRelativeRootPath"
                            :data="srcRelativeRootPathOptions(entityRelationConfig)">
              <template #default="{ data: { labelShort, label } }">
                {{ labelShort || label }}
              </template>
            </el-tree-select>
          </el-form-item>

          <template v-if="index > 0">
            <div style="text-align: right">
              <el-button @click="removeConfig(index)" type="danger">
                <font-awesome-icon icon="trash"/>
              </el-button>
            </div>
          </template>
        </template>
        <el-divider></el-divider>
      </div>
      <div v-if="!isFirst" style="text-align: right">
        <el-button class="add-new-config-btn" @click="addNewConfig" type="primary">
          Add New Relation Config
          <font-awesome-icon icon="plus"/>
        </el-button>
      </div>

      <el-tabs :key="`updateFilter-${updateFilter}`" type="border-card">
        <el-tab-pane>
          <template #label>
            <span :class="{ 'has-error': showErrors }">FilterBuilder</span>
          </template>
          <FilterBuilderGroup :showErrors="showErrors" :level="0" :cols="cols" :condition="entityMapping.entityFilter"/>
        </el-tab-pane>
        <el-tab-pane label="Fields">
          <ConfigEditorReportsTabModelling :showAliases="false" :configDefinition="configDefinition"/>
        </el-tab-pane>
      </el-tabs>

      <el-form-item style="display: none"
                    :rules="[{ message: 'Please input fill all fields in Filter Builder', trigger: 'blur', validator: validateFilter }]"
                    prop="entityFilter"/>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, watch} from "vue";

import FilterBuilderGroup from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/FilterBuilderGroup.vue";
import * as api from "@cyoda/ui-lib/src/api";

import HelperMapper from "../../helpers/HelperMapper";
import _ from "lodash";

import HelperReportDefinition from "@cyoda/http-api/src/helpers/HelperReportDefinition";
import ConfigEditorReportsTabModelling
  from "@cyoda/http-api/src/views/ConfigEditor/tabs/ConfigEditorReportsTabModelling.vue";
import type {EntityMappingConfigDto, ParentRelationConfigDto} from "./MappingConfigDto";
import EntityMappingParentConfig from "./EntityMappingParentConfig.vue";
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import HelperEntities from "@cyoda/ui-lib/src/helpers/HelperEntities.ts";

const props = defineProps({
  sourceData: undefined,
  noneMappingFields: {default: () => []},
  isFirst: {default: false},
  action: {default: ""},
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  }
});
const platformMappingStore = usePlatformMappingStore();

const dataType = computed(() => {
  return platformMappingStore.dataType;
});
const parentRequestClassOptions = computed(() => {
  return props.dataMappingConfigDto.entityMappings.map((el: any) => {
    return {
      value: el.entityClass,
      label: el.entityClass
    };
  });
});

const requestClassOptionsComputed = computed(() => {
  if (requestClassOptions.value.length > 0) {
    const selectedArr = parentRequestClassOptions.value.map((el: any) => el.value);
    return requestClassOptions.value.filter((el) => selectedArr.indexOf(el.value) == -1);
  } else {
    return [];
  }
});


const cols = computed(() => {
  return HelperReportDefinition.buildCols(configDefinition);
});
const defaultSrcRelativeRootPath = computed(() => {
  if (dataType.value === "BINARY_DOC") {
    return "root:/";
  }
  if (dataType.value === "CSV") {
    return "root:/*";
  }
  return "";
});
const isCanBeUploadedFile = computed(() => {
  return HelperMapper.isCanBeUploadedFile(dataType.value);
});
const isDisabled = computed(() => {
  return props.dataMappingConfigDto.dataType === "CSV";
});

const isShowIsPolymorphicList = computed(() => {
  return dataType.value !== "CSV";
})

function getCriteriaDefs(value) {
  return platformMappingStore.getCriteriaDefs(value);
}

const formRef = ref(null);

const isLoadingEntities = ref<boolean>(false);
let requestClassOptions = ref([]);
const relationOptions = ref(null);
const relation = ref(null);
const updateFilter = ref(0);

let entityRelationConfig = reactive({
  parentId: null,
  srcRelativeRootPath: "",
  currentEntityIdPath: "",
  parentEntityIdPath: ""
});

const entityMapping = ref<EntityMappingConfigDto>({
  id: {
    id: null,
    uiId: 1
  },
  name: "",
  entityClass: null,
  entityRelationConfigs: [JSON.parse(JSON.stringify(entityRelationConfig))],
  columns: [],
  functionalMappings: [],
  columnPathsForUniqueCheck: [],
  metadata: [],
  entityFilter: {
    "@bean": "com.cyoda.core.conditions.GroupCondition",
    operator: "AND",
    conditions: []
  },
  isShowNoneMappingFields: true,
  isPolymorphicList: false,
  cobiCoreMetadata: [],
  cobiPathsRelations: [],
  script: {
    inputSrcPaths: [],
    inputMetaPaths: [],
    reusableScripts: [],
    body: ""
  }
});

let colDefs = ref([]);
let aliasDefs = ref([]);
const showErrors = ref<boolean>(false);
const requestClass = ref<string>("");

const configDefinition = reactive({
  requestClass,
  colDefs,
  aliasDefs
});
let rules = reactive({
  entityClass: [{required: true, message: "Please select Entity Class", trigger: "change"}],
  name: [{required: true, message: "Please fill name field"}, {validator: checkNameUnique}]
});

let entityMappingDefault = reactive(JSON.parse(JSON.stringify(entityMapping.value)));
loadDataClassOptions();

async function loadDataClassOptions() {
  try {
    isLoadingEntities.value = true;
    const {data} = await api.getReportingFetchTypes(true);
    requestClassOptions.value = HelperEntities.getOptionsFromData(data);
  } finally {
    isLoadingEntities.value = false;
  }
}

function validateFilter(rule: any, value: any, callback: any) {
  const validate = HelperReportDefinition.validateConfigDefinition(entityMapping.value.entityFilter.conditions || []);
  showErrors.value = !validate;
  if (!validate) {
    return callback(new Error("Please input fill all fields in Filter Builder"));
  }
  callback();
}

// function validateFormField(field: string) {
//   formRef.value.validateField(field);
// }

function srcRelativeRootPathOptions(entityRelationConfig: ParentRelationConfigDto) {
  const selectedEntityMapping = props.dataMappingConfigDto.entityMappings.find((el: any) => {
    return el.id && entityRelationConfig.parentId && el.id.uiId == entityRelationConfig.parentId.uiId;
  });
  if (selectedEntityMapping) {
    const fullPath = HelperMapper.getFullPathForEntity(selectedEntityMapping, props.dataMappingConfigDto);
    const path = HelperMapper.transformPathToJs(fullPath);
    const nestedSourceData = path ? _.get(props.sourceData, path) : props.sourceData;
    if (nestedSourceData) {
      return HelperMapper.relativePathOptions(nestedSourceData);
    }
  } else {
    if (props.sourceData) {
      const options = [
        {
          label: "root:/",
          labelShort: "root",
          value: "root:/",
          children: HelperMapper.relativePathOptions(props.sourceData, "root:/")
        }
      ];
      return options;
    }
  }
  return [];
}

function addNewConfig() {
  const data = JSON.parse(JSON.stringify(entityRelationConfig));
  data.srcRelativeRootPath = defaultSrcRelativeRootPath.value;
  entityMapping.value.entityRelationConfigs.push(data);
}

function removeConfig(index: number) {
  entityMapping.value.entityRelationConfigs.splice(index, 1);
}

watch(
  dataType,
  () => {
    entityMapping.value.entityRelationConfigs[0].srcRelativeRootPath = defaultSrcRelativeRootPath.value;
  },
  {immediate: true}
);

function checkNameUnique(rule, value, callback) {
  const names = props.dataMappingConfigDto.entityMappings.filter((el) => el.id.uiId !== entityMapping.value.id.uiId).map((el) => el.name);
  if (value && names.includes(value)) {
    callback(new Error("Please set unique name"));
  } else {
    callback();
  }
}

watch(
  () => entityMapping.value.entityClass,
  (val) => {
    requestClass.value = val;
  },
  {immediate: true}
);

watch(
  () => entityMapping.value.entityFilter,
  async (val) => {
    if (val) {
      if (entityMapping.value.entityFilter && entityMapping.value.entityFilter.conditions && requestClass.value && colDefs.value.length == 0) {
        const aliasesArr = aliasDefs.value.map((el) => el.name);
        let colPaths: string[] = [];
        colPaths = functionGetAllPathsFromCriteria(entityMapping.value.entityFilter.conditions, aliasesArr);
        if (colPaths.length > 0) {
          const colDefsData = await getCriteriaDefs({
            rootClass: requestClass.value,
            colPaths
          });
          colDefs.value = colDefsData;
          updateFilter.value += 1;
        }
      }
    }
  },
  {immediate: true, deep: true}
);

function functionGetAllPathsFromCriteria(conditions, aliasesArr) {
  let colPaths: string[] = [];
  conditions.forEach((el) => {
    if ("conditions" in el) {
      colPaths = [...colPaths, ...functionGetAllPathsFromCriteria(el.conditions, aliasesArr)];
    } else {
      if (!aliasesArr.includes(el.fieldName) && !colPaths.includes(el.fieldName)) {
        colPaths.push(el.fieldName);
      }
    }
  });
  return colPaths;
}

defineExpose({entityMapping, rules, entityMappingDefault, formRef, defaultSrcRelativeRootPath, showErrors});
</script>

<style lang="scss">
.entity-mapping {
  .wrap-relation {
    margin-bottom: 10px;
  }

  .add-new-config-btn {
    margin-bottom: 25px;
  }
}
</style>
