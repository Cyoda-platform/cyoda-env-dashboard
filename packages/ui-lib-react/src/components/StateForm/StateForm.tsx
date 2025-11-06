import React, { useState, useEffect } from 'react'
import { Form, Input, Button } from 'antd'
import './StateForm.scss'

const { TextArea } = Input

export interface StateFormData {
  name: string
  description: string
  entityClassName?: string
}

export interface StateFormProps {
  workflowId?: string | null
  stateId?: string
  entityClassName?: string
  persistedType?: string
  onLoadState?: (persistedType: string, workflowId: string, stateId: string) => Promise<StateFormData>
  onSubmit?: (persistedType: string, workflowId: string, stateId: string, data: StateFormData) => Promise<void>
  onStateTitle?: (title: string) => void
  onWorkflowTitle?: (title: string) => void
  onSubmitted?: () => void
  className?: string
}

/**
 * StateForm Component
 * Form for editing state machine states
 */
export const StateForm: React.FC<StateFormProps> = ({
  workflowId = null,
  stateId = '',
  entityClassName = '',
  persistedType = '',
  onLoadState,
  onSubmit,
  onStateTitle,
  onWorkflowTitle,
  onSubmitted,
  className = ''
}) => {
  const [form] = Form.useForm()
  const [formData, setFormData] = useState<StateFormData>({
    name: '',
    description: '',
    entityClassName
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadState = async () => {
      if (onLoadState && persistedType && workflowId && stateId) {
        try {
          const data = await onLoadState(persistedType, workflowId, stateId)
          setFormData(data)
          form.setFieldsValue(data)
        } catch (error) {
          console.error('Failed to load state:', error)
        }
      }
    }
    loadState()
  }, [stateId, workflowId, persistedType, onLoadState, form])

  useEffect(() => {
    const pageTitle = `State ${formData.name}`
    onStateTitle?.(pageTitle)
  }, [formData.name, onStateTitle])

  useEffect(() => {
    const workflowTitle = 'Workflow'
    onWorkflowTitle?.(workflowTitle)
  }, [onWorkflowTitle])

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      
      if (onSubmit && persistedType && workflowId && stateId) {
        setLoading(true)
        await onSubmit(persistedType, workflowId, stateId, values)
        onSubmitted?.()
      }
    } catch (error) {
      console.error('Form validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`state-form ${className}`}>
      <div className="state-form__title">
        <h2>{`State ${formData.name}`}</h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input name' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          label="Description"
          name="description"
        >
          <TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        <Button type="primary" onClick={handleSubmit} loading={loading}>
          Update State
        </Button>
      </Form>
    </div>
  )
}

