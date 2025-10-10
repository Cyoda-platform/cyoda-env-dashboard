<template>
  <GSMap :workflowId="workflowId" :positionsMap="positionsMap" :transitionsList="transitionsList"
         :criteriaList="criteriaList" :processesList="processesList"
         @updatePositionsMap="emit('updatePositionsMap', $event)">
    <template #panel="slotProps">
      <GSPanel @resetPositions="slotProps.resetPositions" @toggleProcesses="slotProps.toggleProcesses"
               @toggleCriteria="slotProps.toggleCriteria" @toggleTitles="slotProps.toggleTitles"
               @toggleEdgesTitles="slotProps.toggleEdgesTitles"
               @toggleListOfTransitions="slotProps.toggleListOfTransitions" v-bind="slotProps"/>
    </template>
    <template #selected="slotProps">
      <slot name="selected" v-bind="slotProps"></slot>
    </template>
    <template #map-controls="slotProps">
      <GSMapControls @fitGraph="slotProps.fitGraph" @zoomIn="slotProps.zoomIn" @zoomOut="slotProps.zoomOut"
                     @panLeft="slotProps.panLeft" @panRight="slotProps.panRight" @panTop="slotProps.panTop"
                     @panBottom="slotProps.panBottom" @toggleFullscreen="slotProps.toggleFullscreen"
                     @createTransition="slotProps.createTransition" :isFullscreen="slotProps.isFullscreen"/>
    </template>
    <template #gf-transitions-list="slotProps">
      <GSTransitionsList
        v-show="slotProps.showListOfTransitions"
        :workflowId="props.workflowId"
        :persistedType="props.persistedType"
        :entityClassName="props.entityClassName"
      />
    </template>
    <template #map-legend>
      <GSLegend/>
    </template>
  </GSMap>
</template>

<script setup lang="ts">
import GSMap from "../GraphicalStatemachineMap/GraphicalStatemachineMap.vue";
import GSTransitionsList from "../GraphicalStatemachineTransitionsList/GraphicalStatemachineTransitionsList.vue";
import GSPanel from "../GraphicalStatemachinePanel/GraphicalStatemachinePanel.vue";
import GSMapControls from "../GraphicalStatemachineMapControls/GraphicalStatemachineMapControls.vue";
import GSLegend from "../GraphicalStatemachineLegend/GraphicalStatemachineLegend.vue";

const props = defineProps({
  processesList: {type: Array, required: true},
  criteriaList: {type: Array, required: true},
  transitionsList: {type: Array, required: true},
  positionsMap: {type: [Object, null], default: null},
  workflowId: {type: String, default: ""},
  entityClassName: {type: String, default: ""},
  persistedType: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(['emit']);
</script>
