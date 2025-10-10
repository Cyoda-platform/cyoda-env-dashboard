<template>
  <div
    ref="rootRef"
    class="cyoda-popover el-popper el-popover"
    :x-placement="xPlacement"
    :class="{
      visible: visible
    }"
  >
    <component :is="component" :value="value" />
    <div x-arrow="" class="popper__arrow"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from "vue";
import PrismDataDetectorDate from "./types/PrismDataDetectorDate.vue";

const props = defineProps({
  targetClass: {
    default: ""
  }
});

const component = ref(null);
const visible = ref<boolean>(false);
const xPlacement = ref<string>("top");
const event = ref(null);
const value = ref(null);
const rootRef= ref(null);

onMounted(() => {
  const targetEl = document.querySelector(props.targetClass);
  if(!targetEl) return;
  targetEl.addEventListener("mousemove", onMouseHover);

  targetEl.addEventListener("mouseout", (e: any) => {
    if (!e.target.classList.contains("number")) return;
    visible.value = false;
  });
});

function onMouseHover(e: any) {
  if (!e.target.classList.contains("number")) return;
  if (/^\d{12}$/.test(e.target.innerHTML)) {
    component.value = PrismDataDetectorDate;
    visible.value = true;
    let value = e.target.innerHTML;
    if (e.target.previousSibling.innerHTML === "-") {
      value = -value;
    }
    value.value = value;
    event.value = e;
  }
}

onBeforeUnmount(() => {
  window.removeEventListener("mousedown", onMouseHover);
});

watch(
  event,
  async (event: MouseEvent) => {
    if (event) {
      xPlacement.value = "top";
      await nextTick();

      let top = event.clientY - rootRef.value.offsetHeight - 15;
      if (top < 0) {
        xPlacement.value = "bottom";

        top = event.clientY + window.scrollY;
      }

      rootRef.value.style.top = top + "px";

      rootRef.value.style.left = event.clientX + window.scrollX - rootRef.value.offsetWidth / 2 + "px";

      rootRef.value.style.zIndex = 9999;

      rootRef.value.style.position = "fixed";
    }
  }
);

defineExpose({ xPlacement, event });
</script>

<style scoped lang="scss">
.cyoda-popover {
  display: none;

  &.visible {
    display: block;
  }

  .popper__arrow {
    left: 50%;
    margin-left: -6px;
  }

  table {
    border-collapse: collapse;
    border: 1px solid #ebeef5;

    th {
      border-right: 1px solid #ebeef5;
      background-color: #4b5d7a !important;
      color: #fff !important;
      border-bottom: 1px solid #ebeef5;
      padding: 12px 5px;
      min-width: 0;
      box-sizing: border-box;
      vertical-align: middle;
      position: relative;
      text-align: left;
    }

    td {
      border-right: 1px solid #ebeef5;
      border-bottom: 1px solid #ebeef5;
      padding: 12px 5px;
    }
  }

  .btn-close {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  :deep(.el-form-item) {
    margin-bottom: 5px;
  }
}
</style>
