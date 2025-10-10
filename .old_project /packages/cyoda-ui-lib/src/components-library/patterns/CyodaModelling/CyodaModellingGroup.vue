<template>
  <ul class="modelling-group">
    <li v-for="reportInfoRow in reportInfoRows" :key="reportInfoRow.columnPath">
      <CyodaModellingItem :disablePreview="disablePreview" :onlyView="onlyView" :search="search" :isCondenseThePaths="isCondenseThePaths" :isOpenAllSelected="isOpenAllSelected" :onlyRange="onlyRange" :limit="limit" :checked="checked" :key="reportInfoRow.columnPath" :requestClass="requestClass" :reportInfoRow="reportInfoRow" :relatedPaths="relatedPaths" :parentColDef="parentColDef" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import CyodaModellingItem from "./CyodaModellingItem.vue";

const props = defineProps({
  reportInfoRows: {
    default: () => {
      return [];
    }
  },
  relatedPaths: {
    default: () => {
      return [];
    }
  },
  requestClass: {
    default: ""
  },
  checked: {
    default: () => {
      return [];
    }
  },
  limit: {
    default: null
  },
  onlyRange: {
    default: false
  },
  isOpenAllSelected: {
    default: false
  },
  isCondenseThePaths: {
    default: false
  },
  search: {
    default: ""
  },
  parentColDef: {
    default: () => {
      return {};
    }
  },
  onlyView: {
    default: false
  },
  disablePreview: {
    default: false
  }
});
</script>

<style scoped lang="scss">
ul li {
  list-style: none !important;
}

ul {
  margin: 0;
  padding: 0;
  /*padding-top: 15px;*/
  /*padding-bottom: 15px;*/
}
</style>
