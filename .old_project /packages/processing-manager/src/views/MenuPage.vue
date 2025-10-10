<template>
  <ViewWrapper>
    <div class="c-app flex-row align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="card-group">
            <div class="card p-4">
              <div class="card-body">
                <Home />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ViewWrapper>
</template>

<script setup lang="ts">
import Home from "@cyoda/ui-lib/src/components-library/elements/Home/Home.vue";
import ViewWrapper from "../components/ViewWrapper.vue";
</script>
