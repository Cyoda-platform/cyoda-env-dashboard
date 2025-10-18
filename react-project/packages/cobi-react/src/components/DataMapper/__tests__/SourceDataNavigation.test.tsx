/**
 * Tests for SourceDataNavigation component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SourceDataNavigation from '../SourceDataNavigation';
import type { EntityMappingConfigDto, ColumnMappingConfigDto } from '../../../types';

describe('SourceDataNavigation', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    entityClass: 'com.example.Entity',
    isPolymorphicList: false,
    isShowNoneMappingFields: true,
  } as EntityMappingConfigDto;

  const mockSourceData = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'New York',
    },
  };

  const mockOnPathSelect = vi.fn();

  beforeEach(() => {
    mockOnPathSelect.mockClear();
  });

  it('should render empty state when no source data', () => {
    render(
      <SourceDataNavigation
        sourceData={null}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('No source data available')).toBeInTheDocument();
  });

  it('should render header with title', () => {
    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('Source Data')).toBeInTheDocument();
  });

  it('should render Expand All button', () => {
    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('Expand All')).toBeInTheDocument();
  });

  it('should render Collapse All button', () => {
    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('Collapse All')).toBeInTheDocument();
  });

  it('should render tree with source data keys', () => {
    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('address')).toBeInTheDocument();
  });

  it('should display data types for fields', () => {
    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    const types = screen.getAllByText('string');
    expect(types.length).toBeGreaterThan(0);

    expect(screen.getByText('number')).toBeInTheDocument();
    expect(screen.getByText('object')).toBeInTheDocument();
  });

  it('should display relation count when relations exist', () => {
    const relations: ColumnMappingConfigDto[] = [
      {
        srcColumnPath: 'name',
        dstCyodaColumnPath: 'targetName',
      } as ColumnMappingConfigDto,
      {
        srcColumnPath: 'email',
        dstCyodaColumnPath: 'targetEmail',
      } as ColumnMappingConfigDto,
    ];

    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={relations}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('2 relations')).toBeInTheDocument();
  });

  it('should display singular relation text for one relation', () => {
    const relations: ColumnMappingConfigDto[] = [
      {
        srcColumnPath: 'name',
        dstCyodaColumnPath: 'targetName',
      } as ColumnMappingConfigDto,
    ];

    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={relations}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('1 relation')).toBeInTheDocument();
  });

  it('should not display relation count when no relations', () => {
    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={[]}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.queryByText(/relation/)).not.toBeInTheDocument();
  });

  it('should handle array data', () => {
    const arrayData = {
      items: [1, 2, 3],
    };

    render(
      <SourceDataNavigation
        sourceData={arrayData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('items')).toBeInTheDocument();
    expect(screen.getByText('array')).toBeInTheDocument();
  });

  it('should handle nested objects', () => {
    const nestedData = {
      user: {
        profile: {
          name: 'John',
        },
      },
    };

    render(
      <SourceDataNavigation
        sourceData={nestedData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('should handle boolean values', () => {
    const boolData = {
      active: true,
      verified: false,
    };

    render(
      <SourceDataNavigation
        sourceData={boolData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('verified')).toBeInTheDocument();
    const boolTypes = screen.getAllByText('boolean');
    expect(boolTypes.length).toBe(2);
  });

  it('should handle null values', () => {
    const nullData = {
      value: null,
    };

    render(
      <SourceDataNavigation
        sourceData={nullData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('value')).toBeInTheDocument();
    // 'null' appears multiple times (as type and value), use getAllByText
    const nullTexts = screen.getAllByText('null');
    expect(nullTexts.length).toBeGreaterThan(0);
  });

  it('should handle polymorphic list display', () => {
    const polymorphicMapping: EntityMappingConfigDto = {
      ...mockEntityMapping,
      isPolymorphicList: true,
    };

    const arrayData = {
      items: ['a', 'b', 'c'],
    };

    render(
      <SourceDataNavigation
        sourceData={arrayData}
        selectedEntityMapping={polymorphicMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('items')).toBeInTheDocument();
  });

  it('should filter tree data based on search string', () => {
    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        searchString="name"
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('name')).toBeInTheDocument();
    // Other fields should be filtered out
    expect(screen.queryByText('age')).not.toBeInTheDocument();
  });

  it('should show all data when search string is empty', () => {
    render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        searchString=""
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('should handle empty source data object', () => {
    render(
      <SourceDataNavigation
        sourceData={{}}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('Source Data')).toBeInTheDocument();
  });

  it('should render tree component', () => {
    const { container } = render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    const tree = container.querySelector('.ant-tree');
    expect(tree).toBeInTheDocument();
  });

  it('should have navigation tree container', () => {
    const { container } = render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    const treeContainer = container.querySelector('.navigation-tree');
    expect(treeContainer).toBeInTheDocument();
  });

  it('should display circles for leaf nodes', () => {
    const { container } = render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    const circles = container.querySelectorAll('.circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('should mark nodes with relations', () => {
    const relations: ColumnMappingConfigDto[] = [
      {
        srcColumnPath: 'name',
        dstCyodaColumnPath: 'targetName',
      } as ColumnMappingConfigDto,
    ];

    const { container } = render(
      <SourceDataNavigation
        sourceData={mockSourceData}
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={relations}
        onPathSelect={mockOnPathSelect}
      />
    );

    const hasRelationElements = container.querySelectorAll('.has-relation');
    expect(hasRelationElements.length).toBeGreaterThan(0);
  });
});

