/**
 * RangeCondition Component Tests
 * Tests for advanced filtering component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RangeCondition, type RangeConditionForm } from './RangeCondition';

// Mock the ModellingPopUp component
vi.mock('@cyoda/tableau-react', () => ({
  ModellingPopUp: vi.fn(({ onChange, requestClass }) => (
    <div data-testid="modelling-popup">
      <button
        data-testid="modelling-popup-select"
        onClick={() => {
          onChange([
            {
              fullPath: 'entity.field1',
              colType: 'java.lang.String',
            },
          ]);
        }}
      >
        Select Column
      </button>
    </div>
  )),
}));

// Mock FilterBuilderCondition component
vi.mock('../../../cobi-react/src/components/DataMapper/FilterBuilder/FilterBuilderCondition', () => ({
  default: vi.fn(({ condition, onRemove, onChange }) => (
    <div data-testid="filter-builder-condition">
      <span>Field: {condition.fieldName}</span>
      <button data-testid="condition-change" onClick={onChange}>
        Change Condition
      </button>
      <button data-testid="condition-remove" onClick={onRemove}>
        Remove
      </button>
    </div>
  )),
}));

describe('RangeCondition', () => {
  const mockOnChange = vi.fn();

  const defaultForm: RangeConditionForm = {
    entityClassName: 'com.example.Entity',
    rangeOrder: 'ASC',
    rangeCondition: {
      '@bean': '',
      fieldName: '',
      operation: '',
      value: {
        '@type': '',
        value: '',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} />);

      expect(screen.getByText('Add New Range Column Definition')).toBeInTheDocument();
      expect(screen.getByText('Range Settings')).toBeInTheDocument();
    });

    it('should render Range Order select with correct value', () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('ASC');
    });

    it('should show info alert when no entity class is selected', () => {
      const formWithoutEntity = { ...defaultForm, entityClassName: '' };
      render(<RangeCondition form={formWithoutEntity} onChange={mockOnChange} />);

      expect(screen.getByText('Please select an entity class first')).toBeInTheDocument();
    });

    it('should disable Add button when no entity class is selected', () => {
      const formWithoutEntity = { ...defaultForm, entityClassName: '' };
      render(<RangeCondition form={formWithoutEntity} onChange={mockOnChange} />);

      const addButton = screen.getByText('Add New Range Column Definition').closest('button');
      expect(addButton).toBeDisabled();
    });

    it('should enable Add button when entity class is selected', () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} />);

      const addButton = screen.getByText('Add New Range Column Definition').closest('button');
      expect(addButton).not.toBeDisabled();
    });

    it('should not render FilterBuilderCondition when no range condition is set', () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} />);

      expect(screen.queryByTestId('filter-builder-condition')).not.toBeInTheDocument();
    });

    it('should render FilterBuilderCondition when range condition is set', () => {
      const formWithCondition = {
        ...defaultForm,
        rangeCondition: {
          '@bean': 'com.cyoda.core.conditions.EqualsCondition',
          fieldName: 'entity.field1',
          operation: 'EQUALS',
          value: {
            '@type': 'java.lang.String',
            value: 'test',
          },
        },
      };

      render(<RangeCondition form={formWithCondition} onChange={mockOnChange} />);

      expect(screen.getByTestId('filter-builder-condition')).toBeInTheDocument();
    });
  });

  describe('Range Order Selection', () => {
    it('should call onChange when range order is changed to DESC', async () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);

      await waitFor(() => {
        const descOption = screen.getByText('DESC');
        fireEvent.click(descOption);
      });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultForm,
        rangeOrder: 'DESC',
      });
    });

    it('should call onChange when range order is changed to ASC', async () => {
      const formWithDesc = { ...defaultForm, rangeOrder: 'DESC' as const };
      render(<RangeCondition form={formWithDesc} onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);

      await waitFor(() => {
        const ascOption = screen.getByText('ASC');
        fireEvent.click(ascOption);
      });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...formWithDesc,
        rangeOrder: 'ASC',
      });
    });
  });

  describe('Column Selection', () => {
    it('should open ModellingPopUp when Add button is clicked', () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} />);

      const addButton = screen.getByText('Add New Range Column Definition');
      fireEvent.click(addButton);

      // ModellingPopUp should be rendered (mocked)
      expect(screen.getByTestId('modelling-popup')).toBeInTheDocument();
    });

    it('should update range condition when column is selected', async () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} />);

      const selectButton = screen.getByTestId('modelling-popup-select');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultForm,
          rangeCondition: {
            '@bean': 'com.cyoda.core.conditions.EqualsCondition',
            fieldName: 'entity.field1',
          },
        });
      });
    });

    it('should clear range condition when no columns are selected', async () => {
      const formWithCondition = {
        ...defaultForm,
        rangeCondition: {
          '@bean': 'com.cyoda.core.conditions.EqualsCondition',
          fieldName: 'entity.field1',
          operation: 'EQUALS',
          value: {
            '@type': 'java.lang.String',
            value: 'test',
          },
        },
      };

      const { rerender } = render(<RangeCondition form={formWithCondition} onChange={mockOnChange} />);

      // Simulate clearing selection by passing empty array
      const ModellingPopUp = await import('@cyoda/tableau-react');
      const mockOnChangeHandler = (ModellingPopUp.ModellingPopUp as any).mock.calls[0][0].onChange;
      mockOnChangeHandler([]);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultForm,
          rangeCondition: {
            '@bean': '',
            fieldName: '',
            operation: '',
            value: {
              '@type': '',
              value: '',
            },
          },
        });
      });
    });
  });

  describe('FilterBuilderCondition Interactions', () => {
    const formWithCondition: RangeConditionForm = {
      entityClassName: 'com.example.Entity',
      rangeOrder: 'ASC',
      rangeCondition: {
        '@bean': 'com.cyoda.core.conditions.EqualsCondition',
        fieldName: 'entity.field1',
        operation: 'EQUALS',
        value: {
          '@type': 'java.lang.String',
          value: 'test',
        },
      },
    };

    it('should call onChange when condition is modified', () => {
      render(<RangeCondition form={formWithCondition} onChange={mockOnChange} />);

      const changeButton = screen.getByTestId('condition-change');
      fireEvent.click(changeButton);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should clear condition when remove is clicked', () => {
      render(<RangeCondition form={formWithCondition} onChange={mockOnChange} />);

      const removeButton = screen.getByTestId('condition-remove');
      fireEvent.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...formWithCondition,
        rangeCondition: {
          '@bean': '',
          fieldName: '',
          operation: '',
          value: {
            '@type': '',
            value: '',
          },
        },
      });
    });
  });

  describe('Disabled State', () => {
    it('should disable all controls when disabled prop is true', () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} disabled={true} />);

      const addButton = screen.getByText('Add New Range Column Definition').closest('button');
      const select = screen.getByRole('combobox');

      expect(addButton).toBeDisabled();
      expect(select).toBeDisabled();
    });

    it('should enable all controls when disabled prop is false', () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} disabled={false} />);

      const addButton = screen.getByText('Add New Range Column Definition').closest('button');
      const select = screen.getByRole('combobox');

      expect(addButton).not.toBeDisabled();
      expect(select).not.toBeDisabled();
    });
  });

  describe('Props Validation', () => {
    it('should pass correct props to ModellingPopUp', () => {
      render(<RangeCondition form={defaultForm} onChange={mockOnChange} />);

      const ModellingPopUp = require('@cyoda/tableau-react').ModellingPopUp;
      const lastCall = ModellingPopUp.mock.calls[ModellingPopUp.mock.calls.length - 1][0];

      expect(lastCall.requestClass).toBe('com.example.Entity');
      expect(lastCall.onlyRange).toBe(true);
      expect(lastCall.limit).toBe(1);
    });

    it('should pass correct props to FilterBuilderCondition', () => {
      const formWithCondition = {
        ...defaultForm,
        rangeCondition: {
          '@bean': 'com.cyoda.core.conditions.EqualsCondition',
          fieldName: 'entity.field1',
          operation: 'EQUALS',
          value: {
            '@type': 'java.lang.String',
            value: 'test',
          },
        },
      };

      render(<RangeCondition form={formWithCondition} onChange={mockOnChange} />);

      const FilterBuilderCondition = require('../../../cobi-react/src/components/DataMapper/FilterBuilder/FilterBuilderCondition').default;
      const lastCall = FilterBuilderCondition.mock.calls[FilterBuilderCondition.mock.calls.length - 1][0];

      expect(lastCall.condition).toEqual(formWithCondition.rangeCondition);
      expect(lastCall.disableColumn).toBe(true);
      expect(lastCall.disableRemove).toBe(false);
    });
  });
});

