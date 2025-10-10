<template>
  <div>
    <div class="title">
      <template v-if="'processId' in row"> <strong>Process ID:</strong> {{ row.processId }} </template>
      <template v-if="'transitionId' in row"> <strong>Transition ID:</strong> {{ row.transition }} </template>
      <template v-if="'workflowId' in row"> <strong>WorkflowId:</strong> {{ row.workflowId }} </template>
    </div>

    <div class="body">
      <div v-if="'unknownCriterias' in row && row.unknownCriterias.length > 0">
        <strong>Unknown Criterias:</strong>
        <ol>
          <li v-for="text in row.unknownCriterias">
            {{ text }}
          </li>
        </ol>
      </div>
      <div v-if="'unknownParams' in row && row.unknownParams.length > 0">
        <strong>Unknown Params:</strong>
        <ol>
          <li v-for="text in row.unknownParams">
            {{ text }}
          </li>
        </ol>
      </div>
      <div v-if="'unknownWorkflows' in row && row.unknownWorkflows.length > 0">
        <strong>Unknown Workflows:</strong>
        <ol>
          <li v-for="text in row.unknownWorkflows">
            {{ text }}
          </li>
        </ol>
      </div>
      <div v-if="'unknownStates' in row && row.unknownStates.length > 0">
        <strong>Unknown Stated:</strong>
        <ol>
          <li v-for="text in row.unknownStates">
            {{ text }}
          </li>
        </ol>
      </div>
      <div v-if="'unknownProcessIds' in row && row.unknownProcessIds.length > 0">
        <strong>Unknown Process IDs:</strong>
        <ol>
          <li v-for="text in row.unknownProcessIds">
            {{ text }}
          </li>
        </ol>
      </div>
      <div v-if="'unknownTransitions' in row && row.unknownTransitions.length > 0">
        <strong>Unknown Transitions:</strong>
        <ol>
          <li v-for="text in row.unknownTransitions">
            {{ text }}
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.title {
  margin-top: 15px;
  font-size: 16px;
}
.body > div {
  margin-top: 10px;
}
ol {
  padding: 0;
  padding-left: 25px;
  margin: 0;
}
strong {
  display: block;
  margin-bottom: 5px;
}
</style>
