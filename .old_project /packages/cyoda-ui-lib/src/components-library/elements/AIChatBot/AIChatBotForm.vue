<template>
  <div class="ai-chat-bot-message" style="flex: auto">
    <div class="prepend-actions">
      <el-button-group>
        <el-tooltip append-to="body" :show-after="1000" popper-class="tooltip-item" effect="dark"
                    content="List of Prompts"
                    placement="top">
          <el-button class="promt-btn" @click="onClickPrompt" type="primary">
            <font-awesome-icon :icon="['fas', 'list']"/>
          </el-button>
        </el-tooltip>
        <el-tooltip append-to="body" :show-after="1000" popper-class="tooltip-item" effect="dark"
                    content="Add new Prompt"
                    placement="top">
          <el-button @click="onClickAdd" type="primary">
            <font-awesome-icon icon="plus"/>
          </el-button>
        </el-tooltip>
      </el-button-group>
      <el-tooltip append-to="body" :show-after="1000" popper-class="tooltip-item" effect="dark"
                  :content="form.fileList[0]?.name ? `File name: ${form.fileList[0]?.name}`:'Please select file'"
                  placement="top">
        <el-upload
          ref="uploadRef"
          class="image-uploader"
          action="#"
          accept="image/*"
          v-model:file-list="form.fileList"
          :show-file-list="false"
          :auto-upload="false"
        >
          <template #trigger>
            <el-button :type="form.fileList.length>0? 'success':'default'">
              <font-awesome-icon :icon="['fas', 'file-arrow-up']"/>
            </el-button>
          </template>
        </el-upload>
      </el-tooltip>
      <slot name="actions"/>
    </div>
    <div class="wrap-message-input">
      <el-input
        type="textarea"
        :disabled="isLoading || isLoadingClear"
        resize="none"
        :autosize="{ minRows: 1, maxRows: 8}"
        placeholder="Message for AI assistant..."
        v-model="form.message"
      />
    </div>
    <div class="wrap-message-button">
      <template v-if="isLoading">
        <el-tooltip :show-after="2000" class="item" effect="dark" content="Stop" placement="top">
          <el-button class="action-btn" @click="onStop" type="primary">
            <font-awesome-icon :icon="['fas', 'circle-stop']"/>
          </el-button>
        </el-tooltip>
      </template>
      <template v-else>
        <el-tooltip append-to="body" :show-after="2000" popper-class="tooltip-item" class="item" effect="dark"
                    content="Send message" placement="top">
          <el-dropdown trigger="click" :teleported="false" :disabled="isLoadingClear || isSubmitBtnDisabled"
                       class="action-btn" split-button type="primary"
                       @click="onSubmit(props.defaultReturnObject)">
            Submit
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="key in returnDataTypesKeys" :disabled="isDisabledReturnDataType(key)"
                                  @click.native="onSubmit(key)">{{
                    key
                  }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <font-awesome-icon @click="onClickInfo" class="info-icon" :icon="['fas', 'circle-exclamation']"/>
      </template>
    </div>
    <AIChatBotFormInfo ref="aIChatBotFormInfoRef" :returnDataTypes="returnDataTypes"/>
    <AIChatBotPrompts
      ref="aIChatBotPromptsRef"
      @selected="onSelectedPrompt"
      :category="category"
    />
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import AIChatBotFormInfo from "./AIChatBotFormInfo.vue";
import AIChatBotPrompts from "./AIChatBotPrompts.vue";
import {useChatbotStore} from "../../../stores/chatbot";

const props = defineProps({
  defaultReturnObject: {
    default: null
  },
  isLoading: {
    default: false
  },
  isLoadingClear: {
    default: false
  },
  category: {
    default: null
  },
  hiddenReturnObject: {
    default: () => ([])
  },
  onlyReturnObject: {
    default: () => ([])
  },
  disabledReturnObject: {
    default: () => []
  },
  isSubmitBtnDisabled: {
    default: false,
  }
})

const returnDataTypes = ref({});
const aIChatBotPromptsRef: any = ref(null);
const uploadRef = ref(null);
const chatbotStore = useChatbotStore();

onMounted(async () => {
  returnDataTypes.value = await returnData();
})

async function returnData() {
  let {data} = await chatbotStore.getReturnData(props.category);
  if (props.onlyReturnObject.length > 0) {
    data = Object.keys(data)
      .filter(key => props.onlyReturnObject.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});
  }

  if (props.hiddenReturnObject.length > 0) {
    data = Object.keys(data)
      .filter(key => !props.hiddenReturnObject.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});
  }
  if (props.defaultReturnObject) delete data[props.defaultReturnObject];
  return data;
}

const returnDataTypesKeys = computed((el) => {
  return Object.keys(returnDataTypes.value);
})

const form = reactive({
  message: '',
  key: '',
  fileList: [],
})

const aIChatBotFormInfoRef = ref(null);

const emit = defineEmits(['submit', 'stop']);

function onSubmit(key) {
  emit('submit', {
    message: form.message,
    key,
    file: form.fileList.length > 0 ? form.fileList[0]?.raw : undefined
  });
  uploadRef.value.clearFiles();
  form.message = '';
}

function onStop() {
  emit('stop');
}

function onClickInfo() {
  aIChatBotFormInfoRef.value.dialogVisible = true;
}

function onClickPrompt() {
  aIChatBotPromptsRef.value.dialogVisible = true;
}

function onSelectedPrompt(value) {
  form.message = `${form.message} ${value}`;
}

function onClickAdd() {
  aIChatBotPromptsRef.value.onClickAdd();
}

function isDisabledReturnDataType(key) {
  return props.disabledReturnObject.includes(key);
}

defineExpose({form})
</script>

<style lang="scss">
.tooltip-item {
  z-index: 10000 !important;
}

.ai-chat-bot-message {
  display: flex;

  .wrap-message-input {
    flex: 1;
    margin: 0 10px;

    textarea {
      min-height: 40px !important;
    }
  }

  .wrap-message-button, .prepend-actions {
    align-self: start;
  }

  .prepend-actions {
    display: flex;
  }

  .action-btn {
    //padding: 6px 12px;
    font-size: 18px;
  }

  .info-icon {
    margin-left: 10px;
    opacity: 0.5;
    transition: all 0.5s;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  .image-uploader {
    margin-left: 10px;
  }
}
</style>
