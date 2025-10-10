<template>
  <ul class="modelling-group-class">
    <li v-for="requestParam in requestParams">
      <CyodaModellingItemClass :disablePreview="disablePreview" :onlyView="onlyView" :search="search" :isCondenseThePaths="isCondenseThePaths" :isOpenAllSelected="isOpenAllSelected" :onlyRange="onlyRange" :limit="limit" :checked="checked" :type="type" :configDefinition="configDefinition" :requestParam="requestParam" :parentColDef="parentColDef" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import CyodaModellingItemClass from "./CyodaModellingItemClass.vue";

const props = defineProps({
  requestParams: {
    default: () => {
      return [];
    }
  },
  type: {
    default: ""
  },
  configDefinition: {
    default: () => {
      return {};
    }
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

<style lang="scss">
.modelling-group-class {
  li {
    list-style: none !important;
    margin-top: 10px;
  }
}
</style>
