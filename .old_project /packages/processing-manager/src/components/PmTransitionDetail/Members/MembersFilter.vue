<template>
  <div class="card">
    <div class="card-header">Filter</div>
    <div class="card-body">
      <el-form class="members-filter" label-position="top">
        <el-row class="wrap-row" :gutter="20">
          <el-col :span="5">
            <el-form-item label="Entity type">
              <el-select filterable clearable v-model="form.entityType">
                <el-option v-for="entityClass in entityClassOptions" :key="entityClass.value" :label="entityClass.label" :value="entityClass.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Action Type">
              <el-select v-model="form.actionType" placeholder="Action Type">
                <el-option v-for="actionType in actionTypeOptions" :key="actionType" :label="actionType" :value="actionType" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Version check result">
              <el-select clearable v-model="form.versionCheckResult" placeholder="Please select">
                <el-option label="True" :value="true" />
                <el-option label="False" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="Sort">
              <el-select v-model="form.sort" placeholder="Sort">
                <el-option label="Asc" value="ASC" />
                <el-option label="Desc" value="DESC" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="action-item" :span="4">
            <el-button @click="onSubmit" :loading="isLoading" type="primary">Load</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {useProcessingStore} from "../../../stores/processing";

const emit = defineEmits(["change"]);
const props = defineProps({ isLoading: { default: false } });
const processingStore = useProcessingStore();
function entitiesListPossible() {
  return processingStore.entitiesListPossible();
}

let actionTypeOptions = ref(["ALL", "READ", "UPDATE", "REMOVE"]);

let entityClassOptions = ref([]);

let form = ref({
  entityType: "",
  actionType: "ALL",
  versionCheckResult: null,
  sort: "ASC"
});

function onSubmit() {
  emit("change", form.value);
}
loadEntityClass();

async function loadEntityClass() {
  const { data } = await entitiesListPossible();

  entityClassOptions.value = data.map((el: string) => ({
    label: el,
    value: el
  }));
}

defineExpose({ form });
</script>

<style lang="scss">
.members-filter {
  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .wrap-row {
    position: relative;

    .action-item {
      position: relative;
      left: 0;
      top: 22px;
    }
  }
}
</style>
