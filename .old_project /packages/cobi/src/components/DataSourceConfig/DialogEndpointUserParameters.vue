<template>
  <div class="dialog-endpoint-user-parameters">
    <el-dialog :close-on-click-modal="false" :append-to-body="true" title="User Parameters" v-model="dialogVisible"
               width="90%">
      <el-form :model="form" :rules="rules" ref="elFormRef" label-width="auto">
        <template v-if="authParams.length > 0">
          <el-divider>Auth</el-divider>
          <template v-for="param in authParams" :key="param.name">
            <el-form-item :label="param.name" :prop="param.name">
              <el-input v-model.trim="form[param.name]"/>
            </el-form-item>
          </template>
        </template>

        <el-divider>Parameters</el-divider>
        <template v-for="param in userParams" :key="param.name">
          <el-form-item :label="param.name" :prop="param.name">
            <el-input v-model.trim="form[param.name]"/>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
        <el-button type="primary" @click="onConfirm">Send Request</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, nextTick} from "vue";

const rules = computed(() => {
  const rules: any = {};
  userParameters.value.forEach((el: any) => {
    rules[el.name] = [{required: el.required, message: `Please input ${el.name}`, trigger: "blur"}];
  });
  return rules;
});
const authParams = computed(() => {
  return userParameters.value.filter((el: any) => el.type === "AUTH");
});
const userParams = computed(() => {
  return userParameters.value.filter((el: any) => el.type === "PARAM");
});

const elFormRef = ref(null);

const dialogVisible = ref<boolean>(false);
let userParameters = ref([]);
let form = ref({});
const emit = defineEmits(['confirm']);

function onConfirm() {
  elFormRef.value.validate((val) => {
    if (val) {
      emit(
        "confirm",
        Object.keys(form.value).map((el) => {
          return {
            name: el,
            value: form.value[el]
          };
        }).filter(el => el.value)
      );
      dialogVisible.value = false;
    }
  });
}

watch(
  dialogVisible,
  (val) => {
    if (val) {
      nextTick(()=>{
        elFormRef.value.resetFields();
      })
      form.value = {};
      userParameters.value.forEach((el: any) => {
        form.value[el.name] = el.value;
      });
    }
  },
  {immediate: true}
);

defineExpose({dialogVisible, form, userParameters});
</script>
