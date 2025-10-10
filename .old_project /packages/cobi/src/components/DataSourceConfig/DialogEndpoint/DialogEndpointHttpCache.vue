<template>
  <div class="dialog-endpoint-http-cache">
    <el-form-item label="Ttl" prop="cache.ttl">
      <el-input-number :min="0" v-model="cache.ttl" />
    </el-form-item>

    <el-form-item v-if="false" label="Parameters" prop="cache.parameters">
      <div class="actions-parameters">
        <el-button @click="onAdd" type="primary"
          >Add
          <font-awesome-icon icon="plus" />
        </el-button>
      </div>
      <div class="wrapper-parameters" v-for="(_, index) in cache.parameters" :key="index">
        <div class="input">
          <el-input placeholder="Please input" v-model="cache.parameters[index]" />
        </div>
        <div class="button">
          <el-button @click="onDelete(index)" type="danger">
            <font-awesome-icon icon="trash" />
          </el-button>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";

const props = defineProps({
  cache: {
    default: () => {
      return {};
    }
  }
});

function onAdd() {
  props.cache.parameters.push("");
}

function onDelete(index) {
  ElMessageBox.confirm("Do you really want to delete record?", "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        props.cache.parameters.splice(index, 1);
      }
    }
  });
}
</script>

<style lang="scss">
.dialog-endpoint-http-cache {
  .actions-parameters {
    margin-bottom: 10px;
  }

  .wrapper-parameters {
    display: flex;
    margin-bottom: 10px;

    > div {
      margin-right: 10px;
    }

    .input {
      width: 200px;
    }

    .index-row {
      width: 20px;
    }
  }
}
</style>
