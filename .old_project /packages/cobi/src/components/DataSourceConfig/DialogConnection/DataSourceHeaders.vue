<template>
  <div class="data-source-config-connection-details-headers">
    <div class="header-actions">
      <el-button @click="addHeader" type="primary">
        Add Header
        <font-awesome-icon icon="plus" />
      </el-button>
    </div>
    <table class="table table-headers">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(header, index) in headers" :key="index">
          <td>
            <el-input @input="onChangeHeader" placeholder="Please input key" v-model.trim="header.key"></el-input>
          </td>
          <td>
            <el-input @input="onChangeHeader" placeholder="Please input value" v-model="header.value"></el-input>
          </td>
          <td class="action">
            <el-button size="default" @click="deleteHeader(index)" type="danger">
              <font-awesome-icon icon="trash" />
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, watch } from "vue";

const emit = defineEmits(["update:targetHeaders"]);
const props = defineProps({
  targetHeaders: {
    default: () => {
      return {};
    }
  }
});

let headers = ref([]);

function addHeader() {
  headers.value.push({ key: "", value: "" });
}

function deleteHeader(index: number) {
  ElMessageBox.confirm("Do you really want to remove header?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        headers.value.splice(index, 1);

        onChangeHeader();
      }
    }
  });
}

function onChangeHeader() {
  const headersValue = {};
  headers.value.forEach((el) => {
    headersValue[el.key] = el.value;
  });

  emit("update:targetHeaders", headersValue);
}

watch(
  () => props.targetHeaders,
  (value: any) => {
    if (headers.value.length === 0 && value) {
      Object.keys(value).forEach((el) => {
        headers.value.push({
          key: el,
          value: value[el]
        });
      });
    }
  },
  { immediate: true }
);
</script>
