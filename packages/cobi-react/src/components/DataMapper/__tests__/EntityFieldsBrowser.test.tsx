/**
 * Tests for EntityFieldsBrowser component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EntityFieldsBrowser from '../EntityFieldsBrowser';
import type { EntityMappingConfigDto } from '../../../types';

// Mock the useReportingInfo hook
vi.mock('../../../hooks', () => ({
  useReportingInfo: vi.fn(() => ({
    data: [
      {
        columnPath: 'id',
        columnType: 'java.lang.String',
      },
      {
        columnPath: 'name',
        columnType: 'java.lang.String',
      },
      {
        columnPath: 'metadata',
        columnType: 'java.util.Map',
        children: [
          {
            columnPath: 'metadata.key',
            columnType: 'java.lang.String',
          },
        ],
      },
    ],
    isLoading: false,
  })),
  useEntityTypes: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

describe('EntityFieldsBrowser', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    id: { id: 'test-1', uiId: 1 },
    name: 'Test Entity',
    entityClass: 'com.example.Entity',
    metadata: [],
    columns: [],
    functionalMappings: [],
    entityRelationConfigs: [],
    columnPathsForUniqueCheck: [],
    entityFilter: {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'AND',
      conditions: [],
    },
    isShowNoneMappingFields: false,
    isPolymorphicList: false,
    cobiCoreMetadata: [],
    cobiPathsRelations: [],
    script: {
      inputSrcPaths: [],
      inputMetaPaths: [],
      reusableScripts: [],
      body: '',
    },
  } as EntityMappingConfigDto;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} />);
    const buttons = screen.getAllByText(/Add Column Definitions/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should display Add Column Definitions button', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} />);
    const buttons = screen.getAllByText(/Add Column Definitions/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should disable Add Column Definitions button when readOnly', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} readOnly={true} />);
    const addButton = screen.getAllByText(/Add Column Definitions/i)[0].closest('button');
    expect(addButton).toBeDisabled();
  });

  it('should enable Add Column Definitions button when not readOnly', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} readOnly={false} />);
    const addButton = screen.getAllByText(/Add Column Definitions/i)[0].closest('button');
    expect(addButton).not.toBeDisabled();
  });

  it('should render table with columns', () => {
    const { container } = render(<EntityFieldsBrowser entityMapping={mockEntityMapping} />);
    const table = container.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should display empty table when no metadata', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} />);
    expect(screen.getByText(/No data/i)).toBeInTheDocument();
  });

  it('should display fields when metadata exists', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.id', colType: 'java.lang.String' },
        { fullPath: 'com.example.Entity.name', colType: 'java.lang.String' },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} />);
    
    // Check that paths are displayed (shortened)
    expect(screen.getByText(/id/i)).toBeInTheDocument();
    expect(screen.getByText(/name/i)).toBeInTheDocument();
  });

  it('should display field types', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.id', colType: 'java.lang.String' },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} />);
    
    // Type should be shortened to just "String"
    expect(screen.getByText('String')).toBeInTheDocument();
  });

  it('should display Remove button for each field', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.id', colType: 'java.lang.String' },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} />);
    
    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it('should disable Remove buttons when readOnly', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.id', colType: 'java.lang.String' },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} readOnly={true} />);
    
    const removeButton = screen.getByText('Remove').closest('button');
    expect(removeButton).toBeDisabled();
  });

  it('should enable Remove buttons when not readOnly', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.id', colType: 'java.lang.String' },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} readOnly={false} />);
    
    const removeButton = screen.getByText('Remove').closest('button');
    expect(removeButton).not.toBeDisabled();
  });

  it('should handle multiple fields', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.id', colType: 'java.lang.String' },
        { fullPath: 'com.example.Entity.name', colType: 'java.lang.String' },
        { fullPath: 'com.example.Entity.age', colType: 'java.lang.Integer' },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} />);
    
    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons.length).toBe(3);
  });

  it('should shorten long paths for display', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        {
          fullPath: 'com.example.very.long.package.name.Entity.field',
          colType: 'java.lang.String'
        },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} />);

    // Should show shortened path with "..." for paths with more than 3 parts
    expect(screen.getByText(/name\.Entity\.field/)).toBeInTheDocument();
  });

  it('should display short type names', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.count', colType: 'java.lang.Integer' },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} />);
    
    // Should show just "Integer" not "java.lang.Integer"
    expect(screen.getByText('Integer')).toBeInTheDocument();
  });

  it('should handle fields without type', () => {
    const mappingWithMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.unknown', colType: undefined },
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithMetadata} />);
    
    // Should show "-" for missing type
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should filter out invalid metadata entries', () => {
    const mappingWithInvalidMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: [
        { fullPath: 'com.example.Entity.valid', colType: 'java.lang.String' },
        null as any,
        undefined as any,
        { fullPath: '', colType: 'java.lang.String' } as any,
      ],
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithInvalidMetadata} />);
    
    // Should only show 1 valid field
    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons.length).toBe(1);
  });

  it('should initialize metadata array if not present', () => {
    const mappingWithoutMetadata: EntityMappingConfigDto = {
      ...mockEntityMapping,
      metadata: undefined as any,
    };

    render(<EntityFieldsBrowser entityMapping={mappingWithoutMetadata} />);

    const buttons = screen.getAllByText(/Add Column Definitions/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have table with Path column', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} />);

    expect(screen.getByText('Path')).toBeInTheDocument();
  });

  it('should have table with Type column', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} />);

    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('should have table with Action column', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} />);

    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should render with showAliases prop', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} showAliases={true} />);

    const buttons = screen.getAllByText(/Add Column Definitions/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render without showAliases prop', () => {
    render(<EntityFieldsBrowser entityMapping={mockEntityMapping} showAliases={false} />);

    const buttons = screen.getAllByText(/Add Column Definitions/i);
    expect(buttons.length).toBeGreaterThan(0);
  });
});

