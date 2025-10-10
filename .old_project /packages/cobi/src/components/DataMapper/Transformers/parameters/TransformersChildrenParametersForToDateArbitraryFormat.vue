<template>
  <div class="transformers-children-parameters-for-to-date-arbitrary-format">
    <div><strong>Automatic parsed format:</strong> {{ automaticParsedString }}</div>
    <strong>Result:</strong>
    <template v-if="isValid">
      <span class="valid">Valid</span>
      <div v-if="parameter.value"><strong>Parsed string:</strong> {{ parsingResult }}</div>
    </template>
    <template v-else>
      <span class="in-valid">InValid</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";

import moment from "moment";
import "moment-jdateformatparser";

const props = defineProps({
  parameter: {
    default: () => {
      return {};
    }
  }
});

const isValid = computed(() => {
  const format = moment(inboundData).toMomentFormatString(props.parameter);
  return moment(inboundData, format).isValid();
});
const parsingResult = computed(() => {
  const format = moment(inboundData).toMomentFormatString(props.parameter);
  return moment(inboundData).format(format);
});
const automaticParsedString = computed(() => {
  const format = moment(inboundData).creationData().format;

  return moment(inboundData).toJDFString(format);
});

const inboundData = inject("inboundData");
</script>
<style lang="scss">
.valid {
  color: #67c23a;
}

.in-valid {
  color: #f56c6c;
}
</style>
