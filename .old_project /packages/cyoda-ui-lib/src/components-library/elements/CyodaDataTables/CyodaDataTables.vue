<template>
  <div class="cyoda-data-tables">
    <div class="tool" v-if="toolBarShow">
      <slot name="tool"/>
    </div>
    <div class="table">
      <el-table ref="elTableRef"
                v-bind="$attrs"
                v-loading="loading"
                :data="localTableData"
                :border="tableProps.border"
                :height="tableProps.height"
                :maxHeight="tableProps.maxHeight"
                :default-sort="defaultSort"
                @selectionChange="emit('selection-change', $event)"
                @sortChange="handleSort"
      >
        <slot/>
      </el-table>
    </div>
    <div class="pagination-bar" v-if="paginationShow">
      <div class="pagination-wrap">
        <el-pagination v-model:current-page="localCurrentPage" v-model:page-size="localPageSize" :total="total"
                       :small="localSmall"
                       :page-sizes="localPageSizes" :layout="localLayout"
                       @prev-click="emit('prev-click')" @next-click="emit('next-click')"
        >
          <slot name="pagination"></slot>
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, useSlots, watch} from "vue";
import _ from "lodash";

const paginationShow = ref(true);
const elTableRef = ref(null);
const sortData = ref(null);

const slots = useSlots();
const toolBarShow = computed(() => {
  return !!slots['tool'];
})
const props = defineProps({
  data: {
    required: false,
    default: () => {
      return [];
    }
  },
  filters: {
    type: [Object, Array],
    default() {
      return []
    }
  },
  paginationProps: {
    required: false,
    default: () => {
      return {
        pageSizes: [5, 10, 20, 50],
        total: null,
        small: false,
        layout: 'prev, pager, next, jumper, sizes, total',
      };
    }
  },
  pageSize: {
    required: false,
    default: null,
  },
  currentPage: {
    required: false,
    default: 1,
  },
  tableProps: {
    required: false,
    default: () => {
      return {
        border: false,
        height: null,
        maxHeight: null,
      };
    }
  },
  defaultSort: {
    required: false,
    default: () => {
      return {};
    }
  },
  loading: {
    required: false,
    default: false,
  },
  remote: {
    required: false,
    default: false,
  }
});

const localSmall = computed(() => {
  return props.paginationProps.small || false;
});

const localLayout = computed(() => {
  return props.paginationProps.layout || 'prev, pager, next, jumper, sizes, total';
})

const localCurrentPageValue = ref(props.currentPage || 1);
const localCurrentPage = computed({
  get: () => {
    return localCurrentPageValue.value;
  },
  set: (value) => {
    localCurrentPageValue.value = value;
    emit('current-page-change');
    emit('update:currentPage', value)
    queryChange();
  }
})

watch(() => props.currentPage, () => {
  if (localCurrentPageValue.value !== props.currentPage) {
    localCurrentPageValue.value = props.currentPage;
  }
})

const localPageSizeValue = ref(props.pageSize || 20);
const localPageSize = computed({
  get: () => {
    return localPageSizeValue.value;
  },
  set: (value) => {
    localPageSizeValue.value = value;
    emit('update:pageSize', value);
    queryChange();
  }
})

watch(() => props.pageSize, () => {
  if (localPageSizeValue.value !== props.pageSize) {
    localPageSizeValue.value = props.pageSize;
  }
})

const emit = defineEmits(["prev-click", "next-click", "current-page-change", "selection-change", "query-change", "update:currentPage", "update:pageSize"]);

const total = computed(() => {
  if (props.paginationProps.total) return props.paginationProps.total;
  return filteredData.value.length;
});

const localPageSizes = computed(() => {
  return props.paginationProps.pageSizes;
});

const localTableData = computed(() => {
  if (props.remote) return props.data;
  let from = localPageSize.value * (localCurrentPage.value - 1);
  let to = from + localPageSize.value;
  return filteredData.value.slice(from, to);
});

const filteredData = computed(() => {
  let localData = JSON.parse(JSON.stringify(sortedData.value));
  if (!props.filters || props.filters.length === 0) return localData;
  props.filters.forEach((filter) => {
    localData = localData.filter((row) => {
      if (filter.filterFn) return filter.filterFn(row, filter);
      return !filter.value || row[filter.prop] === filter.value;
    })
  })
  return localData;
})

function handleSort(obj) {
  sortData.value = obj
}


const sortedData = computed(() => {
  if (sortData.value?.order) {
    let sortedData = JSON.parse(JSON.stringify(props.data));

    let {order, prop} = sortData.value
    let orderType = order === 'descending' ? 'desc' : 'asc';

    return _.orderBy(sortedData, [prop], [orderType])
  }

  return props.data;
})

// function handleSizeChange(val: number) {
//   emit('update:pageSize', val);
//   localPageSize.value = val;
// }

let queryChangeRequestId = null;

function queryChange(params = {}) {
  if (!queryChangeRequestId) {
    clearTimeout(queryChangeRequestId);
  }
  queryChangeRequestId = setTimeout(() => {
    emit('query-change', {
      pageSize: localPageSize.value,
      page: localCurrentPage.value,
      filters: props.filters,
      ...params
    })
    queryChangeRequestId = null;
  }, 100);
}

queryChange({type: 'init'})

// function onCurrentPageChange(page) {
//   emit('current-page-change');
//   emit('update:currentPage', page)
//   queryChange();
// }

watch(() => props.filters, () => {
  queryChange()
}, {deep: true})

defineExpose({elTableRef})
</script>

<style lang="scss">
.cyoda-data-tables {
  .pagination-wrap {
    display: flex;
    justify-content: center;
  }

  .tool {
    .el-form--inline {
      display: block;
    }

    .el-form-item {
      margin-top: 5px;
      margin-right: 10px;
      display: inline-block !important;
      min-width: 100% !important;
    }
  }

  .pagination-bar {
    margin-top: 20px
  }
}
</style>
