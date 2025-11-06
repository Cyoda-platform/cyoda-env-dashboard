import React, { useState, useEffect } from 'react'
import { Form, Switch } from 'antd'
import './ModellingToggles.scss'

export interface ModellingTogglesValue {
  isCondenseThePaths: boolean
  isOpenAllSelected: boolean
}

export interface ModellingTogglesProps {
  value?: ModellingTogglesValue
  onChange?: (value: ModellingTogglesValue) => void
  className?: string
}

/**
 * ModellingToggles Component
 * Toggle switches for Cyoda Modelling settings
 */
export const ModellingToggles: React.FC<ModellingTogglesProps> = ({
  value = { isCondenseThePaths: false, isOpenAllSelected: false },
  onChange,
  className = ''
}) => {
  const [form, setForm] = useState<ModellingTogglesValue>(value)

  // Sync with value prop changes using JSON.stringify to avoid infinite loops
  useEffect(() => {
    setForm(value)
  }, [JSON.stringify(value)])

  const handleCondenseChange = (checked: boolean) => {
    const newForm = { ...form, isCondenseThePaths: checked }
    setForm(newForm)
    onChange?.(newForm)
  }

  const handleOpenAllChange = (checked: boolean) => {
    const newForm = { ...form, isOpenAllSelected: checked }
    setForm(newForm)
    onChange?.(newForm)
  }

  return (
    <Form className={`actions-settings-inner ${className}`} layout="inline">
      <Form.Item label="Condense the paths">
        <Switch
          checked={form.isCondenseThePaths}
          onChange={handleCondenseChange}
        />
      </Form.Item>
      <span className="delimiter">|</span>
      <Form.Item label="Open all selected">
        <Switch
          checked={form.isOpenAllSelected}
          onChange={handleOpenAllChange}
        />
      </Form.Item>
    </Form>
  )
}

