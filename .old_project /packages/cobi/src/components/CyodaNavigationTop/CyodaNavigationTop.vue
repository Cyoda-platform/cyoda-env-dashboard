<template>
  <nav class="navbar navbar-expand-lg navbar-absolute fixed-top navbar-transparent">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <div class="navbar-minimize">
          <button @click="onMinimizeSidebar" id="minimizeSidebar" class="btn btn-icon btn-round">
            <i class="nc-icon nc-minimal-right text-center visible-on-sidebar-mini"></i>
            <i class="nc-icon nc-minimal-left text-center visible-on-sidebar-regular"></i>
          </button>
        </div>
        <div class="navbar-toggle">
          <button type="button" class="navbar-toggler">
            <span class="navbar-toggler-bar bar1"></span>
            <span class="navbar-toggler-bar bar2"></span>
            <span class="navbar-toggler-bar bar3"></span>
          </button>
        </div>
        <router-link to="/" class="navbar-brand">{{ route.meta.name }}</router-link>
      </div>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navigation" aria-controls="navigation-index" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-bar navbar-kebab"></span>
        <span class="navbar-toggler-bar navbar-kebab"></span>
        <span class="navbar-toggler-bar navbar-kebab"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navigation">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a @click.prevent="onFullScreen" class="nav-link btn-magnify" href="#">
              <font-awesome-icon icon="expand-arrows-alt" size="lg" />
            </a>
          </li>
          <li class="nav-item btn-rotate dropdown">
            <a @click.prevent="onLogout" class="nav-link btn-magnify" href="#">
              <font-awesome-icon icon="sign-out-alt" size="lg" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script setup lang="ts">
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { ElMessageBox } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const router = useRouter();
const authStore = useAuthStore();
function logout(value) {
  return authStore.logout(value);
}

function onFullScreen() {
  eventBus.$emit("full-screen");
}

function onMinimizeSidebar() {
  const element = document.querySelector("body");
  if (element) {
    element.classList.toggle("sidebar-mini");
  }
  setTimeout(() => {
    eventBus.$emit("minimize-sidebar");
  }, 1000);
}

function onLogout() {
  ElMessageBox.confirm("Do you really want to do logout?", "Confirm", {
    distinguishCancelAndClose: true,
    confirmButtonText: "Logout",
    cancelButtonText: "Logout and Clear Data",
    callback: async (action) => {
      if (action === "confirm" || action === "cancel") {
        await logout(action === "cancel");
        router.push("/login");
      }
    }
  });
}
</script>

<style lang="scss">
.logo-image-big {
  width: 80%;
  margin: 0 auto;
}

.sidebar .nav a svg {
  /*transition: all 300ms ease 0s;*/
  font-size: 24px;
  float: left;
  margin-right: 12px;
  line-height: 30px;
  width: 34px;
  text-align: center;
  /*color: rgba(255, 255, 255, 0.5);*/
  position: relative;
}

.search-box {
  .form-control {
    height: 38px;
  }
}
</style>
