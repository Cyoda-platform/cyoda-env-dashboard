import { useState, useCallback, useEffect } from 'react';
import type { EntityMappingConfigDto } from '../../types';

// Import SVG.js dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SVG: any;
try {
  // @ts-ignore
  SVG = require('@svgdotjs/svg.js').SVG;
} catch (e) {
  console.error('Failed to load SVG.js:', e);
}

interface ActiveRelation {
  column: {
    srcColumnPath: string;
    dstColumnPath: string;
    jsonPath: string;
  };
  type: 'columnMapping' | 'functionalMapping' | 'cobiCoreMetadata';
  direction: 'fromSource' | 'fromTarget';
  clazzType?: string;
  notExistRelation?: boolean;
  jsonPath?: string;
}

interface DragDropHandlerProps {
  selectedEntityMapping: EntityMappingConfigDto;
  onMappingChange: (mapping: EntityMappingConfigDto) => void;
  onRelationsUpdate: () => void;
}

const COLOR_RELATION_DEFAULT = '#999999';
const COLOR_RELATION_COLUMN_MAPPING = '#67c23a';
const COLOR_RELATION_FUNCTIONAL_MAPPING = '#E6A23C';
const COLOR_RELATION_CORE_METADATA = '#409eff';

export const useDragDropHandler = ({
  selectedEntityMapping,
  onMappingChange,
  onRelationsUpdate,
}: DragDropHandlerProps) => {
  const [activeLine, setActiveLine] = useState<any>(null);
  const [activeSvgBox, setActiveSvgBox] = useState<any>(null);
  const [activeRelation, setActiveRelation] = useState<ActiveRelation | null>(null);
  const [reassignRelation, setReassignRelation] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Make SVG box
  const makeSvgBox = useCallback(() => {
    if (!SVG) return null;
    return SVG().addTo('#canvas').group();
  }, []);

  // Make new line
  const makeNewLine = useCallback((type: string | null = null, width = 2) => {
    if (!SVG) return null;

    let stroke = COLOR_RELATION_DEFAULT;
    if (type === 'columnMapping') {
      stroke = COLOR_RELATION_COLUMN_MAPPING;
    } else if (type === 'functionalMapping') {
      stroke = COLOR_RELATION_FUNCTIONAL_MAPPING;
    } else if (type === 'cobiCoreMetadata') {
      stroke = COLOR_RELATION_CORE_METADATA;
    }

    return SVG()
      .path()
      .attr('stroke-width', width)
      .attr('stroke', stroke)
      .attr('stroke-miterlimit', 10)
      .attr('pointer-events', 'stroke')
      .attr('fill', 'transparent')
      .addClass(`line type-${type}`);
  }, []);

  // Set start point for drag
  const setStartPoint = useCallback((el: HTMLElement, line: any, direction = 'fromSource') => {
    if (!line) return;

    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const canvasPos = canvas.getBoundingClientRect();
    const circlePosition = el.getBoundingClientRect();
    const circleHeight = el.offsetHeight / 2 + 1;
    const x1 = direction === 'fromTarget' 
      ? circlePosition.left - canvasPos.left 
      : circlePosition.right - canvasPos.left;

    line.attr('x1', x1).attr('y1', circlePosition.top + circleHeight - canvasPos.top);
  }, []);

  // Start drag
  const startDragLine = useCallback(({
    el,
    path,
    type,
    direction = 'fromSource',
    clazzType,
    jsonPath,
    notExistRelation = false,
  }: {
    el: HTMLElement;
    path: string;
    type: 'columnMapping' | 'functionalMapping' | 'cobiCoreMetadata';
    direction?: 'fromSource' | 'fromTarget';
    clazzType?: string;
    jsonPath?: string;
    notExistRelation?: boolean;
  }) => {
    setIsDragging(true);
    const svgBox = makeSvgBox();
    const line = makeNewLine(type);
    
    if (!svgBox || !line) return;

    line.attr('data-active-relation', 'true');
    svgBox.add(line);
    setStartPoint(el, line, direction);

    setActiveSvgBox(svgBox);
    setActiveLine(line);

    const column = direction === 'fromTarget'
      ? { srcColumnPath: '', jsonPath: '', dstColumnPath: path }
      : { srcColumnPath: path, dstColumnPath: '', jsonPath: jsonPath || path };

    setActiveRelation({
      column,
      type,
      direction,
      clazzType,
      notExistRelation,
      jsonPath,
    });
  }, [makeSvgBox, makeNewLine, setStartPoint]);

  // Update drag line position
  const updateDragLine = useCallback((e: MouseEvent) => {
    if (!activeLine || !isDragging) return;

    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const canvasPos = canvas.getBoundingClientRect();
    const x2 = e.clientX - canvasPos.left;
    const y2 = e.clientY - canvasPos.top;

    // Get start position
    const x1 = parseFloat(activeLine.attr('x1') || 0);
    const y1 = parseFloat(activeLine.attr('y1') || 0);

    // Create curved path
    const path = createCurvedPath(x1, y1, x2, y2);
    activeLine.plot(path);
  }, [activeLine, isDragging]);

  // Create curved horizontal path
  const createCurvedPath = (x1: number, y1: number, x2: number, y2: number): string => {
    const dx = x2 - x1;
    const cx1 = x1 + dx * 0.5;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.5;
    const cy2 = y2;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  // End drag
  const endDragLine = useCallback(async ({
    path,
  }: {
    el: HTMLElement;
    path: string;
    srcPath: string;
    clazzType?: string;
    jsonPath?: string;
  }) => {
    if (!activeRelation) return;

    // Check if reassigning
    if (reassignRelation) {
      // TODO: Implement reassign logic
      console.log('Reassigning relation:', reassignRelation);
    }

    const updatedMapping = { ...selectedEntityMapping };

    // Handle different relation types
    if (activeRelation.type === 'columnMapping') {
      // Remove existing mappings to this target
      updatedMapping.columns = updatedMapping.columns.filter(
        (col: any) => col.dstCyodaColumnPath !== path
      );

      // Add new column mapping
      updatedMapping.columns.push({
        srcColumnPath: activeRelation.column.srcColumnPath,
        dstCyodaColumnPath: path,
        transformer: {
          type: 'COMPOSITE' as const,
          children: [],
        },
      } as any);
    } else if (activeRelation.type === 'functionalMapping') {
      // Remove existing column mappings
      updatedMapping.columns = updatedMapping.columns.filter(
        (col: any) => col.dstCyodaColumnPath !== path
      );

      // Find or create functional mapping
      const existingFunctionalMapping = updatedMapping.functionalMappings.find(
        (fm: any) => fm.dstPath === path
      );

      if (existingFunctionalMapping) {
        if (!existingFunctionalMapping.srcPaths.includes(activeRelation.column.srcColumnPath)) {
          existingFunctionalMapping.srcPaths.push(activeRelation.column.srcColumnPath);
        }
      } else {
        const newFunctionalMapping = {
          srcPaths: [activeRelation.column.srcColumnPath],
          name: null,
          statements: [],
          dstPath: path,
          collectElemsSetModes: [],
          metaPaths: [],
        } as any;
        updatedMapping.functionalMappings.push(newFunctionalMapping);
      }
    } else if (activeRelation.type === 'cobiCoreMetadata') {
      if (!updatedMapping.cobiCoreMetadata) {
        updatedMapping.cobiCoreMetadata = [];
      }

      // Remove existing mappings
      updatedMapping.columns = updatedMapping.columns.filter(
        (col: any) => col.dstCyodaColumnPath !== path
      );
      updatedMapping.functionalMappings = updatedMapping.functionalMappings.filter(
        (fm: any) => fm.dstPath !== path
      );

      // Add metadata mapping
      updatedMapping.cobiCoreMetadata.push({
        name: activeRelation.column.srcColumnPath,
        dstCyodaColumnPath: path,
      });
    }

    // Add to cobiPathsRelations
    if (!updatedMapping.cobiPathsRelations) {
      updatedMapping.cobiPathsRelations = [];
    }

    const existingRelation = updatedMapping.cobiPathsRelations.find(
      (rel: any) =>
        rel.srcColumnPath === activeRelation.column.srcColumnPath &&
        rel.dstColumnPath === path
    );

    if (!existingRelation) {
      updatedMapping.cobiPathsRelations.push({
        jsonPath: activeRelation.jsonPath || activeRelation.column.srcColumnPath,
        srcColumnPath: activeRelation.column.srcColumnPath,
        dstColumnPath: path,
      });
    }

    // Update mapping
    onMappingChange(updatedMapping);

    // Clean up
    cancelDragLine();

    // Update relations
    setTimeout(() => {
      onRelationsUpdate();
    }, 100);
  }, [activeRelation, reassignRelation, selectedEntityMapping, onMappingChange, onRelationsUpdate]);

  // Cancel drag
  const cancelDragLine = useCallback(() => {
    if (activeSvgBox) {
      activeSvgBox.remove();
    }
    setActiveLine(null);
    setActiveSvgBox(null);
    setActiveRelation(null);
    setReassignRelation(null);
    setIsDragging(false);
  }, [activeSvgBox]);

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateDragLine(e);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        cancelDragLine();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateDragLine, cancelDragLine]);

  return {
    startDragLine,
    endDragLine,
    cancelDragLine,
    isDragging,
    activeRelation,
  };
};

export default useDragDropHandler;

