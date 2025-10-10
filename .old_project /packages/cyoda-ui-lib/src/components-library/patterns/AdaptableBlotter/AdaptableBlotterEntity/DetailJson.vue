<template>
  <el-row class="entity-detail-info" :gutter="20">
    <el-col class="wrap-message">
      <h4>Meta</h4>
      <div v-if="entityData">
        <pre :class="codeObjMeta.class"><code :class="codeObjMeta.class" v-html="codeObjMeta.code"></code></pre>
      </div>
      <hr/>
      <h4>Data</h4>
      <div v-if="entityData">
        <pre :class="codeObjData.class"><code :class="codeObjData.class" v-html="codeObjData.code"></code></pre>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from "vue";
import * as api from "../../../../api";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

import beautify from "js-beautify";

const props = defineProps({
  id: {
    default: ""
  },
  requestClass: {
    default: ""
  },
});

const entityData = ref(null);

onMounted(() => {
  loadEntity();
})

async function loadEntity() {
  const {data} = await api.getEntityById(props.id);
  entityData.value = data;
}

const codeObjMeta = computed(() => {
  const data = beautify.js(JSON.stringify(entityData.value.meta).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
  return {
    class: "language-javascript",
    code: Prism.highlight(data, Prism.languages.javascript, "javascript")
  };
});

const codeObjData = computed(() => {
  const data = beautify.js(JSON.stringify(entityData.value.data).trim(), {
    indent_size: 2,
    space_in_empty_paren: true,
    wrap_line_length: 50
  });
  return {
    class: "language-javascript",
    code: Prism.highlight(data, Prism.languages.javascript, "javascript")
  };
});
</script>

<style lang="scss" scoped>
.entity-detail-info {
  .wrap-message,
  .wrap-info {
    pre {
      left: 0;
      right: 0;
      width: 100%;
      overflow: visible;
      resize: none;
      white-space: pre-wrap;
    }

    p {
      margin-bottom: 10px;

      .name {
        font-weight: bold;
        display: inline-block;
        width: 150px;
      }
    }

    h4 {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 15px;
    }
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    li.name {
      font-weight: bold;
      margin-top: 10px;
      margin-bottom: 5px;
    }
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .wrap-form {
      white-space: nowrap;
    }
  }
}
</style>
