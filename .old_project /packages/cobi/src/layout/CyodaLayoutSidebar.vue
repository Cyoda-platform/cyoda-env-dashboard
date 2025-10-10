<template>
  <main>
    <CyodaHeader />
    <div
      class="wrapper wrapper-main"
      :class="{
        toggled: isToggledMenu
      }"
    >
      <CyodaSidebar />
      <main>
        <portal-target v-if="route.meta.breadcrumbs && route.meta.breadcrumbs.length > 0" class="breadcrumbs" name="breadcrumbs"></portal-target>
        <CyodaVersionMismatch />
        <slot />
      </main>
    </div>
    <div class="app-overlaping-components">
      <portal-target name="modal" />
      <slot name="portals"></slot>
    </div>
  </main>
</template>
<script setup lang="ts">
import { computed } from "vue";

import CyodaSidebar from "../components/CyodaSidebar/CyodaSidebar.vue";
import CyodaHeader from "../components/CyodaHeader/CyodaHeader.vue";
import CyodaVersionMismatch from "@cyoda/ui-lib/src/components-library/patterns/CyodaVersion/CyodaVersionMismatch.vue";
import { useAppStore } from "../stores/app";
import { useRoute } from "vue-router";

const appStore = useAppStore();
const route = useRoute();

const isToggledMenu = computed(() => {
  return appStore.isToggledMenu;
});
</script>

<style lang="scss">
.wrapper-main {
  display: flex;

  main {
    transition: 0.5s width;
    width: calc(100% - 220px);
    padding: 30px 45px;
  }
}

.breadcrumbs {
  transition: 0.5s padding-left;
  margin-top: -30px;
  margin-left: -45px;
  margin-right: -45px;
  background: #2e4464;
  padding: 10px 0;
  margin-bottom: 15px;
  height: 55px;
  display: flex;
  align-items: center;

  a {
    color: #fff !important;
  }

  li:after {
    width: 2px;
    background-color: #fff;
  }
}

.wrapper-main.toggled {
  main {
    width: 100%;
  }

  .breadcrumbs {
    padding-left: 45px;
  }
}
</style>
