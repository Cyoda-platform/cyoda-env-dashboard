<template>
  <el-row class="wrap-login-form" :gutter="20">
    <el-col :span="8" :offset="8">
      <el-form :rules="rules" label-position="top" ref="formRef" :model="form" label-width="120px">
        <h3 class="header text-center">Login Form</h3>
        <div class="card-body">
          <el-form-item prop="username">
            <el-input placeholder="Username" v-model.trim="form.username">
              <template slot="prepend">
                <font-awesome-icon icon="user" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input placeholder="Password" v-model.trim="form.password" show-password>
              <template slot="prepend">
                <font-awesome-icon icon="key" />
              </template>
            </el-input>
          </el-form-item>
        </div>
        <div class="actions">
          <el-button :loading="loading" @click="onClick" type="warning">Login</el-button>
<!--          <LoginAuth0Btn />-->
        </div>
      </el-form>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import LoginAuth0Btn from "@cyoda/ui-lib/src/components-library/elements/LoginAuth0Btn/LoginAuth0Btn.vue";
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const authStore = useAuthStore();
function login(form) {
  return authStore.login(form);
}
const formRef = ref(null);

const loading = ref<boolean>(false);

let form = ref({
  username: "",
  password: ""
});

let rules = ref({
  username: [{ required: true, message: "Please input Username", trigger: "blur" }],
  password: [{ required: true, message: "Please input Password", trigger: "blur" }]
});
function onClick() {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true;
        await login(form.value);
        router.push("/");
      } finally {
        loading.value = false;
      }
    }
  });
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

<style scoped lang="scss">
.wrap-login-form {
  .el-form-item {
    margin-bottom: 25px !important;
  }
  svg {
    font-size: 14px;
    max-width: none;
    max-height: none;
  }
  h3.header {
    font-size: 26px;
    margin: 30px auto 40px auto;
    text-align: center;
    font-weight: 700;
  }
  .actions {
    button {
      width: 100%;
    }
    button + button {
      margin: 10px 0;
    }
  }
}
</style>
