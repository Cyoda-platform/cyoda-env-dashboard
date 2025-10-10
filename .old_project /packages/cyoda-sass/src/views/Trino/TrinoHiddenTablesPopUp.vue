<template>
  <el-dialog
    :close-on-click-modal="false"
    v-model="dialogVisible"
    title="Restore Tables"
    width="80%"
  >

    <div class="actions">
      <el-input v-model="form.filter" style="width: 250px" placeholder="Filter"/>
    </div>
    <el-table :data="tablesComputed" border style="width: 100%">
      <el-table-column label="Deleted" width="140">
        <template #default="{row}">
          <el-checkbox v-model="row.hidden"/>
        </template>
      </el-table-column>
      <el-table-column prop="tableName" label="Table Name"/>
      <el-table-column prop="uniformedPath" label="Uniformed Path"/>
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";

const dialogVisible = ref(false);

const form = reactive({
  filter: ""
});

const props = defineProps({
  tables: {
    default: () => {
      return [];
    }
  }
});

const tablesComputed = computed(() => {
  if (!props.tables) return [];
  return props.tables.filter((el) => {
    return !form.filter || el.tableName.toLowerCase().includes(form.filter.toLowerCase());
  }).filter((el) => el.hidden)
})

function open() {
  dialogVisible.value = true;
}

defineExpose({open});
</script>

<style scoped lang="scss">
.actions {
  margin-bottom: 10px;
}
</style>
