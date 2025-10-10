import { computed } from 'vue'
import { usePropsAlias } from './use-props-alias'
import _ from "lodash";

import type { TransferDataItem, TransferKey, TransferProps } from '../transfer'

export const useComputedData = (props: TransferProps) => {
  const propsAlias = usePropsAlias(props)

  const dataObj = computed(() => {
    return props.data.reduce((o, cur) => (o[getKey(cur,props, propsAlias)] = cur) && o, {})
  })

  const sourceData = computed(() => {
    return props.data.filter(
      (item) => !props.modelValue.map((el)=>getKey(el, props, propsAlias)).includes(getKey(item, props, propsAlias))
    )
  })

  const targetData = computed(() => {
    if (props.targetOrder === 'original') {
      return props.modelValue.filter((item) =>
        props.data.map((el)=>getKey(el, props, propsAlias)).includes(getKey(item,props,propsAlias))
      )
    } else {
      return props.modelValue.reduce(
        (arr: TransferDataItem[], cur: TransferKey) => {
          const val = dataObj.value[cur]
          if (val) {
            arr.push(val)
          }
          return arr
        },
        []
      )
    }
  })

  function getKey(obj, props, propsAlias){
    if(props.fieldKey) return _.get(obj, props.fieldKey);
    return obj[propsAlias.value.key];
  }

  return {
    sourceData,
    targetData,
  }
}
