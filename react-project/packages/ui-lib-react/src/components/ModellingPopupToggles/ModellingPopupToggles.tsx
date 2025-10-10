import React, { useState, useEffect } from 'react'
import { Form, Switch } from 'antd'
import './ModellingPopupToggles.scss'

export interface ModellingPopupTogglesForm {
  isOpenAllSelected: boolean
  isCondenseThePaths: boolean
}

export interface ModellingPopupTogglesProps {
  onChange?: (form: ModellingPopupTogglesForm) => void
  className?: string
}

/**
 * ModellingPopupToggles Component
 * Toggle settings for modelling popup
 */
export const ModellingPopupToggles: React.FC<ModellingPopupTogglesProps> = ({
  onChange,
  className = ''
}) => {
  const [form, setForm] = useState<ModellingPopupTogglesForm>({
    isOpenAllSelected: false,
    isCondenseThePaths: false
  })

  useEffect(() => {
    onChange?.(form)
  }, [form, onChange])

  const handleCondenseChange = (checked: boolean) => {
    setForm({ ...form, isCondenseThePaths: checked })
  }

  const handleOpenAllChange = (checked: boolean) => {
    setForm({ ...form, isOpenAllSelected: checked })
  }

  return (
    <div className={`modelling-popup-toggles ${className}`}>
      <Form layout="inline" className="modelling-popup-toggles__form">
        <Form.Item label="Condense the paths">
          <Switch
            checked={form.isCondenseThePaths}
            onChange={handleCondenseChange}
          />
        </Form.Item>
        <span className="modelling-popup-toggles__delimiter">|</span>
        <Form.Item label="Open all selected">
          <Switch
            checked={form.isOpenAllSelected}
            onChange={handleOpenAllChange}
          />
        </Form.Item>
      </Form>
    </div>
  )
}

