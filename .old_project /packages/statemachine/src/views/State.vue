<template>
  <StateForm
    @submitted="onSubmitted"
    :workflowId="route.query.workflowId"
    :stateId="route.params.stateId"
    :persistedType="route.query.persistedType"
    :entityClassName="route.query.entityClassName"
  />
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import StateForm from "@cyoda/ui-lib/src/components-library/patterns/StateForm/StateForm.vue";
import {ElNotification} from "element-plus";

const router = useRouter();
const route = useRoute();

function onSubmitted(params) {
  ElNotification({
    title: 'Success',
    message: 'Data was successfully saved',
    type: 'success',
  })

  router.push({
    path: `/statemachine/workflow/${route.query.workflowId}`,
    query: {
      entityClassName: route.query.entityClassName,
      persistedType: route.query.persistedType
    }
  })
}
</script>

<style scoped lang="scss">

</style>
