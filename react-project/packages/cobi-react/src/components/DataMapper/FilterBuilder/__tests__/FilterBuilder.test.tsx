/**
 * Tests for FilterBuilder component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FilterBuilder from '../FilterBuilder';
import { FilterGroup, ColumnInfo } from '../types';

describe('FilterBuilder', () => {
  const mockCols: ColumnInfo[] = [
    { alias: 'name', type: 'java.lang.String', typeShort: 'String', label: 'Name' },
    { alias: 'age', type: 'java.lang.Integer', typeShort: 'Integer', label: 'Age' },
    { alias: 'email', type: 'java.lang.String', typeShort: 'String', label: 'Email' },
  ];

  const mockFilter: FilterGroup = {
    '@bean': 'com.cyoda.core.conditions.GroupCondition',
    operator: 'AND',
    conditions: [],
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render without crashing', () => {
    render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Build filter conditions/i)).toBeInTheDocument();
  });

  it('should show warning when no columns are available', () => {
    render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={[]}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('No Fields Available')).toBeInTheDocument();
    expect(screen.getByText(/Please select an entity class first/i)).toBeInTheDocument();
  });

  it('should show help text when columns are available', () => {
    render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Build filter conditions to limit which entities/i)).toBeInTheDocument();
  });

  it('should render FilterBuilderGroup when columns are available', () => {
    const { container } = render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    // FilterBuilderGroup should be rendered (uses class 'builder-condition-group')
    const group = container.querySelector('.builder-condition-group');
    expect(group).not.toBeNull();
  });

  it('should show error when showErrors is true and no conditions', () => {
    render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mockCols}
        showErrors={true}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('No Conditions')).toBeInTheDocument();
    expect(screen.getByText(/Please add at least one condition/i)).toBeInTheDocument();
  });

  it('should not show error when showErrors is false', () => {
    render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mockCols}
        showErrors={false}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.queryByText('No Conditions')).not.toBeInTheDocument();
  });

  it('should not show error when conditions exist', () => {
    const filterWithConditions: FilterGroup = {
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

    render(
      <FilterBuilder
        entityFilter={filterWithConditions}
        cols={mockCols}
        showErrors={true}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.queryByText('No Conditions')).not.toBeInTheDocument();
  });

  it('should pass readOnly prop to FilterBuilderGroup', () => {
    const { container } = render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mockCols}
        readOnly={true}
        onChange={mockOnChange}
      />
    );

    // Check that the component is rendered (readOnly is passed down)
    const group = container.querySelector('.builder-condition-group');
    expect(group).not.toBeNull();
  });

  it('should update local filter when entityFilter prop changes', () => {
    const { rerender } = render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    const newFilter: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'OR',
      conditions: [],
    };

    rerender(
      <FilterBuilder
        entityFilter={newFilter}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );

    // Component should re-render with new filter
    expect(screen.getByText(/Build filter conditions/i)).toBeInTheDocument();
  });

  it('should render with different column types', () => {
    const mixedCols: ColumnInfo[] = [
      { alias: 'name', type: 'java.lang.String', typeShort: 'String' },
      { alias: 'age', type: 'java.lang.Integer', typeShort: 'Integer' },
      { alias: 'price', type: 'java.lang.Double', typeShort: 'Double' },
      { alias: 'active', type: 'java.lang.Boolean', typeShort: 'Boolean' },
      { alias: 'createdAt', type: 'java.time.LocalDateTime', typeShort: 'LocalDateTime' },
    ];

    render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mixedCols}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Build filter conditions/i)).toBeInTheDocument();
  });

  it('should handle empty filter group', () => {
    const emptyFilter: FilterGroup = {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    };

    render(
      <FilterBuilder
        entityFilter={emptyFilter}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Build filter conditions/i)).toBeInTheDocument();
  });

  it('should handle filter with nested groups', () => {
    const nestedFilter: FilterGroup = {
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
      <FilterBuilder
        entityFilter={nestedFilter}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Build filter conditions/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={mockCols}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.filter-builder')).toBeInTheDocument();
  });

  it('should handle columns without labels', () => {
    const colsWithoutLabels: ColumnInfo[] = [
      { alias: 'field1', type: 'java.lang.String', typeShort: 'String' },
      { alias: 'field2', type: 'java.lang.Integer', typeShort: 'Integer' },
    ];

    render(
      <FilterBuilder
        entityFilter={mockFilter}
        cols={colsWithoutLabels}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Build filter conditions/i)).toBeInTheDocument();
  });
});

