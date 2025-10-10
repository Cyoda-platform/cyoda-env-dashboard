<template>
  <div>
    <el-drawer destroy-on-close class="data-mapper-csv-settings-headers-list-all" size="600px" title="Headers"
               v-model="drawerVisible" direction="rtl">
      <el-input class="wrap_filter" clearable placeholder="Filter by header name" v-model="filter">
        <template #prepend>
          <font-awesome-icon icon="search"/>
        </template>
      </el-input>
      <div
        v-for="(row, index) in rowKeysComputed"
        :key="`${row.index}${row.name}`"
        :class="{
          'wrap-box': true,
          'current-item': currentIndex === row.index,
        }"
      >
        <div class="wrap-row">
          <div class="wrap-row-title">
            <el-link @click.prevent="onClickHeader(row.index)"> Open Step {{ row.index + 1 }}</el-link>
          </div>
          <div class="sub-row">
            <div class="sub-row-title">{{ headerType }}: {{ row.name }}</div>
            <div class="sub-row-value">{{ parserParameters.headers[row.index] }}</div>
          </div>
        </div>
        <el-divider v-if="index !== rowKeysComputed.length - 1"/>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

const emit = defineEmits(["change"]);
const props = defineProps({
  parserParameters: {
    default: () => ({})
  },
  tableData: {
    default: () => []
  },
  currentIndex: {
    default: 0
  },
  headerType: {
    default: ""
  }
});
const rowKeys = computed(() => {
  if (props.tableData && props.tableData.length > 0) {
    const keys = Object.keys(props.tableData[0]);
    return keys.map((el) => el.replace(/__/g, "."));
  }
  return [];
});
const rowKeysComputed = computed(() => {
  const mapKeys=rowKeys.value.map((name, index)=>{
    return {name,index};
  })
  return mapKeys.filter((el) => {
    return !filter.value || el.name.toLowerCase().indexOf(filter.value.toLowerCase()) > -1 || props.parserParameters.headers[el.index].toString().toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
  });
});

const drawerVisible = ref<boolean>(false);

const filter = ref<string>("");

function onClickHeader(index) {
  emit("change", index);
  drawerVisible.value = false;
}

defineExpose({drawerVisible});
</script>

<style lang="scss">
.data-mapper-csv-settings-headers-list-all {
  line-height: normal;
  .sub-row {
    display: flex;
    margin-bottom: 10px;
    padding: 0;
    border: 1px solid #dfe6ec;
    align-items: stretch;

    .sub-row-title {
      background: #eef1f6;
      padding: 5px 10px;
      width: 200px;
      margin-right: 10px;
    }

    .sub-row-value {
      padding: 5px 10px;
      align-self: center;
    }
  }

  .wrap-row-title {
    padding-left: 5px;
    margin-bottom: 5px;

    a {
      font-weight: bold;
    }
  }

  .current-item .wrap-row {
    .wrap-row-title a {
      color: #949f94 !important;
    }

    .sub-row {
      background-color: #f0f9eb;
      border-color: #c2e7b0;

      .sub-row-title {
        background-color: #e0ecde;
      }
    }
  }

  .wrap_filter {
    margin-bottom: 15px;
  }
}
</style>
