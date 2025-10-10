<template>
  <el-form-item label="Operation" prop="operation">
    <el-input @input="onChangeOeration" v-model.trim="endpointDto.operation" />
  </el-form-item>
</template>

<script setup lang="ts">
const props = defineProps({
  endpointDto: {
    default: () => {
      return {};
    }
  }
});

function onChangeOeration(value) {
  props.endpointDto.operation = value.replaceAll(".", "");
}
</script>
