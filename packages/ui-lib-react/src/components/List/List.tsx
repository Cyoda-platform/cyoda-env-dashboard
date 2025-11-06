import React, { useState, useEffect } from 'react'
import { Checkbox } from 'antd'
import type { CheckboxValueType } from 'antd/es/checkbox/Group'
import './List.scss'

export interface ListOption {
  label: string
  value: string | number
}

export interface ListProps {
  options?: ListOption[]
  name?: string
  min?: number
  max?: number
  value?: CheckboxValueType[]
  onChange?: (value: CheckboxValueType[]) => void
  allowChange?: boolean
}

/**
 * List Component
 * Checkbox group list with min/max selection constraints
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ListComponent/ListComponent.vue
 */
export const List: React.FC<ListProps> = ({
  options = [],
  name = '',
  min = 0,
  max = 9999,
  value = [],
  onChange,
  allowChange = false
}) => {
  const [selected, setSelected] = useState<CheckboxValueType[]>(value)

  useEffect(() => {
    setSelected(value)
  }, [value])

  const maxLocal = allowChange ? max + 1 : max

  const handleChange = (checkedValues: CheckboxValueType[]) => {
    let newValue = [...checkedValues]
    
    // If allowChange is true and more than 1 item selected, remove the first one
    if (allowChange && newValue.length > 1) {
      newValue.shift()
    }
    
    setSelected(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="list-component">
      {name && <h2>{name}</h2>}
      <div className="box-list">
        <Checkbox.Group
          value={selected}
          onChange={handleChange}
          className="wrap-checkbox-group"
        >
          {options.map((option) => (
            <Checkbox
              key={option.value}
              value={option.value}
              disabled={
                (selected.length >= maxLocal && !selected.includes(option.value)) ||
                (selected.length <= min && selected.includes(option.value))
              }
            >
              {option.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    </div>
  )
}

