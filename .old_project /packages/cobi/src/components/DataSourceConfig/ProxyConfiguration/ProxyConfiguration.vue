<template>
  <div class="http-parameters">
    <el-form-item label="Proxy">
      <el-select clearable filterable v-model="form.proxyConfigurationKey" placeholder="Select">
        <el-option v-for="item in proxyConfigurationOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { useDataSourceConfigStore } from "../../../stores/data-source-config";
import { ref } from "vue";

const props = defineProps({
  form: {
    default: () => {
      return {};
    }
  }
});
const dataSourceConfigStore = useDataSourceConfigStore();
function getProxy() {
  return dataSourceConfigStore.getProxy();
}

loadProxy();

let proxyConfigurationOptions = ref([]);

async function loadProxy() {
  const { data } = await getProxy();
  proxyConfigurationOptions.value = data.map((el: string) => {
    return {
      value: el,
      label: el
    };
  });
}
</script>
