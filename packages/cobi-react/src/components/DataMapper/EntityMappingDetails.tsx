import React, { useState } from 'react';
import { 
  Card, 
  Collapse, 
  Tag, 
  Space, 
  Typography, 
  Descriptions, 
  Badge,
  Button,
  Tooltip,
  Empty,
  Divider
} from 'antd';
import {
  InfoCircleOutlined,
  DatabaseOutlined,
  FunctionOutlined,
  SettingOutlined,
  CodeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import type { EntityMappingConfigDto } from '../../types';
import './EntityMappingDetails.scss';

const { Panel } = Collapse;
const { Text, Title, Paragraph } = Typography;

interface EntityMappingDetailsProps {
  entityMapping: EntityMappingConfigDto;
  onEditMapping?: (mappingIndex: number) => void;
  onEditFunctionalMapping?: (mappingIndex: number) => void;
}

const EntityMappingDetails: React.FC<EntityMappingDetailsProps> = ({
  entityMapping,
  onEditMapping,
  onEditFunctionalMapping
}) => {
  const [activeKeys, setActiveKeys] = useState<string[]>(['info', 'columns', 'functional']);

  if (!entityMapping.entityClass) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            <Text type="secondary">Select an entity class to view mapping details</Text>
          </span>
        }
      />
    );
  }

  // Helper function to format class name
  const formatClassName = (className: string) => {
    const parts = className.split('.');
    return parts[parts.length - 1];
  };

  // Helper function to get transformer color
  const getTransformerColor = (type: string) => {
    const colors: Record<string, string> = {
      'SINGLE': 'blue',
      'COMPOSITE': 'purple',
      'CONSTANT': 'green',
      'SCRIPT': 'orange',
      'LOOKUP': 'cyan',
    };
    return colors[type] || 'default';
  };

  return (
    <div className="entity-mapping-details">
      <Collapse 
        activeKey={activeKeys} 
        onChange={(keys) => setActiveKeys(keys as string[])}
        bordered={false}
        className="details-collapse"
      >
        {/* Entity Information */}
        <Panel 
          header={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>Entity Information</Text>
              <Badge count={entityMapping.entityClass ? 1 : 0} showZero={false} />
            </Space>
          } 
          key="info"
        >
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Entity Class">
              <Space direction="vertical" size={0}>
                <Text code copyable>{entityMapping.entityClass}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatClassName(entityMapping.entityClass)}
                </Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Mapping Name">
              <Text strong>{entityMapping.name || <Text type="secondary">(not set)</Text>}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="ID">
              <Space>
                <Tag color="blue">ID: {entityMapping.id?.id || 'null'}</Tag>
                <Tag color="cyan">UI ID: {entityMapping.id?.uiId}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Configuration">
              <Space>
                <Tag 
                  icon={entityMapping.isShowNoneMappingFields ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={entityMapping.isShowNoneMappingFields ? 'success' : 'default'}
                >
                  Show Non-Mapping Fields
                </Tag>
                <Tag 
                  icon={entityMapping.isPolymorphicList ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={entityMapping.isPolymorphicList ? 'success' : 'default'}
                >
                  Polymorphic List
                </Tag>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Panel>

        {/* Column Mappings */}
        <Panel 
          header={
            <Space>
              <DatabaseOutlined style={{ color: '#52c41a' }} />
              <Text strong>Column Mappings</Text>
              <Badge count={entityMapping.columns?.length || 0} showZero style={{ backgroundColor: '#52c41a' }} />
            </Space>
          } 
          key="columns"
        >
          {entityMapping.columns && entityMapping.columns.length > 0 ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {entityMapping.columns.map((col: any, idx: number) => (
                <Card 
                  key={idx}
                  size="small"
                  className="mapping-card"
                  title={
                    <Space>
                      <Text strong style={{ color: '#1890ff' }}>Mapping #{idx + 1}</Text>
                      {col.dstCyodaColumnPathType && (
                        <Tag color="blue">{col.dstCyodaColumnPathType}</Tag>
                      )}
                    </Space>
                  }
                  extra={
                    onEditMapping && (
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => onEditMapping(idx)}
                      >
                        Edit
                      </Button>
                    )
                  }
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div className="mapping-path">
                      <Text type="secondary" style={{ fontSize: '12px' }}>Source:</Text>
                      <Text code copyable style={{ fontSize: '12px' }}>{col.srcColumnPath}</Text>
                    </div>
                    <div className="mapping-arrow">
                      <ArrowRightOutlined style={{ color: '#1890ff' }} />
                    </div>
                    <div className="mapping-path">
                      <Text type="secondary" style={{ fontSize: '12px' }}>Destination:</Text>
                      <Text code copyable style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                        {col.dstCyodaColumnPath}
                      </Text>
                    </div>
                    {col.transformer && (
                      <Divider style={{ margin: '8px 0' }} />
                    )}
                    {col.transformer && (
                      <div className="transformer-info">
                        <Space>
                          <Tag color={getTransformerColor(col.transformer.type)} icon={<FunctionOutlined />}>
                            {col.transformer.type}
                          </Tag>
                          {col.transformer.children && col.transformer.children.length > 0 && (
                            <Tag color="purple">
                              {col.transformer.children.length} child transformer{col.transformer.children.length > 1 ? 's' : ''}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    )}
                  </Space>
                </Card>
              ))}
            </Space>
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No column mappings configured yet. Add mappings in Step 4 (Data Mapping)."
            />
          )}
        </Panel>

        {/* Functional Mappings */}
        <Panel 
          header={
            <Space>
              <FunctionOutlined style={{ color: '#fa8c16' }} />
              <Text strong>Functional Mappings</Text>
              <Badge count={entityMapping.functionalMappings?.length || 0} showZero style={{ backgroundColor: '#fa8c16' }} />
            </Space>
          } 
          key="functional"
        >
          {entityMapping.functionalMappings && entityMapping.functionalMappings.length > 0 ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {entityMapping.functionalMappings.map((fm: any, idx: number) => (
                <Card 
                  key={idx}
                  size="small"
                  className="functional-mapping-card"
                  title={
                    <Space>
                      <Text strong style={{ color: '#fa8c16' }}>
                        {fm.name || `Functional Mapping #${idx + 1}`}
                      </Text>
                      <Tag color="orange" icon={<CodeOutlined />}>
                        {fm.statements?.length || 0} statement{fm.statements?.length !== 1 ? 's' : ''}
                      </Tag>
                    </Space>
                  }
                  extra={
                    onEditFunctionalMapping && (
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => onEditFunctionalMapping(idx)}
                      >
                        Edit
                      </Button>
                    )
                  }
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Source Paths:</Text>
                      <div style={{ marginTop: 4 }}>
                        <Space wrap>
                          {fm.srcPaths && fm.srcPaths.length > 0 ? (
                            fm.srcPaths.map((path: string, pathIdx: number) => (
                              <Tag key={pathIdx} color="blue" style={{ fontSize: '11px' }}>
                                {path}
                              </Tag>
                            ))
                          ) : (
                            <Text type="secondary" style={{ fontSize: '12px' }}>N/A</Text>
                          )}
                        </Space>
                      </div>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Destination:</Text>
                      <Text code copyable style={{ fontSize: '12px', display: 'block', marginTop: 4, wordBreak: 'break-all' }}>
                        {fm.dstPath}
                      </Text>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No functional mappings configured."
            />
          )}
        </Panel>

        {/* Additional Configuration */}
        <Panel 
          header={
            <Space>
              <SettingOutlined style={{ color: '#722ed1' }} />
              <Text strong>Additional Configuration</Text>
            </Space>
          } 
          key="additional"
        >
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Metadata Configs" span={1}>
              <Badge count={entityMapping.metadata?.length || 0} showZero style={{ backgroundColor: '#722ed1' }} />
            </Descriptions.Item>
            <Descriptions.Item label="COBI Core Metadata" span={1}>
              <Badge count={entityMapping.cobiCoreMetadata?.length || 0} showZero style={{ backgroundColor: '#722ed1' }} />
            </Descriptions.Item>
            <Descriptions.Item label="COBI Paths Relations" span={1}>
              <Badge count={entityMapping.cobiPathsRelations?.length || 0} showZero style={{ backgroundColor: '#722ed1' }} />
            </Descriptions.Item>
            <Descriptions.Item label="Unique Check Paths" span={1}>
              <Badge count={entityMapping.columnPathsForUniqueCheck?.length || 0} showZero style={{ backgroundColor: '#722ed1' }} />
            </Descriptions.Item>
            <Descriptions.Item label="Entity Relation Configs" span={2}>
              <Badge count={entityMapping.entityRelationConfigs?.length || 0} showZero style={{ backgroundColor: '#722ed1' }} />
            </Descriptions.Item>
            {entityMapping.script && (
              <Descriptions.Item label="Script" span={2}>
                <Space>
                  {entityMapping.script.body ? (
                    <>
                      <Tag color="green" icon={<CodeOutlined />}>
                        {entityMapping.script.body.length} characters
                      </Tag>
                      <Tooltip title="View script">
                        <Button type="link" size="small" icon={<EyeOutlined />}>
                          View
                        </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <Text type="secondary">No script configured</Text>
                  )}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Panel>
      </Collapse>

      <Card size="small" style={{ marginTop: 16, background: '#e6f7ff', borderColor: '#91d5ff' }}>
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          <Text style={{ fontSize: '13px' }}>
            <Text strong>Note:</Text> Field mappings are created in Step 4 (Data Mapping) using the visual mapper.
            Advanced entity field browser will be available in a future update.
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default EntityMappingDetails;

