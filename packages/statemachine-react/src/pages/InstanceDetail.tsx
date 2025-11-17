/**
 * Instance Detail View Page
 * Displays detailed information about a state machine instance
 * Migrated from: .old_project/packages/statemachine/src/views/InstancesDetailView.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, Card, Spin, Typography, Space, Alert, Descriptions, Button, Switch, Divider } from 'antd';
import type { TabsProps } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  useWorkflow,
  useWorkflowEnabledTypes,
} from '../hooks/useStatemachine';
import { getEntityLoad } from '@cyoda/http-api-react/api/entities';
import type { Entity } from '@cyoda/http-api-react/types';
import type { PersistedType } from '../types';
import axios from 'axios';
import { HelperDetailEntity } from '@cyoda/tableau-react/utils';
import EntityDetailTree from '@cyoda/tableau-react/components/EntityDetailTree';
import EntityTransitions from '@cyoda/tableau-react/components/EntityTransitions';
import EntityAudit from '@cyoda/tableau-react/components/EntityAudit';
import EntityDataLineage from '@cyoda/tableau-react/components/EntityDataLineage';
import './InstanceDetail.scss';

const { Title, Text } = Typography;

export const InstanceDetail: React.FC = () => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const entityClassName = searchParams.get('entityClassName') || '';
  const currentWorkflowId = searchParams.get('currentWorkflowId') || '';
  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;

  // Queries
  const { data: workflow } = useWorkflow(
    persistedType,
    currentWorkflowId,
    !!currentWorkflowId
  );
  const { data: workflowEnabledTypes = [] } = useWorkflowEnabledTypes();

  // Load entity data
  const [entityData, setEntityData] = useState<Entity[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!instanceId || !entityClassName) return;

      setLoading(true);
      try {
        const { data } = await getEntityLoad(instanceId, entityClassName);
        const filtered = HelperDetailEntity.filterData(data);
        console.log('[InstanceDetail] Loaded entity data:', filtered);
        setEntityData(filtered);
      } catch (error) {
        console.error('[InstanceDetail] Failed to load entity data:', error);
        setEntityData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [instanceId, entityClassName]);

  // Determine if we should show JSON view
  const isShowDetailJson = () => {
    const entityRow = workflowEnabledTypes.find(
      (item: any) => item.name === entityClassName
    );
    return entityRow?.type === 'BUSINESS';
  };

  const modelName = entityClassName.split('.').pop();

  // Define tabs using the new items API
  const tabItems: TabsProps['items'] = useMemo(() => {
    const items: TabsProps['items'] = [
      {
        key: 'details',
        label: 'Details',
        children: isShowDetailJson() ? (
          <DetailJsonView
            instanceId={instanceId!}
            entityClassName={entityClassName}
          />
        ) : (
          <DetailView
            instanceId={instanceId!}
            entityClassName={entityClassName}
            entityData={entityData}
            currentWorkflowId={currentWorkflowId}
          />
        ),
      },
      {
        key: 'dataAudit',
        label: 'Audit',
        children: (
          <AuditView
            entityClassName={entityClassName}
            instanceId={instanceId!}
          />
        ),
      },
      {
        key: 'dataLineage',
        label: 'Data Lineage',
        children: (
          <DataLineageView
            entityClassName={entityClassName}
            instanceId={instanceId!}
          />
        ),
      },
    ];

    // Add Workflow tab conditionally
    if (currentWorkflowId) {
      items.splice(1, 0, {
        key: 'workflow',
        label: 'Workflow',
        children: (
          <WorkflowView
            workflowId={currentWorkflowId}
            entityClassName={entityClassName}
            instanceId={instanceId!}
            persistedType={persistedType}
            entityData={entityData}
          />
        ),
      });
    }

    return items;
  }, [instanceId, entityClassName, entityData, currentWorkflowId, persistedType, workflowEnabledTypes]);

  return (
    <div className="instance-detail-page">
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/instances?entityClassName=${entityClassName}`)}
        >
          Back to Instances
        </Button>
      </div>

      <Card variant="borderless">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div>
            <Title level={2} style={{ color: '#148751', marginBottom: 0 }}>
              Instances
              {workflow?.name && ` / ${workflow.name}`}
            </Title>
            <div>
              <Text type="secondary" style={{ fontSize: '20px' }}>
                ID: {instanceId} | Model: {modelName}
              </Text>
            </div>
          </div>
          {/* Tabs */}
          <Spin spinning={loading}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              destroyInactiveTabPane={false}
              items={tabItems}
              className="instance-detail-tabs"
            />
          </Spin>
        </Space>
      </Card>
    </div>
  );
};

// Placeholder components for each tab view
// These will be implemented based on the ui-lib-react components

const DetailView: React.FC<{
  instanceId: string;
  entityClassName: string;
  entityData: Entity[] | null;
  currentWorkflowId?: string;
}> = ({ instanceId, entityClassName, entityData, currentWorkflowId }) => {
  const [showEmptyFields, setShowEmptyFields] = useState(true);

  if (!entityData || entityData.length === 0) {
    return (
      <Alert
        message="No Data"
        description="No entity data available for this instance."
        type="warning"
        showIcon
      />
    );
  }

  // Helper function to get value from column
  const getValueFromColumn = (columnName: string): string => {
    const field = entityData.find((item) => item.columnInfo?.columnName === columnName);
    return field?.value || '-';
  };

  // Standard fields to extract
  const standardFieldNames = ['id', 'state', 'previousTransition', 'creationDate', 'createdDate'];

  // Extract standard fields
  const standardFields = {
    id: getValueFromColumn('id') !== '-' ? getValueFromColumn('id') : instanceId,
    state: getValueFromColumn('state'),
    previousTransition: getValueFromColumn('previousTransition'),
    createdDate: getValueFromColumn('creationDate'),
    lastUpdatedDate: getValueFromColumn('lastUpdateTime'),
  };

  // Filter out standard fields from entity data
  const entityFields = entityData.filter((item) => {
    const columnName = item.columnInfo?.columnName;
    return !standardFieldNames.includes(columnName);
  });

  return (
    <div className="entity-detail-view">
      {/* Standard fields section */}
      <div className="entity-detail-section">
        <h4>Standard fields</h4>
        <div className="standard-fields">
          <p>
            <span className="field-label">Id:</span>
            <span className="field-value">{standardFields.id}</span>
          </p>
          <p>
            <span className="field-label">State:</span>
            <span className="field-value">{standardFields.state}</span>
          </p>
          <p>
            <span className="field-label">Previous Transition:</span>
            <span className="field-value">{standardFields.previousTransition}</span>
          </p>
          <p>
            <span className="field-label">Created Date:</span>
            <span className="field-value">{standardFields.createdDate}</span>
          </p>
          <p>
            <span className="field-label">Last updated date:</span>
            <span className="field-value">{standardFields.lastUpdatedDate}</span>
          </p>
        </div>
      </div>

      <Divider />

      {/* Transition Entity Section */}
      {instanceId && entityClassName && currentWorkflowId && (
        <>
          <EntityTransitions
            entityId={instanceId}
            entityClass={entityClassName}
            onTransitionChange={() => {
              // Reload will be handled by parent component
              window.location.reload();
            }}
          />
          <Divider />
        </>
      )}

      {/* Entity section */}
      <div className="entity-detail-section">
        <div className="entity-header">
          <h4>Entity</h4>
          <div className="entity-controls">
            <span style={{ marginRight: 8 }}>Show Empty Fields</span>
            <Switch
              checked={showEmptyFields}
              onChange={setShowEmptyFields}
            />
          </div>
        </div>

        {/* Use EntityDetailTree for better nested field display */}
        <EntityDetailTree
          entity={entityFields}
          showEmpty={showEmptyFields}
          entityId={instanceId}
          entityClass={entityClassName}
        />
      </div>
    </div>
  );
};

const DetailJsonView: React.FC<{
  instanceId: string;
  entityClassName: string;
}> = ({ instanceId, entityClassName }) => {
  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/platform-api/entity/${entityClassName}/${instanceId}`);
        setJsonData(data);
      } catch (error) {
        console.error('Failed to load entity data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (instanceId && entityClassName) {
      loadData();
    }
  }, [instanceId, entityClassName]);

  if (loading) {
    return <Spin />;
  }

  if (!jsonData) {
    return (
      <Alert
        message="No Data"
        description="No entity data available for this instance."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div>
      <pre style={{
        background: '#f5f5f5',
        padding: '16px',
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '600px'
      }}>
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </div>
  );
};

const WorkflowView: React.FC<{
  workflowId: string;
  entityClassName: string;
  instanceId: string;
  persistedType: PersistedType;
  entityData: any;
}> = ({ workflowId, entityClassName, instanceId, persistedType, entityData }) => {
  // Extract state from entity data array
  const stateItem = Array.isArray(entityData)
    ? entityData.find((item: any) => item.columnName === 'state')
    : null;
  const currentState = stateItem?.value || 'Unknown';

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Current State */}
        <Card title="Current State" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="State">{currentState}</Descriptions.Item>
            <Descriptions.Item label="Workflow ID">{workflowId}</Descriptions.Item>
            <Descriptions.Item label="Entity Class">{entityClassName}</Descriptions.Item>
            <Descriptions.Item label="Instance ID">{instanceId}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Available Transitions */}
        <Card title="Available Transitions" size="small">
          <Alert
            message="Transition Actions"
            description="This section will display available workflow transitions that can be executed on this instance. Implementation requires integration with workflow transition execution API."
            type="info"
            showIcon
          />
        </Card>
      </Space>
    </div>
  );
};

const AuditView: React.FC<{
  entityClassName: string;
  instanceId: string;
}> = ({ entityClassName, instanceId }) => {
  return (
    <div>
      <EntityAudit
        entityClass={entityClassName}
        entityId={instanceId}
      />
    </div>
  );
};

const DataLineageView: React.FC<{
  entityClassName: string;
  instanceId: string;
}> = ({ entityClassName, instanceId }) => {
  return (
    <div>
      <EntityDataLineage
        entityClass={entityClassName}
        entityId={instanceId}
      />
    </div>
  );
};

export default InstanceDetail;

