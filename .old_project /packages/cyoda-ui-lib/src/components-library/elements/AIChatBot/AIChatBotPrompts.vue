<template>
  <el-drawer
    class="ai-chat-bot-form-info"
    v-model="dialogVisible"
    width="700"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="flex-inline">
        <h4 :id="titleId" :class="titleClass">Prompts</h4>
      </div>
    </template>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="value" label="Value"/>
      <el-table-column width="180" label="Actions">
        <template #default="{row}">
          <el-button size="default" v-if="row.type==='user'" type="danger" @click="onDelete(row)">
            <font-awesome-icon icon="trash"/>
          </el-button>
          <el-button size="default" type="primary" @click="onSelect(row)">
            Use
            <font-awesome-icon :icon="['fas', 'check']"/>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useChatbotStore} from "../../../stores/chatbot";
import {type PromptsCategory} from "../../../types/types";
import {useAuthStore} from "../../../stores/auth";
import {ElMessageBox, ElNotification} from "element-plus";

const chatbotStore = useChatbotStore();
const authStore = useAuthStore();
onMounted(() => {
  loadData();
})

const props = defineProps<{
  category: PromptsCategory
}>();

const emits = defineEmits(['selected']);
const allPrompts = ref<any[]>([]);


async function loadData() {
  allPrompts.value = [];
  const [defaultPrompt, userPrompts]: any[] = await Promise.all([
    chatbotStore.getPromtsDefault(props.category),
    chatbotStore.getPromtsByUser(props.category, authStore.userId)
  ]);

  defaultPrompt.data.forEach((el) => allPrompts.value.push({
      type: 'default',
      value: el,
    }
  ));

  userPrompts.data.forEach((el, index) => allPrompts.value.push({
      type: 'user',
      value: el,
      index
    }
  ));
}

const dialogVisible = ref(false);
const tableData = computed(() => {
  return allPrompts.value;
})

function onClickAdd() {
  ElMessageBox.prompt('Please add new Prompt', 'Add new Prompt', {
    inputType: 'textarea',
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    customClass: 'el-message-box-textarea'
  })
    .then(async ({value}) => {
      await chatbotStore.postPromtsByUser(props.category, authStore.userId, {prompt: value.trim()});
      loadData();
      ElNotification({
        type: 'success',
        message: 'New prompt has been added',
        zIndex: 10000
      })
    })
}

function onDelete(row) {
  ElMessageBox.confirm("Do you really want to prompt?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        await chatbotStore.deletePromtsByUser(props.category, authStore.userId, row.index);
        loadData();
        ElNotification({
          type: 'success',
          message: 'Selected prompt was removed',
          zIndex: 10000
        })
      }
    }
  });
}

function onSelect(row) {
  emits('selected', row.value);
  dialogVisible.value = false;
}

defineExpose({dialogVisible, onClickAdd});
</script>

<style lang="scss">
.flex-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-message-box-textarea {
  textarea {
    min-height: 80px !important;
  }
}
</style>
