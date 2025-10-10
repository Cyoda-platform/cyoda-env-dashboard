<template>
  <transition name="el-fade-in-linear">
    <div v-show="activeRelation" class="msg active-relation-information">
      <div>Press <span class="esc">ESC</span> to cancel mapping</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { usePlatformMappingStore } from "../../stores/platform-mapping";
import { computed, onMounted } from "vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const platformMappingStore = usePlatformMappingStore();
const activeRelation = computed(() => {
  return platformMappingStore.activeRelation;
});

onMounted(() => {
  document.onkeydown = (evt) => {
    evt = evt || window.event;
    let isEscape = false;
    if ("key" in evt) {
      isEscape = evt.key === "Escape" || evt.key === "Esc";
    } else {
      isEscape = evt.keyCode === 27;
    }
    if (isEscape) {
      eventBus.$emit("stopRelation");
    }
  };
});
</script>

<style lang="scss" scoped>
.active-relation-information {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: rgba(238, 238, 238, 0.8);
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  font-size: 16px;

  .esc {
    display: inline-block;
    padding: 5px 10px;
    border: 1px solid #b9b9b9;
  }
}
</style>
