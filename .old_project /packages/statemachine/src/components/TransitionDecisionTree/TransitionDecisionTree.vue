<template>
  <div class="transition-decision-tree">
    <div class="title">
      <h1>{{ index + 1 }}) Decision Tree</h1>
      <div>
        <el-button v-if="index > 0" @click="onDelete" class="btn-delete" size="default" type="danger">
          <font-awesome-icon icon="trash" />
        </el-button>
      </div>
    </div>
    <div>
      <label class="label">Start State</label>
      <el-select v-model="decisionTree.startState" placeholder="Start State">
        <el-option v-for="item in statesListComputed" :key="item.id" :label="item.name" :value="item.id"> </el-option>
      </el-select>
    </div>
    <div>
      <TransitionDecisionTreeNode :startState="decisionTree.startState" v-model:node="decisionTree.node" :workflowType="workflowType" :workflowId="workflowId" :workflowTypePersisted="workflowTypePersisted" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import {computed, onMounted, ref} from "vue";

import TransitionDecisionTreeNode from "./TransitionDecisionTreeNode.vue";
import {useStatemachineStore} from "../../stores/statemachine";

const namespace: string = "statemachine";
const emit=defineEmits(['delete']);
const props = defineProps({
  workflowType: { type: String, required: true },
  workflowId: { type: String, default: "" },
  persistedType: { type: String, default: "" },
  index: { type: Number, default: "" },
  decisionTree: {
    required: true,
    default: () => {
      return {
        "@bean": "com.cyoda.core.model.stateMachine.dto.TransitionDecisionTreeDto",
        startState: "",
        node: {
          type: "LEAF"
        }
      };
    }
  }
});
const statemachineStore = useStatemachineStore();
const statesList=ref([]);

async function loadStates() {
  const {data} = await statemachineStore.getStatesList(props.persistedType, props.workflowId);
  statesList.value = data.Data;
}

onMounted(() => {
  if(props.persistedType === "persisted") {
    loadStates();
  }
})

const statesListComputed = computed(() => {
  const data = statesList.value.map((el) => {
    return {
      id: el.id,
      name: el.name
    };
  });
  if (!data.find((el) => el.id === "noneState")) {
    data.unshift({
      id: "noneState",
      name: "NONE"
    });
  }

  return data;
});

function onDelete() {
  ElMessageBox.confirm("Do you really want to delete?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        emit("delete");
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.transition-decision-tree {
  border-bottom: 1px solid #dedede;
  margin-bottom: 15px;
  padding-bottom: 15px;

  h1 {
    color: #8d8d8d;
    font-size: 18px;
    margin-bottom: 10px;
  }

  .title {
    display: flex;
    align-items: baseline;
    margin-bottom: 15px;
  }

  .btn-delete {
    margin-left: 15px;
  }

  label.label {
    display: block;
    margin-bottom: 5px;
  }
}
</style>
