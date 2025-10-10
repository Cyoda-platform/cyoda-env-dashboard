<template>
  <div
    class="wrapper-sidebar"
    :class="{
      toggled: isToggledMenu
    }"
  >
    <a @click.prevent="onClickToggle" class="show-sidebar" href="#">
      <font-awesome-icon icon="bars" />
    </a>
    <aside>
      <div class="top-menu">
        <ul class="toggle-menu">
          <li>
            <a @click.prevent="onClickToggle" href="#">
              <font-awesome-icon size="2x" icon="bars" />
              <span>Menu</span>
            </a>
          </li>
        </ul>
        <ul class="nav">
          <li
            v-for="(menu, index) in menusComputed"
            :key="index"
            :class="{
              active: route.path === menu.link || route.meta.baseUrl === menu.link || getActiveMenuLink === menu.link
            }"
          >
            <router-link @click.native="onClickMenu(menu.link)" :to="menu.link">
              <font-awesome-icon :icon="menu.icon" size="2x" />
              <span>{{ menu.name }}</span>
            </router-link>
          </li>
        </ul>
      </div>
      <ul class="footer-menu">
        <li>
          <a @click.prevent="onLogout" class="nav-link btn-magnify" href="#">
            <font-awesome-icon icon="sign-out-alt" size="2x" />
            <span>Logout</span>
          </a>
        </li>
        <li class="wrap-version">
          <CyodaVersion>
            <template v-slot:icon>
              <font-awesome-icon icon="code-branch" size="2x" />
            </template>
          </CyodaVersion>
        </li>
      </ul>
    </aside>
  </div>
</template>
<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { useRouter, useRoute } from "vue-router";

import { computed } from "vue";

import menusJson from "./menu.json";
import CyodaVersion from "@cyoda/ui-lib/src/components-library/patterns/CyodaVersion/CyodaVersion.vue";
import { useUserManagerStore } from "@cyoda/ui-lib/src/stores/user-manager";
import { useAppStore } from "../../stores/app";
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { useMixin } from "@cyoda/ui-lib/src/plugins/mixin";

const router = useRouter();
const route = useRoute();
const userManagerStore = useUserManagerStore();
const appStore = useAppStore();
const authStore = useAuthStore();
const { userCan } = useMixin();

const user = computed(() => {
  return userManagerStore.me;
});
const getActiveMenuLink = computed(() => {
  return appStore.getActiveMenuLink;
});
const isToggledMenu = computed(() => {
  return appStore.isToggledMenu;
});
const token = computed(() => {
  return authStore.token;
});
const menusComputed = computed(() => {
  return menusJson.filter((el: any) => userCan(el.roles));
});

function setActiveMenuLink(link) {
  return appStore.setActiveMenuLink(link);
}

if (!user.value) {
  ElMessageBox.confirm("You have not all permissions. Please logout and login again. Continue?", "Warning", {
    confirmButtonText: "Logout",
    cancelButtonText: "Cancel",
    type: "warning"
  }).then(async () => {
    await authStore.logout();
    router.push("/login");
  });
}

function onClickMenu(link: string) {
  setActiveMenuLink(link);
}

function onLogout() {
  ElMessageBox.confirm("Do you really want to do logout?", "Confirm", {
    distinguishCancelAndClose: true,
    confirmButtonText: "Logout",
    cancelButtonText: "Logout and Clear Data",
    callback: async (action) => {
      if (action === "confirm" || action === "cancel") {
        authStore.logout(action === "cancel");
        router.push("/login");
      }
    }
  });
}

function onClickToggle() {
  return appStore.toggleMenu();
}
</script>

<style lang="scss">
aside {
  position: relative;
  transition: 0.5s;
  //display: flex;
  //flex-direction: column;
  background: #2e4464;
  width: 220px;
  min-height: calc(100vh - 55px);
  height: 100%;

  ul {
    margin: 0;
    list-style: none;
    padding: 0 10px;

    li a,
    .wrap-version {
      display: flex;
      align-items: center;
      height: 55px;
      padding: 0 10px;
      color: #fff !important;
      white-space: normal;

      svg {
        margin-right: 15px;
        max-width: 25px;
      }

      &:after {
        display: none;
      }
    }

    li.active a {
      background-color: #55bb91;
      border-radius: 5px;
    }
  }

  .toggle-menu {
    background-color: #213248;
  }

  .top-menu {
    position: sticky;
    width: 220px;
    top: 0;
  }

  .footer-menu {
    margin-top: auto;
    padding-bottom: 10px;
    position: sticky;
    top: calc(100vh - 120px);
    background-color: #2e4464;
    width: 220px;
  }
}

.show-sidebar {
  transition: 0.5s;
  position: fixed;
  top: 65px;
  border-radius: 0 4px 4px 0px;
  width: 35px;
  color: #fff !important;
  background-color: #343a40;
  border-color: #343a40;
  z-index: 300;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  text-align: center;
  left: -100px;

  &:after {
    display: none;
  }
}

.wrapper-sidebar.toggled {
  aside {
    margin-left: -220px;
  }

  .show-sidebar {
    left: 0;
    transition-delay: 0.5s;
  }
}
</style>
