<template>
  <TransitionForm
    @submitted="onSubmitted"
    @canceled="onCanceled"
    :workflowId="route.query.workflowId"
    :persistedType="route.query.persistedType"
    :entityClassName="route.query.entityClassName"
    :transitionId="route.params.transitionId"
  />
</template>

<script setup lang="ts">
import TransitionForm from "@cyoda/ui-lib/src/components-library/patterns/TransitionForm/TransitionForm.vue";

import {useRoute, useRouter} from "vue-router";

const route = useRoute();
const router = useRouter();

function onSubmitted(params: any) {
  if (params && params.url) {
    router.push(params.url);
  }
}

function onCanceled(params: any) {
  if (params && params.url) {
    router.push(params.url);
  }
}
</script>

<style scoped lang="scss">

</style>
