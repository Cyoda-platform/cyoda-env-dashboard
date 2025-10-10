<template>
  <header>
    <div class="wrapper wrapper-logo">
      <router-link to="/menu">
        <img class="logo" src="../../assets/images/cyoda-logo.svg" />
      </router-link>
    </div>
    <div class="company-name">
      <portal-target name="header-title">
        {{ computedName }}
      </portal-target>
    </div>
  </header>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();

const computedName = computed(() => {
  return route?.meta?.name || "Cyoda LTD";
});
</script>

<style scoped lang="scss">
header {
  display: flex;
  height: 55px;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  .wrapper-logo {
    width: 220px;
    position: relative;
    top: 2px;
    padding: 0 15px;

    img {
      width: 100%;
      height: auto;
    }
  }

  .company-name {
    padding: 0 15px;
    font-size: 30px;
    color: #3e4850;
  }
}
</style>
