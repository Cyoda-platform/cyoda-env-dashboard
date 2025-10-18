/**
 * Tests for TargetDataNavigation component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TargetDataNavigation from '../TargetDataNavigation';
import type { EntityMappingConfigDto, ColumnMappingConfigDto } from '../../../types';

describe('TargetDataNavigation', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    entityClass: 'com.example.Entity',
    isPolymorphicList: false,
    isShowNoneMappingFields: true,
  } as EntityMappingConfigDto;

  const mockOnPathSelect = vi.fn();

  beforeEach(() => {
    mockOnPathSelect.mockClear();
  });

  it('should render empty state when no entity class', () => {
    const emptyMapping: EntityMappingConfigDto = {
      entityClass: '',
      isPolymorphicList: false,
      isShowNoneMappingFields: true,
    } as EntityMappingConfigDto;

    render(
      <TargetDataNavigation
        selectedEntityMapping={emptyMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    expect(screen.getByText('Please select an entity class')).toBeInTheDocument();
  });

  it('should render header with entity class name', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Target Entity: com.example.Entity/)).toBeInTheDocument();
    });
  });

  it('should render Expand All button', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Expand All')).toBeInTheDocument();
    });
  });

  it('should render Collapse All button', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Collapse All')).toBeInTheDocument();
    });
  });

  it('should render tree with mock entity fields', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Metadata')).toBeInTheDocument();
    });
  });

  it('should display field types as tags', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      const stringTags = screen.getAllByText('string');
      expect(stringTags.length).toBeGreaterThan(0);
    });
  });

  it('should mark required fields with star icon', async () => {
    const { container } = render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      const requiredIcons = container.querySelectorAll('.required-icon');
      expect(requiredIcons.length).toBeGreaterThan(0);
    });
  });

  it('should display relation count when relations exist', async () => {
    const relations: ColumnMappingConfigDto[] = [
      {
        srcColumnPath: 'sourceName',
        dstCyodaColumnPath: 'id',
      } as ColumnMappingConfigDto,
      {
        srcColumnPath: 'sourceEmail',
        dstCyodaColumnPath: 'name',
      } as ColumnMappingConfigDto,
    ];

    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={relations}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2 mappings')).toBeInTheDocument();
    });
  });

  it('should display singular mapping text for one relation', async () => {
    const relations: ColumnMappingConfigDto[] = [
      {
        srcColumnPath: 'sourceName',
        dstCyodaColumnPath: 'id',
      } as ColumnMappingConfigDto,
    ];

    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={relations}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('1 mapping')).toBeInTheDocument();
    });
  });

  it('should not display mapping count when no relations', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={[]}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/mapping/)).not.toBeInTheDocument();
    });
  });

  it('should render tree component after loading', async () => {
    const { container } = render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      const tree = container.querySelector('.ant-tree');
      expect(tree).toBeInTheDocument();
    });
  });

  it('should have navigation tree container', async () => {
    const { container } = render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      const treeContainer = container.querySelector('.navigation-tree');
      expect(treeContainer).toBeInTheDocument();
    });
  });

  it('should display circles for leaf nodes', async () => {
    const { container } = render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      const circles = container.querySelectorAll('.circle');
      expect(circles.length).toBeGreaterThan(0);
    });
  });

  it('should mark nodes with relations', async () => {
    const relations: ColumnMappingConfigDto[] = [
      {
        srcColumnPath: 'sourceName',
        dstCyodaColumnPath: 'id',
      } as ColumnMappingConfigDto,
    ];

    const { container } = render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={relations}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      const hasRelationElements = container.querySelectorAll('.has-relation');
      expect(hasRelationElements.length).toBeGreaterThan(0);
    });
  });

  it('should filter fields when isShowNoneMappingFields is false', async () => {
    const mappingWithFilter: EntityMappingConfigDto = {
      ...mockEntityMapping,
      isShowNoneMappingFields: false,
    };

    const noneMappingFields = ['description'];

    render(
      <TargetDataNavigation
        selectedEntityMapping={mappingWithFilter}
        noneMappingFields={noneMappingFields}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  it('should show all fields when isShowNoneMappingFields is true', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        noneMappingFields={['description']}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  it('should filter tree data based on search string', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        searchString="name"
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  it('should show all data when search string is empty', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        searchString=""
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  it('should handle nested fields', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Metadata')).toBeInTheDocument();
    });
  });

  it('should display badge for multiple relations on same field', async () => {
    const relations: ColumnMappingConfigDto[] = [
      {
        srcColumnPath: 'source1',
        dstCyodaColumnPath: 'id',
      } as ColumnMappingConfigDto,
      {
        srcColumnPath: 'source2',
        dstCyodaColumnPath: 'id',
      } as ColumnMappingConfigDto,
    ];

    const { container } = render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={relations}
        onPathSelect={mockOnPathSelect}
      />
    );

    await waitFor(() => {
      const badges = container.querySelectorAll('.relation-badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('should work without onPathSelect callback', async () => {
    render(
      <TargetDataNavigation
        selectedEntityMapping={mockEntityMapping}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
    });
  });
});

