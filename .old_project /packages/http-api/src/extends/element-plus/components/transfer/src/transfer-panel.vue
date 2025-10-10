<template>
  <div :class="ns.b('panel')">
    <p :class="ns.be('panel', 'header')">
      <el-checkbox
        v-model="allChecked"
        :indeterminate="isIndeterminate"
        :validate-event="false"
        @change="handleAllCheckedChange"
      >
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
    </p>

    <div :class="[ns.be('panel', 'body'), ns.is('with-footer', hasFooter)]">
      <el-input
        v-if="filterable"
        v-model="query"
        :class="ns.be('panel', 'filter')"
        size="default"
        :placeholder="placeholder"
        :prefix-icon="Search"
        clearable
        :validate-event="false"
      />
      <el-checkbox-group
        v-show="!hasNoMatch && !isEmpty(data)"
        v-model="checked"
        :validate-event="false"
        :class="[ns.is('filterable', filterable), ns.be('panel', 'list')]"
      >
        <draggable v-model="orderData"
                   @change="dragEnd"
                   item-key="key"
                   :disabled="!enableSort"
                   ghost-class="ghost"
                   handle=".handle"
                   tag="table"
                   class="table-draggable"
                   :component-data="{name: 'flip-list', type: 'transition'}">
          <template #item="{element: item}">
            <tr :class="{'flex-item': enableSort}">
              <td>
                <el-tooltip class="item" effect="dark" :disabled="strLength === 0 || getLabel(item).length <= strLength" :content="getLabel(item)" placement="top">
                <el-checkbox
                  :key="getKey(item)"
                  :class="ns.be('panel', 'item')"
                  :label="getKey(item)"
                  :disabled="item[propsAlias.disabled]"
                  :validate-event="false"
                >
                  {{
                    strLength > 0 && getLabel(item).length > strLength ? `${getLabel(item).substring(0, strLength)}...` : getLabel(item)
                  }}
                </el-checkbox>
                </el-tooltip>
              </td>
              <td class="custom-field" v-if="enableSort">
                 <span>
                  <slot name="custom-field" :item="item"></slot>
                </span>
              </td>
              <td class="sort-cell">
                <font-awesome-icon class="handle" :icon="['fas', 'align-justify']"/>
              </td>
            </tr>
          </template>
        </draggable>
      </el-checkbox-group>
      <p v-show="hasNoMatch || isEmpty(data)" :class="ns.be('panel', 'empty')">
        {{ hasNoMatch ? t('el.transfer.noMatch') : t('el.transfer.noData') }}
      </p>
    </div>
    <p v-if="hasFooter" :class="ns.be('panel', 'footer')">
      <slot/>
    </p>
  </div>
</template>

<script lang="ts" setup>
import {computed, getCurrentInstance, reactive, ref, toRefs, useSlots, watch} from 'vue'
import {isEmpty} from '../../../utils'
import {useLocale, useNamespace} from '../../../hooks'
import {Search} from '@element-plus/icons-vue'
import {transferPanelEmits, transferPanelProps} from './transfer-panel'
import {useCheck, usePropsAlias} from './composables'
import draggable from "vuedraggable";
import _ from "lodash";

import type {VNode} from 'vue'
import type {TransferPanelState} from './transfer-panel'
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";

defineOptions({
  name: 'ElTransferPanel',
})

const props = defineProps(transferPanelProps)
const emit = defineEmits(transferPanelEmits)
const slots = useSlots()

const OptionContent = ({option}: {
  option: VNode | VNode[]
}) => option

const {t} = useLocale()
const ns = useNamespace('transfer')

const panelState = reactive<TransferPanelState>({
  checked: [],
  allChecked: false,
  query: '',
  checkChangeByUser: true,
})

const propsAlias = usePropsAlias(props)

const {
  filteredData,
  checkedSummary,
  isIndeterminate,
  handleAllCheckedChange,
} = useCheck(props, panelState, emit)

const hasNoMatch = computed(
  () => !isEmpty(panelState.query) && isEmpty(filteredData.value)
)

const hasFooter = computed(() => !isEmpty(slots.default!()[0].children))

const {checked, allChecked, query} = toRefs(panelState)

// Custom data
const isWasSort = ref(false);
const orderDataSort = ref([]);
const orderData = ref([]);
watch(filteredData, (vals) => {
  if (!isWasSort.value) {
    if (orderDataSort.value.length > 0) {
      const found = [];
      let notFound = [];
      orderDataSort.value.forEach((key) => {
        const constItem = vals.find((val) => val.key === key);
        if (constItem) {
          found.push(constItem);
        }
      });
      notFound = _.differenceBy(vals, found, "key");
      orderData.value = [...found, ...notFound];
      orderDataSort.value = orderData.value.map((el) => el.key);
    } else {
      orderData.value = vals;
    }
  }
  isWasSort.value = false;
}, {immediate: true})

const instance = getCurrentInstance();

function dragEnd() {
  isWasSort.value = true;
  orderDataSort.value = orderData.value.map((el) => getKey(el));
  instance.parent.emit(
    "update:modelValue",
    orderData.value
  );
  instance.parent.emit(
    "change",
    orderData.value
  );
}

watch(
  () => props.data,
  () => {
    if (props.data && orderData.value.length != props.data.length && props.enableSort) {
      instance.parent.emit(
        "update:modelValue",
        props.data
      );
      instance.parent.emit(
        "change",
        props.data
      );
    }
  }
);

function getLabel(item) {
  return HelperFormat.shortNamePath(_.get(item, props.fieldLabel));
}

function getKey(item) {
  if (props.fieldKey) return _.get(item, props.fieldKey);
  return item[propsAlias.key];
}

defineExpose({
  /** @description filter keyword */
  query,
})
</script>

<style lang="scss" scoped>
.el-transfer-panel {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  width: 400px;

  .flip-list-move {
    transition: transform 0.5s;
  }

  .no-move {
    transition: transform 0s;
  }

  .ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }

  .el-checkbox {
    height: auto;
  }

  .el-transfer-panel__list {
    padding: 0 15px;
  }

  .table-draggable {
    width: 100%;
    border-collapse: collapse;

    td label {
      padding: 0;
      padding-left: 5px;
    }

    .sort-cell {
      padding: 5px;
      padding-left: 15px;
      width: 28px !important;
      text-align: right;
    }

    .custom-field {
      text-align: right;
      font-size: 14px;
      span{
        white-space: nowrap;
      }
    }

    :deep(.flex-item) {
      svg {
        width: 18px;
        height: 18px;
        cursor: move;
      }

      .el-select {
        margin-left: auto;
        margin-right: 10px;
        width: 150px;
      }

      .el-switch--large {
        height: auto;
      }

      td {
        padding: 5px;
        border-top: 1px solid #dcdfe6;
        border-bottom: 1px solid #dcdfe6;
        background-color: #fff;
      }
    }
  }
}
</style>
