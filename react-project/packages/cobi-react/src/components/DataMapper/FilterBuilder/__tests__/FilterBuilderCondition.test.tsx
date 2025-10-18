/**
 * Tests for FilterBuilderCondition component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBuilderCondition from '../FilterBuilderCondition';
import { FilterCondition, ColumnInfo } from '../types';

describe('FilterBuilderCondition', () => {
  const mockCols: ColumnInfo[] = [
    { alias: 'name', type: 'java.lang.String', typeShort: 'String', label: 'Name' },
    { alias: 'age', type: 'java.lang.Integer', typeShort: 'Integer', label: 'Age' },
    { alias: 'price', type: 'java.lang.Double', typeShort: 'Double', label: 'Price' },
    { alias: 'active', type: 'java.lang.Boolean', typeShort: 'Boolean', label: 'Active' },
    { alias: 'createdAt', type: 'java.time.LocalDate', typeShort: 'LocalDate', label: 'Created At' },
  ];

  const mockCondition: FilterCondition = {
    '@bean': 'com.cyoda.core.conditions.queryable.Equals',
    fieldName: 'name',
    operation: 'EQUALS',
    value: { '@type': 'java.lang.String', value: 'test' },
  };

  const mockOnRemove = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnRemove.mockClear();
    mockOnChange.mockClear();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );

    expect(container.querySelector('.builder-condition-row')).toBeInTheDocument();
  });

  it('should display field name select', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );

    const selects = container.querySelectorAll('.ant-select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should display operation select', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );

    const selects = container.querySelectorAll('.ant-select');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('should display value input for string fields', () => {
    render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
  });

  it('should display delete button when not disabled', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    const deleteButton = container.querySelector('.anticon-delete');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should not display delete button when disableRemove is true', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        disableRemove={true}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    const deleteButton = container.querySelector('.anticon-delete');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should not display delete button when readOnly is true', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        readOnly={true}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    const deleteButton = container.querySelector('.anticon-delete');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should show error styling when showErrors is true and fieldName is empty', () => {
    const emptyCondition: FilterCondition = {
      '@bean': '',
      fieldName: '',
      operation: '',
    };

    const { container } = render(
      <FilterBuilderCondition
        condition={emptyCondition}
        cols={mockCols}
        showErrors={true}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.col-err')).toBeInTheDocument();
  });

  it('should handle integer field type', () => {
    const intCondition: FilterCondition = {
      '@bean': 'com.cyoda.core.conditions.queryable.Equals',
      fieldName: 'age',
      operation: 'EQUALS',
      value: { '@type': 'java.lang.Integer', value: 25 },
    };

    render(
      <FilterBuilderCondition
        condition={intCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    // InputNumber should be rendered for integer fields
    expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
  });

  it('should handle boolean field type', () => {
    const boolCondition: FilterCondition = {
      '@bean': 'com.cyoda.core.conditions.queryable.Equals',
      fieldName: 'active',
      operation: 'EQUALS',
      value: { '@type': 'java.lang.Boolean', value: true },
    };

    const { container } = render(
      <FilterBuilderCondition
        condition={boolCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );

    // Boolean select should be rendered (3 selects: field, operation, boolean value)
    const selects = container.querySelectorAll('.ant-select');
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle range conditions (BETWEEN)', () => {
    const rangeCondition: FilterCondition = {
      '@bean': 'com.cyoda.core.conditions.queryable.Between',
      fieldName: 'age',
      operation: 'BETWEEN',
      from: { '@type': 'java.lang.Integer', value: 18 },
      to: { '@type': 'java.lang.Integer', value: 65 },
    };

    render(
      <FilterBuilderCondition
        condition={rangeCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    // Should render two input fields for from and to
    const inputs = screen.getAllByPlaceholderText('Please input');
    expect(inputs.length).toBe(2);
  });

  it('should handle IS_NULL condition (no value field)', () => {
    const nullCondition: FilterCondition = {
      '@bean': 'com.cyoda.core.conditions.nonqueryable.IsNull',
      fieldName: 'name',
      operation: 'IS_NULL',
    };

    render(
      <FilterBuilderCondition
        condition={nullCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    // Should not render value input for IS_NULL
    expect(screen.queryByPlaceholderText('Please input')).not.toBeInTheDocument();
  });

  it('should apply last class when isLast is true', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        isLast={true}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.builder-condition-row.last')).toBeInTheDocument();
  });

  it('should not apply last class when isLast is false', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        isLast={false}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.builder-condition-row.last')).not.toBeInTheDocument();
  });

  it('should disable field select when disableColumn is true', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        disableColumn={true}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    const selects = container.querySelectorAll('.ant-select-disabled');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should disable all inputs when readOnly is true', () => {
    const { container } = render(
      <FilterBuilderCondition
        condition={mockCondition}
        cols={mockCols}
        readOnly={true}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    const disabledElements = container.querySelectorAll('.ant-select-disabled, .ant-input-disabled');
    expect(disabledElements.length).toBeGreaterThan(0);
  });

  it('should handle empty condition', () => {
    const emptyCondition: FilterCondition = {
      '@bean': '',
      fieldName: '',
      operation: '',
    };

    const { container } = render(
      <FilterBuilderCondition
        condition={emptyCondition}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );

    const selects = container.querySelectorAll('.ant-select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should handle condition without value', () => {
    const conditionNoValue: FilterCondition = {
      '@bean': 'com.cyoda.core.conditions.queryable.Equals',
      fieldName: 'name',
      operation: 'EQUALS',
    };

    render(
      <FilterBuilderCondition
        condition={conditionNoValue}
        cols={mockCols}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
  });
});

