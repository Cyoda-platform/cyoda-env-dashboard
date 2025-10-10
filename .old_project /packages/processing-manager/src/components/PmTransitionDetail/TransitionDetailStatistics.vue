<template>
  <div class="card">
    <div class="card-header">Statistics</div>
    <div class="card-body">
      <ul>
        <li class="name">Transaction ID</li>
        <li>{{ transactionInfoView.id }}</li>
        <li class="name">Transaction Status</li>
        <li>{{ transactionInfoView.status }}</li>
        <li class="name">Transaction Submit Node Id</li>
        <li>{{ transactionInfoView.transactionSubmitNodeId }}</li>
        <li class="name">User</li>
        <li>{{ transactionInfoView.owner }}</li>
        <li class="name">Shard(uuid)</li>
        <li>{{ shardUUID }}</li>
        <li class="name">Consistency Time</li>
        <li>{{ $filters.dateTime(transactionInfoView.transactionConsistencyTime) }}</li>
        <li class="name">Create time</li>
        <li>{{ $filters.dateTime(transactionInfoView.createTime) }}</li>
        <li class="name">Submit time</li>
        <li>{{ $filters.dateTime(transactionInfoView.submitTime) }}</li>
        <li class="name">Finish time</li>
        <li>{{ $filters.dateTime(transactionInfoView.finishTime) }}</li>
        <li class="name">Prepare duration</li>
        <li>{{ $filters.countdown(transactionInfoView.prepareTimeMillis) }}</li>
        <li class="name">Process duration</li>
        <li>{{ $filters.countdown(transactionInfoView.processTimeMillis) }}</li>
        <li class="name">Second Phase Finished Flag</li>
        <li>{{ $filters.boolean(transactionInfoView.secondPhaseFinished) }}</li>
        <li class="name">Transaction Succeeded Flag</li>
        <li>{{ $filters.boolean(transactionInfoView.transactionSucceeded) }}</li>
        <li class="name">Parent Transactions</li>
        <li>
          <template v-for="(parentTransactionId, index) in parentTransactionIds"> {{ index + 1 }}) {{ parentTransactionId }}<br /> </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref } from "vue";
import {useProcessingStore} from "../../stores/processing";

const route = useRoute();
const processingStore = useProcessingStore();
function transactionsView(value) {
  return processingStore.transactionsView(value);
}

let transactionInfoView = ref({});

const shardString = ref<string>("");

const shardUUID = ref<string>("");

let parentTransactionIds = ref([]);

loadData();

async function loadData() {
  const { data } = await transactionsView({
    id: route.params.transactionId
  });
  transactionInfoView.value = data.transactionInfoView;
  shardString.value = data.shardString;
  shardUUID.value = data.shardUUID;
  parentTransactionIds.value = data.parentTransactionIds;
}
</script>

<style scoped lang="scss">
.card-body ul {
  list-style: none;
  margin: 0;
  padding: 0;

  li.name {
    font-weight: bold;
    margin-top: 10px;
  }
}
</style>
