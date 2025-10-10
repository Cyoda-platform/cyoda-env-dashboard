<template>
  <el-dialog width="800px" append-to-body :close-on-click-modal="false" title="Entities" v-model="dialogVisible">
    <el-form ref="elFormRef" :rules="rules" :model="form" label-width="120px">
      <el-form-item label="Entity Class" prop="entityClass">
        <el-select clearable v-model="form.entityClass" placeholder="Select">
          <el-option v-for="item in entityClassOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="onView">View</el-button>
    </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const emit = defineEmits(["change"]);
const entityClassOptions = computed(() => {
  if (Object.keys(dataMapping.value).length === 0) return [];
  return dataMapping.value.entityMappings.map((el) => {
    return {
      label: el.entityClass,
      value: el.entityClass
    };
  });
});

const elFormRef = ref(null);

const dialogVisible = ref<boolean>(false);
let dataMapping = ref({});

let form = ref({
  entityClass: ""
});

let rules = ref({
  entityClass: [{ required: true, message: "Please input Entity Class", trigger: "blur" }]
});

function openDialogWindow(dataMapping) {
  dialogVisible.value = true;
  elFormRef.value.resetFields();
  dataMapping.value = dataMapping;
}

function onView() {
  elFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const entityMapping = dataMapping.value.entityMappings.find((el) => el.entityClass === form.value.entityClass);
      emit("change", entityMapping);
      dialogVisible.value = false;
    }
  });
}

defineExpose({ openDialogWindow });
</script>

<style scoped lang="scss">
.vue-portal-target {
  display: inline-block;
  margin-right: 10px;

  :deep(.el-dropdown) {
    margin: 0 10px;
  }
}
</style>
