/**
 * Tests for FilterBuilderGroup component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBuilderGroup from '../FilterBuilderGroup';
import { FilterGroup, FilterCondition, ColumnInfo } from '../types';

describe('FilterBuilderGroup', () => {
  const mockCols: ColumnInfo[] = [
    { alias: 'name', type: 'java.lang.String', typeShort: 'String', label: 'Name' },
    { alias: 'age', type: 'java.lang.Integer', typeShort: 'Integer', label: 'Age' },
    { alias: 'email', type: 'java.lang.String', typeShort: 'String', label: 'Email' },
  ];

  const mockOnChange = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnRemove.mockClear();
  });

  it('should render without crashing', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    expect(container.querySelector('.builder-condition-group')).toBeInTheDocument();
  });

  it('should display AND operator button', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    // The label is "Match All" for AND operator
    expect(screen.getByText('Match All')).toBeInTheDocument();
  });

  it('should display OR operator button', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'OR',
      conditions: [],
    };

    render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    // The label is "Match Any" for OR operator
    expect(screen.getByText('Match Any')).toBeInTheDocument();
  });

  it('should display add button when not readOnly', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );
    
    const addButton = container.querySelector('.button-add');
    expect(addButton).toBeInTheDocument();
  });

  it('should not display add button when readOnly', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        readOnly={true}
        onChange={mockOnChange}
      />
    );
    
    const addButton = container.querySelector('.button-add');
    expect(addButton).not.toBeInTheDocument();
  });

  it('should display delete button when level > 0', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        level={1}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    const deleteButton = container.querySelector('.button-delete');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should not display delete button when level is 0', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        level={0}
        onChange={mockOnChange}
      />
    );
    
    const deleteButton = container.querySelector('.button-delete');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should render child conditions', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [
        {
          '@bean': 'com.cyoda.core.conditions.queryable.Equals',
          fieldName: 'name',
          operation: 'EQUALS',
          value: { '@type': 'java.lang.String', value: 'test' },
        },
      ],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    // Should render FilterBuilderCondition
    expect(container.querySelector('.builder-condition-row')).toBeInTheDocument();
  });

  it('should render nested groups', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [
        {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'OR',
          conditions: [],
        },
      ],
    };

    render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    // Should render nested group with OR operator (label is "Match Any")
    // Both parent and child groups have "Match Any" button, so use getAllByText
    const matchAnyButtons = screen.getAllByText('Match Any');
    expect(matchAnyButtons.length).toBeGreaterThan(0);
  });

  it('should render multiple conditions', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [
        {
          '@bean': 'com.cyoda.core.conditions.queryable.Equals',
          fieldName: 'name',
          operation: 'EQUALS',
          value: { '@type': 'java.lang.String', value: 'test1' },
        },
        {
          '@bean': 'com.cyoda.core.conditions.queryable.Equals',
          fieldName: 'email',
          operation: 'EQUALS',
          value: { '@type': 'java.lang.String', value: 'test2' },
        },
      ],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );
    
    // Should render two condition rows
    const conditionRows = container.querySelectorAll('.builder-condition-row');
    expect(conditionRows.length).toBe(2);
  });

  it('should apply first class when level is 0', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        level={0}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.builder-condition-group.first')).toBeInTheDocument();
  });

  it('should apply wrap-actions class when level > 0', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        level={1}
        onRemove={mockOnRemove}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.builder-condition-group.wrap-actions')).toBeInTheDocument();
  });

  it('should disable operator buttons when readOnly', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        readOnly={true}
        onChange={mockOnChange}
      />
    );

    // Check that radio group exists and has disabled buttons
    const radioGroup = container.querySelector('.ant-radio-group');
    expect(radioGroup).not.toBeNull();
    const disabledButtons = container.querySelectorAll('.ant-radio-button-wrapper-disabled');
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('should handle empty conditions array', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Match All')).toBeInTheDocument();
  });

  it('should mark last condition with last class', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [
        {
          '@bean': 'com.cyoda.core.conditions.queryable.Equals',
          fieldName: 'name',
          operation: 'EQUALS',
          value: { '@type': 'java.lang.String', value: 'test1' },
        },
        {
          '@bean': 'com.cyoda.core.conditions.queryable.Equals',
          fieldName: 'email',
          operation: 'EQUALS',
          value: { '@type': 'java.lang.String', value: 'test2' },
        },
      ],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );
    
    const lastFields = container.querySelectorAll('.inner-fields.last');
    expect(lastFields.length).toBe(1);
  });

  it('should pass showErrors to child conditions', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [
        {
          '@bean': '',
          fieldName: '',
          operation: '',
        },
      ],
    };

    const { container } = render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        showErrors={true}
        onChange={mockOnChange}
      />
    );
    
    // Should show error styling on child condition
    expect(container.querySelector('.col-err')).toBeInTheDocument();
  });

  it('should handle mixed conditions and groups', () => {
    const group: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [
        {
          '@bean': 'com.cyoda.core.conditions.queryable.Equals',
          fieldName: 'name',
          operation: 'EQUALS',
          value: { '@type': 'java.lang.String', value: 'test' },
        },
        {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'OR',
          conditions: [],
        },
      ],
    };

    render(
      <FilterBuilderGroup
        condition={group}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    // Both parent and child groups have radio buttons, so use getAllByText
    const matchAllButtons = screen.getAllByText('Match All');
    const matchAnyButtons = screen.getAllByText('Match Any');
    expect(matchAllButtons.length).toBeGreaterThan(0);
    expect(matchAnyButtons.length).toBeGreaterThan(0);
  });
});

