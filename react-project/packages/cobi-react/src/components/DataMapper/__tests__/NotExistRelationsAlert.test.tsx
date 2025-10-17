import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import NotExistRelationsAlert from '../NotExistRelationsAlert';
import type { EntityMappingConfigDto } from '../../../types';

describe('NotExistRelationsAlert', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    id: { uiId: 1 },
    name: 'Test Entity',
    entityClass: 'TestClass',
    columns: [],
    functionalMappings: [],
    cobiCoreMetadata: [],
    sourceRelativeRootPath: '',
  };

  const mockOnDeleteRelation = vi.fn();

  beforeEach(() => {
    mockOnDeleteRelation.mockClear();
  });

  it('should not render when there are no non-existent relations', () => {
    const { container } = render(
      <NotExistRelationsAlert
        entityMapping={mockEntityMapping}
        sourceData={{}}
        targetFields={[]}
        onDeleteRelation={mockOnDeleteRelation}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when entityMapping is null', () => {
    const { container } = render(
      <NotExistRelationsAlert
        entityMapping={null}
        sourceData={{}}
        targetFields={[]}
        onDeleteRelation={mockOnDeleteRelation}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render alert when there are non-existent relations', () => {
    const entityMappingWithBadRelation: EntityMappingConfigDto = {
      ...mockEntityMapping,
      columns: [
        {
          srcColumnPath: 'root:/nonexistent',
          dstCyodaColumnPath: 'field1',
          dstCyodaColumnPathType: 'String',
        },
      ],
    };

    render(
      <NotExistRelationsAlert
        entityMapping={entityMappingWithBadRelation}
        sourceData={{}}
        targetFields={['field1']}
        onDeleteRelation={mockOnDeleteRelation}
      />
    );

    expect(screen.getByText(/Non-existent Relations Detected/i)).toBeInTheDocument();
  });
});

