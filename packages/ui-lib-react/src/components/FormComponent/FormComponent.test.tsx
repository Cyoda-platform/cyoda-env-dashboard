import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FormComponent } from './FormComponent'
import { Form, Input, Button } from 'antd'

describe('FormComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <FormComponent>
        <Form.Item name="test">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    expect(container.querySelector('.ant-form')).toBeInTheDocument()
  })

  it('renders form items', () => {
    render(
      <FormComponent>
        <Form.Item label="Username" name="username">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FormComponent className="custom-class">
        <Form.Item name="test">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    const form = container.querySelector('.form-component')
    expect(form).toHaveClass('custom-class')
  })

  it('renders with layout vertical', () => {
    const { container } = render(
      <FormComponent layout="vertical">
        <Form.Item name="test">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    expect(container.querySelector('.ant-form-vertical')).toBeInTheDocument()
  })

  it('renders with layout horizontal', () => {
    const { container } = render(
      <FormComponent layout="horizontal">
        <Form.Item name="test">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    expect(container.querySelector('.ant-form-horizontal')).toBeInTheDocument()
  })

  it('renders with layout inline', () => {
    const { container } = render(
      <FormComponent layout="inline">
        <Form.Item name="test">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    expect(container.querySelector('.ant-form-inline')).toBeInTheDocument()
  })

  it('calls onFinish when form is submitted', async () => {
    const onFinish = vi.fn()
    render(
      <FormComponent onFinish={onFinish}>
        <Form.Item name="username">
          <Input />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </FormComponent>
    )

    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalled()
    })
  })

  it('renders with initial values', () => {
    render(
      <FormComponent initialValues={{ username: 'test' }}>
        <Form.Item name="username">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('test')
  })

  it('renders with disabled state', () => {
    render(
      <FormComponent disabled>
        <Form.Item name="username">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('renders with size large', () => {
    const { container } = render(
      <FormComponent size="large">
        <Form.Item name="test">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    expect(container.querySelector('.ant-form-large')).toBeInTheDocument()
  })

  it('renders with size small', () => {
    const { container } = render(
      <FormComponent size="small">
        <Form.Item name="test">
          <Input />
        </Form.Item>
      </FormComponent>
    )
    
    expect(container.querySelector('.ant-form-small')).toBeInTheDocument()
  })
})

