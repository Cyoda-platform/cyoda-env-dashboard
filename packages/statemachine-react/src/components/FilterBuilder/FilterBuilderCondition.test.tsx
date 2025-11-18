/**
 * FilterBuilderCondition Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBuilderCondition from './FilterBuilderCondition';
import type { Condition } from './HelperFilter';

describe('FilterBuilderCondition', () => {
  const mockCols = [
    { alias: 'name', type: 'java.lang.String', typeShort: 'String' },
    { alias: 'age', type: 'java.lang.Integer', typeShort: 'Integer' },
    { alias: 'active', type: 'java.lang.Boolean', typeShort: 'Boolean' },
    { alias: 'createdDate', type: 'java.time.LocalDate', typeShort: 'LocalDate' },
  ];

  const mockCondition: Condition = {
    '@bean': '',
    fieldName: '',
    operation: '',
    value: {
      '@type': '',
      value: '',
    },
  };

  const mockOnChange = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render field name select', () => {
      render(
        <FilterBuilderCondition
          condition={mockCondition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      // Should have 2 Select components (field name and operation)
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('should render operation select', () => {
      render(
        <FilterBuilderCondition
          condition={mockCondition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('should render value input for non-range operations', () => {
      const condition: Condition = {
        '@bean': 'com.cyoda.core.conditions.queryable.Equals',
        fieldName: 'name',
        operation: 'EQUALS',
        value: {
          '@type': 'java.lang.String',
          value: 'test',
        },
      };

      render(
        <FilterBuilderCondition
          condition={condition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByPlaceholderText('Please input');
      expect(input).toBeInTheDocument();
    });

    it('should render delete button by default', () => {
      render(
        <FilterBuilderCondition
          condition={mockCondition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should not render delete button when disableRemove is true', () => {
      render(
        <FilterBuilderCondition
          condition={mockCondition}
          cols={mockCols}
          disableRemove={true}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('should not render delete button when readOnly is true', () => {
      render(
        <FilterBuilderCondition
          condition={mockCondition}
          cols={mockCols}
          readOnly={true}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });
  });

  describe('Field Name Selection', () => {
    it('should have field name select with placeholder', () => {
      render(
        <FilterBuilderCondition
          condition={mockCondition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      // Should have Select placeholders
      const placeholders = screen.getAllByText('Select');
      expect(placeholders.length).toBeGreaterThanOrEqual(2);
    });

    it('should display selected field name', () => {
      const condition: Condition = {
        '@bean': '',
        fieldName: 'name',
        operation: '',
        value: {
          '@type': 'java.lang.String',
          value: '',
        },
      };

      render(
        <FilterBuilderCondition
          condition={condition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      // Should display the selected field name
      const nameElement = screen.getByTitle('name');
      expect(nameElement).toBeInTheDocument();
    });
  });

  describe('Operation Selection', () => {
    it('should display selected operation', () => {
      const condition: Condition = {
        '@bean': 'com.cyoda.core.conditions.queryable.Equals',
        fieldName: 'name',
        operation: 'EQUALS',
        value: {
          '@type': 'java.lang.String',
          value: 'test',
        },
      };

      render(
        <FilterBuilderCondition
          condition={condition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      // Should display the selected operation
      const equalsElement = screen.getByTitle('equals');
      expect(equalsElement).toBeInTheDocument();
    });

    it('should render for Integer field type', () => {
      const condition: Condition = {
        '@bean': '',
        fieldName: 'age',
        operation: '',
        value: {
          '@type': 'java.lang.Integer',
          value: 0,
        },
      };

      render(
        <FilterBuilderCondition
          condition={condition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      // For Integer type, should render InputNumber (spinbutton)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('Value Input', () => {
    it('should render text input for String fields', () => {
      const condition: Condition = {
        '@bean': 'com.cyoda.core.conditions.queryable.Equals',
        fieldName: 'name',
        operation: 'EQUALS',
        value: {
          '@type': 'java.lang.String',
          value: 'test',
        },
      };

      render(
        <FilterBuilderCondition
          condition={condition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const input = screen.getByPlaceholderText('Please input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('test');
    });
  });

  describe('Remove Button', () => {
    it('should call onRemove when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FilterBuilderCondition
          condition={mockCondition}
          cols={mockCols}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });
  });
});

