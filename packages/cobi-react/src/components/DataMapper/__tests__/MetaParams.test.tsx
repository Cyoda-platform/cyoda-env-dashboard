import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import MetaParams from '../MetaParams';

describe('MetaParams', () => {
  const mockMetaParams = [
    { name: 'metaParam1', displayName: 'Meta Param 1' },
    { name: 'metaParam2', displayName: 'Meta Param 2' },
  ];

  const mockEntityMapping = {
    entityClass: 'TestEntity',
    columns: [],
    functionalMappings: [],
    cobiCoreMetadata: [],
    script: { inputMetaPaths: ['metaParam1'] },
  };

  const mockAllDataRelations = [
    {
      column: { srcColumnPath: 'metaParam1', dstColumnPath: 'field1' },
      type: 'cobiCoreMetadata',
    },
  ];

  it('should render meta params when provided', () => {
    render(
      <MetaParams
        metaParams={mockMetaParams}
        allDataRelations={mockAllDataRelations}
        selectedEntityMapping={mockEntityMapping}
      />
    );
    
    expect(screen.getByText('Meta Params')).toBeInTheDocument();
    expect(screen.getByText('Meta Param 1')).toBeInTheDocument();
    expect(screen.getByText('Meta Param 2')).toBeInTheDocument();
  });

  it('should not render when metaParams is empty', () => {
    const { container } = render(
      <MetaParams
        metaParams={[]}
        allDataRelations={mockAllDataRelations}
        selectedEntityMapping={mockEntityMapping}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render correct number of rows', () => {
    render(
      <MetaParams
        metaParams={mockMetaParams}
        allDataRelations={mockAllDataRelations}
        selectedEntityMapping={mockEntityMapping}
      />
    );
    
    const rows = screen.getAllByText(/Meta Param/);
    expect(rows).toHaveLength(2);
  });
});

