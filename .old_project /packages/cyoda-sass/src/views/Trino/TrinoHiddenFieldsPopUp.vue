<template>
  <el-dialog
    :close-on-click-modal="false"
    v-model="dialogVisible"
    title="Restore Fields"
    width="80%"
  >

    <div class="actions">
      <el-input v-model="form.filter" style="width: 250px" placeholder="Filter"/>
    </div>
    <el-table :data="fieldsComputed" border style="width: 100%" :row-class-name="tableRowClassName" :row-key="rowKetFn">
      <el-table-column label="Deleted" width="140">
        <template #default="{row}">
          <el-checkbox v-model="row.hidden"/>
        </template>
      </el-table-column>
      <el-table-column prop="fieldName" label="Field Name"/>
      <el-table-column prop="fieldKey" label="Field Key"/>
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

const fields = ref([]);

const fieldsComputed = computed(() => {
  return fields.value.filter((el) => {
    return !form.filter || el.fieldName.toLowerCase().includes(form.filter.toLowerCase());
  }).filter((el) => el.hidden);
})

function open(fieldsValue = []) {
  dialogVisible.value = true;
  fields.value = fieldsValue || [];
}


function tableRowClassName({row}) {
  if (!row.arrayFields) return 'not-expanded';
  return '';
}

function rowKetFn(row) {
  return row.fieldKey;
}

defineExpose({open});
</script>

<style scoped lang="scss">
.actions {
  margin-bottom: 10px;
}

::v-deep(.not-expanded .el-table__expand-column .cell) {
  display: none;
}

.inner-table {
  margin-right: 20px;
  margin-left: 20px;
}
</style>
