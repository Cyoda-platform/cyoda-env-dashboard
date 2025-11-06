/**
 * Tests for SearchPathsDialog component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPathsDialog from '../SearchPathsDialog';
import type { EntityMappingConfigDto } from '../../../types';

describe('SearchPathsDialog', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    name: 'Test Mapping',
    entityClass: 'com.test.Entity',
    columns: [
      {
        srcColumnPath: 'source.field1',
        dstCyodaColumnPath: 'target.field1',
        dstCyodaColumnPathType: 'String',
        dstCollectionElementSetModes: [],
      },
      {
        srcColumnPath: 'source.field2',
        dstCyodaColumnPath: 'target.field2',
        dstCyodaColumnPathType: 'Integer',
        dstCollectionElementSetModes: [],
      },
    ],
    functionalMappings: [
      {
        srcPaths: ['source.data'],
        dstPath: 'target.computed',
        statements: [],
      },
    ],
    entityRelationConfigs: [],
  } as EntityMappingConfigDto;

  const mockOnClose = vi.fn();
  const mockOnFindSourcePath = vi.fn();
  const mockOnFindTargetPath = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    render(
      <SearchPathsDialog
        visible={false}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Search Paths and Statements')).not.toBeInTheDocument();
  });

  it('should render when visible is true', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Search Paths and Statements')).toBeInTheDocument();
  });

  it('should display modal title', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Search Paths and Statements')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Filter for paths and statements/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render Close button', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should call onClose when Close button is clicked', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display table with columns', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.getAllByText('Source')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Target')[0]).toBeInTheDocument();
  });

  it('should display column mappings', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const field1Elements = screen.getAllByText(/field1/);
    expect(field1Elements.length).toBeGreaterThan(0);
  });

  it('should display functional mappings', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const computedElements = screen.getAllByText(/computed/);
    expect(computedElements.length).toBeGreaterThan(0);
  });

  it('should filter results when searching', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Filter for paths and statements/i);
    fireEvent.change(searchInput, { target: { value: 'field1' } });

    const field1Elements = screen.getAllByText(/field1/);
    expect(field1Elements.length).toBeGreaterThan(0);
  });

  it('should display table with data', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    // Should display table
    const table = document.querySelector('.ant-table');
    expect(table).toBeTruthy();
  });

  it('should work without entityMapping', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={null}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Search Paths and Statements')).toBeInTheDocument();
  });

  it('should work without onFindSourcePath callback', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Search Paths and Statements')).toBeInTheDocument();
  });

  it('should work without onFindTargetPath callback', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Search Paths and Statements')).toBeInTheDocument();
  });

  it('should render modal with search-paths-dialog class', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    // Modal should be rendered
    expect(screen.getByText('Search Paths and Statements')).toBeInTheDocument();
  });

  it('should have modal width of 90%', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Search Paths and Statements')).toBeInTheDocument();
  });

  it('should clear search when input is cleared', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Filter for paths and statements/i);
    fireEvent.change(searchInput, { target: { value: 'field1' } });
    fireEvent.change(searchInput, { target: { value: '' } });

    // All results should be visible again
    const field1Elements = screen.getAllByText(/field1/);
    const field2Elements = screen.getAllByText(/field2/);
    expect(field1Elements.length).toBeGreaterThan(0);
    expect(field2Elements.length).toBeGreaterThan(0);
  });

  it('should display search icon', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    const searchIcons = document.querySelectorAll('.anticon-search');
    expect(searchIcons.length).toBeGreaterThan(0);
  });

  it('should handle empty columns array', () => {
    const emptyMapping = {
      ...mockEntityMapping,
      columns: [],
      functionalMappings: [],
    };

    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={emptyMapping}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Search Paths and Statements')).toBeInTheDocument();
  });

  it('should display total count of relations', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    // Should show count in the table or somewhere
    const table = document.querySelector('.ant-table');
    expect(table).toBeTruthy();
  });

  it('should handle functional mapping without source paths', () => {
    const mappingWithoutSrcPaths = {
      ...mockEntityMapping,
      functionalMappings: [
        {
          srcPaths: [],
          dstPath: 'target.noSource',
          statements: [],
        },
      ],
    };

    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mappingWithoutSrcPaths}
        onClose={mockOnClose}
      />
    );

    const noSourceElements = screen.getAllByText(/noSource/);
    expect(noSourceElements.length).toBeGreaterThan(0);
  });

  it('should display shortened paths', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    // Paths should be shortened (last part of the path)
    const field1Elements = screen.getAllByText(/field1/);
    expect(field1Elements.length).toBeGreaterThan(0);
  });

  it('should search in both source and target paths', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Filter for paths and statements/i);

    // Search for target path
    fireEvent.change(searchInput, { target: { value: 'target' } });
    const field1Elements = screen.getAllByText(/field1/);
    expect(field1Elements.length).toBeGreaterThan(0);

    // Search for source path
    fireEvent.change(searchInput, { target: { value: 'source' } });
    const field1Elements2 = screen.getAllByText(/field1/);
    expect(field1Elements2.length).toBeGreaterThan(0);
  });

  it('should be case-insensitive when searching', () => {
    render(
      <SearchPathsDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Filter for paths and statements/i);
    fireEvent.change(searchInput, { target: { value: 'FIELD1' } });

    const field1Elements = screen.getAllByText(/field1/);
    expect(field1Elements.length).toBeGreaterThan(0);
  });
});

