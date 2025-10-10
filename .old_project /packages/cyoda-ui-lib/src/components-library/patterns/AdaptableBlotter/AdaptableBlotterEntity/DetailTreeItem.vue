<template>
  <div v-loading="loading" class="detail-tree-item" :class="{ 'is-editable': editableField || isEditable }">
    <template v-if="column.type === 'LEAF' && isShowShortVersion">
      <div class="title-value">
        <div class="name">{{ name }}:</div>
        <div class="value">
          <div v-if="isEditable">
            <DetailTreeItemEditableField :itemValue="valueData" :column="column" />
          </div>
          <div v-else-if="editableField" class="actions">
            {{ valueData }}
            <el-button key="button-edit" @click="onStartEdit" size="default">
              <font-awesome-icon icon="pencil-alt" />
            </el-button>
            <DetailTreeItemEditableForm ref="detailTreeItemEditableFormRef" :editableField="editableField" :requestClass="requestClass" :currentField="name" :id="id" :column="column" :itemValue="valueData" />
          </div>
          <div v-else>
            {{ valueData }}
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div @click="toggleVisibile" class="title name">
        {{ name }}
        <font-awesome-icon icon="chevron-right" :class="{ expanded: isShow }" />
      </div>
      <el-collapse-transition>
        <template v-if="isShow">
          <DetailTreeItemLeaf :isShowEmpty="isShowEmpty" v-if="column.type === 'LEAF'" :column="column" />
          <DetailTreeItemEmbedded @loading="changeLoading" :isEditable="isEditable" :id="id" :requestClass="requestClass" :isShowEmpty="isShowEmpty" v-if="column.type === 'EMBEDDED'" :column="column" />
          <DetailTreeItemListGroup :isShowEmpty="isShowEmpty" :isEditable="isEditable" :id="id" :requestClass="requestClass" v-if="column.type === 'LIST'" :column="column" />
          <DetailTreeItemMapGroup :isShowEmpty="isShowEmpty" :isEditable="isEditable" :id="id" :requestClass="requestClass" v-if="column.type === 'MAP'" :column="column" />
        </template>
      </el-collapse-transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import DetailTreeItemLeaf from "./Display/DetailTreeItemLeaf.vue";
import DetailTreeItemListGroup from "./Display/DetailTreeItemListGroup.vue";
import DetailTreeItemMapGroup from "./Display/DetailTreeItemMapGroup.vue";
import DetailTreeItemEmbedded from "./Display/DetailTreeItemEmbedded.vue";
import HelperFormat from "../../../../helpers/HelperFormat";
import DetailTreeItemEditableForm from "./DetailTreeItem/DetailTreeItemEditableForm.vue";
import { Column } from "@cyoda/ui-lib/src/types/types";
import DetailTreeItemEditableSingleField from "./DetailTreeItem/DetailTreeItemEditableSingleField.vue";
import DetailTreeItemEditableField from "./DetailTreeItem/DetailTreeItemEditableField.vue";

const props = defineProps({
  column: {
    default: () => {
      return {};
    }
  },
  id: {
    default: ""
  },
  requestClass: {
    default: ""
  },
  isShowEmpty: {
    default: true
  },
  isEditable: {
    default: false
  }
});
const name = computed(() => {
  let name = props.column.columnInfo.columnName;
  if (!name) {
    name = props.column.columnInfo.columnPath;
  }
  return name;
});
const isShowShortVersion = computed(() => {
  return HelperFormat.isShortDetailTreeItem(props.column.value);
});
const valueData = computed(() => {
  return HelperFormat.getValue(props.column.value);
});
const editableField = computed(() => {
  return listEditableFields.value.find((el) => el.fieldId.item === name.value || el.fieldName.item === name.value);
});

const detailTreeItemEditableFormRef = ref(null);

const detailTreeItemEditableSingleFieldRef = ref(null);

let listEditableFields = ref([
  {
    fieldId: {
      item: "counterpartyId",
      entity: "id"
    },
    fieldName: {
      item: "counterpartyName",
      entity: "name"
    },
    entity: "com.cyoda.business.model.common.LegalEntity",
    name: "Counterparty"
  }
]);

const isShow = ref<boolean>(false);

const loading = ref<boolean>(false);

function toggleVisibile() {
  isShow.value = !isShow.value;
}

function onStartEdit() {
  detailTreeItemEditableFormRef.value.dialogVisible = true;
}

function onStartEditEditableField() {
  detailTreeItemEditableSingleFieldRef.value.dialogVisible = true;
}

function changeLoading(val: boolean) {
  loading.value = val;
}
</script>

<style lang="scss">
.detail-tree-item {
  margin-bottom: 10px;
  padding: 0;
  border: 1px solid #dfe6ec;

  .name {
    font-size: 16px;
    font-weight: bold;
  }

  .title {
    background: #eef1f6;
    padding: 5px 10px;
    position: relative;
    cursor: pointer;

    svg {
      position: absolute;
      right: 10px;
      top: 5px;
      transform: rotate(0);
      transition: transform 0.3s ease-in-out;

      &.expanded {
        transform: rotate(90deg);
      }
    }
  }

  .title-value {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .name {
      padding: 5px;
      margin-right: 10px;
      background: #eef1f6;
      min-width: 200px;
    }
  }

  &.is-editable .title-value .name {
    padding: 10px 5px;
  }

  &.is-editable {
    .name {
      margin-right: 0;
    }
    .value {
      flex: 1;
    }
  }

  .body {
    padding: 15px;
  }

  .actions {
    display: inline-block;
    margin-left: 15px;
  }
}
</style>
