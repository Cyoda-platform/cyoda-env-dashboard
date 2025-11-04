/**
 * Instance Detail View Page
 * Displays detailed information about a state machine instance
 * Migrated from: .old_project/packages/statemachine/src/views/InstancesDetailView.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, Card, Spin, Typography, Space, Alert, Descriptions, Button } from 'antd';
import type { TabsProps } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  useWorkflow,
  useWorkflowEnabledTypes,
} from '../hooks/useStatemachine';
import { useEntity } from '@cyoda/http-api-react';
import { DataLineage, TransitionChangesTable } from '@cyoda/ui-lib-react';
import type { PersistedType } from '../types';
import axios from 'axios';

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

  // Load entity data using http-api-react hook
  const { data: entityData, isLoading: loading } = useEntity(
    entityClassName,
    instanceId || '',
    undefined,
    { enabled: !!instanceId && !!entityClassName }
  );
  
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
    <div style={{ padding: '16px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/instances?entityClassName=${entityClassName}`)}
        >
          Back to Instances
        </Button>
      </div>

      <Card bordered={false}>
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
  entityData: any;
}> = ({ instanceId, entityClassName, entityData }) => {
  if (!entityData) {
    return (
      <Alert
        message="No Data"
        description="No entity data available for this instance."
        type="warning"
        showIcon
      />
    );
  }

  // Convert entity data array to descriptions format
  // Entity data is an array of { type, columnName, value, presented } objects
  const items = Array.isArray(entityData)
    ? entityData
        .filter((item: any) => item.presented !== false)
        .map((item: any) => ({
          key: item.columnName,
          label: item.columnName,
          children: item.value !== null && item.value !== undefined ? String(item.value) : '-',
        }))
    : [];

  return (
    <div>
      <Descriptions
        bordered
        column={1}
        size="small"
        items={items}
      />
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
  // Fetch transition changes
  const fetchTransitionChanges = async ({ type, id }: { type: string; id: string }) => {
    try {
      const { data } = await axios.get(`/platform-api/pm/transition-changes`, {
        params: { type, id },
      });
      return data || [];
    } catch (error) {
      console.error('Failed to fetch transition changes:', error);
      return [];
    }
  };

  return (
    <div>
      <TransitionChangesTable
        type={entityClassName}
        entityId={instanceId}
        disableLink={true}
        onFetchChanges={fetchTransitionChanges}
      />
    </div>
  );
};

const DataLineageView: React.FC<{
  entityClassName: string;
  instanceId: string;
}> = ({ entityClassName, instanceId }) => {
  // Fetch data lineage transactions
  const fetchDataLineageTransactions = async (requestClass: string, id: string) => {
    try {
      const { data } = await axios.get(`/platform-api/data-lineage/transactions`, {
        params: { requestClass, id },
      });
      return data || [];
    } catch (error) {
      console.error('Failed to fetch data lineage:', error);
      return [];
    }
  };

  return (
    <div>
      <DataLineage
        requestClass={entityClassName}
        id={instanceId}
        onLoadTransactions={fetchDataLineageTransactions}
      />
    </div>
  );
};

export default InstanceDetail;

