<template>
  <div class="target-data-row-elements-embedded">
    <div
      @click="onToggleOpen($event)"
      @mouseover="onOverRow"
      @mouseleave="onLeaveRow"
      class="row"
      :class="{
        'can-not-be-selected-by-relation': !canBeSelectedByRelation,
        'is-not-hovered': isNotHovered,
        'is-hover-with-active-link': isHoverWithActiveLink
      }"
      :data-relation="isOpen ? '' : allRelationClasses.join(' ')"
    >
      <div class="icon" :class="{ 'is-open': isOpen }">
        <font-awesome-icon icon="chevron-right"/>
      </div>

      <div class="key">
        <el-tooltip :show-after="1000" effect="dark" :content="props.requestParam.reportClass" placement="top">
          <span>
            <template v-if="requestParam.key">
              <span>{{ requestParam.key }}: </span>
            </template>
            <span>{{ requestParam.reportClassShort }}</span>
          </span>
        </el-tooltip>
      </div>

      <div class="pull-right"></div>
      <template v-if="assignMode === 'single'">
        <div v-if="requestParam.key" class="btn-edit-element">
          <el-button size="default" @click="onEditElement($event)" :disabled="activeRelation" type="primary">
            <font-awesome-icon icon="pencil-alt"/>
          </el-button>
        </div>
        <div class="btn-delete-element">
          <el-button size="default" @click="onDeleteElement($event)" :disabled="activeRelation" type="danger">
            <font-awesome-icon icon="trash"/>
          </el-button>
        </div>
      </template>

      <span class="type"> element </span>

      <div
        class="circle is-selected"
        v-if="countSelectedItems > 0 && !isOpen"
        :class="{
          selected: countSelectedItems > 0,
          'default-cursor': relationsForRemove.length === 0,
          'path-not-exist': isPathNotExist
        }"
        @click="onDeleteRelation($event)"
      >
        <template v-if="!isOpen && countSelectedItems > 1">
          {{ countSelectedItems }}
        </template>
      </div>
    </div>
    <keep-alive>
      <template v-if="isOpen">
        <TargetData :allDataRelations="allDataRelations" :selectedEntityMapping="selectedEntityMapping"
                    class="target-data" :requestParam="requestParam" :toggleExpand="toggleExpand"
                    :findTargetPath="findTargetPath" :notExistRelations="notExistRelations"/>
      </template>
    </keep-alive>
  </div>
</template>

<script setup lang="ts">
import {usePlatformMappingStore} from "../../../stores/platform-mapping";
import {ElMessageBox} from "element-plus";
import {ref, nextTick, computed, watch} from "vue";

import HelperModelling from "../../../helpers/HelperModelling";
import HelperMapper from "../../../helpers/HelperMapper";

import {useHoverWithActiveLinkMixin} from "../../../mixins/HoverWithActiveLinkMixin";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import TargetData from "./TargetData.vue"

// @TODO Mixins: HoverWithActiveLinkMixer
const props = defineProps({
  toggleExpand: undefined,
  findTargetPath: undefined,
  requestParam: {
    default: () => {
      return {};
    }
  },
  canBeSelectedByRelation: {
    default: false
  },
  selectedEntityMapping: {
    default: () => {
      return {};
    }
  },
  assignMode: {default: "multiple"},
  allDataRelations: undefined,
  notExistRelations: {default: () => []}
});
const emit = defineEmits(['delete']);
const platformMappingStore = usePlatformMappingStore();
const hoveredRelations = computed(() => {
  return platformMappingStore.hoveredRelations;
});
const activeRelation = computed(() => {
  return platformMappingStore.activeRelation;
});
const allRelationClasses = computed(() => {
  if (currentRelations.value.length > 0) {
    return currentRelations.value.map((el) => encodeURIComponent(el.column.dstColumnPath));
  }
  return [];
});
const currentRelations = computed(() => {
  return (
    props.allDataRelations.filter((el) => {
      return HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.requestParam.baseColumnPath, HelperModelling.REGEX_TARGET);
    }) || []
  );
});
const countSelectedItems = computed(() => {
  const relationsCount = props.allDataRelations.filter((el) => {
    return HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.requestParam.baseColumnPath, HelperModelling.REGEX_TARGET);
  }).length;
  return relationsCount;
});
const isNotHovered = computed(() => {
  if (isOpen.value && hoveredRelations.value && hoveredRelations.value.length > 0) {
    return true;
  }
  if (hoveredRelations.value && hoveredRelations.value.length > 0) {
    return !hoveredRelations.value.find((el: any) => {
      return HelperModelling.isElementIsSelected(el.column.dstColumnPath, props.requestParam.baseColumnPath, HelperModelling.REGEX_TARGET);
    });
  }
  return false;
});
const relationsForRemove = computed(() => {
  return currentRelations.value.filter((el) => el.type !== "functionalMappingInner");
});
const isPathNotExist = computed(() => {
  return HelperMapper.checkIfPathNotExist(currentRelations.value, props.notExistRelations);
});

function setHoveredRelations(columns) {
  return platformMappingStore.setHoveredRelations(columns);
}

const isOpen = ref<boolean>(false);
const {
  startHoverWithActiveLink,
  stopHoverWithActiveLink,
  isHoverWithActiveLink
} = useHoverWithActiveLinkMixin(activeRelation, isOpen);

async function onToggleOpen() {
  if (activeRelation.value && activeRelation.value.direction === "fromTarget") {
    return;
  }
  isOpen.value = !isOpen.value;

  if (props.toggleExpand) {
    eventBus.$emit("toggleExpandReset");
  }
  if (props.findTargetPath) {
    eventBus.$emit("findTargetPathReset");
  }
  await nextTick();

  eventBus.$emit("updateRelations");
}

function onDeleteRelation(event: any) {
  event.stopPropagation();
  event.preventDefault();
  if (relationsForRemove.value.length > 0) {
    eventBus.$emit("removeRelation", relationsForRemove.value);
  }
}

function onDeleteElement(event: any) {
  event.stopPropagation();
  event.preventDefault();
  ElMessageBox.confirm(`Do you really want to delete this element. Continue?`, "Confirm", {
    callback: async (action) => {
      if (action === "confirm") {
        if (allRelationClasses.value.length > 0) {
          eventBus.$emit("removeRelationsForNestedPaths", {path: props.requestParam.columnPath});
        }
        emit("delete", currentRelations.value);
      }
    }
  });
}

function onEditElement(event: any) {
  event.stopPropagation();
  event.preventDefault();
  emit('edit');
}

function onOverRow() {
  if (allRelationClasses.value.length > 0 && !isOpen.value) {
    const columns = props.allDataRelations.filter((el) => allRelationClasses.value.indexOf(el.column.dstColumnPath) > -1);
    setHoveredRelations(columns);
  }
  startHoverWithActiveLink();
}

function onLeaveRow() {
  if (allRelationClasses.value.length > 0) {
    setHoveredRelations([]);
  }
  stopHoverWithActiveLink();
}

watch(
  () => props.toggleExpand,
  () => {
    if (countSelectedItems.value > 0 && (props.toggleExpand === true || props.toggleExpand === false)) {
      isOpen.value = props.toggleExpand;
    }
  },
  {immediate: true}
);

watch(
  () => props.findTargetPath,
  () => {
    if (!props.requestParam.columnPath || !props.findTargetPath) return;
    const isElementIsSelected = HelperModelling.isElementIsSelected(props.findTargetPath, props.requestParam.baseColumnPath, HelperModelling.REGEX_TARGET);
    if (isElementIsSelected) {
      isOpen.value = true;
    }
  },
  {immediate: true}
);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.target-data-row-elements-embedded {
  .row {
    cursor: pointer;
    position: relative;
    display: flex;
    padding: 10px 10px 10px 15px;
    border-top: 1px solid #dedede;
    align-items: center;
    transition: all 0.5s;
    height: 40px;

    .pull-right {
      margin-left: auto;
    }

    .btn-edit-element {
      margin-right: 10px;
    }

    .btn-delete-element {
      margin-right: 10px;
    }

    .icon {
      margin-right: 10px;
      transition: all 0.5s;

      &.is-open {
        transform: rotate(90deg);
      }
    }

    .key span {
      font-weight: bold;
    }

    .circle {
      cursor: pointer;
      position: absolute;
      left: -9px;
      min-width: 18px;
      white-space: nowrap;
      height: 18px;
      border-radius: 10px;
      top: 9px;
      border: 2px solid #858484;
      opacity: 0;
      transition: all 0.5s;
      background-color: #fff;
      font-size: 13px;
      text-align: center;
      line-height: 14px;

      &.is-selected {
        border: 2px dotted #858484;
        background-color: #fff;
        opacity: 1;
      }

      &.path-not-exist {
        border-color: #f56c6c !important;
      }
    }
  }

  .target-data {
    margin-left: 15px;
    min-width: 100%;
    display: block;
  }

  .can-not-be-selected-by-relation {
    opacity: 0.5;

    .circle {
      display: none;

      &.selected {
        display: block;
      }
    }
  }

  .is-not-hovered .circle.is-selected {
    opacity: 0.2 !important;
  }

  .default-cursor {
    cursor: default !important;
  }
}
</style>
