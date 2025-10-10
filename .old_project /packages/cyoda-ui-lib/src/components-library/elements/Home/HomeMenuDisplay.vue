<template>
  <div class="home-menu-display">
    <template v-if="menu.name === 'delimiter'">
      <hr />
    </template>
    <template v-else>
      <el-row :gutter="20">
        <el-col
          :class="{
            'text-center': !isDisplayDescription
          }"
          :span="isDisplayDescription ? 12 : 24"
        >
          <template v-if="menu.isRouterLink">
            <router-link class="cyoda-btn" :to="menu.link">{{ menu.name }}</router-link>
          </template>
          <template v-else>
            <el-button type="success" class="cyoda-btn" @click="onClick(menu)">{{ menu.name }}</el-button>
          </template>
        </el-col>
        <el-col v-if="isDisplayDescription" :span="12">
          {{ menu.description }}
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  menu: {
    default: () => {
      return {};
    }
  },
  isDisplayDescription: {
    default: true
  }
});

function onClick(menu: any) {
  window.open(getLink(menu), "_blank");
}

function getLink(menu: any) {
  if (window.location.href.indexOf("localhost") > -1 && menu.hasOwnProperty("localhostLink")) {
    return menu.localhostLink;
  } else {
    let url = `${location.protocol}//${location.hostname}`;
    if (location.port) {
      url += `:${location.port}`;
    }
    return `${url}${menu.link}`;
  }
}

function checkIsPM(menu: any) {
  if (menu.name === "System Monitor" && location.href.indexOf("processing-manager") === -1) {
    return false;
  }
  return true;
}
</script>

<style lang="scss">
.home-menu-display {
  .el-row {
    margin-bottom: 15px;

    .text-center {
      text-align: center;
    }

    .cyoda-btn {
      background-color: #148751;
      border-color: #148751;
      width: 300px;
      color: #fff;
      padding: 12px 20px;
      font-size: 14px;
      border-radius: 4px;
      text-align: center;
      display: block;
      text-decoration: none;

      &:after {
        display: none;
      }

      &:hover {
        background-color: #149c66;
        border-color: #149c66;
      }
    }
  }

  hr {
    box-shadow: none;
    display: block;
    height: 0;
    border: 0;
    border-top: 2px solid rgb(232, 232, 232);
    margin: 1em 0;
    padding: 0;
  }
}
</style>
