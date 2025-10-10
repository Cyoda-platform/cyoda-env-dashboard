/**
 * Workflow Detail Page
 * View and edit workflow with transitions, processes, and criteria
 * Migrated from: .old_project/packages/statemachine/src/views/workflow/WorkflowId.vue
 */

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, Radio, Divider, Space } from 'antd';
import { TableOutlined, ApartmentOutlined, SettingOutlined } from '@ant-design/icons';
import { WorkflowForm } from '../components/WorkflowForm';
import { TransitionsList } from '../components/TransitionsList';
import { ProcessesList } from '../components/ProcessesList';
import { CriteriaList } from '../components/CriteriaList';
import type { PersistedType } from '../types';

type LayoutMode = 'tabular' | 'graphical' | 'config';

export const WorkflowDetail: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const [searchParams] = useSearchParams();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('tabular');
  
  const persistedType = (searchParams.get('persistedType') || 'persisted') as PersistedType;
  const entityClassName = searchParams.get('entityClassName') || '';
  
  if (!workflowId) {
    return <div>Workflow ID is required</div>;
  }
  
  return (
    <div style={{ padding: '16px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Workflow Form */}
          <WorkflowForm
            workflowId={workflowId}
            persistedType={persistedType}
          />
          
          <Divider />
          
          {/* Layout Mode Selector */}
          <div style={{ textAlign: 'center' }}>
            <Radio.Group
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              size="large"
              buttonStyle="solid"
            >
              <Radio.Button value="tabular">
                <TableOutlined style={{ fontSize: '22px' }} />
              </Radio.Button>
              <Radio.Button value="graphical">
                <ApartmentOutlined style={{ fontSize: '22px' }} />
              </Radio.Button>
              <Radio.Button value="config">
                <SettingOutlined style={{ fontSize: '22px' }} />
              </Radio.Button>
            </Radio.Group>
          </div>
          
          {/* Tabular View */}
          {layoutMode === 'tabular' && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <TransitionsList
                workflowId={workflowId}
                persistedType={persistedType}
                entityClassName={entityClassName}
              />
              
              <Divider />
              
              <ProcessesList
                workflowId={workflowId}
                persistedType={persistedType}
                entityClassName={entityClassName}
              />
              
              <Divider />
              
              <CriteriaList
                workflowId={workflowId}
                persistedType={persistedType}
                entityClassName={entityClassName}
              />
            </Space>
          )}
          
          {/* Graphical View */}
          {layoutMode === 'graphical' && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              <ApartmentOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>Graphical state machine view coming soon...</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                Will use Cytoscape for visualization
              </div>
            </div>
          )}
          
          {/* Config View */}
          {layoutMode === 'config' && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              <SettingOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>Workflow configuration view coming soon...</div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default WorkflowDetail;

