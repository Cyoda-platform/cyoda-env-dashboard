<template>
  <div
    @click="onSelect"
    class="drawer-history-item"
    :class="{
      'item-selected': isSelected
    }"
  >
    <div class="date">{{ dateTime }}</div>
    <div v-if="isSelected" class="current-version">Selected version</div>
    <div class="user" v-if="user">
      {{ user }}
    </div>
    <div class="user-undefined" v-else>User is undefined</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import moment from "moment";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";

const emit = defineEmits(["select"]);
const props = defineProps({
  users: {
    default: () => {
      return [];
    }
  },
  item: {
    default: () => {
      return {};
    }
  },
  isSelected: {
    default: false
  }
});
const dateTime = computed(() => {
  const date = get_date_obj(props.item.timeId);
  return moment(date).format("DD.MM.YYYY hh:mm:ss");
});
const user = computed(() => {
  const user = props.users.find((el) => el.userId === props.item.userId);
  if (!user) return false;
  return user.username;
});

function get_date_obj(uuid_str) {
  const int_millisec = HelperFormat.getTimeFromUuid(uuid_str);
  return new Date(int_millisec);
}
async function onSelect() {
  emit("select", props.item);
}
</script>

<style scoped lang="scss">
.drawer-history-item {
  padding: 20px 30px;
  margin-left: -15px;
  margin-right: -15px;
  cursor: pointer;

  &.item-selected {
    background-color: #f0f9eb;
  }

  &:hover {
    background-color: #efefef;
  }

  .date {
    color: #498d29;
    font-weight: bold;
  }

  .current-version {
    color: #1967d2;
    font-style: italic;
    margin-top: 2px;
    font-size: 12px;
  }

  .user-undefined {
    margin-top: 2px;
  }
}
</style>
