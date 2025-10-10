<template>
  <div class="wrapper">
    <CyodaSidebar/>
    <div class="main-panel">
      <!-- Navbar -->
      <CyodaNavigationTop/>
      <!-- End Navbar -->

      <div v-if="isEnable" class="content">
        <div class="card">
          <div class="card-header">
            <portal-target name="breadcrumbs"></portal-target>
          </div>
          <div class="card-body">
            <slot/>
          </div>
        </div>
      </div>

      <CyodaFooter/>
    </div>
    <div class="app-overlaping-components">
      <portal-target name="modal"/>
      <slot name="portals"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref, nextTick, computed, onBeforeUnmount} from "vue";

import CyodaSidebar from "@/components/CyodaSidebar/CyodaSidebar.vue";
import CyodaNavigationTop from "@/components/CyodaNavigationTop/CyodaNavigationTop.vue";
import CyodaFooter from "@/components/CyodaFooter/CyodaFooter.vue";
import {useAuthStore} from "@cyoda/ui-lib/src/stores/auth";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const authStore = useAuthStore();

const token = computed(() => {
  return authStore.token;
});
const fullscreenRef = ref(null);

const fullscreen = ref<boolean>(false);
const isEnable = ref<boolean>(true);

function fullscreenChange(fullscreen: any) {
  fullscreen.value = fullscreen;
}

eventBus.$on("full-screen", toggle);
eventBus.$on("minimize-sidebar", updateKey);

onBeforeUnmount(() => {
  eventBus.$off("full-screen", toggle);
  eventBus.$off("minimize-sidebar", updateKey);
});

async function updateKey() {
  isEnable.value = false;
  await nextTick();

  isEnable.value = true;
}

function toggle() {
  fullscreenRef.value.toggle();
}
</script>
