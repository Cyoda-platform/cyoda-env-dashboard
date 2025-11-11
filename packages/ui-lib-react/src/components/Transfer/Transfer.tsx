import React, { useState, useEffect, useMemo } from 'react'
import { Transfer as AntTransfer } from 'antd'
import type { TransferProps as AntTransferProps } from 'antd'
import _ from 'lodash'
import './Transfer.scss'

export interface TransferDataItem {
  key: string
  [key: string]: any
}

export interface TransferComponentProps {
  /** Titles for left and right panels */
  titles?: [string, string]
  /** All available options */
  optionsData?: TransferDataItem[]
  /** Selected items (right panel) */
  value?: TransferDataItem[]
  /** Callback when value changes */
  onChange?: (value: TransferDataItem[]) => void
  /** Field to use as unique key */
  fieldKey?: string
  /** Field to use as display label */
  fieldLabel?: string
  /** Max string length for left panel items */
  strLengthLeft?: number
  /** Max string length for right panel items */
  strLengthRight?: number
  /** Custom render for right panel items */
  renderItem?: (item: TransferDataItem) => React.ReactNode
  /** Whether to show search */
  showSearch?: boolean
}

/**
 * Transfer Component
 * Dual-list transfer component for moving items between two lists
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/Transfer/Transfer.vue
 */
export const Transfer: React.FC<TransferComponentProps> = ({
  titles = ['Source', 'Target'],
  optionsData = [],
  value = [],
  onChange,
  fieldKey = 'key',
  fieldLabel = 'label',
  strLengthLeft = 40,
  strLengthRight = 0,
  renderItem,
  showSearch = true
}) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([])

  // Sync targetKeys with value prop
  useEffect(() => {
    const keys = value.map(item => _.get(item, fieldKey) as string)
    setTargetKeys(keys)
  }, [value, fieldKey])

  // Prepare data source for Ant Design Transfer
  const dataSource = useMemo(() => {
    return optionsData.map(item => ({
      key: _.get(item, fieldKey) as string,
      title: _.get(item, fieldLabel) as string,
      ...item
    }))
  }, [optionsData, fieldKey, fieldLabel])

  const handleChange = (newTargetKeys: string[]) => {
    if (!onChange) return

    // Find the actual items from optionsData
    const selectedItems = optionsData.filter(item => 
      newTargetKeys.includes(_.get(item, fieldKey) as string)
    )

    onChange(selectedItems)
  }

  const truncateLabel = (label: string, maxLength: number): string => {
    if (maxLength === 0 || label.length <= maxLength) {
      return label
    }
    return `${label.substring(0, maxLength)}...`
  }

  const customRender = (item: any) => {
    const label = item.title || ''
    
    // Use custom render if provided
    if (renderItem) {
      return renderItem(item)
    }

    // Determine which panel this item is in
    const isInTarget = targetKeys.includes(item.key)
    const maxLength = isInTarget ? strLengthRight : strLengthLeft
    
    return truncateLabel(label, maxLength)
  }

  return (
    <div className="transfer-component">
      <AntTransfer
        dataSource={dataSource}
        targetKeys={targetKeys}
        onChange={handleChange}
        render={customRender}
        titles={titles}
        showSearch={showSearch}
        listStyle={{
          // Sizes are controlled by CSS for adaptive behavior
          width: 500,
          height: 500
        }}
        operations={['', '']}
        locale={{
          itemUnit: 'item',
          itemsUnit: 'items',
          searchPlaceholder: 'Search'
        }}
      />
    </div>
  )
}

