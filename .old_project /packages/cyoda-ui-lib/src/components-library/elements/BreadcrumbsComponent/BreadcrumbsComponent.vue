<template>
  <ul>
    <li v-for="breadcrumb in breadcrumbs" :key="breadcrumb.id || breadcrumb.title">
      <router-link :to="breadcrumb.route">{{ breadcrumb.title }}</router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps({
  breadcrumbs: {
    type: Array,
    default: () => ([])
  }
})
</script>

<style lang="scss" scoped>
ul {
  @include list-reset;
  @include inset-squish-space($space-xx-small);

  @supports (flex-wrap: wrap) {
    @include flex-lists;
    @include inset-squish-space($space-xx-small);
    align-items: center;
    flex-wrap: wrap;
  }

  li {
    display: inline-block;
    vertical-align: middle;
    max-width: 240px;
    @include inset-squish-space($space-xx-small);
    padding-left: $space-small;
    padding-right: $space-small;
    position: relative;

    &:not(:last-child) {
      &:after {
        content: "";
        display: block;
        position: absolute;
        right: -1px;
        top: $space-x-small - 4px;
        bottom: $space-x-small - 4px;
        box-shadow: $box-shadow-small;
      }
    }
  }
}
</style>
