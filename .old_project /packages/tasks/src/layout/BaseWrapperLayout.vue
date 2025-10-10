<template>
  <BaseLayout>
    <template #header>
    <div class="header-contents">
      <HomeDrawer />
      <router-link
        to="/http-api/"
        :class="{
          margin: route.path == '\/'
        }"
        class="logo-wrapper"
        aria-label="Cyoda"
      >
        <AppLogo></AppLogo>
      </router-link>
      <small v-if="route.path !== '\/'" class="name-app">
        <template v-if="route.path === '/tasks'"> Tasks </template>
      </small>

      <portal-target name="breadcrumbs"></portal-target>
      <div class="logout">
        {{ username }} |
        <LogOutButton />
      </div>
    </div>
    </template>

    <template #main>
    <div class="main-contents">
      <keep-alive>
        <router-view v-if="route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!route.meta.keepAlive"></router-view>
    </div>
    </template>

    <template #footer>
    <div class="footer-inner">
      <div class="version">
        <CyodaVersion />
      </div>
    </div>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { computed } from "vue";

import AppLogo from "@cyoda/ui-lib/src/components-library/elements/AppLogo/AppLogo.vue";
import BaseLayout from "@cyoda/ui-lib/src/components-library/templates/BaseLayout/BaseLayout.vue";
import LogOutButton from "@cyoda/ui-lib/src/components-library/patterns/LogOutButton/LogOutButton.vue";
import CyodaVersion from "@cyoda/ui-lib/src/components-library/patterns/CyodaVersion/CyodaVersion.vue";

import HomeDrawer from "@cyoda/ui-lib/src/components-library/elements/Home/HomeDrawer.vue";
import {useReportsStore} from "@cyoda/http-api/src/stores/reports";
import {useRoute} from "vue-router";

const route= useRoute();
const reportsStore = useReportsStore();
const authStore = useAuthStore();
const username = computed(() => {
  return authStore.username;
});
function init() {
  return reportsStore.init();
}

if (authStore.isLoggedIn) {
  init();
}
</script>

<style>
body {
  background-color: #fff !important;
}
</style>
<style src="modern-normalize/modern-normalize.css"></style>
<style lang="scss" scoped>
.header-contents {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;

  a {
    color: #148751 !important;
  }

  small {
    margin-left: 20px;
    margin-right: 50px;
    font-size: 16px;
    position: relative;
    top: -5px;
    color: #148751;
    font-weight: bold;
    font-family: Arial, sans-serif;
  }

  .logout {
    margin-left: auto;
  }

  > * {
    flex: 0 1 auto;
    min-width: 0;
  }
}

.logo-wrapper.margin {
  margin-right: 20px;
}

.logo-wrapper--header {
  height: 39px;
}

.logo-image {
  max-height: 100px;
  max-width: 100px;
  margin-left: 10px;
}

.header-contents,
.main-contents {
  max-width: 1440px;
  margin: auto;
}

.wrap-links {
  padding: 4px 0;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #dedede;

  .powered {
    text-align: right;

    span {
      font-size: 14px;
      color: #7b7b7b;
    }
  }
}
</style>
