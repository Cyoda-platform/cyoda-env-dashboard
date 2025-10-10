<template>
  <div>
    <div v-loading="isLoading" class="row-item" @click="openNode">
      <div class="row align-items-center">
        <div class="col-auto">
          <div
            class="statusIndicator"
            :class="{
              active: nodeInfo.up,
              deactive: !nodeInfo.up
            }"
          ></div>
        </div>
        <div class="col-auto">
          <font-awesome-icon icon="server" size="lg" />
        </div>
        <div class="col">
          <div class="title">
            {{ node.hostname }}
          </div>
          <div class="description">
            <template v-if="node.grafana">
              {{ description }}
            </template>
            <template v-else> This IP is not connected to Grafana </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, computed, watch } from "vue";
import {useGrafanaStore} from "../../stores/grafana";

const props = defineProps({ node: { default: [] } });
const router = useRouter();
const grafanaStore = useGrafanaStore();
const description = computed(() => {
  const arr: string[] = [];
  arr.push(nodeInfo.value.osName || "-");
  arr.push(`${nodeInfo.value.cpu || "-"} CPU`);
  arr.push(`${nodeInfo.value.storage || "-"} Storage`);
  arr.push(`${nodeInfo.value.ram || "-"} RAM`);
  return arr.join(", ");
});
function loadUp(grafana) {
  return grafanaStore.loadUp(grafana);
}

function loadNodeInfo(grafana) {
  return grafanaStore.loadNodeInfo(grafana);
}

let nodeInfo = ref({
  cpu: "",
  storage: "",
  ram: "",
  osName: "",
  up: ""
});

const isLoading = ref<boolean>(false);

function openNode() {
  router.push(`/processing-ui/nodes/${props.node.hostname}`);
}

watch(
  () => props.node,
  async () => {
    if (props.node && props.node.grafana) {
      isLoading.value = true;
      nodeInfo.value = await loadNodeInfo(props.node.grafana);
      nodeInfo.value.up = await loadUp(props.node.grafana);
      isLoading.value = false;
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.row-item {
  padding: 0 10px;
  font-size: 16px;
  background: white;
  margin-bottom: 2px;
  border-left: 5px solid transparent;
  cursor: pointer;

  .title {
    font-weight: bold;
  }

  .description {
    font-size: 14px;
  }

  &:hover {
    border-color: #00d8b3;
  }
}

.row {
  min-height: 50px;
  padding: 10px 0;
}
</style>
