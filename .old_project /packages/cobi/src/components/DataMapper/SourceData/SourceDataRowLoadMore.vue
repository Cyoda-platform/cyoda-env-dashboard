<template>
  <div class="source-data-row-load-more" :data-relation="allRelationClasses.join(' ')">
    <div class="row-actions is-partial-match">
      <div v-if="allRelationClasses.length > 0" class="circle">
        <template v-if="allRelationClasses.length > 1">{{ allRelationClasses.value.length }}</template>
      </div>
      <el-button-group class="btn-groups">
        <el-button :disabled="isDisabledLoadMore" @click="onLoadMore" type="primary">
          {{ title }}
          <font-awesome-icon icon="chevron-down"/>
        </el-button>
        <el-button :disabled="isDisabledHideMore" @click="onHideMore" type="warning">
          Hide prev
          <font-awesome-icon icon="chevron-up"/>
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";

import HelperModelling from "../../../helpers/HelperModelling";
import HelperMapper from "../../../helpers/HelperMapper";

const props = defineProps({
  data: undefined,
  numberRows: undefined,
  jsonParentPath: {default: ""},
  parentTypeOfData: undefined,
  allDataRelations: undefined,
  isDisabledLoadMore: undefined,
  isDisabledHideMore: undefined
});
const emit = defineEmits(['loadMore', 'hideMore']);

const title = computed(() => {
  return `Load more (${props.numberRows} of ${props.data.length})`;
});

const getAllSelectedRelations = computed(() => {
  const relations = [];
  const tmpData = JSON.parse(JSON.stringify(props.data));
  const restData: any = {};
  Object.keys(tmpData).forEach((key: any) => {
    if (key >= props.numberRows) {
      restData[key] = tmpData[key];
    }
  });

  Object.keys(restData).forEach((jsonKey) => {
    const jsonPathComputed = HelperMapper.computePathByKey(jsonKey, props.jsonParentPath, "object", "XML");
    props.allDataRelations.forEach((el) => {
      const isSelected = HelperModelling.isElementIsSelected(el.column.jsonPath, jsonPathComputed, HelperModelling.REGEX_SOURCE);
      if (isSelected) {
        relations.push(el);
      }
    });
  });
  return relations;
});
const allRelationClasses = computed(() => {
  return getAllSelectedRelations.value.map((el: any) => encodeURIComponent(el.column.jsonPath));
});

function onLoadMore() {
  emit("loadMore");
}

function onHideMore() {
  emit("hideMore");
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.source-data-row-load-more {
  padding-right: 10px;
  margin: 5px 0;

  .btn-groups {
    width: 100%;

    button {
      width: 50%;
    }
  }

  .row-actions {
    position: relative;

    .circle {
      position: absolute;
      right: -27px;
      min-width: 17px;
      white-space: nowrap;
      height: 18px;
      border-radius: 0 10px 10px 0;
      top: 11px;
      opacity: 0;
      transition: all 0.5s;
      background-color: #858484;
      border: 2px solid #858484;
      font-size: 13px;
      text-align: center;
      line-height: 14px;
    }

    &.is-partial-match {
      .circle {
        border: 2px dotted #858484;
        background-color: #fff;
        opacity: 1;
      }
    }
  }
}
</style>
