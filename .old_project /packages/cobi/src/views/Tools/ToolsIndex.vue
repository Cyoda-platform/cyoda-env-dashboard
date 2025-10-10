<template>
  <div class="tools-index">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="name" label="Name" />
      <el-table-column label="Action" width="180">
        <template v-slot="{ row }">
          <el-button size="default" @click="onClick(row)" type="primary">
            <font-awesome-icon :icon="['fas', 'play']" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <DialogBlockly :key="keyClick" ref="dialogBlocklyRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

import DialogBlockly from "./blockly/DialogBlockly.vue";

const dialogBlocklyRef = ref(null);

const keyClick = ref(0);

let tableData = ref([
  {
    name: "Blockly: Check tool for convert in JSON",
    callback: checkBlockly
  }
]);

async function onClick(row) {
  keyClick.value += 1;
  await nextTick();

  setTimeout(() => {
    row.callback();
  }, 1000);
}

function checkBlockly() {
  dialogBlocklyRef.value.dialogVisible = true;
}
</script>
