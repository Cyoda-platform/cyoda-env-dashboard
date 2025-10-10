<template>
  <div>
    <div class="row">
      <div class="name">Entity Null If Parent Null Time:</div>
      <div class="value">
        {{ data.entityNullIfParentNullTime }}
      </div>
    </div>
    <div class="row">
      <div class="name">Fulfill Column Values And Get Entity Time:</div>
      <div class="value">
        {{ data.fulfillColumnValuesAndGetEntityTime }}
      </div>
    </div>
    <div class="row">
      <div class="name">Fulfill Entity And Unique Column Values Time:</div>
      <div class="value">
        {{ data.fulfillEntityAndUniqueColumnValuesTime }}
      </div>
    </div>
    <div class="row">
      <div class="name">Fulfill Relations Time:</div>
      <div class="value">
        {{ data.fulfillRelationsTime }}
      </div>
    </div>
    <div class="row">
      <div class="name">New Entities Count:</div>
      <div class="value">
        {{ data.newEntitiesCount }}
      </div>
    </div>
    <div class="row">
      <div class="name">Update Entities Count:</div>
      <div class="value">
        {{ data.updateEntitiesCount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    default: () => {
      return {};
    }
  }
});
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 0;
  border: 1px solid #dfe6ec;

  .name {
    padding: 5px;
    margin-right: 10px;
    background: #eef1f6;
    min-width: 200px;
  }
}
</style>
