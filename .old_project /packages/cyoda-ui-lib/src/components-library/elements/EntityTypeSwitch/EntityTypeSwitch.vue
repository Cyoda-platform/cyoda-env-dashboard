<template>
  <div v-if="hasToggleEntity" class="entity-type-switch">
    <span>Entity Type: </span>
    <el-switch
      v-model="entityTypeLocal"
      inactive-text="Business"
      inactive-value="BUSINESS"
      active-text="Technical"
      active-value="PERSISTENCE"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGlobalUiSettingsStore } from "../../../stores/globalUiSettings";
import { useUserStore } from "../../../stores/user";

const globalUiSettings = useGlobalUiSettingsStore();
const userStore = useUserStore();

const hasToggleEntity = computed(() => {
  return userStore.isEnabledTechView;
});

const entityTypeLocal = computed({
  get() {
    return globalUiSettings.entityType;
  },
  set(newValue) {
    globalUiSettings.setEntityType(newValue);
  },
});
</script>

<style lang="scss">
.entity-type-switch {
  display: inline-block;
}
</style>
