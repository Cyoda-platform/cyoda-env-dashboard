<template>
  <footer class="footer footer-black footer-white">
    <div class="container-fluid">
      <div class="row">
        <nav class="footer-nav">
          <ul>
            <li>
              <a href="https://cyoda.com/" target="_blank">CYODA</a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/cyoda/" target="_blank">
                <font-awesome-icon :icon="['fab', 'linkedin-in']" />
                LINKED IN
              </a>
            </li>
          </ul>
        </nav>
        <div class="credits ml-auto">
          <span class="copyright"> {{ year }}, © by Cyoda </span>
        </div>
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
import { computed } from "vue";

const year = computed(() => {
  return new Date().getFullYear();
});
</script>

<style lang="scss">
.footer-nav {
  svg {
    margin-right: 5px;
  }
}
.footer ul li a {
  padding: 0.5rem 1rem !important;
}
</style>
