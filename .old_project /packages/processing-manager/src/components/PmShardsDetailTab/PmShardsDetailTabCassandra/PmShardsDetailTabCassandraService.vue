<template>
  <div class="card">
    <div class="card-header">
      <span> Service </span>
      <span>
        <template v-if="up === null">
          <span class="status unknown">Unknown</span>
        </template>
        <template v-else-if="up">
          <span class="status active">Running</span>
        </template>
        <template v-else>
          <span class="status deactive">Stop</span>
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ElMessage, ElMessageBox} from "element-plus";
import { useRoute } from "vue-router";
import { ref, computed, watch } from "vue";
import {useGrafanaStore} from "../../../stores/grafana";
import {useProcessingStore} from "../../../stores/processing";

const route = useRoute();
const grafanaStore = useGrafanaStore();
const processingStore = useProcessingStore();
const nodes = computed(() => {
  return processingStore.nodes;
});
function loadUp(grafana) {
  return grafanaStore.loadUp(grafana);
}

const up = ref(null);

function onReboot() {
  ElMessageBox.confirm("Cassandra Reboot. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(() => {
      ElMessage({
        type: "success",
        message: "Cassandra Reboot completed"
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Cassandra Reboot canceled"
      });
    });
}

function onPowerOff() {
  ElMessageBox.confirm("Cassandra Stop. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  })
    .then(() => {
      ElMessage({
        type: "success",
        message: "Cassandra Stop completed"
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Cassandra Stop canceled"
      });
    });
}

watch(
  nodes,
  async (nodes: any[]) => {
    if (nodes.length > 0) {
      const node = JSON.parse(JSON.stringify(nodes.find((el) => el.hostname === route.params.name)));
      if (node.grafana) {
        node.grafana.instance = node.grafana.instance.replace(":9100", ":7070");
        node.grafana.job = "cassandra";
        up.value = await loadUp(node.grafana);
      }
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 5px;
  }
}

svg {
  margin-right: 5px;
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;

  .status {
    font-weight: bold;

    &.active {
      color: #00d8b3;
    }

    &.deactive {
      color: #d8646b;
    }

    &.unknown {
      color: #acacac;
    }
  }
}
</style>
