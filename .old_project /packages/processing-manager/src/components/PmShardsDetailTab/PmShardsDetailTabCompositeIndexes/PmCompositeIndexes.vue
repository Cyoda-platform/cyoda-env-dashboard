<template>
  <div>
    <CompositeIndexes
      :getAllCompositeIndexesRequestFn="getAllCompositeIndexesRequest"
      :getReportingFetchTypesRequestFn="getReportingFetchTypesRequest"
      :postCompositeIndexesReindexRequestFn="postCompositeIndexesReindexRequest"
      :postCompositeIndexesDeleteRequestFn="postCompositeIndexesDeleteRequest"
      :postCompositeIndexesCreateRequestFn="postCompositeIndexesCreateRequest"
      ref="compositeIndexesRef"/>
  </div>
</template>

<script setup lang="ts">
import CompositeIndexes from "@cyoda/http-api/src/views/CompositeIndexes.vue";
import {useCommonStore} from "../../../stores/common";
import {useProcessingStore} from "../../../stores/processing";


const commonStore = useCommonStore();
const processingStore = useProcessingStore();

function getAllCompositeIndexesRequest(entity: string) {
  return commonStore.platformCommonCompositeIndexesList({entity});
}

function getReportingFetchTypesRequest() {
  return processingStore.entitiesListPossible();
}

function postCompositeIndexesReindexRequest(indexId: string) {
  return commonStore.platformCommonCompositeIndexesReindex({indexId});
}

function postCompositeIndexesDeleteRequest(indexId: string) {
  return commonStore.platformCommonCompositeIndexesDelete({indexId});
}

function postCompositeIndexesCreateRequest(form: string) {
  return commonStore.platformCommonCompositeIndexesCreate({data: form});
}
</script>
