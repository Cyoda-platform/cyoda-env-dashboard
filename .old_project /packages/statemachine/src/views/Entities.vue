<template>
  <div class="statemachine-entities">
    <div class="wrap-table">
      <el-form :model="form" label-width="auto">
        <el-input size="large" class="input" v-model="form.search" placeholder="Search by name...">
          <template #prepend>
            <font-awesome-icon :icon="['fas', 'search']"/>
          </template>
        </el-input>
      </el-form>
      <el-table style="width: 100%" class="entities-table" :data="tableData" :show-header="false">
        <el-table-column prop="label">
          <template #default="{row}">
            <router-link class="link" :to="row.link">{{ row.label }}</router-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">

import {useStatemachineStore} from "../stores/statemachine";
import {computed, reactive, ref} from "vue";
import _ from "lodash";

const statemachineStore = useStatemachineStore();
const dataServer = ref([]);

const form = reactive({
  search: ""
})

async function loadData() {
  const {data} = await statemachineStore.getWorkflowEnabledTypes();
  dataServer.value = data;
}

loadData();

const tableData = computed(() => {
  let data = dataServer.value.map((el) => {
    return {
      label: el.split('.').pop(),
      link: `/statemachine/workflows?entityClassName=${el}`
    }
  });

  data = data.filter((el) => {
    return !form.search || el.label.toLowerCase().includes(form.search.toLowerCase());
  });
  return _.sortBy(data, [function (o) {
    return o.label;
  }]);
})

</script>

<style lang="scss">
.statemachine-entities {
  .wrap-table {
    max-width: 540px;
    border: 1px solid rgb(235, 238, 245);
    border-radius: 10px;
    overflow: hidden;

    td {
      padding: 0;
    }
  }

  .input .el-input__wrapper {
    box-shadow: none;
    border-bottom: 1px solid rgb(235, 238, 245);;
  }

  .input .el-input-group__prepend {
    box-shadow: none;
    border-radius: 0;
  }

  .wrap-table .el-table__row:last-child td {
    border: none !important;
  }

  .wrap-table .el-table__inner-wrapper::before {
    display: none;
  }

  .link {
    color: #000;
    text-decoration: none;
    display: block;
    padding: 12px 0;
  }
}
</style>
