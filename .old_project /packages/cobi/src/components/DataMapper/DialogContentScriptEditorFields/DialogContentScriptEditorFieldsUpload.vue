<template>
  <div ref="rootRef" class="dialog-content-script-editor-fields-upload">
    <el-upload :file-list="fileList" action="#" drag :auto-upload="false" :on-change="onChange" multiple show-file-list>
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        Drop file(s) here or <em>click to upload</em><br />
        You can only upload folders with JS files
        <div v-show="fileList.length > 0" ref="actionsRef" class="actions">
          <el-button @click.stop.prevent="onClearAll" type="primary">Clear all <font-awesome-icon icon="trash" /></el-button>
        </div>
      </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { ref, onMounted } from "vue";

import JSZip from "jszip";

const actionsRef = ref(null);

const rootRef = ref(null);
let fileList = ref([]);

onMounted(() => {
  const input = rootRef.value.querySelector("input");
  // @ts-ignore
  input.setAttribute("webkitdirectory", true);

  moveActions();
});
function moveActions() {
  // @ts-ignore
  const parentDiv = rootRef.value.querySelector("div:first-child");
  const listDiv = rootRef.value.querySelector(".el-upload-list");
  // @ts-ignore
  parentDiv.insertBefore(actionsRef.value, listDiv);
}

async function onChange(fileElement: any, fileListAll) {
  // console.log(fileListAll);
  fileList.value = fileListAll.filter((el) => el.name.includes(".js"));
  fileList.value.forEach((el) => {
    el.name = el.raw.webkitRelativePath;
  });
}

async function getContent() {
  if (fileList.value.length === 0) return "";

  const archive = new JSZip();
  fileList.value.forEach((el) => {
    const file = el.raw;
    archive.file(file.webkitRelativePath, file);
  });

  return await archive.generateAsync({ type: "base64" });
}

function onClearAll() {
  ElMessageBox.confirm("Do you really want to remove all files?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        fileList.value = [];
      }
    }
  });
}

defineExpose({ fileList, getContent });
</script>

<style lang="scss">
.dialog-content-script-editor-fields-upload {
  .el-upload-dragger,
  .el-upload {
    width: 100%;
  }

  .el-upload {
    margin-bottom: 15px;
  }

  .el-upload-list__item-name {
    margin-bottom: 15px;

    &::after {
      display: none;
    }
  }
  .actions {
    text-align: right;
    margin-bottom: 15px;
  }
}
</style>
