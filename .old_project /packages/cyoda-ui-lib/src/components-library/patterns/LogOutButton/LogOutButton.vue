<template>
  <el-button @click="onClick" type="warning">
    Logout
    <font-awesome-icon icon="sign-out-alt" />
  </el-button>
</template>

<script setup lang="ts">
import { useAuthStore } from "@cyoda/ui-lib/src/stores/auth";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
function logout(value) {
  return authStore.logout(value);
}

function onClick() {
  ElMessageBox.confirm("Do you really want to do logout?", "Confirm", {
    distinguishCancelAndClose: true,
    confirmButtonText: "Logout",
    cancelButtonText: "Logout and Clear Data",
    callback: async (action) => {
      if (action === "confirm" || action === "cancel") {
        await logout(action === "cancel");

        router.push("/login");
      }
    }
  });
}
</script>
