<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" title="Repair Relations" v-model="dialogVisible" width="60%">
    <el-table :data="notExistRelations" style="width: 100%">
      <el-table-column prop="column.srcColumnPath" label="Source Field"></el-table-column>
      <el-table-column prop="column.dstColumnPath" label="Target Field"></el-table-column>
      <el-table-column label="Action" width="100px">
        <template v-slot="{ row }">
          <el-button @click="onRepair(row)" size="default" circle type="primary">
            <font-awesome-icon icon="screwdriver-wrench" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import HelperFormat from "../../../helpers/HelperFormat";

const emit = defineEmits(["repair"]);

const dialogVisible = ref<boolean>(false);

const props = defineProps({
  notExistRelations: {
    default: () => {
      return [];
    }
  }
});

function shortNamePath(name: string) {
  return HelperFormat.shortNamePath(name);
}

function onRepair(relation) {
  dialogVisible.value = false;
  emit("repair", relation);
}

defineExpose({ dialogVisible });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.target-data-row-dialog-not-exist-relations {
  border-collapse: collapse;
  width: 100%;

  td,
  th {
    border: 1px solid #dedede;
    padding: 5px 10px;
  }

  .action {
    width: 60px;
  }
}
</style>
