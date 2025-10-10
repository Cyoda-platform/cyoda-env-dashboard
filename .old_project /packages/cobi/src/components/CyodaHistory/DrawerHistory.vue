<template>
  <div>
    <el-drawer title="History" append-to-body v-model="drawerVisiable" direction="rtl">
      <DrawerHistoryItem v-for="(item, index) in cobiConfigVersions" @select="onSelect" :item="item" :key="index"
                         :users="users" :isSelected="item.timeId === selectedTimeId"/>
    </el-drawer>

    <DialogHistoryAction ref="dialogHistoryActionRef" @setNewConfig="onSetNewConfig" @showChanges="onShowChanges"/>

    <DialogHistoryCompare ref="dialogHistoryCompareRef" @setNewConfig="onSetNewConfig" :oldVal="oldVal"
                          :newVal="newVal"/>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from "vue";

import {usersList} from "@cyoda/ui-lib/src/api";
import DrawerHistoryItem from "./DrawerHistoryItem.vue";
import DialogHistoryCompare from "./DialogHistoryCompare.vue";
import DialogHistoryAction from "./DialogHistoryAction.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {ElMessageBox} from "element-plus";

const props = defineProps({
  dataDto: {
    default: () => {
      return {};
    }
  },
  getHistory: undefined,
  getHistoryByTimeUid: undefined
});
const oldVal = computed(() => {
  return props.dataDto;
});

const dialogHistoryCompareRef = ref(null);

const dialogHistoryActionRef = ref(null);

const drawerVisiable = ref<boolean>(false);

let cobiConfigVersions = ref([]);
let users = ref([]);

const selectedTimeId = ref(null);
const lastSelectedTimeId = ref(null);

const newVal = ref(null);

onMounted(async () => {
  const {data: cobiConfigVersionsData} = await props.getHistory(props.dataDto.id);
  cobiConfigVersions.value = cobiConfigVersionsData.reverse();
  selectedTimeId.value = cobiConfigVersions.value[0].timeId;

  const userIds = cobiConfigVersions.value.map((el) => el.userId);

  const {data: usersValue} = await usersList(userIds);
  users.value = usersValue;
});

async function onSelect(item) {
  const {data} = await props.getHistoryByTimeUid({
    id: props.dataDto.id,
    timeId: item.timeId
  });
  if (JSON.stringify(data) !== JSON.stringify(oldVal.value)) {
    newVal.value = data;
    lastSelectedTimeId.value = item.timeId;
    if(!newVal.value){
      ElMessageBox.alert('Can not be restored. This was action to remove entity', 'Warning');
      return;
    }
    dialogHistoryActionRef.value.dialogVisible = true;
  }
}

function onSetNewConfig() {
  eventBus.$emit("setNewConfig", newVal.value);
  selectedTimeId.value = lastSelectedTimeId.value;
  dialogHistoryActionRef.value.dialogVisible = false;
  dialogHistoryCompareRef.value.dialogVisible = false;
  drawerVisiable.value = false;
}

function onShowChanges() {
  dialogHistoryCompareRef.value.dialogVisible = true;
}

defineExpose({drawerVisiable, cobiConfigVersions, users});
</script>
