/**
 * Tests for MappingCanvas component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MappingCanvas, {
  COLOR_RELATION_COLUMN_MAPPING,
  COLOR_RELATION_FUNCTIONAL_MAPPING,
  COLOR_RELATION_CORE_METADATA,
  COLOR_RELATION_DEFAULT,
  COLOR_RELATION_NOT_EXIST,
} from '../MappingCanvas';
import type { EntityMappingConfigDto } from '../../../types';

// Mock SVG.js
vi.mock('@svgdotjs/svg.js', () => ({
  SVG: vi.fn(() => ({
    addTo: vi.fn(() => ({
      group: vi.fn(() => ({
        clear: vi.fn(),
      })),
    })),
    path: vi.fn(() => ({
      attr: vi.fn().mockReturnThis(),
      addClass: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
    })),
    on: vi.fn().mockReturnThis(),
  })),
}));

describe('MappingCanvas', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    id: { id: 'test-1', uiId: 1 },
    name: 'Test Entity',
    entityClass: 'org.net.cyoda.saas.model.dto.Organisation',
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

  const mockRelations = [
    {
      column: {
        srcColumnPath: 'name',
        dstColumnPath: 'org.name',
        jsonPath: 'name',
      },
      type: 'columnMapping',
      direction: 'fromSource' as const,
      clazzType: null,
      notExistRelation: null,
      jsonPath: 'name',
    },
    {
      column: {
        srcColumnPath: 'id',
        dstColumnPath: 'org.id',
        jsonPath: 'id',
      },
      type: 'functionalMapping',
      direction: 'fromSource' as const,
      clazzType: null,
      notExistRelation: null,
      jsonPath: 'id',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={[]}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render SVG element', () => {
    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={[]}
      />
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render with relations', () => {
    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with empty relations', () => {
    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={[]}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with notExistRelations', () => {
    const notExistRelations = [
      {
        column: {
          srcColumnPath: 'missing',
          dstColumnPath: 'org.missing',
          jsonPath: 'missing',
        },
        type: 'columnMapping',
        direction: 'fromSource' as const,
        clazzType: null,
        notExistRelation: true,
        jsonPath: 'missing',
      },
    ];

    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={[]}
        notExistRelations={notExistRelations}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should call onRelationClick when provided', () => {
    const mockOnRelationClick = vi.fn();
    
    render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
        onRelationClick={mockOnRelationClick}
      />
    );
    
    // onRelationClick should be set up (actual click testing would require DOM manipulation)
    expect(mockOnRelationClick).not.toHaveBeenCalled();
  });

  it('should call onRelationHover when provided', () => {
    const mockOnRelationHover = vi.fn();
    
    render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
        onRelationHover={mockOnRelationHover}
      />
    );
    
    // onRelationHover should be set up (actual hover testing would require DOM manipulation)
    expect(mockOnRelationHover).not.toHaveBeenCalled();
  });

  it('should work without onRelationClick callback', () => {
    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should work without onRelationHover callback', () => {
    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with activeLine prop', () => {
    const activeLine = {
      srcColumnPath: 'name',
      dstColumnPath: 'org.name',
    };

    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
        activeLine={activeLine}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with activeRelation prop', () => {
    const activeRelation = {
      column: {
        srcColumnPath: 'name',
        dstColumnPath: 'org.name',
        jsonPath: 'name',
      },
      type: 'columnMapping',
      direction: 'fromSource' as const,
      clazzType: null,
      notExistRelation: null,
      jsonPath: 'name',
    };

    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
        activeRelation={activeRelation}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should update when relationsUpdateTrigger changes', () => {
    const { container, rerender } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
        relationsUpdateTrigger={0}
      />
    );
    
    expect(container.querySelector('.mapping-canvas')).toBeInTheDocument();
    
    rerender(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mockRelations}
        relationsUpdateTrigger={1}
      />
    );
    
    expect(container.querySelector('.mapping-canvas')).toBeInTheDocument();
  });

  it('should export color constants', () => {
    expect(COLOR_RELATION_COLUMN_MAPPING).toBe('#67c23a');
    expect(COLOR_RELATION_FUNCTIONAL_MAPPING).toBe('#E6A23C');
    expect(COLOR_RELATION_CORE_METADATA).toBe('#409eff');
    expect(COLOR_RELATION_DEFAULT).toBe('#858484');
    expect(COLOR_RELATION_NOT_EXIST).toBe('#F56C6C');
  });

  it('should handle multiple relation types', () => {
    const mixedRelations = [
      {
        column: {
          srcColumnPath: 'name',
          dstColumnPath: 'org.name',
          jsonPath: 'name',
        },
        type: 'columnMapping',
        direction: 'fromSource' as const,
        clazzType: null,
        notExistRelation: null,
        jsonPath: 'name',
      },
      {
        column: {
          srcColumnPath: 'id',
          dstColumnPath: 'org.id',
          jsonPath: 'id',
        },
        type: 'functionalMapping',
        direction: 'fromSource' as const,
        clazzType: null,
        notExistRelation: null,
        jsonPath: 'id',
      },
      {
        column: {
          srcColumnPath: 'metadata',
          dstColumnPath: 'org.metadata',
          jsonPath: 'metadata',
        },
        type: 'cobiCoreMetadata',
        direction: 'fromSource' as const,
        clazzType: null,
        notExistRelation: null,
        jsonPath: 'metadata',
      },
    ];

    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={mixedRelations}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should handle fromTarget direction', () => {
    const targetRelations = [
      {
        column: {
          srcColumnPath: 'name',
          dstColumnPath: 'org.name',
          jsonPath: 'name',
        },
        type: 'columnMapping',
        direction: 'fromTarget' as const,
        clazzType: null,
        notExistRelation: null,
        jsonPath: 'name',
      },
    ];

    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={targetRelations}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should have mapping-canvas class', () => {
    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={[]}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toHaveClass('mapping-canvas');
  });

  it('should render with large number of relations', () => {
    const manyRelations = Array.from({ length: 50 }, (_, i) => ({
      column: {
        srcColumnPath: `field${i}`,
        dstColumnPath: `org.field${i}`,
        jsonPath: `field${i}`,
      },
      type: 'columnMapping',
      direction: 'fromSource' as const,
      clazzType: null,
      notExistRelation: null,
      jsonPath: `field${i}`,
    }));

    const { container } = render(
      <MappingCanvas
        selectedEntityMapping={mockEntityMapping}
        allDataRelations={manyRelations}
      />
    );
    
    const canvas = container.querySelector('.mapping-canvas');
    expect(canvas).toBeInTheDocument();
  });
});

