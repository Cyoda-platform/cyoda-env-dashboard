<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" title="Data mappings:" v-model="dialogVisible" width="400px">
    <div>
      <ol>
        <li v-for="link in links">
          <a target="_blank" :href="getLink(link)">
            {{ link.dmcName }}
          </a>
        </li>
      </ol>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const dialogVisible = ref<boolean>(false);
let links = ref([]);

function openDialog(data) {
  dialogVisible.value = true;
  links.value = data;
}

function getLink(link) {
  return `/${import.meta.env.VITE_APP_PUBLIC_PATH}/data-mapper/configuration/${link.dmcId}`.replace(/\/+/g, "/");
}

defineExpose({ openDialog });
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:after {
    display: none;
  }
}
</style>
