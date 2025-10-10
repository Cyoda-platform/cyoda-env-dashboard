<template>
  <ViewWrapper>
    <div>
      <div v-loading="isLoading" class="row">
        <div class="col-sm-9">
          <h1>{{ title }}</h1>
          <TransitionStateMachineForm @updated="onUpdated" :possibleTransitions="possibleTransitions" />
          <TransitionStateMachineTable :stateMachineEvents="stateMachineEvents" />
        </div>
        <div class="col-sm-3">
          <TransitionStateMachineTimeLine :entityVersions="entityVersions" />
        </div>
      </div>
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed, onMounted } from "vue";

import TransitionStateMachineTable from "../components/PmTransitionStateMachine/TransitionStateMachineTable.vue";

import TransitionStateMachineTimeLine from "../components/PmTransitionStateMachine/TransitionStateMachineTimeLine.vue";
import TransitionStateMachineForm from "../components/PmTransitionStateMachine/TransitionStateMachineForm.vue";
import ViewWrapper from "../components/ViewWrapper.vue";
import {useProcessingStore} from "../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
const title = computed(() => {
  return `State machine view for entity (${route.query.type.split(".").pop()}): ${route.query.entityId}`;
});
function transactionsEntityStateMachine(value) {
  return processingStore.transactionsEntityStateMachine(value);
}

let entityVersions = ref([]);

let possibleTransitions = ref([]);

let stateMachineEvents = ref([]);

const isLoading = ref<boolean>(false);

onMounted(() => {
  loadData();
});

async function loadData() {
  const { data } = await transactionsEntityStateMachine({
    type: route.query.type,
    id: route.query.entityId
  });
  entityVersions.value = data.entityVersions;
  possibleTransitions.value = data.possibleTransitions;
  stateMachineEvents.value = data.stateMachineEvents;
}

async function onUpdated() {
  isLoading.value = true;
  await loadData();
  isLoading.value = false;
}
</script>
