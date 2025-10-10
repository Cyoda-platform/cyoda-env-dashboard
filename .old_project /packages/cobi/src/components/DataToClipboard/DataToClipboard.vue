<template>
  <span class="data-to-clipboard">
    <span>
      {{ value }}
    </span>
    <span class="icon">
      <font-awesome-icon @click="onCopy" :icon="['fas', 'copy']" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";

const props = defineProps({
  value: {
    default: ""
  }
});

async function onCopy() {
  try {
    await navigator.clipboard.writeText(props.value);
    ElNotification({
      title: "Success",
      message: "Data was copied",
      type: "success"
    });
  } catch (e) {
    ElNotification({
      type: "error",
      title: "Error",
      message: "Sorry, data could not be copied"
    });
  }
}
</script>

<style lang="scss">
.data-to-clipboard {
  display: inline-flex;

  .icon {
    margin-left: 5px;

    svg {
      transition: all 0.5s;
      opacity: 0.5;
      cursor: pointer;
    }

    svg:hover {
      opacity: 1;
    }
  }
}
</style>
