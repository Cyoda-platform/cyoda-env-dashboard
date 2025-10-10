<template>
  <el-dialog destroy-on-close append-to-body :close-on-click-modal="false" title="Entity" v-model="dialogVisible"
             width="90%">
    <el-alert class="error-alerts" v-if="allErrorMessages.length > 0" title="Errors" type="error" :closable="false"
              show-icon>
      <div>
        <ol>
          <li v-for="(allErrorMessage, index) in allErrorMessages" :key="index">{{ allErrorMessage }}</li>
        </ol>
      </div>
    </el-alert>
    <div class="dialog-entity">
      <EntityMapping ref="entityMappingRef" :action="entityMappingAction" :isFirst="isFirst"
                     :noneMappingFields="noneMappingFields" :dataMappingConfigDto="dataMappingConfigDto"
                     :sourceData="sourceData"/>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <template v-if="dataBefore">
          <el-button :loading="isLoadingEdit" type="primary" @click="onEdit">Edit</el-button>
        </template>
        <template v-else>
          <el-button type="success" @click="onAdd">Add</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, nextTick, computed, watch} from "vue";

import EntityMapping from "./EntityMapping.vue";
import {getUid} from "../../helpers/HelperEntityMappingConfigId";
import {usePlatformMappingStore} from "../../stores/platform-mapping";
import HelperContent from "../../helpers/HelperContent";

const emit = defineEmits(["save", "edit"]);
const props = defineProps({
  sourceData: undefined,
  noneMappingFields: {default: () => []},
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
const isFirst = computed(() => {
  return props.dataMappingConfigDto.entityMappings.indexOf(dataBefore.value) === 0;
});

const entityMappingRef = ref(null);

const dialogVisible = ref<boolean>(false);
const dataBefore = ref(null);

const isLoadingEdit = ref<boolean>(false);
const entityMappingAction = ref<string>("");
const allErrorMessages = ref([]);

async function createNew() {
  dialogVisible.value = true;
  entityMappingAction.value = "";
  await nextTick();

  const uiIds = props.dataMappingConfigDto.entityMappings.map((el) => el.id.uiId);
  const data = JSON.parse(JSON.stringify(entityMappingRef.value.entityMappingDefault));
  data.entityRelationConfigs[0].srcRelativeRootPath = entityMappingRef.value.defaultSrcRelativeRootPath;
  entityMappingRef.value.entityMapping = data;
  entityMappingRef.value.entityMapping.id.uiId = Math.max(...uiIds) + 1;
  dataBefore.value = null;
}

async function editEntity(entityMapping: any) {
  dialogVisible.value = true;
  entityMappingAction.value = "popup:edit";
  await nextTick();

  dataBefore.value = entityMapping;
  entityMappingRef.value.entityMapping = JSON.parse(JSON.stringify(entityMapping));
}

function onAdd() {
  entityMappingRef.value.formRef.validate((valid: any) => {
    if (valid) {
      emit("save", entityMappingRef.value.entityMapping);
      dialogVisible.value = false;
    }
  });
}

function onEdit() {
  entityMappingRef.value.formRef.validate((valid: any, invalidFields) => {
    allErrorMessages.value = HelperContent.getAllErrorMessagesFromForm(invalidFields);
    if (invalidFields?.entityFilter) entityMappingRef.value.showErrors = true;
    if (valid) {
      saveEditingData();
    }
  });
}

function isExistChildRelations() {
  return !!props.dataMappingConfigDto.entityMappings.find((el) => {
    const ids = el.entityRelationConfigs.map((el) => el.parentId && el.parentId.uiId);
    return ids.includes(dataBefore.value.id.uiId);
  });
}

function getAllChildrenMappingsForMapping(entityMapping: any): any[] {
  let data: any[] = [];
  const childrens = props.dataMappingConfigDto.entityMappings.filter((el) => {
    const ids = el.entityRelationConfigs.map((el) => el.parentId && el.parentId.uiId);
    return ids.includes(entityMapping.id.uiId);
  });
  childrens.forEach((children) => {
    data = [children, ...getAllChildrenMappingsForMapping(children)];
  });
  return data;
}

function saveEditingData() {
  isLoadingEdit.value = true;
  setTimeout(() => {
    const editIndex = props.dataMappingConfigDto.entityMappings.indexOf(dataBefore.value);
    emit("edit", {data: entityMappingRef.value.entityMapping, index: editIndex});
    dialogVisible.value = false;
  }, 200);
}

watch(
  dialogVisible,
  async (val: any) => {
    if (val) {
      await nextTick();
      isLoadingEdit.value = false;
      await nextTick();
      await nextTick();
      entityMappingRef.value.formRef.clearValidate();
    }
  },
  {immediate: true}
);

defineExpose({createNew, editEntity});
</script>

<style lang="scss">
.dialog-entity {
  .wrap-relation {
    margin-bottom: 10px;
  }
}
</style>
