<template>
  <div class="body">
    <DetailTree :isEditable="isEditable" v-if="entity.length > 0" :isShowEmpty="isShowEmpty" :id="id" :requestClass="requestClass" class="detail-tree" :entity="entity" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import * as api from "../../../../../api";
import HelperDetailEntity from "../../../../../helpers/HelperDetailEntity";
import DetailTree from "../DetailTree.vue";

const emit = defineEmits(["loading", "loading"]);
const props = defineProps({
  column: {
    default: () => {
      return {};
    }
  },
  id: {
    default: ""
  },
  requestClass: {
    default: ""
  },
  isShowEmpty: {
    default: true
  },
  isEditable: {
    default: false
  }
});

let entity = ref([]);

const isWasRequest = ref<boolean>(false);

request();

async function request() {
  if (!isWasRequest.value) {
    try {
      emit("loading", true);
      const { data } = await api.getEntityLoad(props.id, props.requestClass, props.column.realClass, props.column.columnInfo.columnPath);
      isWasRequest.value = true;
      entity.value = HelperDetailEntity.filterData(data);
    } finally {
      emit("loading", false);
    }
  }
}
</script>
