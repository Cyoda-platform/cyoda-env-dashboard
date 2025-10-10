<template>
  <div class="card">
    <div class="card-header">IP Addresses</div>
    <div class="card-body">
      <ul>
        <li v-for="ip in ips" :key="ip">
          {{ ip }}
          <font-awesome-icon class="copy-icon" @click="copyIp(ip)" icon="copy" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();

let ips = ref([]);
ips.value.push(route.params.name);

function copyIp(ip: string) {
  navigator.clipboard.writeText(ip).then(
    () => {
      ElNotification({
        title: "Success",
        message: `Ip address ${ip} was copied`,
        type: "success"
      });
    },
    () => {
      ElNotification({
        title: "Error",
        message: `Ip address ${ip} NOT was copied`,
        type: "error"
      });
    }
  );
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

svg {
  margin-left: 5px;
  cursor: pointer;
}

.copy-icon {
  opacity: 0.7;
  transition: all 0.5s;
}

.copy-icon:hover {
  opacity: 1;
}
</style>
