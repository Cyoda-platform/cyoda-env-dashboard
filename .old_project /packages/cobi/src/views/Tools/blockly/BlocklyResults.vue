<template>
  <div class="blockly-results">
    <template v-if="diffsArray.length === 0">
      <el-alert :closable="false" title="All is good" type="success" description="All generated texts same as statements from json" show-icon> </el-alert>
    </template>
    <template v-else>
      <p><strong>Name:</strong> {{ dataMappingName }}</p>
      <p><strong>DstPath:</strong> {{ dstPath }}</p>
      <p>Show {{ currentIndex + 1 }} from {{ diffsArray.length }}</p>
      <p>
        <el-button-group>
          <el-button :disabled="isDisabledPrev" @click="onPrev" type="primary" icon="el-icon-arrow-left">Previous </el-button>
          <el-button :disabled="isDisabledNext" @click="onNext" type="primary">Next<i class="el-icon-arrow-right el-icon-right"></i></el-button>
        </el-button-group>
      </p>
      <el-divider />

      <div class="code-diff-title">
        <div class="left">
          <h3>Generated</h3>
        </div>
        <div class="right">
          <h3>From Server</h3>
        </div>
      </div>
      <CyodaEditor :old-string="newString" :new-string="oldString" :diff="true" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import beautify from "js-beautify";
import CyodaEditor from "@cyoda/ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue";

const props = defineProps({
  diffsArray: {
    default: () => []
  }
});
const currentValue = computed(() => {
  return props.diffsArray[currentIndex.value];
});
const oldString = computed(() => {
  if (!currentValue.value) return "";
  return beautify.js(JSON.stringify(currentValue.value.existStatements).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
});
const newString = computed(() => {
  if (!currentValue.value) return "";
  return beautify.js(JSON.stringify(currentValue.value.generatedStatements).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
});
const dataMappingName = computed(() => {
  if (!currentValue.value) return "";
  return currentValue.value.dataMappingName;
});
const dstPath = computed(() => {
  if (!currentValue.value) return "";
  return currentValue.value.dstPath;
});
const isDisabledPrev = computed(() => {
  return currentIndex.value == 0;
});
const isDisabledNext = computed(() => {
  return currentIndex.value >= props.diffsArray.length - 1;
});

const currentIndex = ref(0);

function onPrev() {
  currentIndex.value -= 1;
  if (currentIndex.value < 0) currentIndex.value = 0;
}
function onNext() {
  currentIndex.value += 1;
  if (currentIndex.value > props.diffsArray.length - 1) currentIndex.value = props.diffsArray.length - 1;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrap-blockly {
  display: none;
}

.code-diff-title {
  display: flex;
  margin-bottom: 10px;
  div {
    width: 50%;
    h3 {
      font-weight: bold;
    }
  }
}
</style>
