<template>
  <div ref="wrapperRef">
    <div :key="tableKey">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUpdated, onBeforeUnmount, nextTick, useSlots} from 'vue';
import sortable from 'sortablejs';

const props = defineProps(['handle', 'animate']);
const tableKey = ref(0);
const wrapperRef = ref(null);
const emit = defineEmits(['drag', 'drop']);
const slots = useSlots();

const makeTableSortable = () => {
  const table = wrapperRef.value.querySelector('.el-table__body-wrapper tbody');

  sortable.create(table, {
    handle: props.handle,
    animation: props.animate,
    onStart: () => {
      emit('drag');
    },
    onEnd: ({newIndex, oldIndex}) => {
      keepWrapperHeight(true);
      tableKey.value = Math.random();

      const arr = slots.default()[0].props.data;
      const targetRow = arr.splice(oldIndex, 1)[0];
      arr.splice(newIndex, 0, targetRow);

      emit('drop', {targetObject: targetRow, list: arr});
    }
  });
};

const keepWrapperHeight = (keep) => {
  if (keep) {
    wrapperRef.value.style.minHeight = `${wrapperRef.value.clientHeight}px`;
  } else {
    wrapperRef.value.style.minHeight = 'auto';
  }
};

onMounted(() => {
  makeTableSortable();
});

onUpdated(() => {
  nextTick(() => {
    makeTableSortable();
    keepWrapperHeight(false);
  });
});

// onBeforeUnmount(() => {
//   const table = wrapperRef.value.querySelector('.el-table__body-wrapper tbody');
//   sortable.destroy(table);
// });
</script>
