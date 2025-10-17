import React, { useRef, useEffect, useCallback, useState } from 'react';
import { throttle } from 'lodash';
import type {
  EntityMappingConfigDto,
} from '../../types';
import './MappingCanvas.css';
import { SVG } from '@svgdotjs/svg.js';

// Relation colors (from HelperMapper)
export const COLOR_RELATION_COLUMN_MAPPING = '#67c23a';
export const COLOR_RELATION_FUNCTIONAL_MAPPING = '#E6A23C';
export const COLOR_RELATION_CORE_METADATA = '#409eff';
export const COLOR_RELATION_DEFAULT = '#858484';
export const COLOR_RELATION_NOT_EXIST = '#F56C6C';

interface MappingCanvasProps {
  selectedEntityMapping: EntityMappingConfigDto;
  allDataRelations: any[];
  notExistRelations?: any[];
  onRelationClick?: (relations: any[]) => void;
  onRelationHover?: (relations: any[]) => void;
  activeLine?: any;
  activeRelation?: any;
  relationsUpdateTrigger?: number;
}

interface ActiveRelation {
  column: {
    srcColumnPath: string;
    dstColumnPath: string;
    jsonPath: string;
  };
  type: string;
  direction: 'fromSource' | 'fromTarget';
  clazzType: string | null;
  notExistRelation: any;
  jsonPath: string;
}

const MappingCanvas: React.FC<MappingCanvasProps> = ({
  allDataRelations,
  notExistRelations = [],
  onRelationClick,
  onRelationHover,
  activeLine: externalActiveLine,
  activeRelation: externalActiveRelation,
  relationsUpdateTrigger = 0,
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeLine = externalActiveLine;
  const activeRelation = externalActiveRelation;

  // Curved horizontal line path generator
  const curvedHorizontal = (startX: number, startY: number, endX: number, endY: number): string => {
    const AX = startX;
    const AY = startY;
    const BX = Math.abs(endX - startX) * 0.05 + startX;
    const BY = startY;
    const CX = (endX - startX) * 0.66 + startX;
    const CY = startY;
    const DX = (endX - startX) * 0.33 + startX;
    const DY = endY;
    const EX = -Math.abs(endX - startX) * 0.05 + endX;
    const EY = endY;
    const FX = endX;
    const FY = endY;

    let path = `M${AX},${AY}`;
    path += ` L${BX},${BY}`;
    path += ` C${CX},${CY}`;
    path += ` ${DX},${DY}`;
    path += ` ${EX},${EY}`;
    path += ` L${FX},${FY}`;

    return path;
  };

  // Create new SVG line
  const makeNewLine = (type: string | null = null, width = 2) => {
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
  };

  // Create SVG group
  const makeSvgBox = () => {
    if (!canvasRef.current) return null;
    return SVG().addTo(canvasRef.current).group();
  };

  // Set start point for line
  const setStartPoint = (el: HTMLElement, line: any, direction: 'fromSource' | 'fromTarget' = 'fromSource') => {
    if (!canvasRef.current) return;

    const canvasPos = canvasRef.current.getBoundingClientRect();
    const circlePosition = el.getBoundingClientRect();
    const circleHeight = el.offsetHeight / 2 + 1;
    const x1 = direction === 'fromTarget' 
      ? circlePosition.left - canvasPos.left 
      : circlePosition.right - canvasPos.left;

    line.attr('x1', x1).attr('y1', circlePosition.top + circleHeight - canvasPos.top);
  };

  // Set end point for line
  const setEndPoint = (el: HTMLElement, line: any) => {
    if (!canvasRef.current) return;

    const canvasPos = canvasRef.current.getBoundingClientRect();
    const circlePosition = el.getBoundingClientRect();
    const circleHeight = el.offsetHeight / 2 + 1;

    const curve = curvedHorizontal(
      line.attr('x1'),
      line.attr('y1'),
      circlePosition.left - canvasPos.left,
      circlePosition.top - canvasPos.top + circleHeight
    );

    line.attr('d', curve);
  };

  // Create invisible line for hover/click detection
  const makeInvisibleLineForLine = () => {
    const invisibleLine = makeNewLine(null, 10);
    invisibleLine.attr('visibility', 'hidden');
    invisibleLine.attr('class', 'invisible-line');
    return invisibleLine;
  };

  // Add event listeners to invisible line
  const addEventListenerForInvisibleLine = (invisibleLine: any) => {
    SVG(invisibleLine).on('click', () => {
      if (activeRelation) return;
      
      const line = invisibleLine.node.closest('g')?.querySelector('.line');
      if (line && line.dataset.allRelationLinks) {
        const allRelationLinks = JSON.parse(line.dataset.allRelationLinks);
        const relations = allDataRelations.filter((el) => {
          return allRelationLinks.find((relationLink: any) => {
            return (
              el.column.srcColumnPath === relationLink.srcColumnPath &&
              el.column.dstColumnPath === relationLink.dstColumnPath
            );
          });
        });
        onRelationClick?.(relations);
      }
    });

    SVG(invisibleLine).on('mouseover', function (this: any) {
      if (activeRelation) return;

      const line = this.node.closest('g')?.querySelector('.line');
      if (line && line.dataset.allRelationLinks) {
        const allRelationLinks = JSON.parse(line.dataset.allRelationLinks);
        const relations = allDataRelations.filter((el) => {
          return allRelationLinks.find((relationLink: any) => {
            return (
              el.column.srcColumnPath === relationLink.srcColumnPath &&
              el.column.dstColumnPath === relationLink.dstColumnPath
            );
          });
        });
        onRelationHover?.(relations);
      }
    });

    SVG(invisibleLine).on('mouseleave', () => {
      if (activeRelation) return;
      onRelationHover?.([]);
    });
  };

  // Set relation data to line
  const setRelationToLink = (column: any, line: any) => {
    const paths = [column.srcColumnPath, column.dstColumnPath];
    line.node.dataset.relationLink = paths.join('-');
  };

  // Set all relations data to line
  const setAllRelationsToLink = (column: any, line: any) => {
    let allRelationLinks: any[] = [];
    if (line.node.dataset.allRelationLinks) {
      allRelationLinks = JSON.parse(line.node.dataset.allRelationLinks);
    }
    allRelationLinks.push({
      srcColumnPath: column.srcColumnPath,
      dstColumnPath: column.dstColumnPath,
    });
    line.node.dataset.allRelationLinks = JSON.stringify(allRelationLinks);
  };

  // Check if relation path doesn't exist
  const checkIfPathNotExist = (relations: any[]): boolean => {
    return relations.some((relation) => {
      return notExistRelations.some((notExist) => {
        return (
          notExist.column.srcColumnPath === relation.column.srcColumnPath &&
          notExist.column.dstColumnPath === relation.column.dstColumnPath
        );
      });
    });
  };

  // Update all relations on canvas
  const updateRelations = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (!canvasRef.current) return;

      // Remove existing SVG elements (except active line)
      const svgs = Array.from(canvasRef.current.querySelectorAll('svg'));
      svgs.forEach((svg) => {
        const path = svg.querySelector('path');
        if (activeLine && path && (path as any).dataset.activeRelation) {
          return; // Keep active line
        }
        svg.remove();
      });

      // Draw all relations
      const allExistDataRelations: any[] = [];

      allDataRelations.forEach((relation: any) => {
        if (!relation.column.srcColumnPath || !relation.column.dstColumnPath) return;

        // Find source and target circles
        const sourceDataColumn = document.querySelector('.source-data-column');
        const targetDataColumn = document.querySelector('.target-data-column');

        if (!sourceDataColumn || !targetDataColumn) return;

        // Use jsonPath for source (matches Vue implementation line 1099)
        const sourceRow = Array.from(
          sourceDataColumn.querySelectorAll(`[data-relation*="${encodeURIComponent(relation.column.jsonPath)}"]`)
        ).find((el) => {
          return (el as HTMLElement).dataset.relation
            ?.split(' ')
            .includes(encodeURIComponent(relation.column.jsonPath));
        });

        // Use dstColumnPath for target (matches Vue implementation line 1104)
        const targetRow = Array.from(
          targetDataColumn.querySelectorAll(`[data-relation*="${encodeURIComponent(relation.column.dstColumnPath)}"]`)
        ).find((el) => {
          return (el as HTMLElement).dataset.relation
            ?.split(' ')
            .includes(encodeURIComponent(relation.column.dstColumnPath));
        });

        const sourceCircle = sourceRow?.querySelector('.circle') as HTMLElement;
        const targetCircle = targetRow?.querySelector('.circle') as HTMLElement;

        const isExistRelation = allExistDataRelations.find(
          (el) => el.sourceCircle === sourceCircle && el.targetCircle === targetCircle
        );

        if (sourceCircle && targetCircle && !isExistRelation) {
          const svgBox = makeSvgBox();
          if (!svgBox) return;

          const line = makeNewLine(relation.type);

          // Check if relation doesn't exist
          const isNotExistRelation = checkIfPathNotExist([relation]);
          if (isNotExistRelation) {
            line.attr('stroke', COLOR_RELATION_NOT_EXIST);
          }

          const invisibleLine = makeInvisibleLineForLine();
          svgBox.add(line);
          svgBox.add(invisibleLine);

          setStartPoint(sourceCircle, line);
          setEndPoint(targetCircle, line);
          invisibleLine.attr('d', line.attr('d'));

          setRelationToLink(relation.column, line);
          setAllRelationsToLink(relation.column, line);
          addEventListenerForInvisibleLine(invisibleLine);

          allExistDataRelations.push({ sourceCircle, targetCircle, line });
        } else if (isExistRelation && isExistRelation.line) {
          setAllRelationsToLink(relation.column, isExistRelation.line);
        }
      });
    }, 100);
  }, [allDataRelations, notExistRelations, activeLine, onRelationClick, onRelationHover, activeRelation]);

  // Update relations when dependencies change
  useEffect(() => {
    updateRelations();
  }, [updateRelations, relationsUpdateTrigger]);

  // Handle window resize
  useEffect(() => {
    const handleResize = throttle(() => {
      updateRelations();
    }, 200);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateRelations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <svg
      ref={canvasRef}
      id="canvas"
      className={`mapping-canvas ${activeRelation ? 'active-relation' : ''}`}
      width="100%"
      height="100%"
    />
  );
};

export default MappingCanvas;

