/**
 * EntityViewer Component
 * Displays entity information with draggable interface
 * 
 * Migrated from: .old_project/packages/http-api/src/components/EntityViewer/EntityViewer.vue
 */

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Spin, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ModellingGroup } from '@cyoda/tableau-react';
import { useEntityViewerStore } from '../../stores/entityViewerStore';
import { getReportingInfo, getReportingRelatedPaths } from '../../api/entities';
import { HelperEntities, HelperModelling } from '../../utils';
import type { EntityViewerEntity, ReportingInfoRow, RelatedPath } from '../../types';
import './EntityViewer.scss';

export interface EntityViewerProps {
  requestClass: string;
  entity: EntityViewerEntity;
  zoom?: number;
  className?: string;
  dataInfo?: string;
  dataName?: string;
  onLoaded?: () => void;
  onResetRequestClass?: () => void;
}

export interface EntityViewerRef {
  drawLines: () => void;
}

export const EntityViewer = forwardRef<EntityViewerRef, EntityViewerProps>(
  ({ requestClass, entity, zoom = 1, className = '', dataInfo, dataName, onLoaded, onResetRequestClass }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportingInfoRows, setReportingInfoRows] = useState<ReportingInfoRow[]>([]);
    const [relatedPaths, setRelatedPaths] = useState<RelatedPath[]>([]);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const { removeEntity } = useEntityViewerStore();

    // Load entity data
    useEffect(() => {
      const loadEntity = async () => {
        if (!requestClass) return;

        setIsLoading(true);
        try {
          const { data } = await getReportingInfo(requestClass, '', '', false);
          setReportingInfoRows(HelperModelling.sortData(HelperModelling.filterData(data)));
          
          const { data: relatedData } = await getReportingRelatedPaths(requestClass);
          setRelatedPaths(relatedData);
          
          onLoaded?.();
        } catch (error) {
          console.error('Failed to load entity:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadEntity();
    }, [requestClass, onLoaded]);

    // Calculate initial position
    useEffect(() => {
      calculatePosition();
    }, []);

    const getCoords = (elem: HTMLElement) => {
      return {
        top: elem.offsetTop,
        topEnd: elem.offsetHeight + elem.offsetTop,
        left: elem.offsetLeft,
        leftEnd: elem.offsetWidth + elem.offsetLeft,
      };
    };

    const calculatePosition = () => {
      // Complex collision detection algorithm from Vue implementation
      setTimeout(() => {
        const allEntities = Array.from(document.querySelectorAll('.entity-viewer')) as HTMLElement[];
        const lastEntity = allEntities[allEntities.length - 1];

        if (!lastEntity || !lastEntity.dataset.info) return;

        const lastEntityInfo = JSON.parse(lastEntity.dataset.info);
        if (!lastEntityInfo.from) return;

        const previousEntity = document.querySelector(
          `.${HelperEntities.getShortNameOfEntity(lastEntityInfo.from)}`
        ) as HTMLElement;

        if (!previousEntity) return;

        const previousEntityCoord = getCoords(previousEntity);
        const previousEntityWidth = previousEntity.offsetWidth;
        let newCoordLeft = 0;
        let result = false;
        const tries = 100;
        let triesIterator = 0;

        do {
          triesIterator += 1;
          if (triesIterator > tries) result = true;

          newCoordLeft = previousEntityCoord.left + previousEntityWidth + 15 * triesIterator;

          const isFreeSpace = allEntities
            .filter((currentEntity) => {
              const currentEntityCoord = getCoords(currentEntity);
              return previousEntityCoord.top < currentEntityCoord.topEnd;
            })
            .every((currentEntity) => {
              const currentEntityCoord = getCoords(currentEntity);
              if (newCoordLeft > currentEntityCoord.leftEnd) {
                if (newCoordLeft - currentEntityCoord.leftEnd < 15) {
                  newCoordLeft = currentEntityCoord.leftEnd + 15;
                }
                return true;
              }
              return false;
            });

          if (isFreeSpace) result = true;
        } while (result === false);

        setPosition({
          x: newCoordLeft,
          y: previousEntityCoord.top,
        });
      }, 100);
    };

    const drawLines = () => {
      // Draw SVG lines connecting entity viewers
      try {
        resetCanvas();
      } catch (e) {
        return;
      }

      // Get all entity viewers
      const allEntities = document.querySelectorAll('.entity-viewer');

      allEntities.forEach((target) => {
        const targetElement = target as HTMLElement;
        const targetInfo = JSON.parse(targetElement.dataset.info || '{}');

        if (!targetInfo.from) return;

        const parentEntityViewer = document.querySelector(
          `.${HelperEntities.getShortNameOfEntity(targetInfo.from)}`
        ) as HTMLElement;

        if (!parentEntityViewer) return;

        const targetName = HelperEntities.getShortNameOfEntity(targetInfo.to);
        const parentEntityViewerName = HelperEntities.getShortNameOfEntity(targetInfo.from);

        // Calculate line positions
        let x1 = parentEntityViewer.offsetLeft + parentEntityViewer.offsetWidth;
        const y1 = parentEntityViewer.offsetTop + parentEntityViewer.offsetHeight / 2;
        let x2 = targetElement.offsetLeft;
        const y2 = targetElement.offsetTop + targetElement.offsetHeight / 2;

        if (parentEntityViewer.offsetLeft > x2) {
          x1 = parentEntityViewer.offsetLeft;
        }
        if (x1 > x2) {
          x2 += targetElement.offsetWidth;
        }

        // Draw circles and line
        const svgCanvas = document.querySelector('.wrap-entity-view-box-inner svg.canvas');
        if (!svgCanvas) return;

        const className = `${parentEntityViewerName}-${targetName}`;
        const strokeColor = '#5c5c5c';

        // Create circle at start point
        const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle1.setAttribute('cx', String(x1));
        circle1.setAttribute('cy', String(y1));
        circle1.setAttribute('r', '5');
        circle1.setAttribute('fill', strokeColor);
        circle1.setAttribute('class', className);
        svgCanvas.appendChild(circle1);

        // Create circle at end point
        const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle2.setAttribute('cx', String(x2));
        circle2.setAttribute('cy', String(y2));
        circle2.setAttribute('r', '5');
        circle2.setAttribute('fill', strokeColor);
        circle2.setAttribute('class', className);
        svgCanvas.appendChild(circle2);

        // Create line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x1));
        line.setAttribute('y1', String(y1));
        line.setAttribute('x2', String(x2));
        line.setAttribute('y2', String(y2));
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('class', className);
        svgCanvas.appendChild(line);
      });
    };

    const resetCanvas = () => {
      const svgCanvas = document.querySelector('.wrap-entity-view-box-inner svg.canvas');
      if (svgCanvas) {
        while (svgCanvas.firstChild) {
          svgCanvas.removeChild(svgCanvas.firstChild);
        }
      }
    };

    const handleDelete = () => {
      Modal.confirm({
        title: 'Confirm',
        content: 'Do you really want to remove?',
        onOk: () => {
          const allEntities = document.querySelectorAll('.entity-viewer');
          if (allEntities.length === 1) {
            onResetRequestClass?.();
          }
          removeEntity(entity);

          // Wait for React to update the DOM before redrawing lines
          // Use requestAnimationFrame to ensure DOM has updated
          requestAnimationFrame(() => {
            setTimeout(() => {
              drawLines();
            }, 50);
          });
        },
      });
    };

    const startDrag = () => {
      const allEntities = Array.from(document.querySelectorAll('.entity-viewer')) as HTMLElement[];
      const allEntitiesFiltered = allEntities.filter((el) => {
        return el !== rootRef.current;
      });
      allEntitiesFiltered.forEach((el) => {
        el.classList.add('action-hover');
      });
    };

    const stopDrag = () => {
      const allEntities = Array.from(document.querySelectorAll('.entity-viewer')) as HTMLElement[];
      allEntities.forEach((el) => {
        el.classList.remove('action-hover');
      });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.wrap-icon')) {
        return; // Don't drag when clicking delete icon
      }
      setIsDragging(true);
      startDrag();

      const startX = e.clientX - position.x;
      const startY = e.clientY - position.y;

      const handleMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - startX,
          y: e.clientY - startY,
        });
        drawLines();
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        stopDrag();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      drawLines,
    }));

    return (
      <div
        ref={rootRef}
        className={`entity-viewer ${className} ${isDragging ? 'dragging' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        data-info={dataInfo}
        data-name={dataName}
        onMouseDown={handleMouseDown}
      >
        <Spin spinning={isLoading}>
          <div className="header">
            <span>{HelperEntities.getShortNameOfEntity(requestClass)}</span>
            <span className="wrap-icon">
              <DeleteOutlined onClick={handleDelete} />
            </span>
          </div>
          <div className="body">
            <ModellingGroup
              reportInfoRows={reportingInfoRows}
              relatedPaths={relatedPaths}
              requestClass={requestClass}
              checked={[]}
              onlyView={true}
              isCondenseThePaths={true}
            />
          </div>
        </Spin>
      </div>
    );
  }
);

EntityViewer.displayName = 'EntityViewer';

