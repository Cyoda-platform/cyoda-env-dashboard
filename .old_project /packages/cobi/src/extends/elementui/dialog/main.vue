<template>
  <transition name="dialog-fade" @after-enter="afterEnter" @after-leave="afterLeave">
    <div v-show="visible" class="el-dialog__wrapper cyoda-dialog" @click.self="handleWrapperClick">
      <div role="dialog" :key="key" aria-modal="true" :aria-label="title || 'dialog'" :class="['el-dialog', { 'is-fullscreen': fullscreen, 'el-dialog--center': center }, customClass]" ref="dialog" :style="style">
        <div class="el-dialog__header">
          <slot name="title">
            <span class="el-dialog__title">{{ title }}</span>
          </slot>
          <button type="button" class="el-dialog__headerbtn" aria-label="Close" v-if="showClose" @click="handleClose">
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>
        <div class="el-dialog__body">
          <slot></slot>
        </div>
        <div class="el-dialog__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<!--<script setup>-->
<!--import { onMounted } from "vue";-->
<!-- import ElDialog from "element-plus/lib/dialog";-->

<!--export default {-->
<!--  name: "CyodaDialog",-->
<!--  extends: ElDialog,-->
<!--  props: {-->
<!--    disableResize: {-->
<!--      type: Boolean,-->
<!--      default: false-->
<!--    }-->
<!--  },-->
<!--function data() {-->
<!--    return {-->
<!--      dialogEl: null,-->
<!--      dialogBodyEl: null,-->
<!--      isWasResize: false,-->
<!--      heightDif: 0-->
<!--    };-->
<!--  },-->
<!-- onMounted( () => {-->

<!--    const self = this;-->
<!--    appendToBody = true;-->
<!--    dialogEl = $el.querySelector('[role="dialog"]');-->
<!--    dialogBodyEl = $el.querySelector(".el-dialog__body");-->

<!--    setTimeout(() => {-->
<!--      heightDif = dialogEl.offsetHeight - dialogBodyEl.offsetHeight;-->
<!--    }, 2000);-->

<!--    $(dialogEl).draggable({-->
<!--      handle: ".el-dialog__header",-->
<!--      start: () => {-->
<!--        $emit("dragStart");-->
<!--      },-->
<!--      stop: () => {-->
<!--        $emit("dragStop");-->
<!--      }-->
<!--    });-->

<!--    if (!disableResize) {-->

<!--      $(dialogEl).resizable({-->
<!--        minHeight: 300,-->
<!--        minWidth: dialogEl.offsetWidth || 300,-->
<!--        resize() {-->
<!--          self.isWasResize = true;-->

<!--          $(self.dialogEl).resizable("option", "minHeight", self.dialogBodyEl.offsetHeight + self.heightDif);-->

<!--        }-->
<!--      });-->
<!--      new ResizeObserver(outputsize).observe(dialogBodyEl);-->
<!--    }-->
<!--   });,-->
<!--  methods: {-->
<!--    outputsize() {-->
<!--      if (isWasResize && isNeedChangeHeight()) {-->
<!--        dialogEl.style.height = `${dialogBodyEl.offsetHeight + heightDif}px`;-->
<!--      }-->
<!--    },-->
<!--    isNeedChangeHeight() {-->
<!--      return dialogBodyEl.offsetHeight + heightDif > dialogEl.offsetHeight;-->
<!--    }-->
<!--  }-->
<!--};-->
<!--</script>-->

<style lang="scss">
.cyoda-dialog {
  .el-dialog__header {
    background-color: #409eff;
    color: #fff;
    cursor: grab;
    padding: 15px 15px 15px 20px;
  }

  .el-icon-close:before,
  .el-dialog__title {
    color: #fff !important;
  }

  .ui-draggable-dragging .el-dialog__header {
    cursor: grabbing;
  }

  .el-dialog__headerbtn {
    top: 18px;
  }

  [role="dialog"] {
    overflow: hidden;
  }
}
</style>
