<template>
  <ViewWrapper>
    <div class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-header">Nodes</div>
          <div class="card-body">
            <el-table @row-click="rowClick" border :data="tableData" style="width: 100%">
              <el-table-column width="50">
                <font-awesome-icon icon="server" size="lg" />
              </el-table-column>
              <el-table-column prop="name" label="Name" sortable> </el-table-column>
              <el-table-column prop="status" label="Status" sortable>
                <template v-slot:default="{ row }">
                  <span>{{ row.status === null ? "Unknown" : row.status }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, computed, watch } from "vue";

import ViewWrapper from "../components/ViewWrapper.vue";
import {useProcessingStore} from "../stores/processing";
import {useGrafanaStore} from "../stores/grafana";

const router = useRouter();
const grafanaStore = useGrafanaStore();
const processingStore = useProcessingStore();
const nodes = computed(() => {
  return processingStore.nodes;
});
function loadNodes() {
  return grafanaStore.loadNodes();
}

function isServerUp(grafana) {
  return grafanaStore.isServerUp(grafana);
}

let tableData = ref([]);

function rowClick(row: any) {
  router.push(`/processing-ui/nodes/${row.name}`);
}
async function loadData() {
  tableData.value = await Promise.all(
    nodes.value.map(async (node: any) => {
      let result = {};
      if (node.grafana) {
        const serverUpData = await isServerUp(node.grafana);
        result = {
          name: node.hostname,
          status: serverUpData.data.data.result[0].value[1] === "1" ? "Running" : "Stopped"
        };
      } else {
        result = {
          name: node.hostname,
          status: null
        };
      }
      return result;
    })
  );
}

watch(
  nodes,
  () => {
    if (nodes.value.length > 0) {
      loadData();
    } else {
      tableData.value = [];
    }
  },
  { immediate: true }
);
</script>
