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

  describe('Condition Types', () => {
    // String conditions
    describe('String Conditions', () => {
      it('should handle EQUALS condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.Equals',
          fieldName: 'name',
          operation: 'EQUALS',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle NOT_EQUAL condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.NotEquals',
          fieldName: 'name',
          operation: 'NOT_EQUAL',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle IEQUALS condition (case insensitive)', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.IEquals',
          fieldName: 'name',
          operation: 'IEQUALS',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle INOT_EQUAL condition (case insensitive)', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.INotEquals',
          fieldName: 'name',
          operation: 'INOT_EQUAL',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle CONTAINS condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.IContains',
          fieldName: 'name',
          operation: 'CONTAINS',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle ISTARTS_WITH condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.IStartsWith',
          fieldName: 'name',
          operation: 'ISTARTS_WITH',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle IENDS_WITH condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.IEndsWith',
          fieldName: 'name',
          operation: 'IENDS_WITH',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle INOT_CONTAINS condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.INotContains',
          fieldName: 'name',
          operation: 'INOT_CONTAINS',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle INOT_STARTS_WITH condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.INotStartsWith',
          fieldName: 'name',
          operation: 'INOT_STARTS_WITH',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle NOT_ENDS_WITH condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.NotEndsWith',
          fieldName: 'name',
          operation: 'NOT_ENDS_WITH',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle INOT_ENDS_WITH condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.INotEndsWith',
          fieldName: 'name',
          operation: 'INOT_ENDS_WITH',
          value: { '@type': 'java.lang.String', value: 'test' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle LIKE condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.Like',
          fieldName: 'name',
          operation: 'LIKE',
          value: { '@type': 'java.lang.String', value: '%test%' },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });
    });

    // Numeric conditions
    describe('Numeric Conditions', () => {
      it('should handle LESS_THAN condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.LessThan',
          fieldName: 'age',
          operation: 'LESS_THAN',
          value: { '@type': 'java.lang.Integer', value: 30 },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle GREATER_THAN condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
          fieldName: 'age',
          operation: 'GREATER_THAN',
          value: { '@type': 'java.lang.Integer', value: 18 },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle LESS_OR_EQUAL condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.LessThanEquals',
          fieldName: 'age',
          operation: 'LESS_OR_EQUAL',
          value: { '@type': 'java.lang.Integer', value: 65 },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle GREATER_OR_EQUAL condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.GreaterThanEquals',
          fieldName: 'age',
          operation: 'GREATER_OR_EQUAL',
          value: { '@type': 'java.lang.Integer', value: 18 },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });
    });

    // Range conditions
    describe('Range Conditions', () => {
      it('should handle BETWEEN condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.Between',
          fieldName: 'age',
          operation: 'BETWEEN',
          from: { '@type': 'java.lang.Integer', value: 18 },
          to: { '@type': 'java.lang.Integer', value: 65 },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        const inputs = screen.getAllByPlaceholderText('Please input');
        expect(inputs.length).toBe(2);
      });

      it('should handle BETWEEN_INCLUSIVE condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.queryable.BetweenInclusive',
          fieldName: 'age',
          operation: 'BETWEEN_INCLUSIVE',
          from: { '@type': 'java.lang.Integer', value: 18 },
          to: { '@type': 'java.lang.Integer', value: 65 },
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        const inputs = screen.getAllByPlaceholderText('Please input');
        expect(inputs.length).toBe(2);
      });
    });

    // Null conditions
    describe('Null Conditions', () => {
      it('should handle IS_NULL condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.IsNull',
          fieldName: 'name',
          operation: 'IS_NULL',
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.queryByPlaceholderText('Please input')).not.toBeInTheDocument();
      });

      it('should handle NOT_NULL condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.NotNull',
          fieldName: 'name',
          operation: 'NOT_NULL',
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.queryByPlaceholderText('Please input')).not.toBeInTheDocument();
      });
    });

    // Change tracking conditions
    describe('Change Tracking Conditions', () => {
      it('should handle IS_UNCHANGED condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.IsUnchanged',
          fieldName: 'name',
          operation: 'IS_UNCHANGED',
          lookback: '0',
          rangeField: 'false',
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });

      it('should handle IS_CHANGED condition', () => {
        const condition: FilterCondition = {
          '@bean': 'com.cyoda.core.conditions.nonqueryable.IsChanged',
          fieldName: 'name',
          operation: 'IS_CHANGED',
          lookback: '0',
          rangeField: 'false',
        };

        render(
          <FilterBuilderCondition
            condition={condition}
            cols={mockCols}
            onRemove={mockOnRemove}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByPlaceholderText('Please input')).toBeInTheDocument();
      });
    });
  });
});

