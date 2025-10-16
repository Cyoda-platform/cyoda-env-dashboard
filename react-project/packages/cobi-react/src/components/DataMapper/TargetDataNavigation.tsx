import React, { useState, useEffect, useMemo } from 'react';
import { Tree, Button, Spin, Badge, Tag } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { RightOutlined, DownOutlined, StarFilled } from '@ant-design/icons';
import type { EntityMappingConfigDto, ColumnMappingConfigDto } from '../../types';
import './TargetDataNavigation.css';

interface TargetDataNavigationProps {
  selectedEntityMapping: EntityMappingConfigDto;
  allDataRelations?: ColumnMappingConfigDto[];
  noneMappingFields?: string[];
  onPathSelect?: (path: string, fieldInfo: any) => void;
  searchString?: string;
}

interface ReportingInfoRow {
  columnPath: string;
  columnName: string;
  clazzType: string;
  required?: boolean;
  children?: ReportingInfoRow[];
}

export const TargetDataNavigation: React.FC<TargetDataNavigationProps> = ({
  selectedEntityMapping,
  allDataRelations = [],
  noneMappingFields = [],
  onPathSelect,
  searchString = '',
}) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportingInfoRows, setReportingInfoRows] = useState<ReportingInfoRow[]>([]);

  // Load entity schema
  useEffect(() => {
    const loadEntitySchema = async () => {
      if (!selectedEntityMapping.entityClass) {
        setReportingInfoRows([]);
        return;
      }

      setIsLoading(true);
      try {
        // TODO: Replace with actual API call to fetch entity schema
        // const response = await api.getReportingInfo(selectedEntityMapping.entityClass);
        // setReportingInfoRows(response.data);
        
        // Mock data for now
        const mockData: ReportingInfoRow[] = [
          {
            columnPath: 'id',
            columnName: 'ID',
            clazzType: 'java.lang.String',
            required: true,
          },
          {
            columnPath: 'name',
            columnName: 'Name',
            clazzType: 'java.lang.String',
            required: true,
          },
          {
            columnPath: 'description',
            columnName: 'Description',
            clazzType: 'java.lang.String',
            required: false,
          },
          {
            columnPath: 'metadata',
            columnName: 'Metadata',
            clazzType: 'java.util.Map',
            required: false,
            children: [
              {
                columnPath: 'metadata.key',
                columnName: 'Key',
                clazzType: 'java.lang.String',
                required: false,
              },
              {
                columnPath: 'metadata.value',
                columnName: 'Value',
                clazzType: 'java.lang.String',
                required: false,
              },
            ],
          },
        ];
        setReportingInfoRows(mockData);
      } catch (error) {
        console.error('Failed to load entity schema:', error);
        setReportingInfoRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntitySchema();
  }, [selectedEntityMapping.entityClass]);

  // Check if path has relations
  const hasRelations = (path: string): boolean => {
    return allDataRelations.some((relation) => relation.dstCyodaColumnPath === path);
  };

  // Get relation count for path
  const getRelationCount = (path: string): number => {
    return allDataRelations.filter((relation) => relation.dstCyodaColumnPath === path).length;
  };

  // Get simple type name
  const getSimpleTypeName = (clazzType: string): string => {
    if (!clazzType) return 'unknown';
    const parts = clazzType.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  // Build tree data from reporting info
  const buildTreeData = (rows: ReportingInfoRow[]): DataNode[] => {
    return rows.map((row) => {
      const relationCount = getRelationCount(row.columnPath);
      const hasRel = hasRelations(row.columnPath);
      const simpleType = getSimpleTypeName(row.clazzType);
      const hasChildren = row.children && row.children.length > 0;

      // Build title with field info
      const title = (
        <div className="target-data-node">
          <span className={`node-key ${hasRel ? 'has-relation' : ''} ${row.required ? 'required' : ''}`}>
            {row.columnName}
            {row.required && <StarFilled className="required-icon" />}
          </span>
          <Tag className="node-type" color={hasRel ? 'blue' : 'default'}>
            {simpleType}
          </Tag>
          {relationCount > 0 && (
            <Badge count={relationCount} className="relation-badge" />
          )}
        </div>
      );

      const node: DataNode = {
        key: row.columnPath,
        title,
        isLeaf: !hasChildren,
        className: `${hasRel ? 'has-relation' : ''} ${row.required ? 'required' : ''}`,
      };

      // Recursively build children
      if (hasChildren) {
        node.children = buildTreeData(row.children!);
      }

      return node;
    });
  };

  // Filter rows based on settings
  const filteredRows = useMemo(() => {
    if (selectedEntityMapping.isShowNoneMappingFields) {
      return reportingInfoRows;
    }

    const filterRows = (rows: ReportingInfoRow[]): ReportingInfoRow[] => {
      return rows
        .filter((row) => !noneMappingFields.includes(row.columnPath))
        .map((row) => ({
          ...row,
          children: row.children ? filterRows(row.children) : undefined,
        }));
    };

    return filterRows(reportingInfoRows);
  }, [reportingInfoRows, selectedEntityMapping.isShowNoneMappingFields, noneMappingFields]);

  // Build tree data
  const treeData = useMemo(() => {
    return buildTreeData(filteredRows);
  }, [filteredRows, allDataRelations]);

  // Handle node expand
  const handleExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  };

  // Handle node select
  const handleSelect = (selectedKeysValue: React.Key[], _info: any) => {
    setSelectedKeys(selectedKeysValue);
    if (selectedKeysValue.length > 0 && onPathSelect) {
      const selectedPath = selectedKeysValue[0] as string;
      const findRow = (rows: ReportingInfoRow[], path: string): ReportingInfoRow | null => {
        for (const row of rows) {
          if (row.columnPath === path) return row;
          if (row.children) {
            const found = findRow(row.children, path);
            if (found) return found;
          }
        }
        return null;
      };
      const fieldInfo = findRow(filteredRows, selectedPath);
      onPathSelect(selectedPath, fieldInfo);
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

  if (!selectedEntityMapping.entityClass) {
    return (
      <div className="target-data-navigation empty">
        <p>Please select an entity class</p>
      </div>
    );
  }

  return (
    <div className="target-data-navigation">
      <div className="navigation-header">
        <h3>Target Entity: {selectedEntityMapping.entityClass}</h3>
        <div className="navigation-actions">
          <Button size="small" onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button size="small" onClick={handleCollapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      <Spin spinning={isLoading}>
        <div className="navigation-tree">
          {filteredTreeData.length > 0 ? (
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
          ) : (
            <div className="empty-state">
              <p>No fields available</p>
            </div>
          )}
        </div>
      </Spin>

      {allDataRelations.length > 0 && (
        <div className="navigation-footer">
          <span className="relation-count">
            {allDataRelations.length} mapping{allDataRelations.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default TargetDataNavigation;

