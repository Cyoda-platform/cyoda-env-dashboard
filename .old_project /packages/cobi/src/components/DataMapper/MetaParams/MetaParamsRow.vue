<template>
  <div ref="rootRef" class="row" :data-relation="allRelationClasses.join(' ')">
    <div class="key">
      <font-awesome-icon
        @click="onClickToMeta"
        :icon="['fab', 'js']"
        class="settings"
        :class="{
            error: !isExistInMeta,
            success: isExistInMeta
          }"
      />
      <el-tooltip :show-after="1000" effect="dark" :content="metaParam.name" placement="top">
        <span>{{ metaParam.displayName }}</span>
      </el-tooltip>

      <el-popover popper-class="popover-actions" placement="top-start" title="Actions" width="200" trigger="click" v-model:visible="visibleTooltip">
        <div>
          <div class="action">
          <el-button @click="onStartDragLine($event, 'cobiCoreMetadata')" type="primary" link>Add new</el-button>
          </div>
          <div class="action" v-if="allRelationClasses.length > 0">
            <el-button @click="onDeleteRelation" type="primary" link>Delete</el-button>
          </div>
        </div>
        <template #reference>
        <div
          class="circle"
          :class="{
            selected: isSelected || visibleTooltip,
            'cobi-core-metadata': true
          }"
        >
          <template v-if="allRelationClasses.length > 1">{{ allRelationClasses.value.length }}</template>
        </div>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  metaParam: undefined,
  allDataRelations: undefined,
  selectedEntityMapping: {
    default: ()=> {
      return {};
    }
  }
});

const visibleTooltip = ref(false);

const rootRef=ref(null);

const allRelationClasses = computed(() => {
  return getAllSelectedRelations.value.map((el: any) => encodeURIComponent(el.column.srcColumnPath));
});
const isColumnMapping = computed(() => {
  return !!currentRelations.value.find((el) => el.type === "cobiCoreMetadata");
});
const currentRelations = computed(() => {
  return props.allDataRelations.filter((el) => el.column.srcColumnPath == props.metaParam.name);
});
const isSelected = computed(() => {
  return currentRelations.value && currentRelations.value.length > 0;
});
const getAllSelectedRelations = computed(() => {
  const relations: any[] = [];
  currentRelations.value.forEach((el: any) => {
    relations.push(el);
  });
  return relations;
});

function onStartDragLine(event: any, type) {
  visibleTooltip.value = false;
  eventBus.$emit("startDragLine", {
    el: rootRef.value.querySelector(".circle"),
    path: props.metaParam.name,
    jsonPath: props.metaParam.name,
    type
  });
}
function onDeleteRelation() {
  if (allRelationClasses.value.length > 0) {
    visibleTooltip.value = false;
    eventBus.$emit("removeRelation", getAllSelectedRelations.value);
  }
}

const isExistInMeta= computed(()=> {
  return props.selectedEntityMapping.script.inputMetaPaths.includes(props.metaParam.name);
})

function onClickToMeta() {
  const inputMetaPaths =props.selectedEntityMapping.script.inputMetaPaths
  if (isExistInMeta.value) {
    props.selectedEntityMapping.script.inputMetaPaths = inputMetaPaths.filter((el) => el !== props.metaParam.name);
  } else {
    inputMetaPaths.push(props.metaParam.name);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.row {
  display: flex;
  padding: 10px 10px 10px 0px;
  border-top: 1px solid #dedede;
  align-items: center;
  transition: all 0.5s;
}

.row {
  position: relative;

  .circle {
    position: absolute;
    right: -17px;
    min-width: 17px;
    white-space: nowrap;
    height: 18px;
    border-radius: 0 10px 10px 0;
    top: 9px;
    opacity: 0;
    transition: all 0.5s;
    background-color: #858484;
    border: 2px solid #858484;
    font-size: 13px;
    text-align: center;
    line-height: 14px;

    &.selected {
      opacity: 1;
      cursor: pointer;
    }

    &.cobi-core-metadata {
      background-color: #409eff;
      border-color: #409eff;
    }
  }

  &.is-partial-match {
    .circle {
      border: 2px dotted #858484;
      background-color: #fff;
      opacity: 1;
    }
  }

  &:hover {
    .circle {
      opacity: 1;
    }
  }

  &.selectable .key span {
    font-weight: bold;
  }

  &.is-not-hovered .circle.selected {
    opacity: 0.2;
  }

  .settings {
    opacity: 0.6;
    cursor: pointer;
    transition: all 0.5s;
    margin-left: 10px;
    margin-right: 7px;

    &:hover {
      opacity: 1;
    }

    &.success {
      color: #67c23a;
    }

    &.error {
      color: #f56c6c;
    }
  }
}
</style>
