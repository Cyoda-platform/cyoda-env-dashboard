<template>
  <div class="data-source-config-dialog-result-tabs-statistics">
    <template v-for="(statistic, index) in data">
      <h3>Statistic: № {{ index + 1 }}</h3>

      <template v-for="key in Object.keys(statistic)">
        <div class="row">
          <div class="name">{{ key }}:</div>
          <div class="value">
            {{ statistic[key] }}
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    default: () => {
      return [];
    }
  }
});
</script>

<style lang="scss">
.data-source-config-dialog-result-tabs-statistics {
  h3 {
    margin: 10px 0;
  }
  .row {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    padding: 0;
    border: 1px solid #dfe6ec;

    .name {
      padding: 5px;
      margin-right: 10px;
      background: #eef1f6;
      min-width: 350px;
    }
  }
}
</style>
