import React, { useState, useEffect } from 'react'
import { Form, Switch } from 'antd'
import './BlotterDetailForm.scss'

export interface BlotterDetailFormValue {
  isShowEmpty: boolean
}

export interface BlotterDetailFormProps {
  value?: BlotterDetailFormValue
  onChange?: (value: BlotterDetailFormValue) => void
  className?: string
}

/**
 * BlotterDetailForm Component
 * Form for controlling detail view settings in Adaptable Blotter
 */
export const BlotterDetailForm: React.FC<BlotterDetailFormProps> = ({
  value = { isShowEmpty: false },
  onChange,
  className = ''
}) => {
  const [form, setForm] = useState<BlotterDetailFormValue>(value)

  // Sync with value prop changes
  useEffect(() => {
    setForm(value)
  }, [JSON.stringify(value)])

  // Emit initial value
  useEffect(() => {
    onChange?.(form)
  }, [])

  const handleShowEmptyChange = (checked: boolean) => {
    const newForm = { ...form, isShowEmpty: checked }
    setForm(newForm)
    onChange?.(newForm)
  }

  return (
    <Form className={`blotter-detail-form ${className}`} labelCol={{ span: 10 }}>
      <Form.Item label="Show Empty Fields">
        <Switch
          checked={form.isShowEmpty}
          onChange={handleShowEmptyChange}
        />
      </Form.Item>
    </Form>
  )
}

