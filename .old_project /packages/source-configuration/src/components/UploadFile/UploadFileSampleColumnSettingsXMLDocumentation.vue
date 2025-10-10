<template>
  <div>
    <el-drawer append-to-body class="upload-file-sample-column-settings-xml-documentation" size="700px" :title="computedTitle" v-model="drawerVisible" direction="rtl">
      <div class="inner">
        Field <code>Xml Base XPath</code> will looks like- <strong>/records/record</strong><br />
        <h3>Example for fill field from XML</h3>
        <h4>technicalRecordId</h4>
        <code>Xml Column XPath</code>- <strong>/ID</strong><br />
        <code>Xml Column Name</code>- you can enter any name. We set <strong>ID</strong><br />
        <code>Alias</code>- Please select alias for technicalRecordId. In DEMO example it will be <strong>technicalRecordId Alias</strong><br />
        <code>Mapper Class</code>- Please select any mapper. For example
        <strong>TrimmedStringMapper</strong>

        <div class="flex space-between">
          <div>
            <h3>Example file</h3>
          </div>
          <div>
            <el-button @click="onDownloadFile" type="success">
              Download file
              <font-awesome-icon icon="download" />
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import fileXml from "!raw-loader!./Docs/SFTR_Example.xml";
import { saveAs } from "file-saver";

const props = defineProps({
  docMapper: {
    default: () => {
      return {};
    }
  }
});
const computedTitle = computed(() => {
  return `Documentation for Xml`;
});

const drawerVisible = ref<boolean>(false);

function onDownloadFile() {
  const blob = new Blob([fileXml], { type: "text/xml;charset=utf-8" });
  saveAs(blob, "SFTR_Example.xml");
}
</script>

<style lang="scss">
.upload-file-sample-column-settings-xml-documentation {
  h3,
  h4 {
    margin-top: 16px;
  }
  .flex.space-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    button {
      position: relative;
      top: 5px;
    }
  }
}
</style>
