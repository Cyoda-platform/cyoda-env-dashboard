import React, { useState, useEffect } from 'react'
import { Form, Input, Button } from 'antd'
import './ModellingItemClassForm.scss'

export interface ModellingItemClassFormProps {
  isAvailableSubmit?: boolean
  types?: string[]
  values?: string[]
  onChange?: (values: string[]) => void
  className?: string
}

/**
 * ModellingItemClassForm Component
 * Form for modelling item class with dynamic input fields based on types
 */
export const ModellingItemClassForm: React.FC<ModellingItemClassFormProps> = ({
  isAvailableSubmit = true,
  types = [],
  values = [],
  onChange,
  className = ''
}) => {
  const [form, setForm] = useState<string[]>([])

  useEffect(() => {
    if (values.length > 0) {
      const newForm = values.map(val => val || '')
      setForm(newForm)
      handleSubmit(newForm)
    }
  }, [values])

  useEffect(() => {
    if (!isAvailableSubmit) {
      onChange?.(form)
    }
  }, [form, isAvailableSubmit, onChange])

  const getMask = (type: string) => {
    if (type === 'Integer') {
      return {
        pattern: '[0-9*]+',
        placeholder: ''
      }
    } else if (type === 'String') {
      return {
        pattern: '.*',
        placeholder: ''
      }
    }
    return { pattern: '.*', placeholder: '' }
  }

  const handleInputChange = (index: number, value: string) => {
    const newForm = [...form]
    newForm[index] = value
    setForm(newForm)
  }

  const handleSubmit = (formData?: string[]) => {
    const dataToSubmit = formData || [...form]
    // Ensure we have entries for all types
    const fullData = types.map((_, index) => dataToSubmit[index] || '')

    const processedData = fullData.map((val, index) => {
      if (val === '' || val === undefined) {
        const newForm = [...form]
        newForm[index] = '*'
        setForm(newForm)
        return '*'
      }
      return val
    })
    onChange?.(processedData)
  }

  return (
    <div className={`modelling-item-class-form ${className}`}>
      <Form layout="vertical">
        <div className="modelling-item-class-form__flex">
          {types.map((type, index) => (
            <div key={index} className="modelling-item-class-form__field">
              <Input
                size="small"
                placeholder={type}
                value={form[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                pattern={getMask(type).pattern}
              />
            </div>
          ))}
          {isAvailableSubmit && (
            <div className="modelling-item-class-form__button">
              <Button size="small" type="primary" onClick={() => handleSubmit()}>
                Apply
              </Button>
            </div>
          )}
        </div>
      </Form>
    </div>
  )
}

