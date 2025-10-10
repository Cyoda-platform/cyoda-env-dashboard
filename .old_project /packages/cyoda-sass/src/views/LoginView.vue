<template>
  <div class="container wrap-login-form">
    <img class="logo" src="../assets/images/cyoda-logo.svg"/>
    <el-form :rules="rules" label-position="top" ref="formRef" :model="form" label-width="120px">
      <el-form-item prop="username">
        <el-input placeholder="Email" v-model.trim="form.username"/>
      </el-form-item>

      <el-form-item prop="password">
        <el-input placeholder="Password" v-model.trim="form.password" show-password/>
      </el-form-item>

      <div class="actions">
        <el-button class="login" :loading="loading" @click="onLogin" type="warning">Login</el-button>
        <LoginAuth0Btn />
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";

import {ref, reactive} from "vue";
import {useAuthStore} from "@cyoda/ui-lib/src/stores/auth";
import LoginAuth0Btn from "@cyoda/ui-lib/src/components-library/elements/LoginAuth0Btn/LoginAuth0Btn.vue";

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref<boolean>(false);

let form = reactive({
  username: "",
  password: ""
});

let rules = reactive({
  username: [{required: true, message: "Please input Email", trigger: "blur"}],
  password: [{required: true, message: "Please select Password", trigger: "blur"}]
});

function onLogin() {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true;
        await authStore.login(form);
        router.push("/");
      } finally {
        loading.value = false;
      }
    }
  });
}

function onResetPassword() {
  router.push("/reset-passwords");
}
</script>

<style scoped lang="scss">
.card-footer {
  text-align: center;

  button {
    width: 80%;
  }
}
</style>

<style lang="scss">
.wrap-login-form {
  width: 400px;
  padding: 20px;

  .logo {
    width: 100%;
    height: auto;
    margin-bottom: 15px;
  }

  .actions {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;

    .login {
      width: 100px;
    }
  }
}
</style>
