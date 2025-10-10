<template>
  <div class="card">
    <div class="card-body">
      <data-tables :data="stateMachineEvents" style="width: 100%">
        <el-table-column label="State Machine Event Type" prop="event.type" />
        <el-table-column label="Transaction Id" width="320px" prop="event.transactionId">
          <template v-slot:default="scope">
            <router-link :to="`/processing-ui/nodes/${route.params.name}/transaction/${scope.row.event.transactionId}`">
              {{ scope.row.event.transactionId }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Current State" prop="event.state" />
        <el-table-column label="Message" prop="message" />
      </data-tables>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route=useRoute();
const props = defineProps({ stateMachineEvents: { default: () => [] } });
</script>
