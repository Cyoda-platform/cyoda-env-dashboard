<template>
  <el-form class="pm-processing-events-entities-error-list-view-filter" label-position="top">
    <h3>Filter</h3>
    <el-row class="wrap-row" :gutter="20">
      <el-col :span="10">
        <el-form-item label="Entity class">
          <el-select filterable v-model="form.type">
            <el-option v-for="entityClass in entityClassOptions" :key="entityClass" :label="entityClass" :value="entityClass"> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col class="action-item" :span="4">
        <el-button :loading="isLoading" @click="onSubmit" type="primary">Load</el-button>
      </el-col>
    </el-row>
    <hr />
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {useProcessingStore} from "../../../../stores/processing";

const emit = defineEmits(["change", "change"]);
const props = defineProps({ isLoading: { default: false } });
const processingStore = useProcessingStore();
function entitiesListPossible() {
  return processingStore.entitiesListPossible();
}

let entityClassOptions = ref([]);

let form = ref({
  type: "ALL"
});

async function loadEntitiesListPossible() {
  const { data } = await entitiesListPossible();
  entityClassOptions.value = [...data, "ALL"];
  emit("change", form.value);
}

(async function () {
  loadEntitiesListPossible();
})();

function onSubmit() {
  emit("change", form.value);
}
</script>

<style lang="scss">
.pm-processing-events-entities-error-list-view-filter {
  h3 {
    margin-bottom: 5px;
  }
  .el-form-item__label {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .wrap-row {
    position: relative;

    .action-item {
      position: relative;
      top: 22px;
    }
  }
}
</style>
