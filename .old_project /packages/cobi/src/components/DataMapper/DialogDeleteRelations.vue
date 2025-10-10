<template>
  <el-dialog append-to-body :close-on-click-modal="false" title="Delete Relations" v-model="dialogVisible" width="800px">
    <el-table :data="selectedDataRelations" style="width: 100%">
      <el-table-column prop="column.srcColumnPath" label="Source Field"></el-table-column>
      <el-table-column prop="column.dstColumnPath" label="Target Field"></el-table-column>
      <el-table-column label="Action" width="100px">
        <template v-slot:default="{ row }">
          <el-button type="danger" @click="onDelete(row)" circle>
            <font-awesome-icon icon="trash"/>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="danger" @click="onDeleteAll">
          Delete All
          <font-awesome-icon icon="trash" />
        </el-button>
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref } from "vue";

import "prismjs/themes/prism.css";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const emit = defineEmits(["delete", "deleteList"]);
const props = defineProps({
  selectedDataRelations: {
    default: () => {
      return [];
    }
  }
});

const dialogVisible = ref<boolean>(false);

function onDelete(row: any) {
  ElMessageBox.confirm("Do you really want to remove?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        emit("delete", row);
      }
    }
  });
}

function onDeleteAll() {
  ElMessageBox.confirm(`Do you really want to remove ${props.selectedDataRelations.length} record(s)?`, "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        emit("deleteList", props.selectedDataRelations);
        dialogVisible.value = false;
      }
    }
  });
}

defineExpose({ dialogVisible });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
