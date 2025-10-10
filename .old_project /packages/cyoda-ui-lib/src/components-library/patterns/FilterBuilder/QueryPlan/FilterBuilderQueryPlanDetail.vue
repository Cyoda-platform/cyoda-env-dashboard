<template>
  <div class="filter-builder-query-plan-detail">
    <div class="header">
      <h2>
        {{ title }}
        <el-popover placement="top-start" :title="title" width="400" trigger="hover" :content="description">
          <template #reference>
            <font-awesome-icon icon="info-circle"/>
          </template>
        </el-popover>
      </h2>
      <div>
        <el-button @click="onViewRaw" type="primary"
        >View Raw
          <font-awesome-icon icon="search"/>
        </el-button>
      </div>
    </div>
    <h3>Queries to cassandra</h3>
    <template v-if="conditions.length > 0">
      <div v-for="condition in conditions" class="row">
        <div class="type">
          <label>Type</label>
          <div>{{ condition.type }}</div>
        </div>
        <div class="condition">
          <label>Conditions</label>
          <div v-for="item in condition.conditions">{{ displayCondition(item) }}</div>
        </div>
        <div class="index-id">
          <label>IndexId</label>
          <div>{{ condition.indexId || "-" }}</div>
        </div>
        <div class="index-values-json">
          <label>indexValuesJson</label>
          <div>{{ (condition.indexValuesJson && JSON.parse(condition.indexValuesJson).join(", ")) || "-" }}</div>
        </div>
      </div>
    </template>
    <template v-else>
      <div>No queries</div>
    </template>

    <FilterBuilderQueryPlanDetailRaw :queryPlan="queryPlan" :title="title" ref="filterBuilderQueryPlanDetailRawRef"/>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

import FilterBuilderQueryPlanDetailRaw from "./FilterBuilderQueryPlanDetailRaw.vue";
import HelperFormat from "../../../../helpers/HelperFormat";

const props = defineProps({
  queryPlan: {
    default() {
      return {};
    }
  },
  title: {
    default: ""
  },
  description: {
    default: ""
  }
});
const filterBuilderQueryPlanDetailRawRef = ref(null);

let conditions = ref([]);

function collectAllConditions(obj) {
  if (Object.keys(obj).indexOf("conditions") > -1) {
    conditions.value.push(obj);
  } else {
    Object.keys(obj).forEach((key) => {
      if (Array.isArray(obj[key])) {
        obj[key].forEach((arrItem) => collectAllConditions(arrItem));
      } else if (typeof obj[key] === "object") {
        collectAllConditions(obj[key]);
      }
    });
  }
}

function onViewRaw() {
  filterBuilderQueryPlanDetailRawRef.value.dialogVisible = true;
}

function displayCondition(item) {
  return HelperFormat.shortNamePath(item);
}

watch(
  () => props.queryPlan,
  () => {
    conditions.value = [];
    collectAllConditions(props.queryPlan);
  },
  {immediate: true}
);
</script>

<style lang="scss">
.filter-builder-query-plan-detail {
  .header {
    display: flex;

    div {
      margin-left: auto;
    }
  }

  h2 {
    margin-bottom: 0 !important;

    svg {
      font-size: 14px;
      position: relative;
      top: -5px;
      margin: 0 5px;
    }
  }

  .row {
    display: flex;
    line-height: normal;
    margin-bottom: 10px;

    > div {
      background-color: #eef1f6;
      border: 1px solid #dfe6ec;
      padding: 5px;
      margin-right: 10px;

      &:last-child {
        margin-right: 0;
      }
    }

    label {
      font-size: 12px;
      font-weight: bold;
      color: #696969;
    }

    .type {
      width: 100px;
    }

    .index-id,
    .index-values-json {
      width: 20%;
    }

    .condition {
      flex-grow: 1;
    }
  }
}
</style>
