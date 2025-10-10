<template>
  <el-row class="entity-detail-info" :gutter="20">
    <el-col class="wrap-message">
      <h4>Standard fields</h4>
      <div>
        <p><span class="name">Id:</span> {{ listStandardFieldsComputed.id }}</p>
        <p><span class="name">State:</span> {{ listStandardFieldsComputed.state }}</p>
        <p><span class="name">Previous Transition:</span> {{ listStandardFieldsComputed.previousTransition }}</p>
        <p><span class="name">Created Date:</span> {{ listStandardFieldsComputed.creationDate }}</p>
        <p><span class="name">Last updated date:</span> -</p>
      </div>
      <hr/>
      <template v-if="isShowDetailTransitions">
        <DetailTransitions :isEditable="isEditable" :entity="entity" :id="id" :entityClass="requestClass"/>
        <hr/>
      </template>
      <div class="flex">
        <div>
          <h4>
            Entity
            <template v-if="isEditable"> (Editable)</template>
          </h4>
        </div>
        <div class="wrap-form">
          <DetailForm @change="onChangeForm"/>
        </div>
      </div>
      <DetailTree :isShowEmpty="isShowEmpty" :isEditable="isEditable" :id="id" :requestClass="requestClass"
                  :entity="entityCopyWithoutDefaultFields"/>
    </el-col>
    <el-col class="wrap-info">
      <template v-if="customFieldsGroups.length > 0">
        <hr/>
        <h4>Custom fields</h4>
        <el-row :gutter="20">
          <template v-for="group in customFieldsGroups">
            <el-col :span="12">
              <p v-for="customFields in group">
                <span class="name">{{ customFields.name }}:</span> {{ customFields.value || "-" }}
              </p>
            </el-col>
          </template>
        </el-row>
      </template>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";

import DetailTree from "./DetailTree.vue";
import DetailForm from "./DetailForm.vue";
import DetailTransitions from "./DetailTransitions.vue";
import {Entity} from "../../../../types/types";

interface CustomFieldsGroup {
  name: string;
  value: string;
}

const props = defineProps({
  entity: {
    default: () => {
      return [];
    }
  },
  id: {
    default: ""
  },
  requestClass: {
    default: ""
  },
  isEditable: {
    default: false
  },
  isShowDetailTransitions: {
    default: true
  },
});
const listStandardFieldsComputed = computed(() => {
  const obj: {
    [key: string]: string
  } = {};
  listStandardFields.value.forEach((el) => {
    obj[el] = getValueFromColumn(el);
  });
  return obj;
});
const entityCopyWithoutDefaultFields = computed(() => {
  let entityCopy: Entity[] = JSON.parse(JSON.stringify(props.entity));
  listStandardFields.value.forEach((standardField) => {
    entityCopy = entityCopy.filter((el) => {
      return el.columnInfo.columnName !== standardField;
    });
  });
  return entityCopy;
});

let listStandardFields = ref(["id", "state", "previousTransition", "creationDate"]);

let customFieldsGroups = ref([]);

const isShowEmpty = ref<boolean>(true);

function getValueFromColumn(name: string) {
  const column = props.entity.find((el) => {
    return el.columnInfo.columnName === name;
  });
  if (column && column.value) {
    return column.value;
  } else {
    return "-";
  }
}

function onChangeForm({isShowEmpty: isShowEmptyValue}: {
  isShowEmpty: boolean
}) {
  isShowEmpty.value = isShowEmptyValue;
}
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
