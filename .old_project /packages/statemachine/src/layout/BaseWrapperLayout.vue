<template>
  <BaseLayout>
    <template #header>
      <div class="header-contents">
        <HomeDrawer />
        <router-link to="/menu" class="logo-wrapper" aria-label="Cyoda">
          <AppLogo></AppLogo>
        </router-link>
        <small v-if="route.path !== '\/'" class="name-app"> Workflow Designer </small>

        <div class="wrap-links">
          <router-link to="/statemachine/workflows">Workflows</router-link>
          <!--          <span style="margin: 0 10px">|</span>-->
          <!--          <router-link to="/statemachine/entities">Entities</router-link>-->
          <span style="margin: 0 10px">|</span>
          <router-link to="/statemachine/instances">Instances</router-link>
        </div>
        <portal-target name="breadcrumbs"></portal-target>
        <div class="logout">
          <EntityTypeSwitch class="entity-type-switch" />
          {{ user && user.email }} |
          <LogOutButton />
        </div>
      </div>
    </template>
    <template #main>
      <div class="main-contents">
        <div v-if="route.path !== '\/'" class="state-machine-consistency">
          <StateMachineConsistency />
        </div>
        <router-view />
      </div>
    </template>
    <template #portals> </template>
    <template #footer>
      <div class="footer-inner">
        <div class="version">
          <CyodaVersion />
        </div>
      </div>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useUserManagerStore } from '@cyoda/ui-lib/src/stores/user-manager'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

import AppLogo from '@cyoda/ui-lib/src/components-library/elements/AppLogo/AppLogo.vue'
import BaseLayout from '@cyoda/ui-lib/src/components-library/templates/BaseLayout/BaseLayout.vue'
import LogOutButton from '@cyoda/ui-lib/src/components-library/patterns/LogOutButton/LogOutButton.vue'
import StateMachineConsistency from '@cyoda/ui-lib/src/components-library/patterns/StateMachineConsistency/StateMachineConsistency.vue'
import CyodaVersion from '@cyoda/ui-lib/src/components-library/patterns/CyodaVersion/CyodaVersion.vue'

import HomeDrawer from '@cyoda/ui-lib/src/components-library/elements/Home/HomeDrawer.vue'
import EntityTypeSwitch from '@cyoda/ui-lib/src/components-library/elements/EntityTypeSwitch/EntityTypeSwitch.vue'

const route = useRoute()
const userManagerStore = useUserManagerStore()
const user = computed(() => {
  return userManagerStore.user
})
</script>

<style lang="scss" scoped>
.logo-wrapper {
  &::after,
  &::before {
    display: none;
  }
}

.header-contents,
.main-contents {
  max-width: 1440px;
  margin: auto;
}

.main-contents {
  padding-bottom: 48px;
}

.header-contents {
  white-space: nowrap;

  .wrap-bars {
    margin-right: 15px;
    margin-bottom: 6px;
    font-size: 20px;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }

  .entity-type-switch {
    margin-right: 30px;
    :deep(span) {
      font-size: 14px;
    }
  }
}
</style>

<style lang="scss">
.loading-placeholder {
  width: 140px;
  min-height: 420px;
  padding-top: 140px;
  margin: 16px auto;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #dedede;

  .powered {
    text-align: right;

    span {
      font-size: 14px;
      color: #7b7b7b;
    }
  }
}
</style>
