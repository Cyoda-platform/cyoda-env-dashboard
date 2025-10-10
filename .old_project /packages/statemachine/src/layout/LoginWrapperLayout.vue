<template>
  <LoginLayout nameApp="Workflow Designer" />
</template>

<script setup lang="ts">
import LoginLayout from "@cyoda/ui-lib/src/components-library/templates/LoginLayout/LoginLayout.vue";
</script>

<style>
body {
  background-color: #fff !important;
}
</style>
<style lang="scss" scoped>
.header-contents {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  > * {
    flex: 0 1 auto;
    min-width: 0;
  }
}

.logo-wrapper {
  margin-right: 20px;
}

.logo-wrapper--header {
  height: 39px;
}

.logo-image {
  max-height: 100%;
  max-width: 100%;
}

.header-contents,
.main-contents {
  max-width: 1440px;
  margin: auto;
}
</style>
