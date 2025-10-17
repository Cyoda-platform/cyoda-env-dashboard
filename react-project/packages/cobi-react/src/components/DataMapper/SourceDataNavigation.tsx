import React, { useState, useMemo, useEffect } from 'react';
import { Tree, Button, Tooltip, Badge } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import type { EntityMappingConfigDto, ColumnMappingConfigDto } from '../../types';
import './SourceDataNavigation.css';

interface SourceDataNavigationProps {
  sourceData: any;
  selectedEntityMapping: EntityMappingConfigDto;
  allDataRelations?: ColumnMappingConfigDto[];
  onPathSelect?: (path: string) => void;
  searchString?: string;
  dragDropHandler?: any;
}

export const SourceDataNavigation: React.FC<SourceDataNavigationProps> = ({
  sourceData,
  selectedEntityMapping,
  allDataRelations = [],
  onPathSelect,
  searchString = '',
  dragDropHandler,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [treeRenderKey, setTreeRenderKey] = useState(0);

  // Get type of data
  const getTypeOfData = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'unknown';
  };

  // Check if path has relations
  const hasRelations = (path: string): boolean => {
    return allDataRelations.some((relation) => relation.srcColumnPath === path);
  };

  // Get relation count for path
  const getRelationCount = (path: string): number => {
    return allDataRelations.filter((relation) => relation.srcColumnPath === path).length;
  };

  // Build tree data from source data
  const buildTreeData = (
    data: any,
    parentPath: string = 'root:',
    level: number = 0
  ): DataNode[] => {
    if (!data || typeof data !== 'object') {
      return [];
    }

    const keys = Object.keys(data);
    const isArray = Array.isArray(data);

    return keys.map((key) => {
      const value = data[key];
      const currentPath = `${parentPath}/${key}`;
      const typeOfData = getTypeOfData(value);
      const isLeaf = typeOfData !== 'object' && typeOfData !== 'array';
      const relationCount = getRelationCount(currentPath);
      const hasRel = hasRelations(currentPath);

      // Handle mouse down on circle
      const handleCircleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (dragDropHandler && isLeaf) {
          dragDropHandler.startDragLine({
            el: e.currentTarget,
            path: currentPath,
            jsonPath: currentPath,
            type: 'columnMapping',
            direction: 'fromSource',
          });
        }
      };

      // Build title with type, relation indicator, and draggable circle
      const title = (
        <div
          className="source-data-node"
          data-relation={isLeaf ? encodeURIComponent(currentPath) : ''}
          data-path={currentPath}
        >
          <span className={`node-key ${hasRel ? 'has-relation' : ''}`}>
            {isArray && selectedEntityMapping.isPolymorphicList ? `[${key}]` : key}
          </span>
          <span className="node-type">{typeOfData}</span>
          {!isLeaf && relationCount > 0 && (
            <Badge count={relationCount} className="relation-badge" />
          )}
          {isLeaf && (
            <>
              <Tooltip title={String(value)}>
                <span className="node-value">{String(value).substring(0, 50)}</span>
              </Tooltip>
              <div
                className={`circle ${hasRel ? 'has-relation' : ''} ${relationCount > 0 ? 'selected' : ''}`}
                onMouseDown={handleCircleMouseDown}
                data-path={currentPath}
              >
                {relationCount > 1 && <span>{relationCount}</span>}
              </div>
            </>
          )}
        </div>
      );

      const node: DataNode = {
        key: currentPath,
        title,
        isLeaf,
        className: `level-${level} ${hasRel ? 'has-relation' : ''}`,
      };

      // Recursively build children for objects and arrays
      if (!isLeaf) {
        node.children = buildTreeData(value, currentPath, level + 1);
      }

      return node;
    });
  };

  // Build tree data
  const treeData = useMemo(() => {
    if (!sourceData) return [];
    return buildTreeData(sourceData);
  }, [sourceData, allDataRelations, selectedEntityMapping.isPolymorphicList]);

  // Handle node expand
  const handleExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  };

  // Handle node select
  const handleSelect = (selectedKeysValue: React.Key[], _info: any) => {
    setSelectedKeys(selectedKeysValue);
    if (selectedKeysValue.length > 0 && onPathSelect) {
      onPathSelect(selectedKeysValue[0] as string);
    }
  };

  // Expand all nodes
  const handleExpandAll = () => {
    const getAllKeys = (nodes: DataNode[]): React.Key[] => {
      let keys: React.Key[] = [];
      nodes.forEach((node) => {
        if (!node.isLeaf) {
          keys.push(node.key);
          if (node.children) {
            keys = keys.concat(getAllKeys(node.children));
          }
        }
      });
      return keys;
    };
    setExpandedKeys(getAllKeys(treeData));
  };

  // Collapse all nodes
  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };

  // Filter tree by search string
  const filterTreeData = (nodes: DataNode[]): DataNode[] => {
    if (!searchString) return nodes;

    return nodes
      .map((node) => {
        const nodeKey = String(node.key).toLowerCase();
        const matches = nodeKey.includes(searchString.toLowerCase());

        if (node.children) {
          const filteredChildren = filterTreeData(node.children);
          if (filteredChildren.length > 0 || matches) {
            return {
              ...node,
              children: filteredChildren,
            };
          }
        }

        return matches ? node : null;
      })
      .filter((node): node is DataNode => node !== null);
  };

  const filteredTreeData = useMemo(() => {
    return filterTreeData(treeData);
  }, [treeData, searchString]);

  // Handle mouse move for drag line
  useEffect(() => {
    if (!dragDropHandler) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragDropHandler.isDragging && dragDropHandler.updateDragLine) {
        dragDropHandler.updateDragLine(e);
      }
    };

    const handleMouseUp = () => {
      if (dragDropHandler.isDragging && dragDropHandler.cancelDragLine) {
        dragDropHandler.cancelDragLine();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragDropHandler]);

  // Force re-render when drag state changes
  useEffect(() => {
    if (dragDropHandler) {
      setTreeRenderKey((prev) => prev + 1);
    }
  }, [dragDropHandler?.isDragging]);

  if (!sourceData) {
    return (
      <div className="source-data-navigation empty">
        <p>No source data available</p>
      </div>
    );
  }

  return (
    <div className="source-data-navigation">
      <div className="navigation-header">
        <h3>Source Data</h3>
        <div className="navigation-actions">
          <Button size="small" onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button size="small" onClick={handleCollapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      <div className="navigation-tree">
        <Tree
          showLine
          switcherIcon={<RightOutlined />}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          onExpand={handleExpand}
          onSelect={handleSelect}
          treeData={filteredTreeData}
          icon={<DownOutlined />}
        />
      </div>

      {allDataRelations.length > 0 && (
        <div className="navigation-footer">
          <span className="relation-count">
            {allDataRelations.length} relation{allDataRelations.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default SourceDataNavigation;

