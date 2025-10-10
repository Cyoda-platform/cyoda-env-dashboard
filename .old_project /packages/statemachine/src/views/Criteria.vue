<template>
  <CriteriaForm
    @submitted="onSubmitted"
    :entityClassName="route.query.entityClassName"
    :persistedType="route.query.persistedType"
    :criteriaId="route.params.criteriaId"
    :workflowPersistedType="route.query.workflowPersistedType"
    :workflowId="route.query.workflowId"
  />
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import CriteriaForm from "@cyoda/ui-lib/src/components-library/patterns/CriteriaForm/CriteriaForm.vue";
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
