<template>
  <div class="login">
    <el-card>
      <h2>Login</h2>
      <el-form class="login-form" :model="form" :rules="rules" ref="elForm" @submit.native.prevent="onClick">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="Username">
            <template slot="prepend">
              <font-awesome-icon icon="user" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" placeholder="Password" type="password">
            <template slot="prepend">
              <font-awesome-icon icon="lock" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoading" class="login-button" type="primary" native-type="submit" block> Login </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, reactive, onMounted } from "vue";

import { ElForm } from "element-plus/types/form";

import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";

const helperStorage = new HelperStorage();

const router = useRouter();
const authStore = useAuthStore();

function login(form) {
  return authStore.login(form);
}

const elFormRef = ref(null);
if (authStore.isLoggedIn) {
  router.push("/tableau/reports");
}

onMounted(async () => {
  const authAuto = helperStorage.get("authAuto", null);
  if (authAuto) {
    form.username = authAuto.username;
    form.password = authAuto.password;
    helperStorage.set("authAuto", null);
    await login(form);
    router.push(`/tableau/reports?username=${authAuto.username}&password=${authAuto.password}`);
  }
});

let form = reactive({
  username: "",
  password: ""
});

const isLoading = ref<boolean>(false);
let rules = reactive({
  username: [
    {
      required: true,
      message: "Username is required",
      trigger: "blur"
    }
  ],
  password: [{ required: true, message: "Password is required", trigger: "blur" }]
});
async function onClick() {
  let valid = await elFormRef.value.validate();
  if (!valid) {
    return;
  }
  isLoading.value = true;
  try {
    await login(form);
    router.push("/tableau/reports");
  } finally {
    isLoading.value = false;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-button {
  width: 100%;
  margin-top: 40px;
}

.login-form {
  width: 290px;
}

.forgot-password {
  margin-top: 10px;
}
</style>
<style lang="scss">
$teal: rgb(0, 124, 137);

.login .el-input__inner:hover {
  border-color: $teal;
}

.login .el-input__prefix {
  background: rgb(238, 237, 234);
  left: 0;
  height: calc(100% - 2px);
  left: 1px;
  top: 1px;
  border-radius: 3px;
}

.login .el-card {
  padding-top: 0;
  padding-bottom: 30px;
}

h2 {
  font-family: "Open Sans";
  letter-spacing: 1px;
  font-family: Roboto, sans-serif;
  padding-bottom: 20px;
}

a {
  color: $teal;
  text-decoration: none;

  &:hover,
  &:active,
  &:focus {
    color: lighten($teal, 7);
  }
}

.login .el-card {
  width: 340px;
  display: flex;
  justify-content: center;
}
</style>
