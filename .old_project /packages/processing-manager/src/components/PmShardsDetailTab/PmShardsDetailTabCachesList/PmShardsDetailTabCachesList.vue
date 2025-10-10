<template>
  <div>
    <CachesListView
      :getCachesListRequestFn="getCachesListRequest"
      :getInvalidateCacheRequestFn="getInvalidateCacheRequest"
      :getCacheKeysRequestFn="getCacheKeysRequest"
    />
  </div>
</template>

<script setup lang="ts">
import CachesListView from "@cyoda/http-api/src/views/CachesListView.vue";
import {useCommonStore} from "../../../stores/common";

const commonStore = useCommonStore();

function getCachesListRequest() {
  return commonStore.platformCommonCachesList();
}

function getInvalidateCacheRequest(cacheType: string) {
  return commonStore.platformCommonInvalidateCache(cacheType);
}

function getCacheKeysRequest(cacheType: string) {
  return commonStore.platformCommonCacheKeys(cacheType);
}
</script>
