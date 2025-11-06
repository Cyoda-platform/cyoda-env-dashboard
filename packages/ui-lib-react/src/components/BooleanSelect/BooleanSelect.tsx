import React from 'react'
import { Select } from 'antd'
import './BooleanSelect.scss'

const { Option } = Select

export interface BooleanSelectProps {
  /** Current value */
  value?: boolean | null
  /** Callback when value changes */
  onChange?: (value: boolean) => void
  /** Placeholder text */
  placeholder?: string
  /** Whether the select is disabled */
  disabled?: boolean
  /** Custom labels for true/false options */
  labels?: {
    true?: string
    false?: string
  }
  /** Additional props passed to Ant Design Select */
  [key: string]: any
}

/**
 * BooleanSelect Component
 * Select dropdown for boolean values (true/false)
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/SelectBoolean/SelectBoolean.vue
 */
export const BooleanSelect: React.FC<BooleanSelectProps> = ({
  value,
  onChange,
  placeholder = 'Select',
  disabled = false,
  labels = {},
  ...restProps
}) => {
  const handleChange = (val: boolean) => {
    onChange?.(val)
  }

  const trueLabel = labels.true || 'true'
  const falseLabel = labels.false || 'false'

  return (
    <Select
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className="boolean-select"
      {...restProps}
    >
      <Option value={true}>{trueLabel}</Option>
      <Option value={false}>{falseLabel}</Option>
    </Select>
  )
}

