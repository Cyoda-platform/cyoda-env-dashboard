<template>
  <div>
    <el-form :model="form" class="demo-form-inline">
      <el-form-item label="Filter Message">
        <el-input v-model="form.filter" placeholder="Filter Message"></el-input>
      </el-form-item>
    </el-form>
    <el-divider/>

    <data-tables
      :table-props="{
        border: true
      }"
      :data="dataComputed"
      style="width: 100%"
    >
      <el-table-column prop="globalTimeMillis" label="Global Time Millis" width="200" sortable />
      <el-table-column prop="level" label="Level" width="100" sortable></el-table-column>
      <el-table-column prop="message" label="Message" sortable/>
      <el-table-column prop="seqNo" label="SeqNo" width="100" sortable/>
      <el-table-column prop="timeMillisFromStart" label="Time Millis From Start" width="200" sortable/>
      <el-table-column prop="type" label="type" width="200" sortable/>
    </data-tables>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

const dataComputed = computed(() => {
  return props.data.filter((el) => {
    return !form.value.filter || el.message.toLowerCase().includes(form.value.filter.toLowerCase()) || el.level.toLowerCase().includes(form.value.filter.toLowerCase());
  });
});

const props = defineProps({
  data: {
    default: () => {
      return {};
    }
  }
});

let form = ref({
  filter: ""
});

defineExpose({form});
</script>
