<template>
  <div>
    <div class="row">
      <div>
        <el-badge :value="reusableScriptsLength" :hidden="reusableScriptsLength === 0" class="item">
          <h1>Libraries</h1>
        </el-badge>
      </div>
      <div class="btn">
        <el-tooltip class="item" :show-after="1000" effect="dark" content="Add new" placement="top">
          <el-button @click="onCreate('editor')" size="mini" type="primary"
          >Add
            <font-awesome-icon icon="plus"/>
          </el-button>
        </el-tooltip>
        <el-tooltip class="item" :show-after="1000" effect="dark" content="Upload" placement="top">
          <el-button @click="onCreate('upload')" size="mini" type="primary">
            <font-awesome-icon icon="upload"/>
          </el-button>
        </el-tooltip>
        <el-tooltip class="item" :show-after="1000" effect="dark"
                    content="Refreshes the scripting cache for all. Use this in case of cache synch issues"
                    placement="top">
          <el-button @click="onRefresh" size="mini" type="warning">
            <font-awesome-icon :pulse="isLoadingRefresh" icon="rotate"/>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <DialogContentScriptEditorFieldsFilesNpm @created="onCreated"/>
    <el-divider/>

    <template v-if="nodes.length === 0">
      <el-empty :image-size="100" description="No scripts yet"></el-empty>
    </template>
    <template v-for="node in nodes" :key="node.label">
      <Node :node="node" :script="script"/>
    </template>
    <el-divider></el-divider>
    <DialogContentScriptEditorFieldsFilesPopUp @created="onCreated" @updated="onUpdated"
                                               @renameVersion="onRenameVersion"
                                               ref="dialogContentScriptEditorFieldsFilesPopUpRef"/>

    <NodeScriptUsage ref="nodeScriptUsageRef"/>
  </div>
</template>

<script setup lang="ts">
import {ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";
import {ref, computed, onBeforeUnmount} from "vue";

import Node from "./DialogContentScriptEditorFieldsFilesTypes/Node.vue";
import DialogContentScriptEditorFieldsFilesPopUp from "./DialogContentScriptEditorFieldsFilesPopUp.vue";

import _ from "lodash";
import NodeScriptUsage from "./DialogContentScriptEditorFieldsFilesTypes/NodeScriptUsage.vue";
import DialogContentScriptEditorFieldsFilesNpm from "./DialogContentScriptEditorFieldsFilesNpm.vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {useScriptsStore} from "../../../stores/scripts";

const scriptStore = useScriptsStore();
const emit = defineEmits(['data']);
const props = defineProps({
  script: {
    default: () => {
      return {};
    },
  }
});
const route = useRoute();
const nodes = computed(() => {
  let nodesList = [];
  allScripts.value.forEach((el) => {
    nodesList.push(...buildTree(el, nodesList));
  })
  nodesList = _.sortBy(nodesList, [(o) => {
    return typeWeights.value[o.type];
  }]);
  return nodesList;
})
const reusableScriptsLength = computed(() => {
  return props.script.reusableScripts.length;
})
const isVirtual = computed(() => {
  return route.query.virtual === "true";
})

const dialogContentScriptEditorFieldsFilesPopUpRef = ref(null);

const nodeScriptUsageRef = ref(null);


let allScripts = ref([]);
const mode = ref(null);
const isLoadingRefresh = ref<boolean>(false);
eventBus.$on('scripts:view', onView);
eventBus.$on('scripts:delete', onDelete);
eventBus.$on('scripts:edit', onEdit);
eventBus.$on('scripts:copy', onCopy);
eventBus.$on('scripts:show-usage', onShowUsage);
eventBus.$on('scripts:rename', onRename);
loadData();

onBeforeUnmount(() => {
  eventBus.$off('scripts:view', onView);
  eventBus.$off('scripts:delete', onDelete);
  eventBus.$off('scripts:edit', onEdit);
  eventBus.$off('scripts:copy', onCopy);
  eventBus.$off('scripts:show-usage', onShowUsage);
  eventBus.$off('scripts:rename', onRename);
});

function onCreated() {
  loadData();
}

function onUpdated() {
  loadData();
}

function onRenameVersion() {
  loadData();
}

async function loadData() {
  let params = {};
  if (!isVirtual.value) {
    params = {excludeDmc: route.params.id};
  }
  const {data} = await scriptStore.getListAll(params);
  allScripts.value = data.scripts;

  emit('data', data);
}

let typeWeights = ref({
  folder: 1,
  file: 2,
  version: 3
})


function buildTree(el, nodesList) {
  const sections = el.name.split('.');
  const tree = [];
  buildTreeItem(tree, sections, el, nodesList);
  return tree;
}

function buildTreeItem(tree, sections, scriptData, nodesList, currentFolderArr = []) {
  const folderName = sections[0];
  currentFolderArr = [...currentFolderArr, folderName].filter((el) => el);
  if (sections.length === 1) {
    tree.push({
      label: sections[0],
      type: "file",
      script: scriptData,
      usageCount: scriptData.versions.reduce((accumulator, el) => accumulator + el.usageCount, 0),
      currentFolder: currentFolderArr.join('.'),
      children: scriptData.versions.map((el) => {
        return {
          label: el.scriptVersion,
          script: scriptData,
          type: 'version',
          ...el
        }
      })
    })
  } else {
    let element = nodesList.find((el) => el.label === folderName);
    if (element) {
      element.usageCount += scriptData.usageCount;
    } else {
      element = {
        label: folderName,
        type: "folder",
        script: scriptData,
        usageCount: scriptData.usageCount,
        currentFolder: currentFolderArr.join('.'),
        children: []
      };
      tree.push(element);
      Object.assign(tree, _.sortBy(tree, [(o) => {
        return typeWeights.value[o.type];
      }]));
    }
    sections.shift();
    buildTreeItem(element.children, sections, scriptData, element.children, currentFolderArr)
  }
}


function onCreate(typeContent) {
  dialogContentScriptEditorFieldsFilesPopUpRef.value.createAction({typeContent});
}

async function onRefresh() {
  try {
    isLoadingRefresh.value = true;
    await scriptStore.refresh();
    await loadData();
  } finally {
    isLoadingRefresh.value = false;
  }
}

async function onView(versionId) {
  const data = await getDataByVersionId(versionId);
  dialogContentScriptEditorFieldsFilesPopUpRef.value.viewAction(data);
}

function onShowUsage(links) {
  // @ts-ignore
  nodeScriptUsageRef.value.openDialog(links);
}

async function onRename(data) {
  // @ts-ignore
  await scriptStore.renameScript(data);
  loadData();
}

async function onDelete(node) {
  ElMessageBox.confirm("Do you really want to remove record?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        let delatedScriptsIds = [];
        getAllScriptsIds(node, delatedScriptsIds);

        if (node.type === 'folder') {
          await scriptStore.deleteScript(node.currentFolder);
        } else if (node.type === 'file') {
          await scriptStore.deleteScript(node.script.name);
        } else if (node.type === 'version') {
          await scriptStore.deleteVersion(node.id);
        }
        delatedScriptsIds.forEach((id) => {
          props.script.reusableScripts = props.script.reusableScripts.filter((el) => el !== id);
        })
        loadData();
      }
    }
  })
}

function getAllScriptsIds(node, delatedScriptsIds) {
  if (node.id) {
    delatedScriptsIds.push(node.id)
  }
  if (node.hasOwnProperty('children')) node.children.forEach((el) => getAllScriptsIds(el, delatedScriptsIds));
}

async function onEdit(versionId) {
  const data = await getDataByVersionId(versionId);
  if (data) {
    dialogContentScriptEditorFieldsFilesPopUpRef.value.editAction(data);
  } else {
    ElMessage.error('Data not found');
  }
}

async function onCopy(versionId) {
  const data = await getDataByVersionId(versionId);
  if (data) {
    dialogContentScriptEditorFieldsFilesPopUpRef.value.copyAction(data);
  } else {
    ElMessage.error('Data not found');
  }
}

async function getDataByVersionId(versionId: string) {
  const {data: contentScriptData} = await scriptStore.getVersion(versionId);
  for (const script of allScripts.value) {
    for (const version of script.versions) {
      if (version.id === versionId) {
        return {version, script, contentScriptData};
      }
    }
  }
  return {};
}
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .btn {
    margin-left: 20px;
    display: flex;
  }
}
</style>
