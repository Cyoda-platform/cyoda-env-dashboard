<template>
  <div>
    <h4>Transition Entity</h4>
    <el-form ref="detailTransitionsFormRef" :rules="rules" :inline="true" :model="form" class="demo-form-inline">
      <el-form-item label="Attempt" prop="transition">
        <el-select v-model="form.transition" placeholder="Select">
          <el-option v-for="option in transitionOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <template v-if="isEditable">
          <el-button :loading="loading" type="success" @click="onUpdate">Update Entity</el-button>
        </template>
        <template v-else>
          <el-button :loading="loading" type="primary" @click="onSubmit">Submit</el-button>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";

import * as api from "../../../../api";
import { ElementUiOption, Entity, EntityRequest } from "@cyoda/ui-lib/src/types/types";

import {ElForm, ElMessageBox, ElNotification} from "element-plus";
import eventBus from "../../../../plugins/eventBus";
import {useDetailEntityStore} from "@cyoda/http-api/src/stores/detail-entity";

const props = defineProps({
  id: {
    default: ""
  },
  entityClass: {
    default: ""
  },
  entity: {
    default: () => {
      return {};
    }
  },
  isEditable: {
    default: false
  }
});
const detailEntityStore = useDetailEntityStore();
const changedFields = computed(() => {
  return detailEntityStore.changedFields;
});
const rules = computed(() => {
  return {
    transition: [{ required: props.isEditable, message: "Please select transition", trigger: "blur" }]
  };
});

const detailTransitionsFormRef = ref(null);

let form = ref({
  transition: ""
});

let transitionOptions = ref([]);
const loading = ref<boolean>(false);

(async function () {
  getTransitions();
  eventBus.$on("dialogEntityChangeTransition", getTransitions);
  eventBus.$on("entity:update", onUpdate);
})();

onBeforeUnmount(() => {
  eventBus.$off("dialogEntityChangeTransition", getTransitions);
  eventBus.$off("entity:update", onUpdate);
});

async function getTransitions() {
  const { data } = await api.getTransitionsForEntity(props.id, props.entityClass);
  transitionOptions.value = data.map((el: string) => {
    return {
      label: el,
      value: el
    };
  });
  form.value.transition = data[0];
}

async function onSubmit() {
  saveOnlyTransition();
}

function onUpdate() {
  saveEditableFieldsWithTransition();
}

function saveOnlyTransition() {
  ElMessageBox.confirm("Do you really want to attempt the new Transition?", "Confirm!", {
    callback: async (action) => {
      if (action === "confirm") {
        try {
          loading.value = true;
          await api.putTransitionsForEntity(props.id, props.entityClass, form.value.transition);
          ElNotification({
            title: "Success",
            message: "Transition is changed",
            type: "success"
          });
          eventBus.$emit("dialogEntityChangeTransition");
        } finally {
          loading.value = false;
        }
      }
    }
  });
}

function saveEditableFieldsWithTransition() {
  detailTransitionsFormRef.value.validate((valid) => {
    if (valid) {
      ElMessageBox.confirm("Do you really want to save data?", "Confirm!", {
        callback: async (action) => {
          if (action === "confirm") {
            const changedFieldsCopy = JSON.parse(JSON.stringify(changedFields.value));
            const data: EntityRequest = {
              entityClass: props.entityClass,
              entityId: props.id,
              transition: form.value.transition,
              transactional: false,
              async: false,
              values: changedFieldsCopy.map((el: any) => {
                if (typeof el.value === "boolean") {
                  el.value = el.value === true ? "1" : "0";
                }
                return el;
              })
            };
            try {
              loading.value = true;
              await api.putEntity(data);
              ElNotification({
                title: "Success",
                message: "Data is updated",
                type: "success"
              });
              eventBus.$emit("dialogEntityChangeTransition");
            } finally {
              loading.value = false;
            }
          }
        }
      });
    } else {
      ElNotification({ type: "error", title: "Error", message: "Form have errors. Please fix them!" });
    }
  });
}
</script>

<style lang="scss" scoped>
h4 {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 15px;
}

.demo-form-inline .el-select {
  width: 220px;
}
</style>
