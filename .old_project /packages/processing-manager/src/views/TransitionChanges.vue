<template>
  <ViewWrapper>
    <div>
      <h1>{{ title }}</h1>
      <TransitionChangesTable :type="route.query.type" :entityId="route.query.entityId" />
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";

import TransitionChangesTable from "@cyoda/ui-lib/src/components-library/patterns/PmTransitionChanges/TransitionChangesTable.vue";
import ViewWrapper from "../components/ViewWrapper.vue";

const route = useRoute();
const title = computed(() => {
  return `Changes of entity (${route.query.type.split(".").pop()}): ${route.query.entityId}`;
});
</script>
