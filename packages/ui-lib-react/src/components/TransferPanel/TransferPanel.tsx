import React, { useState, useEffect, useMemo } from 'react'
import { Checkbox, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import _ from 'lodash'
import './TransferPanel.scss'

const { Group: CheckboxGroup } = Checkbox

export interface TransferPanelItem {
  [key: string]: any
}

export interface TransferPanelProps {
  /** Panel title */
  title?: string
  /** List of items to display */
  listData?: TransferPanelItem[]
  /** Selected items */
  value?: TransferPanelItem[]
  /** Callback when selection changes */
  onChange?: (selected: TransferPanelItem[]) => void
  /** Whether to enable sorting (drag and drop) */
  enableSort?: boolean
  /** Field to use as unique key */
  fieldKey?: string
  /** Field to use as display label */
  fieldLabel?: string
  /** Max string length for truncation */
  strLength?: number
  /** Custom render for items */
  children?: (item: TransferPanelItem) => React.ReactNode
}

/**
 * TransferPanel Component
 * Single panel for Transfer component with search and selection
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/Transfer/TransferPanel.vue
 */
export const TransferPanel: React.FC<TransferPanelProps> = ({
  title = '',
  listData = [],
  value = [],
  onChange,
  enableSort = false,
  fieldKey = 'key',
  fieldLabel = 'label',
  strLength = 0,
  children
}) => {
  const [checked, setChecked] = useState<TransferPanelItem[]>(value)
  const [query, setQuery] = useState('')

  // Use listData directly instead of local state to avoid infinite loops
  const localData = listData

  // Sync checked with value only when it changes
  useEffect(() => {
    setChecked(value)
  }, [JSON.stringify(value)])

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!query) return localData

    return localData.filter(item => {
      const label = _.get(item, fieldLabel, '').toString().toLowerCase()
      return label.includes(query.toLowerCase())
    })
  }, [localData, query, fieldLabel])

  const getKey = (item: TransferPanelItem): string => {
    return _.get(item, fieldKey, '') as string
  }

  const getLabel = (item: TransferPanelItem): string => {
    return _.get(item, fieldLabel, '') as string
  }

  const truncateLabel = (label: string): string => {
    if (strLength === 0 || label.length <= strLength) {
      return label
    }
    return `${label.substring(0, strLength)}...`
  }

  const handleCheckboxChange = (checkedValues: any[]) => {
    const selectedItems = localData.filter(item =>
      checkedValues.includes(item)
    )
    setChecked(selectedItems)
    onChange?.(selectedItems)
  }

  const handleAllCheckedChange = (e: any) => {
    if (checked.length === 0) {
      setChecked(filteredData)
      onChange?.(filteredData)
    } else {
      setChecked([])
      onChange?.([])
    }
  }

  const allChecked = checked.length > 0 && checked.length === filteredData.length
  const indeterminate = checked.length > 0 && checked.length < filteredData.length
  const checkedSummary = `${checked.length}/${filteredData.length}`
  const hasNoMatch = query && filteredData.length === 0

  return (
    <div className={`transfer-panel ${enableSort ? 'sort' : ''}`}>
      <p className="transfer-panel__header">
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          onChange={handleAllCheckedChange}
        >
          {title} <span>{checkedSummary}</span>
        </Checkbox>
      </p>

      <div className="transfer-panel__body">
        <Input
          className="transfer-panel__filter"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          prefix={<SearchOutlined />}
        />

        <div className="transfer-panel__body-inner">
          {filteredData.length > 0 && (
            <CheckboxGroup
              value={checked}
              onChange={handleCheckboxChange}
              className="transfer-panel__list"
            >
              {filteredData.map(item => (
                <div key={getKey(item)} className="transfer-panel__item-wrapper">
                  <Checkbox value={item} className="transfer-panel__item">
                    {truncateLabel(getLabel(item))}
                  </Checkbox>
                  {enableSort && children && (
                    <div className="custom-field">
                      {children(item)}
                    </div>
                  )}
                </div>
              ))}
            </CheckboxGroup>
          )}

          {hasNoMatch && (
            <p className="transfer-panel__empty">No Match</p>
          )}

          {!hasNoMatch && filteredData.length === 0 && (
            <p className="transfer-panel__empty">No Data</p>
          )}
        </div>
      </div>
    </div>
  )
}

