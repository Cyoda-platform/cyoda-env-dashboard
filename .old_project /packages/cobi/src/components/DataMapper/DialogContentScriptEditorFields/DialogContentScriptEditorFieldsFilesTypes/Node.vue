<template>
  <div class="dialog-content-script-editor-fields-files-node">
    <div class="row" @click="onClick" :class="rowType">
      <div class="icon" :class="iconClass">
        <font-awesome-icon :icon="icon"/>
      </div>
      <div class="label">
        {{ node.label }}
        <el-link class="link-show-usage-dialog" @click="onClickShowUsage" type="info" v-if="isExistUsageCount">
          <small class="usage-count"> usage count: {{ node.usageCount }} </small>
        </el-link>
      </div>
      <div v-if="node.type === 'folder'" class="actions">
        <el-tooltip class="item" :show-after="1000" effect="dark" content="Rename" placement="top">
          <el-button @click.stop="onRenameScript" link>
            <font-awesome-icon icon="r"/>
          </el-button>
        </el-tooltip>
        <el-tooltip class="item" :show-after="1000" effect="dark" :content="getDeleteMessage(node)" placement="top">
          <el-button :disabled="node.usageCount > 0" @click.stop="onDeleteVersion" link>
            <font-awesome-icon icon="trash"/>
          </el-button>
        </el-tooltip>
      </div>
      <div v-if="node.type === 'file'" class="actions">
        <el-tooltip class="item" :show-after="1000" effect="dark" content="Activate / Deactivate Script"
                    placement="top">
          <el-checkbox @click.stop @change="onCheckBox" class="checkbox-script" :model-value="form.checked"/>
        </el-tooltip>
        <el-tooltip class="item" :show-after="1000" effect="dark" content="Copy" placement="top">
          <el-button @click.stop="onCopy" link>
            <font-awesome-icon icon="copy"/>
          </el-button>
        </el-tooltip>
        <el-tooltip class="item" :show-after="1000" effect="dark" content="Edit" placement="top">
          <el-button @click.stop="onEdit" link>
            <font-awesome-icon icon="pencil"/>
          </el-button>
        </el-tooltip>
        <el-tooltip class="item" :show-after="1000" effect="dark" content="Rename" placement="top">
          <el-button @click.stop="onRenameScript" link>
            <font-awesome-icon icon="r"/>
          </el-button>
        </el-tooltip>
        <el-tooltip class="item" :show-after="1000" effect="dark" :content="getDeleteMessage(node)" placement="top">
          <el-button :disabled="node.usageCount > 0" @click.stop="onDeleteVersion" link>
            <font-awesome-icon icon="trash"/>
          </el-button>
        </el-tooltip>
      </div>
      <div v-if="node.type === 'version'" class="actions">
        <el-tooltip class="item" :show-after="1000" effect="dark" content="Activate / Deactivate Script"
                    placement="top">
          <el-checkbox @change="onCheckBox" class="checkbox-script" v-model="form.checked"/>
        </el-tooltip>
        <el-tooltip class="item" :show-after="1000" effect="dark" content="View" placement="top">
          <el-button @click.stop="onViewVersion" link>
            <font-awesome-icon icon="eye"/>
          </el-button>
        </el-tooltip>
        <el-tooltip class="item" :open-delay="1000" effect="dark" :content="getDeleteMessage(node)" placement="top">
          <el-button :disabled="node.usageCount > 0" @click.stop="onDeleteVersion" link>
            <font-awesome-icon icon="trash"/>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <template v-if="hasChildren && isOpen">
      <Node class="node-child" v-for="(nodeChildren, index) in node.children" :key="`${node.label}${index}`"
            :node="nodeChildren" :script="script"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onBeforeUnmount} from "vue";

import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";
import {ElMessageBox} from "element-plus";

const props = defineProps({
  node: {
    default: () => {
      return {}
    }
  },
  script: {
    default: () => {
      return {};
    },
  }
});
const icon = computed(() => {
  if (props.node.type === "folder" && isOpen.value) {
    return "folder-open";
  } else if (props.node.type === "folder") {
    return "folder";
  } else if (props.node.type === "file") {
    return "file";
  }
  return "code-compare"
})
const iconClass = computed(() => {
  const iconClass = {};
  let containsValue = false;
  if (['folder', 'file'].includes(props.node.type)) {
    // const allVersions = props.node.script.versions.map((el) => el.id);
    // containsValue = allVersions.some(value => props.script.reusableScripts.includes(value));
    const text = JSON.stringify(props.node);
    containsValue = props.script.reusableScripts.some((el) => text.includes(el))
  } else if (['version'].includes(props.node.type)) {
    containsValue = props.script.reusableScripts.includes(props.node.id);
  }

  iconClass["icon-used"] = containsValue
  return iconClass;
})
const rowType = computed(() => {
  return `row-${props.node.type}`
})
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
})
const defaultVersion = computed(() => {
  let defaultVersion = props.node.script.versions.find((el) => el.isDefault);
  if (!defaultVersion) {
    const lengthScripts = props.node.script.versions.length;
    defaultVersion = props.node.script.versions[lengthScripts - 1];
  }
  return defaultVersion;
})
const usedVersion = computed(() => {
  const version = props.node.script.versions.find(version => props.script.reusableScripts.includes(version.id));
  if (version) {
    return version;
  }
  return defaultVersion.value;
})
const isExistUsageCount = computed(() => {
  return props.node && props.node.usageCount > 0 && props.node.links && props.node.links.length > 0;
})


let form = ref({
  checked: false,
});

const isOpen = ref<boolean>(false);
eventBus.$on('scripts:check-box', setCheckboxEvent);

onBeforeUnmount(() => {
  eventBus.$off('scripts:check-box', setCheckboxEvent);
});


function onClick() {
  if (!hasChildren.value) return;
  isOpen.value = !isOpen.value;
}

function onViewVersion() {
  eventBus.$emit('scripts:view', props.node.id)
}

function onDeleteVersion() {
  eventBus.$emit('scripts:delete', props.node)
}

function onEdit() {
  const version = usedVersion.value;
  eventBus.$emit('scripts:edit', version.id);
}

function onClickShowUsage() {
  eventBus.$emit('scripts:show-usage', props.node.links);
}

function onRenameScript() {
  // let inputValue = props.node.script.name;
  // if (props.node.type === 'folder' && props.node.label) inputValue = props.node.label
  let inputValue = props.node.label;
  ElMessageBox.prompt('Please input new name', 'Rename', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    closeOnClickModal: false,
    inputValue,
    // @ts-ignore
  }).then(({value}) => {
    let oldName = inputValue
    let newName = value.replaceAll('/', '-');
    oldName = props.node.currentFolder;
    const folders = props.node.currentFolder.split('.');
    folders.pop();
    folders.push(newName);
    newName = folders.join('.');

    eventBus.$emit('scripts:rename', {
      oldName,
      newName
    });
  });
}

function onCopy() {
  const version = usedVersion.value;
  eventBus.$emit('scripts:copy', version.id)
}

function onCheckBox(value) {
  props.script.reusableScripts = props.script.reusableScripts.filter((id) => {
    return !props.node.script.versions.some(version => version.id === id);
  })
  if (value) {
    if (props.node.type === "version") {
      props.script.reusableScripts.push(props.node.id);
    } else if (props.node.type === "file") {
      props.script.reusableScripts.push(defaultVersion.value.id);
    }
  }
}

function setCheckboxEvent(versionId) {
  if (props.node.type !== "version" || props.node.id !== versionId) return;
  onCheckBox(true);
}


function getDeleteMessage(node) {
  return node.usageCount == 0 ? "Delete" : `Button is disabled and is used in ${node.usageCount} places`;
}


watch(() => props.script.reusableScripts, (value) => {
  form.value.checked = false;
  if (props.node.type === "version") {
    form.value.checked = value.includes(props.node.id);
  } else if (props.node.type === "file") {
    form.value.checked = value.some(reusableScript => props.node.script.versions.find(version => version.id === reusableScript));
  }
}, {immediate: true});
</script>

<style lang="scss">
.dialog-content-script-editor-fields-files-node {
  .row {
    display: flex;
    padding: 10px;
    //&.row-version{
    //  border-bottom: 1px solid #dedede;
    //}

    .icon {
      margin-right: 10px;

      &.icon-used {
        color: #67c23a;
      }
    }

    .actions {
      margin-left: auto;
      border-left: 1px solid #dedede;
      padding-left: 10px;
      margin-bottom: 0;

      button {
        padding: 0;
        color: #606266;
        height: auto;
      }

      button[disabled] {
        opacity: 0.5;
      }

      .checkbox-script {
        margin-right: 10px;
        height: auto;
        position: relative;
        top: 4px;
      }
    }

    .action-point {
      display: inline-block;
      width: 16px;
      height: 16px;
      text-align: center;
      line-height: 16px;
      background: #909399;
      color: #fff;
      border-radius: 2px;
      font-size: 12px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.5s;

      &-active {
        background: #67c23a;
      }
    }

    .usage-count {
      color: #b0b0b0;
    }

    .link-show-usage-dialog {
      &:after {
        display: none;
      }

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .row:hover {
    background-color: #f5f7fa;
  }

  .node-child {
    margin-left: 10px;
  }
}
</style>
