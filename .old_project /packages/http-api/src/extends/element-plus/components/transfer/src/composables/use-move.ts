import {CHANGE_EVENT, UPDATE_MODEL_EVENT} from '../../../../constants'
import {usePropsAlias} from './use-props-alias'

import type {SetupContext} from 'vue'
import type {
  TransferCheckedState,
  TransferDataItem,
  TransferDirection,
  TransferEmits,
  TransferKey,
  TransferProps,
} from '../transfer'
import _ from "lodash";

export const useMove = (
  props: TransferProps,
  checkedState: TransferCheckedState,
  emit: SetupContext<TransferEmits>['emit']
) => {
  const propsAlias = usePropsAlias(props)

  const _emit = (
    value: TransferKey[],
    direction: TransferDirection,
    movedKeys: TransferKey[]
  ) => {
    emit(UPDATE_MODEL_EVENT, value)
    emit(CHANGE_EVENT, value, direction, movedKeys)
  }

  const addToLeft = () => {
    const currentValue = props.modelValue.slice()

    checkedState.rightChecked.forEach((item) => {
      const index = currentValue.map(el => getKey(el, props, propsAlias)).indexOf(item)
      if (index > -1) {
        currentValue.splice(index, 1)
      }
    })
    _emit(currentValue, 'left', checkedState.rightChecked)
  }

  const addToRight = () => {
    let currentValue = props.modelValue.slice().map((el) => getKey(el, props, propsAlias))

    let itemsToBeMoved = props.data
      .filter((item: TransferDataItem) => {
        const itemKey = getKey(item, props, propsAlias)
        return (
          checkedState.leftChecked.includes(itemKey) &&
          !props.modelValue.includes(itemKey)
        )
      })
      .map((item) => getKey(item, props, propsAlias))

    currentValue =
      props.targetOrder === 'unshift'
        ? itemsToBeMoved.concat(currentValue)
        : currentValue.concat(itemsToBeMoved)


    if (props.targetOrder === 'original') {
      itemsToBeMoved = props.data
        .filter((item) => itemsToBeMoved.includes(getKey(item, props, propsAlias)))
      itemsToBeMoved = JSON.parse(JSON.stringify(itemsToBeMoved));
      currentValue = [...props.modelValue, ...itemsToBeMoved];
    }

    _emit(currentValue, 'right', checkedState.leftChecked)
  }

  function getKey(obj, props, propsAlias) {
    if (props.fieldKey) return _.get(obj, props.fieldKey);
    return obj[propsAlias.value.key];
  }

  return {
    addToLeft,
    addToRight,
  }
}
