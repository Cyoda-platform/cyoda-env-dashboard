<template>
  <div class="entity-mapping-parent-config">
    <el-form-item label="Parent?">
      <el-switch @change="onChangeEnableParent" v-model="enableParent"/>
    </el-form-item>
    <template v-if="enableParent">
      <el-form-item label="Parent Relation" prop="parentId">
        <el-select value-key="uiId" @clear="clearParentEntityClass" clearable v-model="entityRelationConfig.parentId"
                   filterable
                   placeholder="Please select">
          <el-option v-for="(item, index) in parentIdOptions" :key="index" :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Relation" prop="relation" :rules="[{
        required: enableParent,
        validator: validateRelation
      }]">
        <div class="wrap-relation">
          <el-radio-group :disabled="!entityRelationConfig.parentId" @change="onChangeRelation" v-model="relationType">
            <el-radio-button label="current">From Current Entity Path</el-radio-button>
            <el-radio-button label="parent">From Parent Entity Path</el-radio-button>
          </el-radio-group>
        </div>

        <TreeSelectViewModel :relationValue="relationValue" @input="onChangeRelative"
                             :disabled="!(selectedClassForRelative && entityRelationConfig.parentId)"
                             :entityClass="selectedClassForRelative"/>
      </el-form-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import TreeSelectViewModel from "../TreeSelectViewModel/TreeSelectViewModel.vue";
import {usePlatformMappingStore} from "../../stores/platform-mapping";

const props = defineProps({
  entityRelationConfig: {
    default: () => {
      return {};
    }
  },
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  },
  entityMapping: {
    default: () => {
      return {};
    }
  }
});

const platformMappingStore = usePlatformMappingStore();
const dataType = computed(() => {
  return platformMappingStore.dataType;
})

const selectedClassForRelative = computed(() => {
  if (relationType.value == "current") {
    return props.entityMapping.entityClass;
  } else if (relationType.value == "parent" && props.entityRelationConfig.parentId) {
    return props.dataMappingConfigDto.entityMappings.find((el) => el.id.uiId === props.entityRelationConfig.parentId.uiId).entityClass;
  }
  return "";
});

const isInit = ref(false);

const relationValue = computed(() => {
  if (relationType.value == "current") {
    return props.entityRelationConfig.currentEntityIdPath || null;
  } else if (relationType.value == "parent") {
    return props.entityRelationConfig.parentEntityIdPath || null;
  }
  return null;
});
const parentIdOptions = computed(() => {
  return props.dataMappingConfigDto.entityMappings
    // .filter((el) => el.id.uiId !== props.entityMapping.id.uiId)
    .map((entityMapping) => {
      return {
        label: entityMapping.name,
        value: {
          id: (entityMapping.id && entityMapping.id.id) || null,
          uiId: (entityMapping.id && entityMapping.id.uiId) || null
        }
      };
    });
});

const relationType = ref<string>("current");
const enableParent = ref<boolean>(false);

function clearParentEntityClass() {
  relationType.value = "current";
  props.entityRelationConfig.currentEntityIdPath = null;
  props.entityRelationConfig.parentEntityIdPath = null;
  props.entityRelationConfig.srcRelativeRootPath = ['BINARY_DOC', 'CSV'].includes(dataType.value) ? "" : null;
  props.entityRelationConfig.parentId = null;
}

function onChangeRelation() {
  resetRelation();
}

function resetRelation() {
  props.entityRelationConfig.currentEntityIdPath = null;
  props.entityRelationConfig.parentEntityIdPath = null;
  props.entityRelationConfig.srcRelativeRootPath = ['BINARY_DOC', 'CSV'].includes(dataType.value) ? "" : null;
}

function onChangeEnableParent(value) {
  if (value) {
    if (['BINARY_DOC', 'CSV'].includes(dataType.value)) {
      props.entityRelationConfig.srcRelativeRootPath = "";
    }
  } else {
    clearParentEntityClass();
    if (['BINARY_DOC', 'CSV'].includes(dataType.value)) {
      if (dataType.value === "CSV") {
        props.entityRelationConfig.srcRelativeRootPath = "root:/*";
      } else if (dataType.value === "BINARY_DOC") {
        props.entityRelationConfig.srcRelativeRootPath = "root:/";
      }
    }
  }
}

function onChangeRelative(val) {
  resetRelation();

  if (relationType.value == "current") {
    props.entityRelationConfig.currentEntityIdPath = val;
  } else if (relationType.value == "parent") {
    props.entityRelationConfig.parentEntityIdPath = val;
  }
}

function validateRelation(rule, value, callback) {
  if (!enableParent.value) return callback();
  if (!props.entityRelationConfig.currentEntityIdPath && !props.entityRelationConfig.parentEntityIdPath) {
    callback(new Error("Please select Relation"));
  }
  return callback();
}

watch(
  () => props.entityRelationConfig,
  (val) => {
    if (isInit.value || !props.entityRelationConfig.parentId) return;
    if (!enableParent.value && props.entityRelationConfig.parentId) enableParent.value = true;
    if (relationType.value !== "parent" && props.entityRelationConfig.parentEntityIdPath) relationType.value = "parent";
    isInit.value = true;
  },
  {immediate: true}
);
</script>
