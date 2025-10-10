<template>
  <div>
    <div class="row post" v-for="post in posts" :key="post.link">
      <div class="col-md-12">
        <div class="title">
          <a target="_blank" :href="post.link">{{ post.title }}</a>
        </div>
        <div class="description">
          {{ post.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ posts: { default: [] } });
</script>

<style scoped lang="scss">
.post {
  padding: 24px;
  background-color: white;
  margin-bottom: 2px;
  a {
    font-size: 16px;
    font-weight: 600;
  }
  .title {
    margin-bottom: 10px;
  }
}
</style>
