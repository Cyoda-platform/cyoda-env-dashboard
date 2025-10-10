<template>
  <el-button :loading="isLoading" @click="loginWithRedirect">Login with Auth0</el-button>
</template>

<script setup lang="ts">
import {useAuth0} from '@auth0/auth0-vue';
import {useAuthStore} from "../../../stores/auth";
import {onMounted, watch} from "vue";
import {useRouter} from "vue-router";
import {useUserStore} from "../../../stores/user";

const {loginWithRedirect, isLoading, user, getAccessTokenSilently, isAuthenticated} = useAuth0();
const router = useRouter();
const authStore = useAuthStore();

watch(isAuthenticated, async (value) => {
  if (!value) return;
  const token = await getAccessTokenSilently();
  const userStore = useUserStore();
  authStore.saveData({
    token: token,
    refreshToken: null,
    userId: user.value.sub,
    username: user.value.name,
    type: 'auth0',
  })
  const { data: accountInfo } = await userStore.accountInfo();
  userStore.saveData(accountInfo);
  router.push("/");
})
</script>

<style scoped lang="scss">

</style>
