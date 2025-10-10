<template>
  <div class="c-app flex-row align-items-center">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card-group">
            <div class="card p-4">
              <div class="card-body">
                <h1>Login</h1>
                <p class="text-muted">Sign In to your account</p>

                <el-form :rules="rules" label-position="top" ref="formRef" :model="form" label-width="120px">
                  <el-form-item prop="username">
                    <el-input placeholder="Username" v-model.trim="form.username">
                      <template #prepend>
                        <font-awesome-icon icon="user" />
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item prop="password">
                    <el-input placeholder="Password" v-model.trim="form.password" show-password>
                      <template #prepend>
                        <font-awesome-icon icon="key" />
                      </template>
                    </el-input>
                  </el-form-item>
                  <div class="actions">
                    <el-button :loading="loading" @click="onClick" type="warning">Login</el-button>
                    <LoginAuth0Btn />
                  </div>
                </el-form>
              </div>
            </div>
            <div class="card text-white bg-primary py-5 d-md-down-none" style="width: 44%">
              <div class="card-body text-center">
                <div>
                  <h2>System Monitor</h2>
                  <p>Memory, IO, network monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
        router.push("/processing-ui");
      } finally {
        loading.value = false;
      }
    }
  });
}
</script>
