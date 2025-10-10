<template>
  <div class="workflow-id">
    <WorkflowForm
      :workflowId="route.params.workflowId"
      :persistedType="route.query.persistedType"
    />

    <el-divider/>
    <div class="layout-mode-wrapper">
      <el-radio-group v-model="layoutMode" size="large">
        <el-radio-button value="tabular">
          <font-awesome-icon :icon="['fas', 'table']"/>
        </el-radio-button>
        <el-radio-button value="graphical">
          <font-awesome-icon :icon="['fas', 'diagram-project']"/>
        </el-radio-button>
        <el-radio-button value="config">
          <font-awesome-icon :icon="['fas', 'gears']"/>
        </el-radio-button>
      </el-radio-group>
    </div>

    <keep-alive>
      <div v-if="layoutMode === 'tabular'">
        <TransitionsList
          :workflowId="route.params.workflowId"
          :persistedType="route.query.persistedType"
          :entityClassName="route.query.entityClassName"
        />

        <el-divider/>

        <ProcessesList
          :workflowId="route.params.workflowId"
          :persistedType="route.query.persistedType"
          :entityClassName="route.query.entityClassName"
        />

        <el-divider/>

        <CriteriaList
          :workflowId="route.params.workflowId"
          :persistedType="route.query.persistedType"
          :entityClassName="route.query.entityClassName"
        />
      </div>
    </keep-alive>

    <keep-alive>
      <GraphicalStatemachine
        v-if="layoutMode === 'graphical'"
        :workflowId="route.params.workflowId"
        :persistedType="route.query.persistedType"
        :entityClassName="route.query.entityClassName"
      />
    </keep-alive>

    <keep-alive>
      <ConfigWorkflow
        v-if="layoutMode === 'config'"
        :workflowId="route.params.workflowId"
        :persistedType="route.query.persistedType"
      />
    </keep-alive>
  </div>
</template>

<script setup lang="ts">
import WorkflowForm from "../../components/WorkflowForm.vue";
import {useRoute} from "vue-router";
import TransitionsList from "../../components/TransitionsList.vue";
import ConfigWorkflow from "../../components/ConfigWorkflow.vue";
import {ref} from "vue";
import GraphicalStatemachine from "../../components/GraphicalStatemachine.vue";
import CriteriaList from "../../components/CriteriaList.vue";
import ProcessesList from "../../components/ProcessesList.vue";

const route = useRoute();
const layoutMode = ref<string>("tabular");
</script>

<style scoped lang="scss">
.workflow-id {
  .layout-mode-wrapper {
    text-align: center;

    svg {
      font-size: 22px;
    }
  }
}
</style>
