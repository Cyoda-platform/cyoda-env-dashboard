<template>
  <div class="transition-decision-tree-node">
    <div
      :class="{
        'wrap-type': props.node.type && props.node.type !== 'NULL'
      }"
    >
      <el-radio-group v-model="node.type">
        <el-radio-button v-for="type in types" :key="type.key" :label="type.key">{{ type.label }} </el-radio-button>
      </el-radio-group>
    </div>

    <div class="node">
      <template v-if="props.node.type === 'CHOICE'">
        <div class="wrap-choice">
          <div class="inner-field">
            <label class="label">Criteria</label>
            <el-select v-model="node.choiceCriteriaId" placeholder="Select">
              <el-option v-for="item in criteriaList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
            <el-button class="btn-criteria" @click="addNewCriteria" type="primary">
              <font-awesome-icon icon="plus" />
              Add new
            </el-button>
            <el-button v-if="node.choiceCriteriaId" class="btn-criteria" @click="addEditCriteria" type="primary">
              <font-awesome-icon icon="pencil-alt" />
              Edit
            </el-button>
          </div>
          <div class="inner-field">
            <label class="label">Matched Node</label>
            <TransitionDecisionTreeNode :startState="startState" v-model:node="node.choiceMatchedNode" :workflowId="workflowId" :workflowType="workflowType" :workflowTypePersisted="workflowTypePersisted" />
          </div>
          <div class="inner-field">
            <label class="label">Not Matched Node</label>
            <TransitionDecisionTreeNode :startState="startState" v-model:node="node.choiceNotMatchedNode" :workflowId="workflowId" :workflowType="workflowType" :workflowTypePersisted="workflowTypePersisted" />
          </div>
        </div>
      </template>

      <template v-if="props.node.type === 'LEAF'">
        <div class="wrap-leaf">
          <div class="inner-field">
            <label class="label">Transition</label>
            <el-select v-model="node.leafTransitionId" placeholder="Select">
              <el-option v-for="item in transitionsComputed" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </div>
        </div>
      </template>
    </div>

    <!--    New Criteria-->
    <el-dialog :close-on-click-modal="false" append-to-body title="Criteria" v-model="dialogVisibleCriteria" width="90%">
      <CriteriaForm :criteriaId="selectedCriteriaId" :workflowType="workflowType" :workflowTypePersisted="workflowTypePersisted" @submitted="onSubmittedCriteria" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

import {useStatemachineStore} from "../../stores/statemachine";
import CriteriaForm from "@cyoda/ui-lib/src/components-library/patterns/CriteriaForm/CriteriaForm.vue";

const namespace: string = "statemachine";

const emit = defineEmits(["update:node", "update:node", "update:node"]);
const props = defineProps({
  node: {
    type: Object,
    required: true,
    default: () => {
      return {
        type: "LEAF"
      };
    }
  },
  startState: {
    type: String,
    required: true,
    default: ""
  },
  workflowId: { type: String, default: "" },
  workflowType: { type: String, default: "" },
  workflowTypePersisted: { type: String, default: "" }
});
const statemachineStore = useStatemachineStore();
const criteriaList = computed(() => {
  return statemachineStore.criteriaListPersisted;
});
const transitions = computed(() => {
  return statemachineStore.transitions;
});
const transitionsComputed = computed(() => {
  return transitions.value.filter((el) => el.startStateId === props.startState);
});
function getCriteriaList(arg: object) {
  return statemachineStore.getCriteriaList(arg);
}

function resetCriteriaStore() {
  return statemachineStore.resetCriteriaStore();
}

function getCriteria(arg: object) {
  return statemachineStore.getCriteria(arg);
}

const dialogVisibleCriteria = ref<boolean>(false);
const selectedCriteriaId = ref<string>("");

let types = ref([
  {
    key: "CHOICE",
    label: "Choice"
  },
  {
    key: "LEAF",
    label: "Leaf"
  },
  {
    key: "NULL",
    label: "Null"
  }
]);

watch(
  () => props.node.type,
  () => {
    if (props.node.type === "CHOICE") {
      emit("update:node", {
        type: "CHOICE",
        choiceCriteriaId: "",
        choiceMatchedNode: {
          type: "LEAF"
        },
        choiceNotMatchedNode: {
          type: "LEAF"
        }
      });
    } else if (props.node.type === "LEAF") {
      emit("update:node", {
        type: "LEAF",
        leafTransitionId: ""
      });
    } else if (props.node.type === "NULL") {
      emit("update:node", {
        type: "NULL"
      });
    }
  }
);

function addNewCriteria() {
  dialogVisibleCriteria.value = true;
  selectedCriteriaId.value = "";
  resetCriteriaStore();
}

function addEditCriteria() {
  dialogVisibleCriteria.value = true;
  getCriteria({
    workflowType: props.workflowType,
    workflowTypePersisted: props.workflowTypePersisted,

    criteriaId: props.node.choiceCriteriaId
  });

  selectedCriteriaId.value = props.node.choiceCriteriaId;
}

function onSubmittedCriteria(params: any) {
  dialogVisibleCriteria.value = false;
  if (params && params.id) {
    props.node.choiceCriteriaId = params.id;
  }
  getCriteriaList({ workflowType: props.workflowType });
}
</script>

<style lang="scss">
.transition-decision-tree-node {
  margin-top: 5px;
  //margin-left: 15px;

  .wrap-choice,
  .wrap-leaf {
    margin-top: 10px;
  }

  .choiceMatchedNode,
  .choiceNotMatchedNode {
    margin-top: 10px;
  }

  label.label {
    display: block;
    margin-bottom: 5px;
    position: relative;

    &:before {
      content: "";
      border-color: #e0e0e0;
      border-style: dotted;
      border-width: 0 0 2px 0;
      position: absolute;
      width: 20px;
      left: -21px;
      top: 8px;
    }
  }

  .inner-field {
    margin-left: 15px;
    position: relative;
    margin-top: 10px;

    &:before {
      content: "";
      border-color: #e0e0e0;
      border-style: dotted;
      border-width: 0 0 0 2px;
      left: -22px;
      position: absolute;
      width: 10px;
      top: 10px;
      bottom: -20px;
    }
  }

  .wrap-type {
    position: relative;

    &:before {
      content: "";
      border-color: #e0e0e0;
      border-style: dotted;
      border-width: 0 0 0 2px;
      left: 13px;
      position: absolute;
      width: 10px;
      top: 0;
      bottom: -20px;
    }
  }

  .inner-field:last-child {
    &:before {
      display: none;
    }
  }

  .node {
    position: relative;
    padding-left: 20px;
  }

  .btn-criteria {
    margin-left: 10px;
  }
}
</style>
