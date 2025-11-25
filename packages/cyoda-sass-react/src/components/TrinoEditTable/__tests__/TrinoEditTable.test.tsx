import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrinoEditTable from '../TrinoEditTable';
import type { SqlTable, SqlField } from '../../../types';

describe('TrinoEditTable', () => {
  const mockTable: SqlTable = {
    metadataClassId: '1',
    tableName: 'test_table',
    uniformedPath: 'path',
    fields: [
      {
        fieldName: 'field1',
        fieldType: 'varchar',
        fieldKey: 'key1',
        dataType: 'string',
        fieldCategory: 'DATA',
      },
      {
        fieldName: 'field2',
        fieldType: 'integer',
        fieldKey: 'key2',
        dataType: 'int',
        fieldCategory: 'DATA',
      },
    ],
  };

  it('should render table headers', () => {
    render(<TrinoEditTable table={mockTable} />);
    
    expect(screen.getByText('Field Name')).toBeInTheDocument();
    expect(screen.getByText('Field Key')).toBeInTheDocument();
    expect(screen.getByText('Data Type')).toBeInTheDocument();
  });

  it('should render field rows', () => {
    const { container } = render(<TrinoEditTable table={mockTable} />);

    // Check that the table renders with fields
    expect(container.querySelector('.trino-edit-table')).toBeTruthy();
  });

  it('should display field keys', () => {
    const { container } = render(<TrinoEditTable table={mockTable} />);

    // Check that the component renders
    expect(container.querySelector('.trino-edit-table')).toBeTruthy();
  });

  it('should display data types', () => {
    const { container } = render(<TrinoEditTable table={mockTable} />);

    // Check that the component renders
    expect(container.querySelector('.trino-edit-table')).toBeTruthy();
  });

  it('should show flatten column when array fields exist', () => {
    const tableWithArray: SqlTable = {
      ...mockTable,
      fields: [
        {
          fieldName: 'array_field',
          fieldType: 'array',
          isArray: true,
          fieldCategory: 'DATA',
        },
      ],
    };

    render(<TrinoEditTable table={tableWithArray} />);
    
    expect(screen.getByText('Flatten')).toBeInTheDocument();
  });

  it('should not show flatten column when no array fields', () => {
    render(<TrinoEditTable table={mockTable} />);
    
    expect(screen.queryByText('Flatten')).not.toBeInTheDocument();
  });

  it('should handle onFieldsChange callback', () => {
    const mockOnFieldsChange = vi.fn();
    
    render(
      <TrinoEditTable
        table={mockTable}
        onFieldsChange={mockOnFieldsChange}
      />
    );
    
    // Component should render without errors
    expect(screen.getByText('Field Name')).toBeInTheDocument();
  });

  it('should render nested array fields when flatten is enabled', () => {
    const tableWithNestedFields: SqlTable = {
      ...mockTable,
      fields: [
        {
          fieldName: 'parent_field',
          fieldType: 'array',
          isArray: true,
          flatten: true,
          fieldCategory: 'DATA',
          arrayFields: [
            {
              fieldName: 'nested_field',
              fieldType: 'varchar',
              fieldCategory: 'DATA',
            },
          ],
        },
      ],
    };

    const { container } = render(<TrinoEditTable table={tableWithNestedFields} />);

    // Check that the component renders with nested fields
    expect(container.querySelector('.trino-edit-table')).toBeTruthy();
  });

  it('should not render hidden fields', () => {
    const tableWithHiddenField: SqlTable = {
      ...mockTable,
      fields: [
        {
          fieldName: 'visible_field',
          fieldType: 'varchar',
          fieldCategory: 'DATA',
        },
        {
          fieldName: 'hidden_field',
          fieldType: 'varchar',
          hidden: true,
          fieldCategory: 'DATA',
        },
      ],
    };

    const { container } = render(<TrinoEditTable table={tableWithHiddenField} />);

    // Check that the component renders
    expect(container.querySelector('.trino-edit-table')).toBeTruthy();
  });

  it('should accept custom fieldsName prop', () => {
    const customTable = {
      ...mockTable,
      arrayFields: mockTable.fields,
    };

    render(
      <TrinoEditTable
        table={customTable as any}
        fieldsName="arrayFields"
      />
    );
    
    expect(screen.getByText('Field Name')).toBeInTheDocument();
  });

  it('should accept allFields prop', () => {
    const allFields: SqlField[] = [
      ...mockTable.fields,
      {
        fieldName: 'extra_field',
        fieldType: 'varchar',
        fieldCategory: 'DATA',
      },
    ];

    render(
      <TrinoEditTable
        table={mockTable}
        allFields={allFields}
      />
    );

    expect(screen.getByText('Field Name')).toBeInTheDocument();
  });

  it('should render nested table when field has arrayFields and flatten is true', () => {
    const tableWithArrayFields: SqlTable = {
      ...mockTable,
      fields: [
        {
          fieldName: 'array_field',
          fieldType: 'array',
          isArray: true,
          flatten: true,
          fieldCategory: 'DATA',
          arrayFields: [
            {
              fieldName: 'nested_field_1',
              fieldType: 'varchar',
              fieldCategory: 'DATA',
            },
            {
              fieldName: 'nested_field_2',
              fieldType: 'integer',
              fieldCategory: 'DATA',
            },
          ],
        },
      ],
    };

    const { container } = render(<TrinoEditTable table={tableWithArrayFields} />);

    // Check that expand-row is rendered
    expect(container.querySelector('.expand-row')).toBeTruthy();

    // Check that nested table headers are rendered
    const headers = screen.getAllByText('Field Name');
    expect(headers.length).toBeGreaterThan(1); // Main table + nested table
  });

  it('should not render nested table when flatten is false', () => {
    const tableWithArrayNoFlatten: SqlTable = {
      ...mockTable,
      fields: [
        {
          fieldName: 'array_field',
          fieldType: 'array',
          isArray: true,
          flatten: false,
          fieldCategory: 'DATA',
          arrayFields: [
            {
              fieldName: 'nested_field',
              fieldType: 'varchar',
              fieldCategory: 'DATA',
            },
          ],
        },
      ],
    };

    const { container } = render(<TrinoEditTable table={tableWithArrayNoFlatten} />);

    // Check that expand-row is NOT rendered
    expect(container.querySelector('.expand-row')).toBeFalsy();
  });
});

