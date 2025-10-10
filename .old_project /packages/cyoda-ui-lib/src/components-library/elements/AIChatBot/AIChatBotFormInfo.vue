<template>
  <el-dialog
    class="ai-chat-bot-form-info"
    v-model="dialogVisible"
    title="Info"
    width="700"
  >
    <el-table :data="tableData" style="width: 100%">
      <el-table-column width="100px" prop="name" label="Name"/>
      <el-table-column prop="description" label="Prompt"/>
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {ElNotification} from "element-plus";

const props = defineProps({
  returnDataTypes: {
    default: () => {
      return {};
    }
  }
})

const dialogVisible = ref(false);
const tableData = computed(() => {
  return Object.keys(props.returnDataTypes).filter((el) => el !== 'random').map((el) => {
    return {
      name: el,
      description: props.returnDataTypes[el]
    }
  })
});

defineExpose({dialogVisible});
</script>

<style lang="scss">
.ai-chat-bot-form-info {
  text-align: left;
}
</style>
