<template>
  <ProcessForm
    @submitted="onSubmitted"
    :entityClassName="route.query.entityClassName"
    :persistedType="route.query.persistedType"
    :workflowPersistedType="route.query.workflowPersistedType"
    :workflowId="route.query.workflowId"
    :processId="route.params.processId"
  />
</template>

<script setup lang="ts">
import ProcessForm from "@cyoda/ui-lib/src/components-library/patterns/ProcessForm/ProcessForm.vue";
import {useRoute, useRouter} from "vue-router";
import {ElNotification} from "element-plus";

const router = useRouter();
const route = useRoute();

function onSubmitted(params) {
  ElNotification({
    title: 'Success',
    message: 'Data was successfully saved',
    type: 'success',
  })

  if (params && params.url) {
    router.push(params.url);
  }
}
</script>

<style scoped lang="scss">

</style>
