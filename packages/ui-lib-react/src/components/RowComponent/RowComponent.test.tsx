import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RowComponent } from './RowComponent'
import { Col } from 'antd'

describe('RowComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <RowComponent>
        <Col span={12}>Column 1</Col>
        <Col span={12}>Column 2</Col>
      </RowComponent>
    )
    
    expect(container.querySelector('.ant-row')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <RowComponent>
        <Col span={12}>Column 1</Col>
        <Col span={12}>Column 2</Col>
      </RowComponent>
    )
    
    expect(screen.getByText('Column 1')).toBeInTheDocument()
    expect(screen.getByText('Column 2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <RowComponent className="custom-class">
        <Col>Content</Col>
      </RowComponent>
    )
    
    const row = container.querySelector('.row-component')
    expect(row).toHaveClass('custom-class')
  })

  it('renders with gutter', () => {
    const { container } = render(
      <RowComponent gutter={16}>
        <Col span={12}>Column 1</Col>
        <Col span={12}>Column 2</Col>
      </RowComponent>
    )
    
    expect(container.querySelector('.ant-row')).toBeInTheDocument()
  })

  it('renders with justify center', () => {
    const { container } = render(
      <RowComponent justify="center">
        <Col>Content</Col>
      </RowComponent>
    )
    
    expect(container.querySelector('.ant-row-center')).toBeInTheDocument()
  })

  it('renders with justify space-between', () => {
    const { container } = render(
      <RowComponent justify="space-between">
        <Col>Content</Col>
      </RowComponent>
    )
    
    expect(container.querySelector('.ant-row-space-between')).toBeInTheDocument()
  })

  it('renders with align middle', () => {
    const { container } = render(
      <RowComponent align="middle">
        <Col>Content</Col>
      </RowComponent>
    )
    
    expect(container.querySelector('.ant-row-middle')).toBeInTheDocument()
  })

  it('renders with align top', () => {
    const { container } = render(
      <RowComponent align="top">
        <Col>Content</Col>
      </RowComponent>
    )
    
    expect(container.querySelector('.ant-row-top')).toBeInTheDocument()
  })

  it('renders with wrap', () => {
    const { container } = render(
      <RowComponent wrap>
        <Col>Content</Col>
      </RowComponent>
    )
    
    expect(container.querySelector('.ant-row')).toBeInTheDocument()
  })
})

