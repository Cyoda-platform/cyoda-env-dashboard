<template>
  <div>
    <el-form label-position="top" ref="elFormRef" :model="form" :rules="rules" label-width="150px">
      <el-form-item prop="url" label="Url">
        <el-input v-model.trim="form.url"></el-input>
        <div class="hint">
          Example: jdbc:mysql://localhost:3306/wolterskluwer
          <el-popover placement="top-start" title="Settings" width="200" trigger="hover">
            <div>
              Host: localhost<br />
              Port: 3306<br />
              Database: wolterskluwer
            </div>
            <template #reference>
              <font-awesome-icon icon="info" />
            </template>
          </el-popover>
        </div>
      </el-form-item>
      <el-form-item prop="driverClassName" label="Driver Class Name">
        <el-input v-model.trim="form.driverClassName"></el-input>
        <div class="hint">com.mysql.cj.jdbc.Driver</div>
      </el-form-item>
      <el-form-item prop="username" label="Username">
        <el-input v-model.trim="form.username"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="Password">
        <el-input show-password v-model.trim="form.password"></el-input>
      </el-form-item>
      <el-form-item prop="testSql" label="Test Sql">
        <el-input v-model.trim="form.testSql"></el-input>
        <div class="hint">SELECT COUNT(*) FROM users;</div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

import { Form } from "element-plus";
import UploadFileSample from "./UploadFileSample.vue";

const props = defineProps({
  form: {
    default: () => {
      return {};
    }
  }
});
const wolterskluwerStore = useWolterskluwerStore();
function postTestConnection() {
  return wolterskluwerStore.postTestConnection();
}

function postSave() {
  return wolterskluwerStore.postSave();
}

const elFormRef = ref(null);

const isDisabledSaveBtn = ref<boolean>(true);

const isLoadingTestConnection = ref<boolean>(false);

let rules = ref({
  url: [{ required: true, message: "Please input Url", trigger: "blur" }],
  driverClassName: [
    {
      required: true,
      message: "Please input Driver Class Name",
      trigger: "blur"
    }
  ],
  username: [{ required: true, message: "Please input Username", trigger: "blur" }],
  password: [{ required: true, message: "Please input Password", trigger: "blur" }],
  testSql: [{ required: true, message: "Please input TestSql", trigger: "blur" }]
});
</script>

<style lang="scss">
.configuration-form {
  .footer-nav {
    svg {
      margin-right: 5px;
    }
  }

  .footer ul li a {
    padding: 0.5rem 1rem !important;
  }

  .el-form-item__label {
    padding-bottom: 5px !important;
    line-height: normal !important;
  }

  .hint {
    line-height: 22px;
    color: #a1a0a0;
  }
}
</style>
