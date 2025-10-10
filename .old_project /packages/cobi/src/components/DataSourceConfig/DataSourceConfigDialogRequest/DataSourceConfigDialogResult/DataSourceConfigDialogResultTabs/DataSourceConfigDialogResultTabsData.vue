<template>
  <div class="data-source-config-dialog-result-tabs-data">
    <div class="filter">
      <el-input placeholder="Filter" v-model="form.filter"></el-input>
    </div>
    <data-tables :data="tableData" style="width: 100%">
      <el-table-column v-for="header in headers" :key="header.prop" :prop="header.prop" min-width="200"
                       :label="header.label">
        <template v-slot:default="{ row }">
          <ReportTableCell @showDetails="onShowDetails" :row="row" :prop="header.prop"/>
        </template>
      </el-table-column>
    </data-tables>
    <AdaptableBlotterColumnCollections ref="adaptableBlotterColumnCollectionsRef"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import AdaptableBlotterColumnCollections
  from "@cyoda/ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterColumnCollections.vue";
import ReportTableCell from "@cyoda/http-api/src/components/ReportTable/ReportTableCell.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

const props = defineProps({
  data: {
    default: () => {
      return [];
    }
  }
});
const tableData = computed(() => {
  if (!form.value.filter) return props.data;
  return props.data.filter((el) => {
    return Object.values(el).filter((val) => val.toString().toLowerCase().indexOf(form.value.filter.toLowerCase()) > -1).length > 0;
  });
});
const headers = computed(() => {
  return Object.keys(props.data[0]).map((el) => {
    return {
      prop: el,
      label: el
    };
  });
});

let form = ref({
  filter: ""
});

const adaptableBlotterColumnCollectionsRef = ref(null);

function onClickColumnCollections(prop: string, row: any) {
  const headerName: string = prop.split(".").shift()!;
  if (headerName) {
    eventBus.$emit("column-collections:show-detail", {
      data: row[headerName],
      headerName: prop
    });
  }
}

function onShowDetails(data) {
  console.log(data);
  adaptableBlotterColumnCollectionsRef.value.showDetail(data);
}
</script>

<style scoped lang="scss">
.filter {
  margin-bottom: 15px;
}
</style>
