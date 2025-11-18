import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBuilderGroup from './FilterBuilderGroup';
import type { GroupCondition } from './HelperFilter';

// Mock the FilterBuilderCondition component
vi.mock('./FilterBuilderCondition', () => ({
  default: ({ condition, onChange, onRemove }: any) => (
    <div data-testid="filter-condition">
      <span>Condition: {condition.fieldName || 'empty'}</span>
      <button onClick={() => onChange({ ...condition, fieldName: 'changed' })}>
        Change
      </button>
      <button onClick={onRemove}>Remove</button>
    </div>
  ),
}));

describe('FilterBuilderGroup', () => {
  const mockCols = [
    { alias: 'name', type: 'String' },
    { alias: 'age', type: 'Integer' },
  ];

  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnRemove: ReturnType<typeof vi.fn>;
  let mockGroupCondition: GroupCondition;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnRemove = vi.fn();
    mockGroupCondition = {
      '@bean': 'com.cyoda.core.conditions.queryable.GroupCondition',
      operator: 'AND',
      conditions: [
        {
          '@bean': '',
          fieldName: '',
          operation: '',
          value: {
            '@type': 'java.lang.String',
            value: '',
          },
        },
      ],
    };
  });

  describe('Rendering', () => {
    it('should render operator radio buttons', () => {
      render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          onChange={mockOnChange}
        />
      );

      const matchAllRadio = screen.getByText('Match All');
      const matchAnyRadio = screen.getByText('Match Any');

      expect(matchAllRadio).toBeInTheDocument();
      expect(matchAnyRadio).toBeInTheDocument();
      // Check that AND is selected by checking the parent button has the checked class
      expect(matchAllRadio.closest('.ant-radio-button-wrapper')).toHaveClass('ant-radio-button-wrapper-checked');
    });

    it('should render add button', () => {
      render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          onChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /plus/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should render delete button when onRemove is provided and level > 0', () => {
      render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          level={1}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should not render delete button when onRemove is not provided', () => {
      render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          onChange={mockOnChange}
        />
      );

      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('should render conditions', () => {
      render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          onChange={mockOnChange}
        />
      );

      const conditions = screen.getAllByTestId('filter-condition');
      expect(conditions).toHaveLength(1);
    });
  });

  describe('Operator Change', () => {
    it('should call onChange when operator is changed to OR', async () => {
      const user = userEvent.setup();

      render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          onChange={mockOnChange}
        />
      );

      const matchAnyRadio = screen.getByText('Match Any');
      await user.click(matchAnyRadio);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          operator: 'OR',
        })
      );
    });
  });

  describe('Nested Groups', () => {
    it('should render nested group conditions', () => {
      const nestedGroupCondition: GroupCondition = {
        '@bean': 'com.cyoda.core.conditions.queryable.GroupCondition',
        operator: 'AND',
        conditions: [
          {
            '@bean': '',
            fieldName: 'name',
            operation: '',
            value: {
              '@type': 'java.lang.String',
              value: '',
            },
          },
          {
            '@bean': 'com.cyoda.core.conditions.queryable.GroupCondition',
            operator: 'OR',
            conditions: [
              {
                '@bean': '',
                fieldName: 'age',
                operation: '',
                value: {
                  '@type': 'java.lang.Integer',
                  value: 0,
                },
              },
            ],
          },
        ],
      };

      render(
        <FilterBuilderGroup
          condition={nestedGroupCondition}
          cols={mockCols}
          onChange={mockOnChange}
        />
      );

      // Should render both the parent group and nested group
      const matchAllRadios = screen.getAllByText('Match All');
      const matchAnyRadios = screen.getAllByText('Match Any');
      expect(matchAllRadios.length).toBeGreaterThanOrEqual(1);
      expect(matchAnyRadios.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ReadOnly Mode', () => {
    it('should disable operator radio buttons when readOnly is true', () => {
      render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          readOnly={true}
          onChange={mockOnChange}
        />
      );

      const matchAllRadio = screen.getByText('Match All');
      const matchAnyRadio = screen.getByText('Match Any');

      // Check that the radio buttons are disabled by checking the input element
      const matchAllInput = matchAllRadio.closest('.ant-radio-button-wrapper')?.querySelector('input');
      const matchAnyInput = matchAnyRadio.closest('.ant-radio-button-wrapper')?.querySelector('input');

      expect(matchAllInput).toBeDisabled();
      expect(matchAnyInput).toBeDisabled();
    });

    it('should not render add button when readOnly is true', () => {
      render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          readOnly={true}
          onChange={mockOnChange}
        />
      );

      const addButton = screen.queryByRole('button', { name: /plus/i });
      expect(addButton).not.toBeInTheDocument();
    });
  });

  describe('Level Styling', () => {
    it('should apply first class when level is 0', () => {
      const { container } = render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          level={0}
          onChange={mockOnChange}
        />
      );

      const groupElement = container.querySelector('.builder-condition-group.first');
      expect(groupElement).toBeInTheDocument();
    });

    it('should not apply first class when level is greater than 0', () => {
      const { container } = render(
        <FilterBuilderGroup
          condition={mockGroupCondition}
          cols={mockCols}
          level={1}
          onChange={mockOnChange}
        />
      );

      const groupElement = container.querySelector('.builder-condition-group.first');
      expect(groupElement).not.toBeInTheDocument();
    });
  });
});

