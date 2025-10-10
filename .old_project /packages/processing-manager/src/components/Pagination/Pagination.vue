<template>
  <div class="pagination">
    <div class="row">
      <div v-if="!firstPage">
        <el-button @click="onClickFirst" type="primary">
          <font-awesome-icon icon="angle-double-left" />
          First
        </el-button>
      </div>
      <div v-if="!firstPage">
        <el-button @click="onClickPrev" type="primary">
          <font-awesome-icon icon="angle-left" />
          Prev
        </el-button>
      </div>
      <div v-if="!lastPage">
        <el-button @click="onClickNext" type="primary">
          Next
          <font-awesome-icon icon="angle-right" />
        </el-button>
      </div>
      <div v-if="!lastPage">
        <el-button @click="onClickLast" type="primary">
          Last
          <font-awesome-icon icon="angle-double-right" />
        </el-button>
      </div>
      <div>
        <el-select class="page-size" @change="pageSizeChange" v-model="form.pageSize" placeholder="Page Size">
          <el-option v-for="page in pagesOptions" :key="page" :label="`${page}/page`" :value="page" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

const props = defineProps({ firstPage: { default: false }, lastPage: { default: false }, nextCursor: { default: "" }, prevCursor: { default: "" } });

const emit=defineEmits(['change']);
let pagesOptions = ref([10, 25, 50, 100, 200, 500]);

let form = ref({
  pageSize: 25,
  requestLast: false,
  nextCursor: null,
  prevCursor: null
});

function onClickFirst() {
  form.value.requestLast = false;
  emit("change");
  resetForm();
}

function onClickPrev() {
  form.value.prevCursor = props.prevCursor;
  emit("change");
  resetForm();
}

function onClickNext() {
  form.value.nextCursor = props.nextCursor;
  emit("change");
  resetForm();
}

function onClickLast() {
  form.value.requestLast = true;
  emit("change");
  resetForm();
}

function pageSizeChange(val: number) {
  form.value.pageSize = val;
  emit("change");
}

async function resetForm() {
  await nextTick();

  form.value.requestLast = false;
  form.value.nextCursor = null;
  form.value.prevCursor = null;
}

defineExpose({ form });
</script>

<style lang="scss">
.pagination {
  margin-top: 10px;

  .row {
    width: 100%;
    display: flex;
    justify-content: center;

    > div {
      margin: 0 5px;
    }
  }
  .page-size{
    min-width: 120px;
  }
}
</style>
