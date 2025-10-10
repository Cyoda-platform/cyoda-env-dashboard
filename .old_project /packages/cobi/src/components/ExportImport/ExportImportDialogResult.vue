<template>
  <div class="export-import-dialog-result">
    <div v-if="typeof instance.name === 'string'">
      {{ instance.name }}
    </div>
    <div v-else>
      <div v-for="(name, index) in instance.name" :key="index" class="names-list">{{ index + 1 }}) {{ name }}<br /></div>
    </div>
    <div class="result-box">
      <template v-if="instance.isSuccess === true">
        <el-tag type="success">Success</el-tag>
      </template>
      <template v-if="instance.isSuccess === false">
        <el-tag type="danger">Fail</el-tag>
        <el-popover placement="top-start" title="Error" width="400" trigger="click">
          <template>
            <div v-if="typeof instance.errorDesc === 'string'">
              {{ instance.errorDesc }}
            </div>
            <div v-else>
              <ol>
                <li v-for="(msg, index) in instance.errorDesc" :key="index">
                  {{ msg }}
                </li>
              </ol>
            </div>
          </template>
          <template #reference>
          <el-button size="default" circle>
            <font-awesome-icon icon="info" />
          </el-button>
          </template>
        </el-popover>
        <template v-if="instance._solveProblemFn">
          <el-tooltip :show-after="1000" class="item" effect="dark" content="Try to solve problem" placement="top">
            <el-button :disabled="instance.isSolveLoading" @click="solveProblem" type="primary" size="default" circle>
              <font-awesome-icon :pulse="instance.isSolveLoading" icon="sync-alt" />
            </el-button>
          </el-tooltip>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";
import { onMounted } from "vue";

const props = defineProps({
  instance: {
    default: {}
  }
});

onMounted(() => {
  props.instance.doImport();
});

function solveProblem() {
  ElMessageBox.confirm(props.instance.getSolveProblemMessage() || 'You have same item in system. If you press "Confirm" system will replace exist item by new. Continue?', "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        props.instance.doSolveProblem();
      }
    }
  });
}
</script>

<style lang="scss">
.export-import-dialog-result {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dedede;

  .export-import {
    display: inline-block;
    margin-left: 10px;
  }

  .el-button.is-circle {
    width: 30px;
    height: 30px;
    margin-left: 10px;
    line-height: 0;
  }

  .result-box {
    white-space: nowrap;
    margin-left: 10px;
  }

  .names-list {
    margin-bottom: 5px;
  }

  /*.wrap-info {*/
  /*  display: inline-block;*/
  /*  width: 25px;*/
  /*  height: 25px;*/
  /*  line-height: 20px;*/
  /*  border-radius: 100%;*/
  /*  border: 1px solid rgba(20, 135, 81, 0.5);*/
  /*  background-color: rgba(20, 135, 81, 0.5);*/
  /*  margin-left: 10px;*/
  /*  font-size: 12px;*/
  /*  text-align: center;*/
  /*  svg{*/
  /*    color: #148751;*/
  /*  }*/
  /*}*/
}
</style>
