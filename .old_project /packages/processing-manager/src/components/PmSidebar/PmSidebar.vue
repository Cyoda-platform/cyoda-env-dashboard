<template>
  <div
    :class="{
      'c-sidebar-lg-show': sideBarIsShow,
      'c-sidebar-unfoldable': sideBarIsMinimize
    }"
    class="c-sidebar c-sidebar-dark c-sidebar-fixed"
    id="sidebar"
  >
    <div class="c-sidebar-brand">
      <router-link to="/">
        <img class="c-sidebar-brand-full" src="@/assets/images/cyoda-logo.png" width="118"
             alt="Cyoda Logo"/>
        <img class="c-sidebar-brand-minimized" src="@/assets/images/cyoda-small.png" width="28"
             alt="Cyoda Logo"/>
      </router-link>
    </div>
    <ul class="c-sidebar-nav">
      <li v-for="menu in menus" :key="menu.link" class="c-sidebar-nav-item">
        <router-link
          :to="menu.link"
          class="c-sidebar-nav-link"
          :class="{
            'c-active': route.path === menu.link || route.meta.baseUrl === menu.link
          }"
        >
          <font-awesome-icon class="c-sidebar-nav-icon" :icon="menu.icon"/>
          {{ menu.name }}
        </router-link>
      </li>
    </ul>
    <button @click.prevent="sideBarMinimizeToggle" class="c-sidebar-minimizer c-class-toggler"
            type="button" data-target="_parent" data-class="c-sidebar-minimized"></button>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "../../stores/app";
import {useRoute} from "vue-router";
import {ref, computed} from "vue";

import menusJson from "./menu.json";

const route = useRoute();
const appStore = useAppStore();
const sideBarIsShow = computed(() => {
  return appStore.sideBarIsShow;
});

const sideBarIsMinimize = computed(() => {
  return appStore.sideBarIsMinimize;
});

function sideBarMinimizeToggle() {
  return appStore.sideBarMinimizeToggle();
}

let menus = ref(menusJson);
</script>
