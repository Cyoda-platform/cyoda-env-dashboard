import React from 'react';
import { Alert, Button, Space, message } from 'antd';
import { DeleteOutlined, WarningOutlined, ToolOutlined } from '@ant-design/icons';
import type { EntityMappingConfigDto } from '../../types';
import './NotExistRelationsAlert.css';

interface NotExistRelation {
  type: 'columnMapping' | 'functionalMapping' | 'metadata';
  srcPath?: string;
  dstPath: string;
  reason: string;
  data: any;
}

interface NotExistRelationsAlertProps {
  entityMapping: EntityMappingConfigDto | null;
  sourceData: any;
  targetFields: string[];
  onDeleteRelation: (relation: NotExistRelation) => void;
  onRepairRelation?: (relation: NotExistRelation) => void;
}

const NotExistRelationsAlert: React.FC<NotExistRelationsAlertProps> = ({
  entityMapping,
  sourceData,
  targetFields,
  onDeleteRelation,
  onRepairRelation,
}) => {
  const findNotExistRelations = (): NotExistRelation[] => {
    if (!entityMapping) return [];

    const notExistRelations: NotExistRelation[] = [];

    // Helper to check if source path exists
    const sourcePathExists = (path: string): boolean => {
      if (!sourceData) return false;
      
      // Remove 'root:/' prefix if present
      const cleanPath = path.replace(/^root:\//, '');
      const parts = cleanPath.split('/').filter(p => p);
      
      let current = sourceData;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return false;
        }
      }
      return true;
    };

    // Helper to check if target path exists
    const targetPathExists = (path: string): boolean => {
      return targetFields.includes(path);
    };

    // Check column mappings
    entityMapping.columns.forEach((column) => {
      if (column.srcColumnPath && !sourcePathExists(column.srcColumnPath)) {
        notExistRelations.push({
          type: 'columnMapping',
          srcPath: column.srcColumnPath,
          dstPath: column.dstCyodaColumnPath,
          reason: 'Source path does not exist in source data',
          data: column,
        });
      }

      if (column.dstCyodaColumnPath && !targetPathExists(column.dstCyodaColumnPath)) {
        notExistRelations.push({
          type: 'columnMapping',
          srcPath: column.srcColumnPath,
          dstPath: column.dstCyodaColumnPath,
          reason: 'Target path does not exist in entity schema',
          data: column,
        });
      }
    });

    // Check functional mappings
    entityMapping.functionalMappings.forEach((fm) => {
      // Check source paths
      fm.srcPaths.forEach((srcPath) => {
        if (!sourcePathExists(srcPath)) {
          notExistRelations.push({
            type: 'functionalMapping',
            srcPath: srcPath,
            dstPath: fm.dstPath,
            reason: 'Source path does not exist in source data',
            data: fm,
          });
        }
      });

      // Check destination path
      if (!targetPathExists(fm.dstPath)) {
        notExistRelations.push({
          type: 'functionalMapping',
          dstPath: fm.dstPath,
          reason: 'Target path does not exist in entity schema',
          data: fm,
        });
      }
    });

    // Check metadata
    if (entityMapping.cobiCoreMetadata) {
      entityMapping.cobiCoreMetadata.forEach((metadata) => {
        if (!targetPathExists(metadata.dstCyodaColumnPath)) {
          notExistRelations.push({
            type: 'metadata',
            dstPath: metadata.dstCyodaColumnPath,
            reason: 'Target path does not exist in entity schema',
            data: metadata,
          });
        }
      });
    }

    return notExistRelations;
  };

  const notExistRelations = findNotExistRelations();

  if (notExistRelations.length === 0) {
    return null;
  }

  const shortNamePath = (path: string): string => {
    if (!path) return '';
    const parts = path.split(/[.@#]/);
    return parts[parts.length - 1] || path;
  };

  const getRelationTypeLabel = (type: string): string => {
    switch (type) {
      case 'columnMapping':
        return 'Column Mapping';
      case 'functionalMapping':
        return 'Functional Mapping';
      case 'metadata':
        return 'Metadata';
      default:
        return type;
    }
  };

  const canRepair = (relation: NotExistRelation): boolean => {
    // Can repair if the relation has a source path (can't repair metadata or script paths)
    return !!relation.srcPath;
  };

  const handleRepair = (relation: NotExistRelation) => {
    if (onRepairRelation) {
      onRepairRelation(relation);
    } else {
      message.info('Repair functionality: This will highlight the field in the mapper for re-mapping');
    }
  };

  return (
    <Alert
      message={
        <Space>
          <WarningOutlined />
          <span>Non-existent Relations Detected ({notExistRelations.length})</span>
        </Space>
      }
      description={
        <div>
          <p>The following relations reference fields that do not exist. Please review and delete them:</p>
          <div className="not-exist-relations-list">
            {notExistRelations.map((relation, index) => (
              <div key={index} className="not-exist-relation-item">
                <div className="relation-info">
                  <span className="relation-type">{getRelationTypeLabel(relation.type)}</span>
                  {relation.srcPath && (
                    <span className="relation-path">
                      {shortNamePath(relation.srcPath)} →{' '}
                    </span>
                  )}
                  <span className="relation-path">{shortNamePath(relation.dstPath)}</span>
                  <span className="relation-reason">({relation.reason})</span>
                </div>
                <Space size="small">
                  {canRepair(relation) && (
                    <Button
                      type="link"
                      size="small"
                      icon={<ToolOutlined />}
                      onClick={() => handleRepair(relation)}
                      title="Repair this relation by re-mapping"
                    >
                      Repair
                    </Button>
                  )}
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteRelation(relation)}
                  >
                    Delete
                  </Button>
                </Space>
              </div>
            ))}
          </div>
        </div>
      }
      type="warning"
      showIcon={false}
      closable={false}
      className="not-exist-relations-alert"
    />
  );
};

export default NotExistRelationsAlert;

