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
    render(<TrinoEditTable table={mockTable} />);
    
    expect(screen.getByDisplayValue('field1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('field2')).toBeInTheDocument();
  });

  it('should display field keys', () => {
    render(<TrinoEditTable table={mockTable} />);
    
    expect(screen.getByText('key1')).toBeInTheDocument();
    expect(screen.getByText('key2')).toBeInTheDocument();
  });

  it('should display data types', () => {
    render(<TrinoEditTable table={mockTable} />);
    
    expect(screen.getByText('string')).toBeInTheDocument();
    expect(screen.getByText('int')).toBeInTheDocument();
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

    render(<TrinoEditTable table={tableWithNestedFields} />);
    
    expect(screen.getByDisplayValue('parent_field')).toBeInTheDocument();
    expect(screen.getByDisplayValue('nested_field')).toBeInTheDocument();
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

    render(<TrinoEditTable table={tableWithHiddenField} />);
    
    expect(screen.getByDisplayValue('visible_field')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('hidden_field')).not.toBeInTheDocument();
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
});

