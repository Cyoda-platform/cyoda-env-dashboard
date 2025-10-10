<template>
  <el-form ref="formRef" :model="form" class="dialog-content-script-editor-fields-files-npm" label-position="top">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Package name">
          <el-select :disabled="loadingContent" clearable filterable remote :remote-method="remoteMethodNpm"
                     :loading="loadingPackage" v-model="form.package" placeholder="Select" @change="onChangePackage">
            <el-option v-for="item in optionsPackage" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Version">
          <el-select clearable :disabled="loadingContent || loadingPackage" filterable :loading="loadingVersion"
                     v-model="form.version" placeholder="Select">
            <el-option v-for="item in optionsVersions" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <div v-if="selectedPackage" class="link-npm">
      <strong>Link:</strong>&nbsp;
      <el-link type="info" target="_blank" :href="selectedPackage.links.npm">{{ selectedPackage.links.npm }}</el-link>
    </div>
    <el-row :gutter="20">
      <el-col class="actions-box" :span="24">
        <el-button :loading="loadingContent" :disabled="isDisableSaveBtn" @click="onAdd" size="mini" type="primary">
          Add from NPM
          <font-awesome-icon icon="plus"/>
        </el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import {ElNotification} from "element-plus";
import {ref, computed} from "vue";

import axios from 'axios';
import {useScriptsStore} from "../../../stores/scripts";


const scriptsStore = useScriptsStore();
const isDisableSaveBtn = computed(() => {
  return loadingContent.value || !form.value.package || !form.value.version;
})
const selectedPackage = computed(() => {
  return optionsPackage.value.find((el) => el.value == form.value.package);
})

function putVersion(value) {
  return scriptsStore.putVersion(value);
}

const loadingPackage = ref<boolean>(false);
const loadingVersion = ref<boolean>(false);
const loadingContent = ref<boolean>(false);

let optionsPackage = ref([]);
let optionsVersions = ref([]);
const emit = defineEmits(['emit']);


let defaultForm = ref({
  package: null,
  version: null
})

let form = ref(JSON.parse(JSON.stringify(defaultForm.value)));

const trottleId = ref(null);

function resetForm() {
  form.value = JSON.parse(JSON.stringify(defaultForm.value));
}


let instanceAxios = ref(axios.create({
  timeout: 30 * 1000,
}));

function remoteMethodNpm(query) {
  if (query.length < 3) return optionsPackage.value = [];
  if (trottleId.value) clearTimeout(trottleId.value);
  setTimeout(async () => {
    try {
      loadingPackage.value = true;
      const {data} = await instanceAxios.value.get(`https://registry.npmjs.com/-/v1/search?text=${query}&size=10`);

      optionsPackage.value = data.objects.map((el) => {
        return {
          value: el.package.name,
          label: el.package.name,
          links: el.package.links
        }
      })
    } catch (e) {
      ElNotification({
        type: "error",
        title: 'Error',
        message: 'Please try again to get packages'
      })
    } finally {
      loadingPackage.value = false;
    }
  }, 300);
}

async function onChangePackage(name) {
  if (!name) return;
  try {
    loadingVersion.value = true;
    form.value.version = 'latest'
    const {data} = await instanceAxios.value.get(`https://registry.npmjs.org/${name}`);
    const optionsVersionsData = Object.keys(data.versions).map((version) => {
      return {
        value: version,
        label: version,
      }
    }).reverse();
    optionsVersions.value = [
      {
        value: 'latest',
        label: 'latest',
      },
      ...optionsVersionsData
    ]
  } catch (e) {
    ElNotification({
      type: "error",
      title: 'Error',
      message: 'Please try again to get versions'
    })
  } finally {
    loadingVersion.value = false;
  }
}

async function onAdd() {
  try {
    loadingContent.value = true;
    const {data} = await instanceAxios.value.get(`https://unpkg.com/${form.value.package}@${form.value.version}`);
    let version = form.value.version;
    if (version === 'latest') version = optionsVersions.value[1].label;
    await putVersion({
      id: null,
      scriptName: form.value.package,
      scriptVersion: version,
      script: data,
      isDefault: true,
    });
    emit('created');
    resetForm();
    ElNotification({
      title: 'Success',
      message: 'The library has been successfully added',
      type: 'success'
    })
  } catch (e) {
    ElNotification({
      type: "error",
      title: 'Error',
      message: 'Please try again to get content'
    })
  } finally {
    loadingContent.value = false;
  }
}
</script>

<style scoped lang="scss">
.dialog-content-script-editor-fields-files-npm {
  .el-form-item {
    margin-bottom: 0;
  }

  .actions-box {
    text-align: right;
    margin-top: 15px;
  }

  .link-npm {
    margin-top: 10px;
    margin-bottom: 15px;

    a {
      &::after {
        display: none;
      }

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
