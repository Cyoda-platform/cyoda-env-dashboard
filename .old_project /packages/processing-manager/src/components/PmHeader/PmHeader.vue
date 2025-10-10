<template>
  <header class="c-header c-header-light c-header-fixed c-header-with-subheader">
    <button @click.prevent="sideBarToggle" class="c-header-toggler c-class-toggler d-lg-none mr-auto" type="button" data-target="#sidebar" data-class="c-sidebar-show">
      <span class="c-header-toggler-icon"></span>
    </button>
    <button @click.prevent="sideBarToggle" class="c-header-toggler c-class-toggler ml-3 d-md-down-none" type="button" data-target="#sidebar" data-class="c-sidebar-lg-show" responsive="true">
      <span class="c-header-toggler-icon"></span>
    </button>
    <ul class="c-header-nav d-md-down-none">
      <li class="c-header-nav-item px-3">
        <router-link class="c-header-nav-link" to="/dashboard">Dashboard</router-link>
      </li>
    </ul>
    <ul class="c-header-nav ml-auto mr-4">
      <li>
        {{ user && user.email }} |
        <LogOutButton />
      </li>
    </ul>
    <div class="c-subheader px-3">
      <!-- Breadcrumb-->
      <portal-target name="breadcrumbs"></portal-target>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserManagerStore } from "@cyoda/ui-lib/src/stores/user-manager";
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { useAppStore } from "../../stores/app";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { computed } from "vue";
/* eslint-disable */

import LogOutButton from "@cyoda/ui-lib/src/components-library/patterns/LogOutButton/LogOutButton.vue";
import PmHeaderProxyRequest from "../../components/PmHeader/PmHeaderProxyRequest.vue";

const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();
const userManagerStore = useUserManagerStore();
const user = computed(() => {
  return userManagerStore.user;
});
function sideBarToggle() {
  return appStore.sideBarToggle();
}

function logout() {
  return authStore.logout();
}

(async function () {
  if (!user.value || !user.value.email) {
    ElMessageBox.confirm("You have not all permissions. Please logout and login again. Continue?", "Warning", {
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
      type: "warning"
    }).then(async () => {
      await logout();
      router.push("/login");
    });
  }
})();
</script>

<style scoped>
.c-subheader {
  display: flex;
  align-items: center;
}

.vue-portal-target {
  width: 100%;
}
</style>
