<template>
  <div class="graphical-statemachine-map-controls">
    <el-button @click="emit('fitGraph')" class="fit-graph" circle title="Fit graph">
      <font-awesome-icon icon="up-right-and-down-left-from-center"/>
    </el-button>
    <br/>
    <el-button @click="emit('zoomIn')" class="zoom-in" title="Zoom in" circle>
      <font-awesome-icon icon="plus"/>
    </el-button>
    <el-button @click="emit('zoomOut')" class="zoom-out" title="Zoom out" circle>
      <font-awesome-icon icon="minus"/>
    </el-button>
    <el-button @click="emit('panLeft')" class="move-left" title="Move left" circle>
      <font-awesome-icon icon="chevron-left"/>
    </el-button>
    <el-button @click="emit('panTop')" class="move-up" title="Move up" circle>
      <font-awesome-icon icon="chevron-up"/>
    </el-button>
    <el-button @click="emit('panRight')" class="move-right" title="Move right" circle>
      <font-awesome-icon icon="chevron-right"/>
    </el-button>
    <el-button @click="emit('panBottom')" class="move-down" title="Move down" circle>
      <font-awesome-icon icon="chevron-down"/>
    </el-button>
    <!--    <el-button @click="emit('toggleFullscreen')" class="fullscreen" :icon-before="isFullscreen ? 'fullscreen-off' : 'fullscreen-on'" mode="secondary" :aria-label="isFullscreen ? 'Fullscreen off' : 'Fullscreen on'" :aria-pressed="JSON.stringify(isFullscreen)" :title="isFullscreen ? 'Fullscreen off' : 'Fullscreen on'" icon-only />-->
    <el-button v-if="isAvailbaleAddButton" @click="emit('createTransition')" type="primary" class="create-transition"
               title="Create transition"> Add
    </el-button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isFullscreen: {type: Boolean, default: false},
  isAvailbaleAddButton: {type: Boolean, default: true}
});
const emit = defineEmits(['fitGraph', 'zoomIn', 'zoomOut', 'panLeft', 'panTop', 'panRight', 'panBottom', 'toggleFullscreen', 'createTransition']);
</script>

<style lang="scss">
.graphical-statemachine-map-controls {

  width: 110px;
  height: 330px;
  padding-bottom: 50px;
  position: relative;
  text-align: center;

  //.el-button {
  //  margin: 0 !important;
  //}

  //button {
  //  margin: 5px;
  //}

  .fit-graph {
    position: absolute;
    top: 5px;
    left: 50%;
    margin: 0;
    margin-left: -20px;
  }

  .zoom-in {
    position: absolute;
    top: 45px;
    left: 5px;
    margin: 0;
  }

  .zoom-out {
    position: absolute;
    top: 45px;
    right: 5px;
    margin: 0;
  }

  .move-up {
    position: absolute;
    top: 125px;
    left: 50%;
    margin: 0;
    margin-left: -20px !important;
  }

  .move-left {
    position: absolute;
    top: 155px;
    left: 5px;
    margin: 0 !important;
  }

  .move-right {
    position: absolute;
    top: 155px;
    right: 5px;
    margin: 0 !important;
  }

  .move-down {
    position: absolute;
    top: 185px;
    left: 50%;
    margin: 0;
    margin-left: -20px !important;
  }

  .fullscreen {
    position: absolute;
    bottom: 60px;
    left: 50%;
    margin-left: -20px;
  }

  .create-transition {
    bottom: 10px;
    position: absolute;
    left: 50%;
    width: 68px;
    margin-left: -34px !important;
  }

  .el-button.is-circle {
    border-color: transparent;
    transition: border-color 0.5s;
    &:hover {
      border-color: rgb(198, 226, 255);
    }
  }
}
</style>
