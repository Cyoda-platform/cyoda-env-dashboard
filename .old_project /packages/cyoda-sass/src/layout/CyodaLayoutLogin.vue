<template>
  <div class="flex">
    <main>
      <slot />
      <footer>All Rights Reserved {{ yearComputed }}</footer>
    </main>
    <section class="background"></section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from "vue";

const year = computed(() => {
  const date = new Date();
  return date.getFullYear();
});
const yearComputed = computed(() => {
  const date = new Date();
  return date.getFullYear();
});

const body = document.querySelector("body");
if (body) {
  body.classList.add("login-page");
}

onBeforeUnmount(() => {
  const body = document.querySelector("body");
  if (body) {
    body.classList.remove("login-page");
  }
});
</script>

<style lang="scss">
.login-page {
  .flex {
    display: flex;
  }

  main {
    display: flex;
    min-height: 100vh;
    height: auto;
    background: #fff;
    box-shadow: 0 10px 20px rgb(0 0 0 / 20%);
    z-index: 1;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    margin-top: -50px;
    padding-bottom: 50px;
  }

  .background {
    min-height: 100vh;
    height: auto;
    background: #38b291 url("@/assets/images/bigdata-green.jpg") 0 0 no-repeat;
    background-size: cover;
    background-position: 50%;
  }

  @media (min-width: 1200px) {
    main {
      width: 600px;
    }
    .background {
      width: calc(100% - 600px);
    }
  }

  footer {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 20px 100px;
    background: #f7f8f9;
    color: #000;
    font-size: 10px;
    width: 100%;
  }
}
</style>
