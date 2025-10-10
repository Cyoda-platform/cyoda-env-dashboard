<template>
  <div class="legend">
    <figure>
      <div class="icon-state"></div>
      <figcaption>State</figcaption>
    </figure>
    <figure>
      <span class="icon-transition"></span>
      <figcaption>Automated Transition</figcaption>
    </figure>
    <figure>
      <span class="icon-transition-manual"></span>
      <figcaption>Manual Transition</figcaption>
    </figure>
    <figure>
      <span class="icon-transition"></span>
      <span class="icon-criteria"></span>
      <span class="icon-transition"></span>
      <figcaption>Transition with Criteria</figcaption>
    </figure>
    <figure>
      <span class="icon-process-edge"></span>
      <span class="icon-process"></span>
      <figcaption>Process</figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.legend {
  padding: 10px 16px;
}

figure {
  margin: 0;
  display: inline-block;
  margin-right: 24px;
  padding: 5px 0;
}

.icon-state {
  width: 1em;
  height: 1em;
  border-radius: 1em;
  background: rgb(20, 135, 81);
  display: inline-block;
  vertical-align: middle;
}

.icon-transition {
  display: inline-block;
  vertical-align: middle;
  border-top: 5px solid rgb(247, 173, 17);
  width: 2em;
}

.icon-transition-manual {
  display: inline-block;
  vertical-align: middle;
  border-top: 5px dotted rgb(247, 173, 17);
  width: 2em;
}

.icon-criteria {
  display: inline-block;
  vertical-align: middle;
  width: 2em;
  height: 1em;
  background: rgb(249, 253, 253);
  border: 1px solid rgb(204, 204, 204);
}

.icon-process {
  display: inline-block;
  vertical-align: middle;
  background: rgb(243, 246, 255);
  border: 1px solid rgb(204, 204, 204);
  width: 2em;
  height: 1em;
}

.icon-process-edge {
  display: inline-block;
  vertical-align: middle;
  border-top: 5px solid rgb(33, 48, 99);
  width: 2em;
}

figcaption {
  display: inline-block;
  vertical-align: middle;
  margin-left: 0.5em;
}
</style>
