import { useState, useCallback, useEffect, useRef } from 'react';
import type { EntityMappingConfigDto } from '../../types';
import { SVG } from '@svgdotjs/svg.js';

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
  const [startPoint, setStartPointState] = useState<{ x: number; y: number } | null>(null);

  // Use ref to track isDragging for event handlers to avoid stale closures
  const isDraggingRef = useRef(false);

  // Make SVG box
  const makeSvgBox = useCallback(() => {
    if (!SVG) {
      console.error('SVG.js is not loaded');
      return null;
    }
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return null;
    }
    return SVG().addTo('#canvas').group();
  }, []);

  // Make new line
  const makeNewLine = useCallback((type: string | null = null, width = 2) => {
    if (!SVG) {
      console.error('SVG.js is not loaded in makeNewLine');
      return null;
    }

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
  const setStartPoint = useCallback((el: HTMLElement, direction = 'fromSource') => {
    const canvas = document.getElementById('canvas');
    if (!canvas) return null;

    const canvasPos = canvas.getBoundingClientRect();
    const circlePosition = el.getBoundingClientRect();
    const circleHeight = el.offsetHeight / 2 + 1;
    const x = direction === 'fromTarget'
      ? circlePosition.left - canvasPos.left
      : circlePosition.right - canvasPos.left;
    const y = circlePosition.top + circleHeight - canvasPos.top;

    return { x, y };
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
    console.log('🚀 startDragLine called:', { path, jsonPath, type, direction });

    setIsDragging(true);
    isDraggingRef.current = true;
    const svgBox = makeSvgBox();
    const line = makeNewLine(type);

    if (!svgBox || !line) {
      console.error('Failed to create SVG elements');
      return;
    }

    line.attr('data-active-relation', 'true');
    svgBox.add(line);

    // Store start point
    const point = setStartPoint(el, direction);
    if (point) {
      setStartPointState(point);
      // Draw initial path at start position
      const initialPath = `M ${point.x} ${point.y} L ${point.x} ${point.y}`;
      line.plot(initialPath);
    }

    setActiveSvgBox(svgBox);
    setActiveLine(line);

    const column = direction === 'fromTarget'
      ? { srcColumnPath: '', jsonPath: '', dstColumnPath: path }
      : { srcColumnPath: path, dstColumnPath: '', jsonPath: jsonPath || path };

    console.log('📦 Active relation set:', { column, type, direction });

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
    if (!activeLine || !isDragging || !startPoint) {
      return;
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const canvasPos = canvas.getBoundingClientRect();
    const x2 = e.clientX - canvasPos.left;
    const y2 = e.clientY - canvasPos.top;

    // Create curved path from start point to current mouse position
    const path = createCurvedPath(startPoint.x, startPoint.y, x2, y2);
    activeLine.plot(path);
  }, [activeLine, isDragging, startPoint]);

  // Create curved horizontal path
  const createCurvedPath = (x1: number, y1: number, x2: number, y2: number): string => {
    const dx = x2 - x1;
    const cx1 = x1 + dx * 0.5;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.5;
    const cy2 = y2;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

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
    isDraggingRef.current = false;
    setStartPointState(null);
  }, [activeSvgBox]);

  // End drag
  const endDragLine = useCallback(async ({
    el,
    path,
    srcPath,
    clazzType,
    jsonPath,
  }: {
    el?: HTMLElement;
    path: string;
    srcPath?: string;
    clazzType?: string;
    jsonPath?: string;
  }) => {
    console.log('🎯 endDragLine called:', { path, srcPath, jsonPath, activeRelation });

    if (!activeRelation) {
      cancelDragLine();
      return;
    }

    // Check if reassigning
    if (reassignRelation) {
      // TODO: Implement reassign logic
      console.log('Reassigning relation:', reassignRelation);
    }

    const updatedMapping = { ...selectedEntityMapping };

    // Determine source and destination based on direction
    const finalSrcPath = activeRelation.direction === 'fromSource'
      ? activeRelation.column.srcColumnPath
      : (srcPath || path);
    const finalDstPath = activeRelation.direction === 'fromSource'
      ? path
      : activeRelation.column.dstColumnPath;

    console.log('📍 Final paths:', { finalSrcPath, finalDstPath, jsonPath: activeRelation.jsonPath });

    // Handle different relation types
    if (activeRelation.type === 'columnMapping') {
      // Remove existing mappings to this target
      updatedMapping.columns = updatedMapping.columns.filter(
        (col: any) => col.dstCyodaColumnPath !== finalDstPath
      );

      // Add new column mapping
      updatedMapping.columns.push({
        srcColumnPath: finalSrcPath,
        dstCyodaColumnPath: finalDstPath,
        transformer: {
          type: 'COMPOSITE' as const,
          children: [],
        },
      } as any);
    } else if (activeRelation.type === 'functionalMapping') {
      // Remove existing column mappings
      updatedMapping.columns = updatedMapping.columns.filter(
        (col: any) => col.dstCyodaColumnPath !== finalDstPath
      );

      // Find or create functional mapping
      const existingFunctionalMapping = updatedMapping.functionalMappings.find(
        (fm: any) => fm.dstPath === finalDstPath
      );

      if (existingFunctionalMapping) {
        if (!existingFunctionalMapping.srcPaths.includes(finalSrcPath)) {
          existingFunctionalMapping.srcPaths.push(finalSrcPath);
        }
      } else {
        const newFunctionalMapping = {
          srcPaths: [finalSrcPath],
          name: null,
          statements: [],
          dstPath: finalDstPath,
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
        (col: any) => col.dstCyodaColumnPath !== finalDstPath
      );
      updatedMapping.functionalMappings = updatedMapping.functionalMappings.filter(
        (fm: any) => fm.dstPath !== finalDstPath
      );

      // Add metadata mapping
      updatedMapping.cobiCoreMetadata.push({
        name: finalSrcPath,
        dstCyodaColumnPath: finalDstPath,
      });
    }

    // Add to cobiPathsRelations
    if (!updatedMapping.cobiPathsRelations) {
      updatedMapping.cobiPathsRelations = [];
    }

    const existingRelation = updatedMapping.cobiPathsRelations.find(
      (rel: any) =>
        rel.srcColumnPath === finalSrcPath &&
        rel.dstColumnPath === finalDstPath
    );

    if (!existingRelation) {
      updatedMapping.cobiPathsRelations.push({
        jsonPath: jsonPath || finalSrcPath,
        srcColumnPath: finalSrcPath,
        dstColumnPath: finalDstPath,
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
  }, [activeRelation, reassignRelation, selectedEntityMapping, onMappingChange, onRelationsUpdate, cancelDragLine]);

  // Mouse move and mouse up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        updateDragLine(e);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        // Check if mouseup happened on a circle element (valid drop target)
        const target = e.target as HTMLElement;
        const circle = target.closest('.circle');

        if (circle) {
          // Don't cancel - let the target's onMouseUp handler call endDragLine
          return;
        }

        cancelDragLine();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateDragLine, cancelDragLine]);

  return {
    startDragLine,
    endDragLine,
    cancelDragLine,
    updateDragLine,
    isDragging,
    activeRelation,
    activeLine,
    reassignRelation,
    setReassignRelation,
  };
};

export default useDragDropHandler;

