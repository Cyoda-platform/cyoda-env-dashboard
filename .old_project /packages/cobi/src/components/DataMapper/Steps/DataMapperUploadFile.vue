<template>
  <div class="data-mapper-upload-file">
    <el-alert
      class="exist-data"
      v-if="isDataExist"
      title="The data has already been loaded"
      type="success"
      description="You can skip this step and use the data that has been previously loaded"
      :closable="false"
      show-icon
    />
    <UploadFile :isEnableEditor="true" :dataMappingConfigDto="dataMappingConfigDto" @save="onSave"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import "prismjs/themes/prism.css";

import UploadFile from "../../../components/DataMapper/UploadFile.vue";

const props = defineProps({
  dataMappingConfigDto: {
    default: () => {
      return {};
    }
  },
  isVirtual: {
    default: false
  }
});

const emit = defineEmits(["save"]);

let rules = ref({
  name: [{required: true, message: "Please fill field Name", trigger: "blur"}]
});

function onSave(data: any) {
  emit("save", data);
}

const isDataExist = computed(() => {
  return props.dataMappingConfigDto.sampleContent;
})
</script>

<style scoped lang="scss">
.data-mapper-upload-file {
  margin-top: 20px;

  .exist-data {
    max-width: 500px;
    margin: 0 auto;
    margin-bottom: 15px;
    padding: 16px 32px;
  }
}
</style>
